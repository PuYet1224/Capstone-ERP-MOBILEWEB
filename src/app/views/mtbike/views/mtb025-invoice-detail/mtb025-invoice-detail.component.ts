import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { HRListTypeDataEnum } from 'src/app/models/enums/e-type/hr-list-type-data.enum';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { CSLoyalCustomerCusDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { LSProvinceDTO } from 'src/app/models/dtos/e-dtos/ls-province.dto';
import { LSWardDTO } from 'src/app/models/dtos/e-dtos/ls-ward.dto';
import { PSCoreApiService } from 'src/app/services/core/ps-core-api.service';
import { LSDistrictDTO } from 'src/app/models/dtos/e-dtos/ls-district.dto';

@Component({
  selector: 'mtb025-invoice-detail',
  templateUrl: './mtb025-invoice-detail.component.html',
  styleUrls: ['./mtb025-invoice-detail.component.scss']
})
export class Mtb025InvoiceDetailComponent implements OnInit, OnDestroy {
  public invoice: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public invoiceCopy: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public isLoading = false;
  public isReadOnly = false;
  private arrUnsubscribe: Subscription[] = [];

  // Apply to other vehicles
  public showApplyPopup = false;
  public siblingInvoices: SALOrderInvoiceCusDTO[] = [];
  public selectedSiblings = new Set<number>();
  public isApplying = false;

  // Options for Dropdown
  public invoiceTypes: ListDTO[] = [];
  public listGender = [
    { Code: 1, ListName: 'Nam' },
    { Code: 2, ListName: 'Nữ' },
    { Code: 7, ListName: 'Nam' },
    { Code: 8, ListName: 'Nữ' }
  ];

  // Customer data from CSLoyalCustomer
  public customer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  private customerCopy: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public purchaserCustomer: CSLoyalCustomerCusDTO | null = null;
  public isSameAsPurchaser = false;

  // Province / Ward cascade (Ward API accepts Province Code internally)
  public provinceList: LSProvinceDTO[] = [];
  public wardList: LSWardDTO[] = [];

  public currentheader: LSHeadCusDTO;

  public orderInfo: { id: string, customerCode?: number, customerName: string, vehicleName: string, totalAmount: number, status?: number, statusName?: string } = { id: '', customerName: '', vehicleName: '', totalAmount: 0 };

  // Vehicle transfer (xe điều chuyển)
  public isTransfer = false;
  public transferHeadCode: number | null = null;
  public transferHeadName = '';
  public transferReceiptCode: number | null = null;
  public transferReceiptStatus: number | null = null;
  public orderDetailCode: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private configCache: ConfigCacheService,
    private cache: PsCache,
    private configService: GetConfigService,
    private coreApiService: PSCoreApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.currentheader = this.configService.GetHead();
    const cached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_INVOICE);
    if (cached) {
      const invoiceData = this.cache.parseValue(cached) as SALOrderInvoiceCusDTO;
      if (invoiceData && invoiceData.Code) {
        this.loadInvoice(invoiceData.Code);
      }
    } else {
      this.notification.onWarning('Không tìm thấy thông tin hóa đơn');
      this.onBack();
    }
    
    this.getlistlslist();
    this.loadProvinces();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach(sub => sub.unsubscribe());
  }

  private getlistlslist(): void {
    try {
      const sub = this.configCache.GetListLSList(LSListTypeDataEnum.InvoiceType).subscribe({
        next: (data) => { this.invoiceTypes = data || []; },
        error: () => { this.invoiceTypes = []; }
      });
      this.arrUnsubscribe.push(sub);
    } catch {
      this.invoiceTypes = [];
    }
  }

  //#region Load Invoice + Customer
  private customerLoaded = false;

  loadInvoice(code: number): void {
    this.isLoading = true;
    this.customerLoaded = false;
    const param = new SALOrderInvoiceCusDTO();
    param.Code = code;

    const sub = this.apiService.GetSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          this.invoice = res.ObjectReturn;
          this.invoice.FrameSeri = this.invoice.FrameSeri ?? '';
          this.invoice.EngineSeri = this.invoice.EngineSeri ?? '';
          this.invoiceCopy = { ...this.invoice };
          this.isReadOnly = this.invoice.Status === SALOrderInvoiceStatusEnum.Success || this.invoice.Status === 135;
          if (!this.invoice.VATType && this.invoiceTypes.length > 0) {
            this.invoice.VATType = this.invoiceTypes[0].TypeOfList;
            this.invoiceCopy.VATType = this.invoiceTypes[0].TypeOfList;
          }
          const vatCustomerCode = this.invoice.VATCustomer;
          const purchaserCode = this.invoice['Customer'];

          const purchaserName = this.invoice['CustomerName'];
          this.detectTransfer(this.invoice);

          if (vatCustomerCode) {
            this.loadCustomer(vatCustomerCode);
            if (purchaserCode && vatCustomerCode === purchaserCode) {
              this.isSameAsPurchaser = true;
            }
          } else {
              this.isSameAsPurchaser = false;
              if (!this.invoice.VATCCCD && !this.invoice.VATAddress && this.invoice.VATCustomerName === purchaserName) {
                  this.invoice.VATCustomerName = '';
              }
              // Populate this.customer from invoice fields (VATProvince, VATWard, etc.)
              this.applyCustomerData(new CSLoyalCustomerCusDTO());
          }
          this.loadOrderInfo();

          // Detect vehicle transfer (xe điều chuyển)
          this.detectTransfer(res.ObjectReturn);
        } else {
          this.notification.onError(`Lỗi tải thông tin hóa đơn: ${res.ErrorString}`);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.notification.onError(`Lỗi kết nối: ${err.message}`);
        this.isLoading = false;
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadCustomer(customerCode: number): void {
    if (this.customerLoaded) return;
    this.customerLoaded = true;

    const param = new CSLoyalCustomerCusDTO();
    param.Code = customerCode;

    const sub = this.apiService.GetCustomer(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Code) {
          this.applyCustomerData(res.ObjectReturn);
        } else {
          this.customerLoaded = false;
          console.warn('GetCustomer: no valid customer data', res.ObjectReturn);
        }
      },
      error: (err) => {
        this.customerLoaded = false;
        console.warn('GetCustomer failed:', err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadCustomerFromOrder(orderMasterCode: number): void {
    const sub = this.apiService.GetListSALMaster({
      filter: { logic: 'and', filters: [{ field: 'Code', operator: 'eq', value: orderMasterCode }] },
      sort: [], skip: 0, take: 1
    }).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          let order: any = null;
          const raw = res.ObjectReturn;
          if (Array.isArray(raw)) {
            for (const group of raw) {
              if (group.ListData?.length) {
                order = group.ListData[0];
                break;
              }
            }
          }
          if (order?.Customer) {
            this.loadCustomer(order.Customer);
          }
        }
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private applyCustomerData(data: any): void {
    this.customer = data;
    this.customer.Email = this.customer.Email || this.invoice.VATEmail || '';
    this.customer.Zalo = this.customer.Zalo || this.invoice.VATZalo || '';
    this.customer.CitizenCardNo = this.customer.CitizenCardNo || this.invoice.VATCCCD || '';
    this.customer.CardNo = this.customer.CardNo || this.invoice.VATCMND || '';
    this.customer.Cellphone1 = this.customer.Cellphone1 || this.invoice.VATCellPhone || '';
    
    setTimeout(() => {
      this.customer.FullName = this.customer.FullName || this.invoice.VATCustomerName || '';
      this.customer.Address = this.customer.Address || this.invoice.VATAddress || '';
      if (!this.customer.Province && this.invoice.VATProvince) {
        this.customer.Province = parseInt(this.invoice.VATProvince, 10);
      }
      if (!this.customer.Ward && this.invoice.VATWard) {
        this.customer.Ward = parseInt(this.invoice.VATWard, 10);
      }
      if (!this.customer.Gender && this.invoice.VATGender) {
        this.customer.Gender = this.invoice.VATGender;
      }
      if (this.customer.IsCellPhone == null && this.invoice.VATIsSamePhone != null) {
        this.customer.IsCellPhone = this.invoice.VATIsSamePhone;
      }

      this.customerCopy = { ...this.customer };
      // Link customer to invoice (just set value — do NOT call update API during load)
      if (this.customer.Code && !this.invoice.VATCustomer) {
        this.invoice.VATCustomer = this.customer.Code;
        this.invoiceCopy.VATCustomer = this.customer.Code;
      }

      // Resolve Province/Ward from dropdowns or parse from address text
      if (this.customer.Province && this.provinceList.length > 0) {
        // Province already set (from DB or VATProvince) → load ward list
        this.loadWards(this.customer.Province, () => {
          // Auto-match ward from address text if ward not yet set
          if (!this.customer.Ward && this.customer.Address) {
            this.customer.Ward = this.matchWardFromAddress(this.customer.Address);
          }
          // Strip geo names from street address
          this.customer.Address = this.stripGeoFromAddress(this.customer.Address);
          this.customerCopy = { ...this.customer };
          this.syncCustomerToInvoice();
          this.cdr.detectChanges();
        });
      } else if (this.customer.Address && this.provinceList.length > 0) {
        // No Province set but has address text → try parse
        this.parseAddressToDropdowns(this.customer.Address);
      } else {
        this.syncCustomerToInvoice();
        this.cdr.detectChanges();
      }
    }, 50);
  }

  /**
   * Remove Province/Ward/District names from a full address string,
   * leaving only the specific street portion.
   * Handles prefixed names like "Tỉnh Hưng Yên", "Xã Cương Chính", "Huyện Tiên Lữ"
   */
  private stripGeoFromAddress(fullAddress: string): string {
    if (!fullAddress) return '';
    let street = fullAddress;

    // Remove province name (try full name first, then core name without prefix)
    const province = this.provinceList.find(p => p.Code == this.customer.Province);
    if (province) {
      street = this.removeGeoName(street, province.VNProvince);
    }

    // Remove ward name
    const ward = this.wardList.find(w => w.Code == this.customer.Ward);
    if (ward) {
      street = this.removeGeoName(street, ward.VNWard);
    }

    return street.replace(/,\s*$/, '').trim();
  }

  /**
   * Remove a geo name (like "Tỉnh Hưng Yên") from address text.
   * Tries full name first, then tries core name without common prefixes
   * (Tỉnh/Thành phố/Huyện/Quận/Thị xã/Xã/Phường/Thị trấn).
   */
  private removeGeoName(address: string, geoName: string): string {
    const coreName = this.stripGeoPrefix(geoName.trim());
    const coreEsc = this.escapeRegex(coreName);
    
    // Look for the prefix optional + coreName at the end or anywhere
    // e.g. ", Tỉnh Tuyên Quang", ", Tuyên Quang"
    let result = address.replace(new RegExp(`(,\\s*)?(Tỉnh\\s+|Thành phố\\s+|Huyện\\s+|Quận\\s+|Thị xã\\s+|Xã\\s+|Phường\\s+|Thị trấn\\s+)?${coreEsc}\\s*$`, 'i'), '');
    
    // If not found at the very end, try anywhere
    if (result === address) {
      result = address.replace(new RegExp(`(,\\s*)?(Tỉnh\\s+|Thành phố\\s+|Huyện\\s+|Quận\\s+|Thị xã\\s+|Xã\\s+|Phường\\s+|Thị trấn\\s+)?${coreEsc}(,|\\s*$)`, 'i'), '');
    }
    return result;
  }

  /**
   * Strip common Vietnamese geo prefixes: Tỉnh, Thành phố, Huyện, Quận, Thị xã, Xã, Phường, Thị trấn
   */
  private stripGeoPrefix(name: string): string {
    return name.replace(/^(Tỉnh|Thành phố|Huyện|Quận|Thị xã|Xã|Phường|Thị trấn)\s+/i, '');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Match a Ward from address text using fuzzy matching.
   * Ward names in DB have prefixes like "Xã", "Phường", "Thị trấn",
   * but address text often omits these prefixes.
   * Returns the matched ward Code or null.
   */
  private matchWardFromAddress(fullAddress: string): number | null {
    if (!fullAddress || this.wardList.length === 0) return null;
    const lowerAddress = fullAddress.toLowerCase();

    // 1st pass: exact full name match (e.g., "Xã Cương Chính" in address)
    let matched = this.wardList.find(w => w.VNWard && lowerAddress.includes(w.VNWard.trim().toLowerCase()));
    if (matched) return matched.Code;

    // 2nd pass: match core name without prefix (e.g., "Cương Chính" in address)
    matched = this.wardList.find(w => {
      const coreName = this.stripGeoPrefix(w.VNWard.trim()).toLowerCase();
      return coreName.length >= 3 && lowerAddress.includes(coreName);
    });
    return matched ? matched.Code : null;
  }

  /**
   * Parse a full address text to auto-fill Province + Ward dropdowns.
   * After matching, strip geo parts so customer.Address = street only.
   */
  private parseAddressToDropdowns(fullAddress: string, updateApi: boolean = false): void {
    if (!fullAddress) return;

    // Find Province by matching name in address text (try core name too)
    const lowerAddress = fullAddress.toLowerCase();
    let matchedProv = this.provinceList.find(p => p.VNProvince && lowerAddress.includes(p.VNProvince.trim().toLowerCase()));
    if (!matchedProv) {
      // Try core name without prefix ("Hưng Yên" instead of "Tỉnh Hưng Yên")
      matchedProv = this.provinceList.find(p => {
        if (!p.VNProvince) return false;
        const core = this.stripGeoPrefix(p.VNProvince.trim()).toLowerCase();
        return core.length >= 3 && lowerAddress.includes(core);
      });
    }
    if (!matchedProv) {
      this.customer.Address = fullAddress;
      this.syncCustomerToInvoice();
      if (updateApi && this.customer.Address !== this.customerCopy.Address) {
        this.onCustomerChange('Address');
      }
      this.cdr.detectChanges();
      return;
    }

    this.customer.Province = matchedProv.Code;
    this.loadWards(matchedProv.Code, () => {
      // Find Ward by matching name in address text
      this.customer.Ward = this.matchWardFromAddress(fullAddress);
      // Strip geo parts from address, keep only street
      this.customer.Address = this.stripGeoFromAddress(fullAddress);
      
      if (updateApi) {
        if (this.customer.Province !== this.customerCopy.Province) this.onCustomerChange('Province');
        if (this.customer.Ward !== this.customerCopy.Ward) this.onCustomerChange('Ward');
        if (this.customer.Address !== this.customerCopy.Address) this.onCustomerChange('Address');
      }
      
      this.customerCopy = { ...this.customer };
      this.syncCustomerToInvoice();
      this.cdr.detectChanges();
    });
  }

  onSameAsPurchaserChange(isChecked: boolean): void {
    this.isSameAsPurchaser = isChecked;
    if (isChecked) {
      if (this.purchaserCustomer) {
        this.applyCustomerData({ ...this.purchaserCustomer });
        this.syncCustomerToInvoice(true);
        this.notification.onSuccess('Đã lấy thông tin người mua xe');
      } else {
        const purchaserCode = this.invoice['Customer'] || this.orderInfo?.customerCode;
        if (purchaserCode) {
          this.isLoading = true;
          const param = new CSLoyalCustomerCusDTO();
          param.Code = purchaserCode;
          const sub = this.apiService.GetCustomer(param).subscribe({
            next: (res: ResponseDTO) => {
              if (res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Code) {
                this.purchaserCustomer = res.ObjectReturn;
                this.applyCustomerData({ ...this.purchaserCustomer });
                this.syncCustomerToInvoice(true);
                this.notification.onSuccess('Đã lấy thông tin người mua xe');
              } else {
                this.notification.onWarning('Không có thông tin người mua xe');
                this.isSameAsPurchaser = false;
              }
              this.isLoading = false;
            },
            error: () => {
              this.notification.onWarning('Lỗi khi lấy thông tin người mua xe');
              this.isSameAsPurchaser = false;
              this.isLoading = false;
            }
          });
          this.arrUnsubscribe.push(sub);
        } else {
          this.notification.onWarning('Không có thông tin người mua xe');
          this.isSameAsPurchaser = false;
        }
      }
    } else {
      this.resetInvoiceFields(false);
    }
  }

  private resetInvoiceFields(silent: boolean = false): void {
    this.customer = new CSLoyalCustomerCusDTO();
    this.customerCopy = new CSLoyalCustomerCusDTO();

    this.invoice.VATCustomer = null;
    this.invoiceCopy.VATCustomer = null;
    this.invoice.VATCustomerName = '';
    this.invoice.VATCCCD = '';
    this.invoice.VATCMND = '';
    this.invoice.VATAddress = '';
    this.invoice.VATProvince = '';
    this.invoice.VATWard = '';
    this.invoice.VATCellPhone = '';
    this.invoice.VATEmail = '';
    this.invoice.VATZalo = '';
    this.invoice.VATGender = null;
    this.invoice.VATIsSamePhone = false;
    this.invoice.VATCompanyTax = '';
    this.invoice.VATCompanyName = '';
    this.invoice.VATBRUName = '';

    this.invoiceCopy = { ...this.invoice };
        if (!silent) {
        this.syncCustomerToInvoice(true);
      }
  }

  onCustomerSearch(type: 'VATCCCD' | 'VATCellPhone'): void {
    if (this.isSameAsPurchaser) return;

    let value = '';
    const param = new CSLoyalCustomerCusDTO();

    if (type === 'VATCCCD') {
      value = this.invoice.VATCCCD?.replace(/\D/g, '') || '';
      if (value.length < 9) return;
      if (value === this.invoiceCopy.VATCCCD?.replace(/\D/g, '')) return;
      param.CitizenCardNo = value;
    } else if (type === 'VATCellPhone') {
      value = this.invoice.VATCellPhone?.replace(/\D/g, '') || '';
      if (value.length < 10) return;
      if (value === this.invoiceCopy.VATCellPhone?.replace(/\D/g, '')) return;
      param.Cellphone1 = value;
    }

    const sub = this.apiService.GetCustomer(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Code) {
          this.applyCustomerData({ ...res.ObjectReturn });
          this.notification.onSuccess('Đã tìm thấy thông tin khách hàng');
        }
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadOrderInfo(): void {
    if (!this.invoice.OrderMaster) return;
    const sub = this.apiService.GetListSALMaster({
      filter: { logic: 'and', filters: [{ field: 'Code', operator: 'eq', value: this.invoice.OrderMaster }] },
      sort: [], skip: 0, take: 1
    }).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          // GetListSALMaster returns grouped: [{ListData: [...]}] or {Data: [...]}
          let order: any = null;
          const raw = res.ObjectReturn;
          if (Array.isArray(raw)) {
            // Grouped format: [{ListData: [order1, order2]}]
            for (const group of raw) {
              if (group.ListData?.length) {
                order = group.ListData.find((o: any) => o.Code === this.invoice.OrderMaster);
                if (order) break;
              }
            }
          } else if (raw.Data?.length) {
            // Flat format: {Data: [order1]}
            order = raw.Data[0];
          }

          if (order) {
            this.orderInfo = {
              id: order.ID || '',
              customerCode: order.Customer || null,
              customerName: order.CustomerName || '',
              vehicleName: (this.invoice['VehicleName'] ? `${this.invoice['VehicleName']} | ${this.invoice['VehicleColorName'] || ''}` : order.VehicleName) || '',
              totalAmount: order.TotalPayment || 0,
              status: order.Status || SALOrderMasterStatusRetailEnum.PENDING,
              statusName: order.StatusName || 'Chờ xử lý'
            };

            if (this.isTransfer) {
              this.loadTransferReceipt();
            }
          }
        }
      }
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region Vehicle transfer (xe điều chuyển)
  private detectTransfer(data: any): void {
    const headTransfer = data.HeadTransfer;
    const currentHeadCode = this.currentheader?.Head || this.currentheader?.Code;

    if (headTransfer && currentHeadCode && String(headTransfer) !== String(currentHeadCode)) {
      this.isTransfer = true;
      this.transferHeadCode = headTransfer;
      this.orderDetailCode = data.OrderDetail || data.OrderDetailCode || null;
      this.transferReceiptCode = data.TransferReceiptCode || null;
      this.transferReceiptStatus = data.TransferReceiptStatus || null;

      // If receipt is complete and CSVehicle has SK/SM, auto-bind
      if (data.CSFrameSeri && !this.invoice.FrameSeri) {
        this.invoice.FrameSeri = data.CSFrameSeri;
        this.onValueChange('FrameSeri');
      }
      if (data.CSEngineSeri && !this.invoice.EngineSeri) {
        this.invoice.EngineSeri = data.CSEngineSeri;
        this.onValueChange('EngineSeri');
      }

      this.resolveHeadName(headTransfer);
    } else {
      this.isTransfer = false;
    }
  }

  private loadTransferReceipt(): void {
    if (!this.invoice.OrderMaster) return;
    const orderID = this.orderInfo?.id || this.invoice['OrderNo'] || '';
    if (!orderID) return;

    const filter: any = {
      filter: { logic: 'and', filters: [{ field: 'RefNo', operator: 'eq', value: orderID }] },
      sort: [{ field: 'Code', dir: 'desc' }]
    };

    const sub = this.apiService.GetListIOMasterVehicle(filter).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          const raw = res.ObjectReturn?.Data ?? res.ObjectReturn ?? [];
          const masters = Array.isArray(raw) ? raw : [];

          // Override status with real NK/XK status
          const importReceipt = masters.find((m: any) => m.TypeOfMaster === 1);
          const exportReceipt = masters.find((m: any) => m.TypeOfMaster === 2);

          if (importReceipt) {
            this.transferReceiptCode = importReceipt.Code;
            this.transferReceiptStatus = importReceipt.StatusID;
            if (importReceipt.StatusID >= 5) {
              this.loadTransferDetail(importReceipt.Code);
            }
          } else if (exportReceipt) {
            this.transferReceiptCode = exportReceipt.Code;
            this.transferReceiptStatus = exportReceipt.StatusID;
          }
        }
        this.cdr.detectChanges();
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadTransferDetail(masterCode: number): void {
    const filter: any = {
      filter: { logic: 'and', filters: [{ field: 'Master', operator: 'eq', value: masterCode }] },
      sort: [{ field: 'Master', dir: 'desc' }]
    };

    const sub = this.apiService.GetListIODetailVehicle(filter).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          const groups = Array.isArray(res.ObjectReturn) ? res.ObjectReturn : [];
          for (const group of groups) {
            if (group.ListDetail && Array.isArray(group.ListDetail)) {
              for (const detail of group.ListDetail) {
                if (detail.FrameSeri && !this.invoice.FrameSeri) {
                  this.invoice.FrameSeri = detail.FrameSeri;
                  this.onValueChange('FrameSeri');
                }
                if (detail.EngineSeri && !this.invoice.EngineSeri) {
                  this.invoice.EngineSeri = detail.EngineSeri;
                  this.onValueChange('EngineSeri');
                }
                break;
              }
            }
          }
        }
        this.cdr.detectChanges();
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private resolveHeadName(headCode: number): void {
    this.transferHeadName = `Head #${headCode}`;
  }

  get isTransferSKSMDisabled(): boolean {
    return this.isTransfer;
  }

  get transferReceiptStatusLabel(): string {
    if (!this.transferReceiptCode) return 'Chưa tạo phiếu';
    switch (this.transferReceiptStatus) {
      case 1: return 'Tạo mới';
      case 2: return 'Chờ xử lý';
      case 3: return 'Đang xử lý';
      case 4: return 'Đang giao nhận';
      case 5: return 'Hoàn tất';
      default: return 'Hoàn tất';
    }
  }

  // Removed refreshTransferStatus
  //#endregion
  private loadProvinces(): void {
    const sub = this.coreApiService.GetListProvince().subscribe({
      next: (res: ResponseDTO) => {
        if (res?.StatusCode === 0) {
          const raw = res.ObjectReturn;
          this.provinceList = Array.isArray(raw) ? raw : (raw?.Data || []);
          
          // If invoice already loaded, trigger the parsing/matching logic
          if (this.provinceList.length > 0 && this.invoice.Code) {
            if (this.customer.Province) {
              this.loadWards(this.customer.Province, () => {
                // Post-ward load logic for late-loading provinces
                if (!this.customer.Ward && this.customer.Address) {
                  this.customer.Ward = this.matchWardFromAddress(this.customer.Address);
                }
                this.customer.Address = this.stripGeoFromAddress(this.customer.Address);
                this.customerCopy = { ...this.customer };
                this.cdr.detectChanges();
              });
            } else if (this.customer.Address) {
              this.parseAddressToDropdowns(this.customer.Address);
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: () => { this.provinceList = []; }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadWards(provinceCode: number, callback?: () => void): void {
    // BE GetListWard reads request.Payload.GetProperty("Code") = provinceCode
    // It internally finds all Districts for that Province then returns all Wards
    const param = new LSDistrictDTO();
    param.Code = provinceCode;
    const sub = this.coreApiService.GetListWard(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res?.StatusCode === 0) {
          const raw = res.ObjectReturn;
          this.wardList = Array.isArray(raw) ? raw : (raw?.Data || []);
        }
        if (callback) callback();
        this.cdr.detectChanges();
      },
      error: () => {
        this.wardList = [];
        if (callback) callback();
        this.cdr.detectChanges();
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  onProvinceChange(provinceCode: number): void {
    if (!this.provinceList || this.provinceList.length === 0) return; // Prevent Kendo from clearing during load
    this.customer.Province = provinceCode;
    this.customer.Ward = null;
    this.wardList = [];
    if (provinceCode) {
      this.loadWards(provinceCode);
    }
    this.syncCustomerToInvoice(true);
    this.onCustomerChange('Province');
  }

  onWardChange(wardCode: number): void {
    if (!this.wardList || this.wardList.length === 0) return; // Prevent Kendo from clearing during load
    this.customer.Ward = wardCode;
    this.syncCustomerToInvoice(true);
    this.onCustomerChange('Ward');
  }

  onVATAddressBlur(): void {
    if (this.invoice.VATAddress === this.invoiceCopy.VATAddress) return;
    this.invoiceCopy.VATAddress = this.invoice.VATAddress;
    this.onValueChange('VATAddress');
    this.parseAddressToDropdowns(this.invoice.VATAddress, true);
  }
  //#endregion

  //#region Customer field updates (Personal case)
  onCustomerChange(prop: string): void {
    if (this.isLoading) return;
    if (!this.customer.Code) return;
    if (this.customer[prop] === this.customerCopy[prop]) return;

    const param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
      DTO: this.customer,
      Properties: [prop]
    };

    const sub = this.apiService.UpdateLoyalCustomer(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0) {
          // Only update the changed property in copy, do NOT overwrite entire customer
          this.customerCopy[prop] = this.customer[prop];
          this.syncCustomerToInvoice(true);
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
          this.customer[prop] = this.customerCopy[prop];
        }
      },
      error: (err) => {
        this.notification.onError(`Lỗi kết nối: ${err.message}`);
        this.customer[prop] = this.customerCopy[prop];
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private syncCustomerToInvoice(autoSave: boolean = false): void {
    const changedProps: string[] = [];

    if (this.customer.Code && this.invoice.VATCustomer !== this.customer.Code) {
      this.invoice.VATCustomer = this.customer.Code;
      changedProps.push('VATCustomer');
    }

    // Sync customer name — GUARD: never overwrite existing name with empty
    const newName = this.customer.FullName || '';
    if (newName && this.invoice.VATCustomerName !== newName) {
      this.invoice.VATCustomerName = newName;
      changedProps.push('VATCustomerName');
    }

    // Sync phone — GUARD: never overwrite existing phone with empty
    const newPhone = this.customer.Cellphone1 || '';
    if (newPhone && this.invoice.VATCellPhone !== newPhone) {
      this.invoice.VATCellPhone = newPhone;
      changedProps.push('VATCellPhone');
    }

    // Sync CCCD — GUARD: never overwrite existing CCCD with empty
    const newCCCD = this.customer.CitizenCardNo || '';
    if (newCCCD && this.invoice.VATCCCD !== newCCCD) {
      this.invoice.VATCCCD = newCCCD;
      changedProps.push('VATCCCD');
    }

    // Build VATAddress = street + ward + province
    // customer.Address holds ONLY the street part (after geo stripping)
    const geoParts: string[] = [];
    const ward = this.wardList.find(w => w.Code == this.customer.Ward);
    if (ward) geoParts.push(ward.VNWard);
    const province = this.provinceList.find(p => p.Code == this.customer.Province);
    if (province) geoParts.push(province.VNProvince);
    const geoSuffix = geoParts.join(', ');

    const street = this.customer.Address || '';
    const parts: string[] = [];
    if (street) parts.push(street);
    if (geoSuffix) parts.push(geoSuffix);
    const fullAddress = parts.join(', ');

    if (fullAddress && this.invoice.VATAddress !== fullAddress) {
      this.invoice.VATAddress = fullAddress;
      changedProps.push('VATAddress');
    }

    // Sync other missing fields
    if (this.invoice.VATZalo !== (this.customer.Zalo || '')) {
      this.invoice.VATZalo = this.customer.Zalo || '';
      changedProps.push('VATZalo');
    }
    const newEmail = this.customer.Email || '';
    if (this.invoice.VATEmail !== newEmail) {
      this.invoice.VATEmail = newEmail;
      changedProps.push('VATEmail');
    }

    if (autoSave && changedProps.length > 0 && this.invoice.Code) {
      const invoiceParam: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
        DTO: this.invoice,
        Properties: changedProps
      };
      this.apiService.UpdateSALInvoice(invoiceParam).subscribe();
    }
    if (this.invoice.VATGender !== this.customer.Gender) {
      this.invoice.VATGender = this.customer.Gender;
      changedProps.push('VATGender');
    }

    // Sync Province - ONLY if list is loaded to prevent overwriting with empty
    if (this.provinceList.length > 0) {
      const province = this.provinceList.find(p => p.Code == this.customer.Province);
      const newProv = province ? province.Code.toString() : '';
      if (this.invoice.VATProvince !== newProv) {
        this.invoice.VATProvince = newProv;
        changedProps.push('VATProvince');
      }
    }

    // Sync Ward - ONLY if list is loaded to prevent overwriting with empty
    if (this.wardList.length > 0) {
      const ward = this.wardList.find(w => w.Code == this.customer.Ward);
      const newWard = ward ? ward.Code.toString() : '';
      if (this.invoice.VATWard !== newWard) {
        this.invoice.VATWard = newWard;
        changedProps.push('VATWard');
      }
    }
    // Sync IsSamePhone flag
    const newIsSame = !!this.customer.IsCellPhone;
    if (this.invoice.VATIsSamePhone !== newIsSame) {
      this.invoice.VATIsSamePhone = newIsSame;
      changedProps.push('VATIsSamePhone');
    }
    // Sync contact email
    const newContactEmail = this.customer.Email || '';
    if (this.invoice.VATContactEmail !== newContactEmail) {
      this.invoice.VATContactEmail = newContactEmail;
      changedProps.push('VATContactEmail');
    }

    // Persist changed fields to DB
    if (changedProps.length > 0 && this.invoice.Code) {
      const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
        DTO: this.invoice,
        Properties: changedProps
      };
      this.apiService.UpdateSALInvoice(param).subscribe({
        next: (res: ResponseDTO) => {
          if (res.StatusCode === 0) {
            changedProps.forEach(p => {
              (this.invoiceCopy as any)[p] = (this.invoice as any)[p];
            });
          } else {
            this.notification.onError(res.ErrorString);
            changedProps.forEach(p => {
              (this.invoice as any)[p] = (this.invoiceCopy as any)[p];
            });
          }
        }
      });
    }
  }
  //#endregion

  //#region Status display
  isInfoComplete(): boolean {
    const inv = this.invoice;
    if (!inv.FrameSeri || !inv.EngineSeri) return false;
    if (!inv.VATCustomerName) return false;
    if (!inv.VATAddress) return false;
    
    const vatType = inv.VATType || 1;
    if (vatType === 1) {
      return !!(inv.VATCCCD && inv.VATCellPhone);
    }
    if (vatType === 2 || vatType === 3) {
      return !!(inv.VATCompanyName && inv.VATCompanyTax);
    }
    return false;
  }

  getOrderStatusLabel(): string {
    if (!this.orderInfo) return 'CHỜ XỬ LÝ';
    switch (this.orderInfo.status) {
      case SALOrderMasterStatusRetailEnum.PENDING: return 'CHỜ XỬ LÝ';
      case SALOrderMasterStatusRetailEnum.PROCESSING: return 'ĐANG XỬ LÝ';
      case SALOrderMasterStatusRetailEnum.COMPLETE: return 'HOÀN THÀNH';
      case SALOrderMasterStatusRetailEnum.CANCEL: return 'ĐÃ HỦY';
      default: return 'CHỜ XỬ LÝ';
    }
  }

  getOrderStatusClass(): string {
    if (!this.orderInfo) return 'status-new';
    switch (this.orderInfo.status) {
      case SALOrderMasterStatusRetailEnum.NEW: return 'status-new';
      case SALOrderMasterStatusRetailEnum.PENDING: return 'status-pending';
      case SALOrderMasterStatusRetailEnum.PROCESSING: return 'status-processing';
      case SALOrderMasterStatusRetailEnum.COMPLETE: return 'status-complete';
      case SALOrderMasterStatusRetailEnum.CANCEL: return 'status-cancel';
      default: return 'status-new';
    }
  }

  getStatusLabel(): string {
    if (this.invoice.Status === 134 || this.invoice.Status === SALOrderInvoiceStatusEnum.New) {
      return 'Chưa phát hành';
    }
    if (this.invoice.Status === 135 || this.invoice.Status === SALOrderInvoiceStatusEnum.Success) {
      return 'Đã phát hành';
    }
    if (this.invoice.Status === 136 || this.invoice.Status === SALOrderInvoiceStatusEnum.Cancled) {
      return 'Đã hủy';
    }
    return this.invoice.StatusName || 'Chưa phát hành';
  }

  getStatusClass(): string {
    if (this.invoice.Status === 134 || this.invoice.Status === SALOrderInvoiceStatusEnum.New) {
      return 'status-pending';
    }
    if (this.invoice.Status === 135 || this.invoice.Status === SALOrderInvoiceStatusEnum.Success) {
      return 'status-success';
    }
    if (this.invoice.Status === 136 || this.invoice.Status === SALOrderInvoiceStatusEnum.Cancled) {
      return 'status-cancel';
    }
    return 'status-pending';
  }
  //#endregion

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  //#region Invoice field updates (Business/Public case + shared fields)
  private pendingSaves = new Set<string>();

  onValueChange(prop: string): void {
    if (this.isLoading) return;

    const currentVal = this.invoice[prop];
    const previousVal = this.invoiceCopy[prop];

    // Normalize: treat null, undefined, empty string as equivalent
    const normalize = (v: any) => (v === null || v === undefined || v === '') ? '' : String(v);
    if (normalize(currentVal) === normalize(previousVal)) return;

    // Prevent duplicate saves for same property
    if (this.pendingSaves.has(prop)) return;
    this.pendingSaves.add(prop);

    // Snapshot the value NOW before any async changes
    const snapshotValue = currentVal;

    if (prop === 'VATType' && this.invoice.VATType) {
      this.invoice.VATType = Number(this.invoice.VATType);
    }

    const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
      DTO: { ...this.invoice, [prop]: snapshotValue } as SALOrderInvoiceCusDTO,
      Properties: [prop]
    };

    const sub = this.apiService.UpdateSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        this.pendingSaves.delete(prop);
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi cập nhật ${prop}: ${res.ErrorString}`);
          this.invoice[prop] = previousVal;
        } else {
          // Update copy with snapshotted value
          this.invoiceCopy[prop] = snapshotValue;
          // Restore the value in case it was overwritten by re-render
          this.invoice[prop] = snapshotValue;
        }
      },
      error: (err) => {
        this.pendingSaves.delete(prop);
        const errMsg = err?.message || err?.statusText || 'Không thể kết nối máy chủ';
        this.notification.onError(`Lỗi kết nối khi cập nhật ${prop}: ${errMsg}`);
        this.invoice[prop] = previousVal;
      }
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region Số khung / Số máy lookup
  private lookupSeri(field: 'FrameSeri' | 'EngineSeri'): void {
    const value = this.invoice[field]?.trim();
    if (!value || value === this.invoiceCopy[field]) return;

    const otherField = field === 'FrameSeri' ? 'EngineSeri' : 'FrameSeri';
    const url = '/api/proxy-api/api/warehouse/GetIOSeriInternal';

    const sub = this.http.post<any>(url, { [field]: value }).subscribe({
      next: (res) => {
        if (res?.StatusCode === 0 && res?.ObjectReturn) {
          const otherValue = res.ObjectReturn[otherField];
          if (otherValue) {
            this.invoice[otherField] = otherValue;
            const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
              DTO: this.invoice,
              Properties: [field, otherField]
            };
            this.apiService.UpdateSALInvoice(param).subscribe({
              next: (saveRes: ResponseDTO) => {
                if (saveRes.StatusCode === 0) {
                  this.invoiceCopy[field] = this.invoice[field];
                  this.invoiceCopy[otherField] = this.invoice[otherField];
                  this.notification.onSuccess('Thành công');
                } else {
                  this.notification.onError(saveRes.ErrorString);
                  this.invoice[field] = this.invoiceCopy[field];
                  this.invoice[otherField] = this.invoiceCopy[otherField];
                }
              }
            });
          } else {
            this.onValueChange(field);
          }
        } else {
          this.onValueChange(field);
        }
      },
      error: () => {
        this.onValueChange(field);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  onFrameSeriBlur(): void {
    this.lookupSeri('FrameSeri');
  }

  onEngineSeriBlur(): void {
    this.lookupSeri('EngineSeri');
  }
  //#endregion

  //#region Save / Export
  onSaveForm(): void {
    if (!this.invoice.Code) return;
    
    // Explicitly call Update API so the user knows it's saving
    this.isLoading = true;
    const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
      DTO: this.invoice,
      Properties: ['VATCustomerName', 'VATCellPhone', 'VATAddress'] // Send some core properties
    };
    
    const sub = this.apiService.UpdateSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        this.isLoading = false;
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Đã lưu thông tin chứng từ hóa đơn');
        } else {
          this.notification.onError(`Lỗi lưu thông tin: ${res.ErrorString}`);
        }
      },
      error: () => {
        this.isLoading = false;
        this.notification.onError('Lỗi kết nối khi lưu thông tin');
      }
    });
    this.arrUnsubscribe.push(sub);
  }



  onUpdate(): void {
    // Validate SK/SM (mandatory for all types)
    if (!this.invoice.FrameSeri?.trim()) {
      this.notification.onWarning('Vui lòng nhập Số khung');
      return;
    }
    if (!this.invoice.EngineSeri?.trim()) {
      this.notification.onWarning('Vui lòng nhập Số máy');
      return;
    }

    // Validate VATType selected
    if (!this.invoice.VATType) {
      this.notification.onWarning('Vui lòng chọn Loại hóa đơn');
      return;
    }

    // Personal case: validate customer fields
    if (this.invoice.VATType == 1) {
      const cccd = (this.invoice.VATCCCD || '').replace(/\D/g, '');
      if (cccd.length < 9) {
        this.notification.onWarning('Số CCCD/CMND không hợp lệ (tối thiểu 9 số)');
        return;
      }
      if (!this.invoice.VATCustomerName?.trim()) {
        this.notification.onWarning('Vui lòng nhập tên Khách hàng');
        return;
      }
      if (!this.customer.Province) {
        this.notification.onWarning('Vui lòng chọn Tỉnh thành');
        return;
      }
      if (!this.customer.Ward) {
        this.notification.onWarning('Vui lòng chọn Phường xã');
        return;
      }
      const phone = (this.invoice.VATCellPhone || '').replace(/\D/g, '');
      if (phone.length < 10) {
        this.notification.onWarning('Số di động không hợp lệ (tối thiểu 10 số)');
        return;
      }
      // Sync customer → invoice snapshot before save
      this.syncCustomerToInvoice();
    }

    // Business / Public case: validate invoice fields
    if (this.invoice.VATType == 2 || this.invoice.VATType == 3) {
      const isPublic = this.invoice.VATType == 3;
      if (!this.invoice.VATCustomerName?.trim()) {
        this.notification.onWarning('Vui lòng nhập tên Người mua hàng');
        return;
      }
      if (!this.invoice.VATCompanyTax?.trim()) {
        this.notification.onWarning(`Vui lòng nhập ${isPublic ? 'Mã đơn vị' : 'Mã số thuế'}`);
        return;
      }
      if (!this.invoice.VATCompanyName?.trim()) {
        this.notification.onWarning(`Vui lòng nhập ${isPublic ? 'Tên đơn vị' : 'Tên công ty / doanh nghiệp'}`);
        return;
      }
      if (!this.invoice.VATEmail?.trim()) {
        this.notification.onWarning('Vui lòng nhập Email');
        return;
      }
      if (!this.invoice.VATAddress?.trim()) {
        this.notification.onWarning('Vui lòng nhập Địa chỉ');
        return;
      }
      const cccd = (this.invoice.VATCCCD || '').replace(/\D/g, '');
      if (cccd.length < 9) {
        this.notification.onWarning('Số CCCD người đại diện không hợp lệ (tối thiểu 9 số)');
        return;
      }
      if (!this.invoice.VATBRUName?.trim()) {
        this.notification.onWarning('Vui lòng nhập tên Người đại diện');
        return;
      }
      if (!this.customer.Province) {
        this.notification.onWarning('Vui lòng chọn Tỉnh thành');
        return;
      }
      if (!this.customer.Ward) {
        this.notification.onWarning('Vui lòng chọn Phường xã');
        return;
      }
    }

    // Sync final data and save — NO PDF export here.
    // PDF export only happens at invoice issuance (mtb026).
    this.syncCustomerToInvoice();
    this.notification.onSuccess('Đã lưu thông tin chứng từ hóa đơn');
  }
  //#endregion

  //#region Same phone toggle
  onSamePhoneChange(e: any): void {
    if (e === true) {
      // Copy phone number to Zalo when checked
      this.customer.Zalo = this.customer.Cellphone1 || '';
      this.customer.IsCellPhone = true;
      if (this.customer.Code) {
        const param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
          DTO: this.customer,
          Properties: ['IsCellPhone', 'Zalo']
        };
        const sub = this.apiService.UpdateLoyalCustomer(param).subscribe({
          next: (res: ResponseDTO) => {
            if (res.StatusCode === 0) {
              this.customerCopy.IsCellPhone = this.customer.IsCellPhone;
              this.customerCopy.Zalo = this.customer.Zalo;
              this.notification.onSuccess('Thành công');
            }
          }
        });
        this.arrUnsubscribe.push(sub);
      }
    } else {
      this.customer.Zalo = '';
      this.customer.IsCellPhone = false;
      if (this.customer.Code) {
        this.onCustomerChange('IsCellPhone');
      }
    }
    // Sync to invoice
    this.invoice.VATIsSamePhone = !!e;
    this.invoice.VATZalo = this.customer.Zalo || '';
    if (this.invoice.Code) {
      const invoiceParam: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
        DTO: this.invoice,
        Properties: ['VATIsSamePhone', 'VATZalo']
      };
      this.apiService.UpdateSALInvoice(invoiceParam).subscribe();
    }
  }
  //#endregion

  //#region Apply to other vehicles
  onApplyToOtherVehicles(): void {
    if (!this.invoice.OrderMaster) return;
    this.isApplying = true;
    const sub = this.apiService.GetListSALInvoice({}).subscribe({
      next: (res: ResponseDTO) => {
        this.isApplying = false;
        if (res.StatusCode === 0) {
          const all = res.ObjectReturn?.Data ?? res.ObjectReturn ?? [];
          this.siblingInvoices = (all as SALOrderInvoiceCusDTO[])
            .filter(inv => inv.OrderMaster === this.invoice.OrderMaster 
                        && inv.Code !== this.invoice.Code
                        && inv.Status !== 135
                        && inv.Status !== SALOrderInvoiceStatusEnum.Success);
          if (this.siblingInvoices.length === 0) {
            this.notification.onWarning('Không có xe khác trong cùng phiếu bán hàng');
            return;
          }
          this.selectedSiblings.clear();
          this.siblingInvoices.forEach(inv => this.selectedSiblings.add(inv.Code));
          this.showApplyPopup = true;
        }
      },
      error: () => {
        this.isApplying = false;
        this.notification.onError('Lỗi tải danh sách hóa đơn');
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  toggleSibling(code: number): void {
    if (this.selectedSiblings.has(code)) {
      this.selectedSiblings.delete(code);
    } else {
      this.selectedSiblings.add(code);
    }
  }

  confirmApply(): void {
    if (this.selectedSiblings.size === 0) {
      this.notification.onWarning('Vui lòng chọn ít nhất 1 xe');
      return;
    }

    // Sync customer snapshot to invoice props for copying
    this.syncCustomerToInvoice();

    const customerProps = [
      'VATType', 'VATCustomerName', 'VATCCCD', 'VATAddress',
      'VATCellPhone', 'VATEmail', 'VATPassport',
      'VATCompanyName', 'VATCompanyTax', 'VATBRUName', 'VATBRUCode', 'VATNote'
    ];

    this.isApplying = true;
    let completed = 0;
    let failed = 0;
    const total = this.selectedSiblings.size;

    this.selectedSiblings.forEach(code => {
      const dto = new SALOrderInvoiceCusDTO();
      dto.Code = code;
      customerProps.forEach(p => (dto as any)[p] = (this.invoice as any)[p]);

      const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
        DTO: dto,
        Properties: customerProps
      };

      const sub = this.apiService.UpdateSALInvoice(param).subscribe({
        next: (res: ResponseDTO) => {
          if (res.StatusCode !== 0) failed++;
          completed++;
          if (completed === total) this.onApplyComplete(failed);
        },
        error: () => {
          failed++;
          completed++;
          if (completed === total) this.onApplyComplete(failed);
        }
      });
      this.arrUnsubscribe.push(sub);
    });
  }

  private onApplyComplete(failed: number): void {
    this.isApplying = false;
    this.showApplyPopup = false;
    if (failed === 0) {
      this.notification.onSuccess(`Đã áp dụng thông tin cho ${this.selectedSiblings.size} xe`);
    } else {
      this.notification.onWarning(`Hoàn tất: ${this.selectedSiblings.size - failed} thành công, ${failed} lỗi`);
    }
  }

  closeApplyPopup(): void {
    this.showApplyPopup = false;
  }
  //#endregion
}


