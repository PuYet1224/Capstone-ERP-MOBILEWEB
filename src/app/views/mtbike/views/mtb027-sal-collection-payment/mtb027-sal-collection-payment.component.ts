import { Component } from '@angular/core';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';

@Component({
  selector: 'mtb027-sal-collection-payment',
  templateUrl: './mtb027-sal-collection-payment.component.html',
  styleUrls: ['./mtb027-sal-collection-payment.component.scss'],
})

export class Mtb027SalCollectionPaymentComponent {
  // constructor(
  //   private cache: PsCache,
  //   private router: Router,
  //   private loader: SystemLoaderService,
  //   private coreapi: PSCoreApiService,
  //   private notification: PsKendoNotificationService,
  //   private api: MtbikeApiService,
  //   private configCache: ConfigCacheService,
  // ) { }

  // //#region life cycle
  // private arrUnsubscribe: Subscription[] = [];

  // ngOnInit(): void {
  //   var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
  //   this.orderdetail = this.cache.parseValue(temp);

  //   this.getlistlslist();
  //   if (this.orderdetail.PaymentType == SALOrderDetailPaymentTypeEnum.INSTALLMENT)
  //     this.getlistpartnerfinance();
  // }

  // ngAfterViewInit(): void {
  //   this.enableAutoSlide();
  // }

  // ngOnDestroy(): void {
  //   this.loader.reset();
  //   this.arrUnsubscribe.forEach(e => e.unsubscribe());
  //   this.arrUnsubscribe = [];
  // }
  // //#endregion

  // //#region chung
  // public odstt = SALOrderDetailStatusEnum;
  // public orderdetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // public orderdetailcopy: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // public paymenttypeenum = SALOrderDetailPaymentTypeEnum;
  // public FunctionPermissionDTO = FunctionPermissionDTO;

  // public onNavigate(field: string) {
  //   if (field == 'check') {
  //     if (!this.orderdetail.PaymentType) {
  //       this.notification.onWarning("Chưa có thông tin hình thức thanh toán");
  //       return;
  //     }

  //     if (this.orderdetail.PaymentType == this.paymenttypeenum.INSTALLMENT) {
  //       if (!this.orderdetail.FinanceCompany) {
  //         this.notification.onWarning("Chưa có thông tin công ty tài chính");
  //         return;
  //       }

  //       if (PsString.isNullOrWhitespace(this.orderdetail.ContractID)) {
  //         this.notification.onWarning("Chưa có thông tin số hợp đồng");
  //         return;
  //       }

  //       if (!this.orderdetail.InterestRate || this.orderdetail.InterestRate == 0) {
  //         this.notification.onWarning("Chưa có thông tin lãi xuất vay");
  //         return;
  //       }
  //     }

  //     this.orderdetail.Status = this.odstt.Payment;
  //     this.updatesaldetail(this.orderdetail);
  //     field = '/mtbike/collection';
  //   }
  //   this.router.navigate([field]);
  // }
  // //#endregion

  // //#region header
  // @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  // @ViewChild('content') content!: ElementRef<HTMLElement>;

  // private enableAutoSlide() {
  //   const wrapperWidth = this.wrapper.nativeElement.clientWidth;
  //   const contentWidth = this.content.nativeElement.scrollWidth;

  //   const content = this.content.nativeElement;
  //   content.classList.remove('running');

  //   if (contentWidth > wrapperWidth) {
  //     content.classList.add('running');
  //   }
  // }
  // //#endregion

  // //#region body
  // public listpaymenttype: ListDTO[] = [];
  // public listfinance: LSTypeOfPartnerCusDTO[] = [];
  // public odtype = SALOrderDetailTypeDataEnum;

  // public onvaluechange(field: string) {
  //   if (this.orderdetail[field] === this.orderdetailcopy[field]) {
  //     return;
  //   }
  //   this.updatesaldetail(this.orderdetail);
  // }

  // private getlistlslist(forceReload: boolean = false) {
  //   this.loader.loader(true);
  //   var temp = this.configCache.GetListLSList(LSListTypeDataEnum.PaymentType, forceReload).subscribe((res) => {
  //     if (res) {
  //       this.listpaymenttype = res;

  //       if (this.orderdetail.TypeData == this.odtype.BOOK)
  //         this.listpaymenttype = this.listpaymenttype.filter(f => f.TypeOfList != this.paymenttypeenum.INSTALLMENT)

  //       this.loader.loader(false);
  //     } else {
  //       this.loader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách hình thức thanh toán`);
  //     }
  //   }, (err) => {
  //     this.loader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách hình thức thanh toán: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlistpartnerfinance() {
  //   this.loader.loader(true);
  //   var temp = this.coreapi.GetListPartnerFinance().subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.listfinance = res.ObjectReturn
  //       this.loader.loader(false);
  //     } else {
  //       this.loader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách công ty tài chính: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.loader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách công ty tài chính: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private updatesaldetail(param: SALOrderDetailCusDTO) {
  //   this.loader.loader(true);
  //   param.DeliveryStatus = null;
  //   const preservedIsCustomerOwner = this.orderdetail.IsCustomerOwner;
  //   const sub = this.api.UpdateSALDetail(param).subscribe(res => {
  //     if (res.StatusCode === 0) {
  //       this.orderdetail = { ...res.ObjectReturn };
  //       if (preservedIsCustomerOwner !== undefined) {
  //         this.orderdetail.IsCustomerOwner = preservedIsCustomerOwner;
  //       }
  //       this.orderdetailcopy = { ...this.orderdetail };
  //       this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderdetail);

  //       if (this.orderdetail.PaymentType == SALOrderDetailPaymentTypeEnum.INSTALLMENT)
  //         this.getlistpartnerfinance();

  //       this.notification.onSuccess(`Thành công`);
  //       this.loader.loader(false);
  //     } else {
  //       this.loader.loader(false);
  //       this.notification.onError(`Lỗi: ${res.ErrorString}`);
  //     }
  //   }, err => {
  //     this.loader.loader(false);
  //     this.notification.onError(`Lỗi:: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(sub);
  // }
  // //#endregion
}