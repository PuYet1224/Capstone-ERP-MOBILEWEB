import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'mtb025-invoice-detail',
  templateUrl: './mtb025-invoice-detail.component.html',
  styleUrls: ['./mtb025-invoice-detail.component.scss']
})
export class Mtb025InvoiceDetailComponent implements OnInit, OnDestroy {
  public invoice: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public invoiceCopy: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public isLoading = false;
  private arrUnsubscribe: Subscription[] = [];

  // Apply to other vehicles
  public showApplyPopup = false;
  public siblingInvoices: SALOrderInvoiceCusDTO[] = [];
  public selectedSiblings = new Set<number>();
  public isApplying = false;

  // Options for Dropdown
  public invoiceTypes: ListDTO[] = [];

  // Lists for Personal case
  public listGender = [
    { Code: 1, ListName: 'Nam' },
    { Code: 2, ListName: 'Nữ' },
    { Code: 3, ListName: 'Khác' }
  ];
  public listYear: number[] = [];
  public listMonth: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  public listDay: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  public currentheader: LSHeadCusDTO = this.configService.GetHead();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private configCache: ConfigCacheService,
    private cache: PsCache,
    private configService: GetConfigService,
  ) { 
    // Init years
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      this.listYear.push(i);
    }
  }

  ngOnInit(): void {
    // Read from cache instead of URL parameter
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
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach(sub => sub.unsubscribe());
  }

  private getlistlslist(): void {
    try {
      const sub = this.configCache.GetListLSList(LSListTypeDataEnum.InvoiceType).subscribe({
        next: (data) => {
          this.invoiceTypes = data || [];
        },
        error: () => {
          this.invoiceTypes = [];
        }
      });
      this.arrUnsubscribe.push(sub);
    } catch {
      this.invoiceTypes = [];
    }
  }

  loadInvoice(code: number): void {
    this.isLoading = true;
    const param = new SALOrderInvoiceCusDTO();
    param.Code = code;

    const sub = this.apiService.GetSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode === 0 && res.ObjectReturn) {
          this.invoice = res.ObjectReturn;
          this.invoiceCopy = { ...res.ObjectReturn };
          // Ensure VATType has a default value if missing
          if (!this.invoice.VATType && this.invoiceTypes.length > 0) {
            this.invoice.VATType = this.invoiceTypes[0].TypeOfList; 
            this.invoiceCopy.VATType = this.invoiceTypes[0].TypeOfList;
          }
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

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onUpdate(): void {
    // Validation for VATType == 1 (Personal)
    if (this.invoice.VATType == 1) {
      if (!this.invoice.VATType) {
        this.notification.onWarning('Vui lòng chọn Loại hóa đơn');
        return;
      }
      if (!this.invoice['VATCCCD']) {
        this.notification.onWarning('Vui lòng nhập Số căn cước công dân');
        return;
      }
      if (!this.invoice.VATCustomerName) {
        this.notification.onWarning('Vui lòng nhập tên Khách hàng');
        return;
      }
      if (!this.invoice['VATProvince']) {
        this.notification.onWarning('Vui lòng nhập Tỉnh thành');
        return;
      }
      if (!this.invoice['VATWard']) {
        this.notification.onWarning('Vui lòng nhập Phường xã');
        return;
      }
      if (!this.invoice.VATCellPhone) {
        this.notification.onWarning('Vui lòng nhập Số di động');
        return;
      }
    }

    // Validation for VATType == 2 (Business) or VATType == 3 (Public Service)
    if (this.invoice.VATType == 2 || this.invoice.VATType == 3) {
      const isPublic = this.invoice.VATType == 3;
      if (!this.invoice.VATCustomerName) {
        this.notification.onWarning('Vui lòng nhập tên Người mua hàng');
        return;
      }
      if (!this.invoice.VATCompanyTax) {
        this.notification.onWarning(`Vui lòng nhập ${isPublic ? 'Mã đơn vị' : 'Mã số thuế'}`);
        return;
      }
      if (!this.invoice.VATCompanyName) {
        this.notification.onWarning(`Vui lòng nhập ${isPublic ? 'Tên đơn vị' : 'Tên công ty / doanh nghiệp'}`);
        return;
      }
      if (!this.invoice.VATEmail) {
        this.notification.onWarning('Vui lòng nhập Email');
        return;
      }
      if (!this.invoice.VATAddress) {
        this.notification.onWarning('Vui lòng nhập Địa chỉ');
        return;
      }
    }

    this.isLoading = true;

    // Gọi API Export PDF từ Backend
    const param = { Code: this.invoice.Code, Type: this.invoice.VATType, HeadName: this.currentheader.HeadName, TaxCode: this.currentheader.TaxCode, Address: this.currentheader.Address };

    this.apiService.ExportSALInvoicePdf(param).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.StatusCode === 0 && res.ObjectReturn?.Base64) {
          // 1. Lấy chuỗi Base64 và tên file từ BE trả về
          const base64Data = res.ObjectReturn.Base64;
          const fileName = res.ObjectReturn.FileName || `HoaDon_${this.invoice.InvoiceNo}.pdf`;

          // 2. Convert Base64 sang Blob (File thực)
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          // 3. Tự động tải file xuống trình duyệt
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();

          this.notification.onSuccess('Xuất hóa đơn thành công!');
        } else {
          this.notification.onError(`Lỗi xuất hóa đơn: ${res.ErrorString}`);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.onError('Lỗi kết nối khi xuất hóa đơn');
      }
    });
  }


  onValueChange(prop: string): void {
    // Check if value actually changed
    if (this.invoice[prop] === this.invoiceCopy[prop]) {
      return;
    }

    const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
      DTO: this.invoice,
      Properties: [prop]
    };
    
    // Ensure VATType is a number if it's the property being changed
    if (prop === 'VATType' && this.invoice.VATType) {
      this.invoice.VATType = Number(this.invoice.VATType);
    }

    console.log('Updating prop:', prop, 'Value:', this.invoice[prop]);

    const sub = this.apiService.UpdateSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi cập nhật ${prop}: ${res.ErrorString}`);
          // Revert on error
          this.invoice[prop] = this.invoiceCopy[prop];
        }
        else {
          console.log(this.invoice.VATType);
          this.invoice = res.ObjectReturn;
          this.invoiceCopy = { ...res.ObjectReturn };
          this.notification.onSuccess(`Thành công`);
        }
      },
      error: (err) => {
        this.notification.onError(`Lỗi kết nối khi cập nhật ${prop}: ${err.message}`);
        // Revert on error
        this.invoice[prop] = this.invoiceCopy[prop];
      }
    });

    this.arrUnsubscribe.push(sub);
  }

  onSamePhoneChange(e: any): void {
    if (e === true) {
      this.invoice['VATZalo'] = '';
      const param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
        DTO: this.invoice,
        Properties: ['VATIsSamePhone', 'VATZalo']
      };

      const sub = this.apiService.UpdateSALInvoice(param).subscribe({
        next: (res: ResponseDTO) => {
          if (res.StatusCode === 0) {
            this.invoice = res.ObjectReturn;
            this.invoiceCopy = { ...res.ObjectReturn };
            this.notification.onSuccess(`Thành công`);
          }
        }
      });
      this.arrUnsubscribe.push(sub);
    } else {
      this.onValueChange('VATIsSamePhone');
    }
  }

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

    const customerProps = [
      'VATType', 'VATCustomerName', 'VATCCCD', 'VATCMND',
      'VATGender', 'VATProvince', 'VATWard', 'VATAddress',
      'VATCellPhone', 'VATZalo', 'VATIsSamePhone', 'VATContactEmail', 'VATEmail',
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
