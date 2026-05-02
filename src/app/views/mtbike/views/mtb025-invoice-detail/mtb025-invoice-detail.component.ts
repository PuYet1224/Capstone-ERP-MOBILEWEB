import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { CSLoyalCustomerCusDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { LSProvinceDTO } from 'src/app/models/dtos/e-dtos/ls-province.dto';
import { LSWardDTO } from 'src/app/models/dtos/e-dtos/ls-ward.dto';

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

  // Customer data from CSLoyalCustomer
  public customer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  private customerCopy: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();

  // Province / Ward cascade (no District)
  public provinceList: LSProvinceDTO[] = [];
  public wardList: LSWardDTO[] = [];

  public readonly listGender = [
    { Code: 7, ListName: 'Nam' },
    { Code: 8, ListName: 'Nữ' }
  ] as const;
  public currentheader: LSHeadCusDTO = this.configService.GetHead();

  public orderInfo = { id: '', customerName: '', vehicleName: '', totalAmount: 0 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private configCache: ConfigCacheService,
    private cache: PsCache,
    private configService: GetConfigService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
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
          this.isReadOnly = this.invoice.Status === SALOrderInvoiceStatusEnum.Success;
          if (!this.invoice.VATType && this.invoiceTypes.length > 0) {
            this.invoice.VATType = this.invoiceTypes[0].TypeOfList;
            this.invoiceCopy.VATType = this.invoiceTypes[0].TypeOfList;
          }
          // Load customer from invoice response (GetSALInvoice joins OrderMaster.Customer)
          const customerCode = this.invoice.VATCustomer || this.invoice['Customer'];
          if (customerCode) {
            this.loadCustomer(customerCode);
          }
          this.loadOrderInfo();
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

  private applyCustomerData(data: any): void {
    this.customer = data;
    this.customer.Email = this.customer.Email || this.invoice.VATEmail || '';
    this.customer.Zalo = this.customer.Zalo || this.invoice.VATZalo || '';
    this.customer.CitizenCardNo = this.customer.CitizenCardNo || this.invoice.VATCCCD || '';
    this.customer.CardNo = this.customer.CardNo || this.invoice.VATCMND || '';
    this.customer.Cellphone1 = this.customer.Cellphone1 || this.invoice.VATCellPhone || '';
    this.customer.FullName = this.customer.FullName || this.invoice.VATCustomerName || this.invoice['CustomerName'] || '';
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
    this.syncCustomerToInvoice();
    // Cascade: load ward if province exists
    if (this.customer.Province) {
      this.loadWards(this.customer.Province);
    }
  }

  onCCCDBlur(): void {
    const cccd = this.customer.CitizenCardNo?.trim();
    if (!cccd) return;
    // Same value, skip
    if (cccd === this.customerCopy.CitizenCardNo) return;

    // Customer already loaded from order → just update CitizenCardNo on existing customer
    if (this.customer.Code) {
      this.onCustomerChange('CitizenCardNo');
      return;
    }

    // No customer loaded yet → search by CCCD to find existing customer
    const param = new CSLoyalCustomerCusDTO();
    param.CitizenCardNo = cccd;

    const sub = this.apiService.GetCustomer(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Code) {
          this.applyCustomerData(res.ObjectReturn);
          this.notification.onSuccess('Đã tìm thấy khách hàng');
        } else {
          this.notification.onWarning(res.ErrorString || 'Không tìm thấy khách hàng với CCCD này. Vui lòng nhập thủ công.');
        }
      },
      error: () => {
        this.notification.onWarning('Không thể tra cứu khách hàng. Vui lòng nhập thủ công.');
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
              customerName: order.CustomerName || '',
              vehicleName: order.VehicleName || '',
              totalAmount: order.TotalPayment || 0
            };
            // Fallback: if customer wasn't loaded from invoice, try from order
            if (!this.customerLoaded && order.Customer) {
              this.loadCustomer(order.Customer);
            }
          }
        }
      }
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region Province / Ward cascade (no District)
  private loadProvinces(): void {
    const url = '/api/proxy-api/api/core/GetListProvince';
    const sub = this.http.post<any>(url, null).subscribe({
      next: (res) => {
        if (res?.StatusCode === 0) {
          this.provinceList = res.ObjectReturn || [];
        }
      },
      error: () => { this.provinceList = []; }
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadWards(provinceCode: number): void {
    const url = '/api/proxy-api/api/core/GetListWard';
    const sub = this.http.post<any>(url, { Code: provinceCode }).subscribe({
      next: (res) => {
        if (res?.StatusCode === 0) {
          this.wardList = res.ObjectReturn || [];
        }
      },
      error: () => { this.wardList = []; }
    });
    this.arrUnsubscribe.push(sub);
  }

  onProvinceChange(provinceCode: number): void {
    this.customer.Province = provinceCode;
    this.customer.Ward = null;
    this.wardList = [];
    if (provinceCode) {
      this.loadWards(provinceCode);
    }
    this.onCustomerChange('Province');
  }

  onWardChange(wardCode: number): void {
    this.customer.Ward = wardCode;
    this.onCustomerChange('Ward');
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
          this.syncCustomerToInvoice();
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

  private syncCustomerToInvoice(): void {
    const changedProps: string[] = [];

    // Sync customer name
    const newName = this.customer.FullName || '';
    if (this.invoice.VATCustomerName !== newName) {
      this.invoice.VATCustomerName = newName;
      changedProps.push('VATCustomerName');
    }

    // Sync phone
    const newPhone = this.customer.Cellphone1 || '';
    if (this.invoice.VATCellPhone !== newPhone) {
      this.invoice.VATCellPhone = newPhone;
      changedProps.push('VATCellPhone');
    }

    // Sync CCCD
    const newCCCD = this.customer.CitizenCardNo || '';
    if (this.invoice.VATCCCD !== newCCCD) {
      this.invoice.VATCCCD = newCCCD;
      changedProps.push('VATCCCD');
    }

    // Build full address from ward + province + street
    const geoParts: string[] = [];
    const ward = this.wardList.find(w => w.Code === this.customer.Ward);
    if (ward) geoParts.push(ward.VNWard);
    const province = this.provinceList.find(p => p.Code === this.customer.Province);
    if (province) geoParts.push(province.VNProvince);
    const geoAddress = geoParts.join(', ');

    const street = this.customer.Address || '';
    const fullParts: string[] = [];
    if (street) fullParts.push(street);
    if (geoAddress) fullParts.push(geoAddress);
    const autoAddress = fullParts.join(', ');

    // Always update address from geo data (unless user manually edited to something completely different)
    if (autoAddress && this.invoice.VATAddress !== autoAddress) {
      this.invoice.VATAddress = autoAddress;
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
    if (this.invoice.VATGender !== this.customer.Gender) {
      this.invoice.VATGender = this.customer.Gender;
      changedProps.push('VATGender');
    }
    const newProv = province ? province.Code.toString() : '';
    if (this.invoice.VATProvince !== newProv) {
      this.invoice.VATProvince = newProv;
      changedProps.push('VATProvince');
    }
    const newWard = ward ? ward.Code.toString() : '';
    if (this.invoice.VATWard !== newWard) {
      this.invoice.VATWard = newWard;
      changedProps.push('VATWard');
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
            this.invoiceCopy = { ...res.ObjectReturn };
          }
        }
      });
    }
  }
  //#endregion

  //#region Status display
  getStatusLabel(): string {
    switch (this.invoice.Status) {
      case SALOrderInvoiceStatusEnum.New: return 'Chờ xử lý';
      case SALOrderInvoiceStatusEnum.Success: return 'Đã phát hành';
      case SALOrderInvoiceStatusEnum.Cancled: return 'Đã hủy';
      default: return 'Chờ xử lý';
    }
  }

  getStatusClass(): string {
    switch (this.invoice.Status) {
      case SALOrderInvoiceStatusEnum.New: return 'status-pending';
      case SALOrderInvoiceStatusEnum.Success: return 'status-success';
      case SALOrderInvoiceStatusEnum.Cancled: return 'status-cancel';
      default: return 'status-pending';
    }
  }
  //#endregion

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  //#region Invoice field updates (Business/Public case + shared fields)
  onValueChange(prop: string): void {
    if (this.isLoading) return;
    if (this.invoice[prop] === this.invoiceCopy[prop]) return;

    const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
      DTO: this.invoice,
      Properties: [prop]
    };
    
    if (prop === 'VATType' && this.invoice.VATType) {
      this.invoice.VATType = Number(this.invoice.VATType);
    }

    const sub = this.apiService.UpdateSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi cập nhật ${prop}: ${res.ErrorString}`);
          this.invoice[prop] = this.invoiceCopy[prop];
        } else {
          // Only update the copy, do NOT overwrite entire invoice object
          this.invoiceCopy[prop] = this.invoice[prop];
          this.notification.onSuccess('Thành công');
        }
      },
      error: (err) => {
        this.notification.onError(`Lỗi kết nối khi cập nhật ${prop}: ${err.message}`);
        this.invoice[prop] = this.invoiceCopy[prop];
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
                  this.invoice = saveRes.ObjectReturn;
                  this.invoiceCopy = { ...saveRes.ObjectReturn };
                  this.notification.onSuccess('Đã tìm thấy xe');
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
            .filter(inv => inv.OrderMaster === this.invoice.OrderMaster && inv.Code !== this.invoice.Code);
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
