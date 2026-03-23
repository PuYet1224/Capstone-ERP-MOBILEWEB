import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SALOrderInvoiceCusDTO } from "src/app/models/dtos/e-dtos/sal-order-invoice.dto";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { SALOrderInvoiceStatusEnum } from "src/app/models/enums/e-status/sal-order-invoice-status.enum";
import { SALOrderMasterStatusRetailEnum } from "src/app/models/enums/e-status/sal-order-master-status-retail.enum";
import { SALOrderInvoiceVATTypeEnum } from "src/app/models/enums/e-type/sal-order-invoice-vat-type.enum";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PsKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PsCache } from "src/app/services/utilities/ps-cache";
import { PSDate } from "src/app/services/utilities/ps-date";
import { PsString } from "src/app/services/utilities/ps-string";
import { SystemLoaderService } from "src/app/views/system/services/system-loader.service";
import { MtbikeApiService } from "../../services/mtbike-api.service";

@Component({
  selector: 'mtb033-sal-payment-invoice',
  templateUrl: './mtb033-sal-payment-invoice.component.html',
  styleUrls: ['./mtb033-sal-payment-invoice.component.scss'],
})

export class Mtb033SalPaymentInvoiceComponent {
  constructor(
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private api: MtbikeApiService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  ngOnInit(): void {
    // ---- MOCK DATA TEST ----
    const mockWomMaster = { Code: 9999, CustomerName: 'Nguyễn Văn A', Phone: '0901234567', Address: '123 Đường Hoa Hồng, TP.HCM', TotalPrice: 15000000, StatusName: 'Mới' };
    const mockPaymentData = { 
      Code: 0, OrderMaster: 9999, TotalAmount: 15000000, TotalReceiptAmount: 0, 
      CollectedAmount: 15000000, CustomerName: 'Nguyễn Văn A', CellPhone: '0901234567', 
      EffDate: new Date(), Description: 'Thanh toán tiền sửa xe/mua phụ tùng',
      VATType: 1, VATCustomerName: 'Nguyễn Văn A', VATCellPhone: '0901234567', 
      VATAddress: '123 Đường Hoa Hồng', VATEmail: 'nvana@gmail.com'
    };
    this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, mockWomMaster);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, mockPaymentData);
    // ------------------------

    var master = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.womMaster = this.cache.parseValue(master) || mockWomMaster;

    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    this.invoice = this.cache.parseValue(temp) || mockPaymentData;
    if (this.invoice.EffDate) {
      this.invoice.EffDate = new Date(this.invoice.EffDate);
    }
    this.invoicecopy = { ...this.invoice };
    
    // Bypass GetSALInvoice API
    // this.GetSALInvoice(this.invoice)
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region core
  public womMaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public invoice: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public invoicecopy: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public showpopup: boolean = false;
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public enuminvoicestt = SALOrderInvoiceStatusEnum;
  public SALOrderInvoiceVATTypeEnum = SALOrderInvoiceVATTypeEnum;
  public onnavigate(field: string = '') {
    this.router.navigate([field]);
  }
  //#endregion
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  private enableAutoSlide() {
    if (!this.wrapper || !this.content) return;

    const wrapperWidth = this.wrapper.nativeElement.clientWidth;
    const contentWidth = this.content.nativeElement.scrollWidth;

    const el = this.content.nativeElement;
    el.classList.remove('running');

    if (contentWidth > wrapperWidth) {
      requestAnimationFrame(() => {
        el.classList.add('running');
      });
    }
  }

  //#region body
  public vattab: { name: string, value: SALOrderInvoiceVATTypeEnum }[] = [
    { name: 'Cá nhân', value: SALOrderInvoiceVATTypeEnum.Personal },
    { name: 'Doanh nghiệp', value: SALOrderInvoiceVATTypeEnum.Company },
    { name: 'Đơn vị công', value: SALOrderInvoiceVATTypeEnum.Government },
  ]

  public onchangetabvat(type: SALOrderInvoiceVATTypeEnum) {
    if (this.invoice.Status !== this.enuminvoicestt.New) { return }
    this.invoice.VATType = type;
    if (this.invoicecopy.VATType == this.invoice.VATType) return;
    if (this.invoice.Status == this.enuminvoicestt.New) {
      this.invoice.VATEmail = '';
      this.invoice.VATNote = '';
      this.invoice.VATAddress = '';
    }
  }


  public onValueChange(field: string) {
    if (this.invoice[field] === this.invoicecopy[field]) {
      return;
    }

    // Nếu xóa số điện thoại (tab Cá nhân), clear thông tin khách hàng
    if (field === 'VATCellPhone') {
      const cellPhoneValue = this.invoice.VATCellPhone?.trim() || '';
      if (PsString.isNullOrWhitespace(cellPhoneValue) || cellPhoneValue.length < 10) {
        this.invoice.VATCustomerName = '';
        this.invoice.VATPassport = '';
        this.invoice.VATAddress = '';
        this.invoice.VATEmail = '';
        this.invoice.VATNote = '';
        this.invoice.VATCellPhone = '';
        this.invoicecopy.VATCustomerName = '';
        this.invoicecopy.VATPassport = '';
        this.invoicecopy.VATAddress = '';
        this.invoicecopy.VATEmail = '';
        this.invoicecopy.VATNote = '';
        this.invoicecopy.VATCellPhone = '';
        return;
      }
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(this.invoice.VATCellPhone)) {
        this.notification.onWarning('Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng 0)');
        return;
      }
    }

    // Nếu xóa mã số thuế (tab Doanh nghiệp), clear thông tin doanh nghiệp
    if (field === 'VATCompanyTax') {
      const companyTaxValue = this.invoice.VATCompanyTax?.trim() || '';
      if (PsString.isNullOrWhitespace(companyTaxValue)) {
        this.invoice.VATCompanyName = '';
        this.invoice.VATAddress = '';
        this.invoice.VATEmail = '';
        this.invoice.VATNote = '';
        this.invoice.VATCompanyTax = '';
        this.invoicecopy.VATCompanyName = '';
        this.invoicecopy.VATAddress = '';
        this.invoicecopy.VATEmail = '';
        this.invoicecopy.VATNote = '';
        this.invoicecopy.VATCompanyTax = '';
        return;
      }
    }

    // Nếu xóa mã đơn vị (tab Đơn vị công), clear thông tin đơn vị công
    if (field === 'VATBRUCode') {
      const bruCodeValue = this.invoice.VATBRUCode?.trim() || '';
      if (PsString.isNullOrWhitespace(bruCodeValue)) {
        this.invoice.VATBRUName = '';
        this.invoice.VATBRUCode = '';
        this.invoice.VATNote = '';
        this.invoicecopy.VATBRUName = '';
        this.invoicecopy.VATBRUCode = '';
        this.invoicecopy.VATNote = '';
        return;
      }
    }

    if (field === 'EffDate') {
      const d = new Date(this.invoice.EffDate);
      const newDate = PSDate.setHours(d, d.getHours(), d.getMinutes(), 0, 0
      );
      this.invoice.EffDate = newDate;
    } else if (field == 'Email') {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(this.invoice.VATEmail)) {
        this.notification.onWarning('Email không hợp lệ');
        return;
      }
    }

    const props: string[] = [field];

    if (this.invoicecopy.VATType !== this.invoice.VATType) {
      props.push('VATType');
    }

    let param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO> = {
      DTO: this.invoice,
      Properties: props
    };

    this.UpdateSALInvoiceInfo(param);
  }
  //#endregion

  //#region footer
  public onupdatestatus(enumstt: SALOrderInvoiceStatusEnum) {
    if (enumstt == SALOrderInvoiceStatusEnum.Success) {

      if (!this.invoice.EffDate) {
        this.notification.onWarning("Chưa có thông tin ngày hiệu lực");
        return;
      }

      if (this.invoice.TotalAmount == null) {
        this.notification.onWarning("Chưa có tổng tiền");
        return;
      }
      if (this.invoice.VATType == SALOrderInvoiceVATTypeEnum.Personal) {

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(this.invoice.VATCellPhone)) {
          this.notification.onWarning('Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng 0)');
          return;
        }

        if (PsString.isNullOrWhitespace(this.invoice.VATCustomerName)) {
          this.notification.onWarning("Chưa có thông tin tên khách hàng");
          return;
        }
      } else if (this.invoice.VATType == SALOrderInvoiceVATTypeEnum.Company) {
        if (PsString.isNullOrWhitespace(this.invoice.VATCompanyTax)) {
          this.notification.onWarning("Chưa có mã số thuế");
          return;
        }
      } else if (this.invoice.VATType == SALOrderInvoiceVATTypeEnum.Government) {
        if (PsString.isNullOrWhitespace(this.invoice.VATBRUCode)) {
          this.notification.onWarning("Chưa có đơn vị quan hệ ngân sách");
          return;

        }
      }

    }
    this.invoice.Status = enumstt;
    var param = { DTO: this.invoice, Properties: ['Status'] }
    this.UpdateSALInvoiceInfo(param);
  }
  //#endregion

  //#region call API
  private GetSALInvoice(param: SALOrderInvoiceCusDTO) {
    this.loader.loader(true);
    const temp = this.api.GetSALInvoice(param).subscribe(res => {
      if (res.StatusCode === 0) {

        this.invoice = res.ObjectReturn;
        this.invoicecopy = { ...res.ObjectReturn };
        if (this.invoice.EffDate) {
          this.invoice.EffDate = new Date(this.invoice.EffDate);
        }
        this.invoice = res.ObjectReturn;
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy hóa đơn: ${res.ErrorString}`);
      }
    }, err => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy hóa đơn: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALInvoiceInfo(param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO>) {
    this.loader.loader(true);
    const temp = this.api.UpdateSALInvoiceInfo(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, res.ObjectReturn);
        this.invoice = res.ObjectReturn;
        this.invoicecopy = { ...res.ObjectReturn };
        if (this.invoice.EffDate) {
          this.invoice.EffDate = new Date(this.invoice.EffDate);
        }
        this.showpopup = false;
        this.notification.onSuccess('Thành công');
        this.loader.loader(false);
      } else {
        this.showpopup = false;
        this.loader.loader(false);
        this.notification.onError(`Lỗi cập nhật hóa đơn: ${res.ErrorString}`);
      }
    }, err => {
      this.showpopup = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi cập nhật hóa đơn: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}