import { Component } from '@angular/core';
@Component({
  selector: 'mtb026-sal-collection-other',
  templateUrl: './mtb026-sal-collection-other.component.html',
  styleUrls: ['./mtb026-sal-collection-other.component.scss'],
})
export class Mtb026SalCollectionOtherComponent {
  // constructor(
  //   private router: Router,
  //   private cache: PsCache,
  //   private subLoader: SystemLoaderService,
  //   private notification: PsKendoNotificationService,
  //   private mtbikeapi: MtbikeApiService,
  //   private coreapi: PSCoreApiService,
  // ) { }

  // public cscustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public cscustomerCOPY: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public listHondaReason: ListDTO[] = [];
  // public listOAReason: ListDTO[] = [];
  // public listHondaStatus: LSStatusCusDTO[] = [];
  // public listOAStatus: LSStatusCusDTO[] = [];
  // private arrUnsubscribe: Subscription[] = [];
  // public orderDetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // public FunctionPermissionDTO = FunctionPermissionDTO;
  // public SALOrderDetailStatusEnum = SALOrderDetailStatusEnum;
  // public showpopup: boolean = false;

  // //#region LIFECYCLE
  // ngOnInit(): void {
  //   var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
  //   let orderdetail = this.cache.parseValue(temp);
  //   this.orderDetail = orderdetail;

  //   this.cscustomer.Code = orderdetail.Owner;
  //   this.GetCustomer(this.cscustomer);
  //   this.getlistcslist(CSListTypeDataEnum.UNFLZALOOA);
  //   this.getlistcslist(CSListTypeDataEnum.INSTALLAPP);
  //   this.GetListStatus(LSStatusTypeDataEnum.HONDA);
  //   this.GetListStatus(LSStatusTypeDataEnum.ZALOOA);
  //   if (this.orderDetail.Status == SALOrderDetailStatusEnum.ContactInfo) {
  //     this.orderDetail.Status = SALOrderDetailStatusEnum.OtherInfo;
  //     this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
  //     this.UpdateSALDetail(this.orderDetail)
  //   }
  // }

  // ngAfterViewInit(): void {
  //   this.enableAutoSlide();
  // }

  // ngOnDestroy(): void {
  //   this.subLoader.reset();
  //   this.arrUnsubscribe.forEach(e => e.unsubscribe());
  //   this.arrUnsubscribe = [];
  // }

  // //#end region

  // //#region  header
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

  // public onValueChange(field: string) {
  //   if (this.cscustomer[field] === this.cscustomerCOPY[field]) {
  //     return;
  //   }

  //   let param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //     DTO: this.cscustomer,
  //     Properties: [field]
  //   };
  //   this.UpdateLoyalCustomer(param);
  // }

  // onNavigate(field: string, item?: SALOrderDetailCusDTO) {
  //   if (field == '/mtbike/collection/payment' && this.orderDetail.Status == SALOrderDetailStatusEnum.OtherInfo) {
  //     if (!this.cscustomer.OA) {
  //       this.notification.onWarning('Chưa có thông tin tình trạng quan tâm Zalo OA');
  //       return;
  //     }

  //     if (!this.cscustomer.MyHonda) {
  //       this.notification.onWarning('Chưa có thông tin tình trạng sử dụng app MyHonda');
  //       return;
  //     }

  //     this.orderDetail.Status = SALOrderDetailStatusEnum.RePayment;
  //     const shownoti = true;
  //     this.UpdateSALDetail(this.orderDetail, shownoti)
  //   }
  //   else {
  //     this.router.navigate([field]);
  //   }
  // }


  // //#region CALL API
  // private GetCustomer(param: CSLoyalCustomerCusDTO) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbikeapi.GetCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.cscustomer = res.ObjectReturn;
  //       if (this.cscustomer.FreeStartTime) {
  //         this.cscustomer.FreeStartTime = new Date(this.cscustomer.FreeStartTime);
  //       }
  //       if (this.cscustomer.FreeEndTime) {
  //         this.cscustomer.FreeEndTime = new Date(this.cscustomer.FreeEndTime);
  //       }
  //       this.cscustomerCOPY = { ...this.cscustomer };
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${res.ErrorString}`);
  //     }
  //   },
  //     (err) => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(temp);
  // }

  // private GetListStatus(param: LSStatusTypeDataEnum) {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListStatus(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       if (param == LSStatusTypeDataEnum.HONDA) {
  //         this.listHondaStatus = res.ObjectReturn;
  //       } else {
  //         this.listOAStatus = res.ObjectReturn;
  //       }
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách tình trạng: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách tình trạng: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlistcslist(param: CSListTypeDataEnum) {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListCSList(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       if (param == CSListTypeDataEnum.INSTALLAPP) {
  //         this.listHondaReason = res.ObjectReturn;
  //       } else {
  //         this.listOAReason = res.ObjectReturn;
  //       }
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách lý do: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách lý do: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private UpdateSALDetail(param: SALOrderDetailCusDTO, shownoti: boolean = false) {
  //   this.subLoader.loader(true);
  //   param.DeliveryStatus = null;
  //   const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(res => {
  //     if (res.StatusCode === 0) {
  //       if (shownoti) {
  //         this.notification.onSuccess(`Thành công`);
  //         this.router.navigate(['/mtbike/collection/payment']);
  //       }
  //       this.subLoader.loader(false);
  //       this.showpopup = false;
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
  //       this.showpopup = false;
  //     }
  //   }, err => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi cập nhật: ${err.message}`);
  //     this.showpopup = false;
  //   });
  //   this.arrUnsubscribe.push(sub);
  // }

  // private UpdateLoyalCustomer(param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO>) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbikeapi.UpdateLoyalCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.cscustomer = res.ObjectReturn;
  //       this.cscustomerCOPY = { ...this.cscustomer };
  //       this.notification.onSuccess('Thành công');
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }
  // //#endregion
}
