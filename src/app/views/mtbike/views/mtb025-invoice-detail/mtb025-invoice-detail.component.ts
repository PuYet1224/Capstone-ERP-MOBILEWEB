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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private configCache: ConfigCacheService,
    private cache: PsCache
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

  private getlistlslist() {
    const sub = this.configCache.GetListLSList(LSListTypeDataEnum.InvoiceType).subscribe({
      next: (data) => {
        this.invoiceTypes = data || [];
      },
      error: (err) => {
        this.notification.onError(`Lỗi tải danh sách loại hóa đơn: ${err}`);
      }
    });
    this.arrUnsubscribe.push(sub);
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
    this.isLoading = true;

    // Gọi API Export PDF từ Backend
    const param = { Code: this.invoice.Code, Type: this.invoice.VATType };

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

          this.notification.onSuccess('Đã xuất Hóa đơn PDF thành công!');
        } else {
          this.notification.onError(`Lỗi xuất PDF: ${res.ErrorString}`);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.onError('Lỗi kết nối khi xuất PDF');
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
    console.log(param);

    const sub = this.apiService.UpdateSALInvoice(param).subscribe({
      next: (res: ResponseDTO) => {
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi cập nhật ${prop}: ${res.ErrorString}`);
          // Revert on error
          this.invoice[prop] = this.invoiceCopy[prop];
        }
        else {
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

}
