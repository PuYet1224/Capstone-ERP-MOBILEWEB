import { Component } from '@angular/core';

@Component({
  selector: 'mtb025-sal-collection-contact',
  templateUrl: './mtb025-sal-collection-contact.component.html',
  styleUrls: ['./mtb025-sal-collection-contact.component.scss'],
})
export class Mtb025SalCollectionContactComponent {
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
  // public listjob: ListDTO[] = [];
  // public listtype: ListDTO[] = [];
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
  //   this.GetCustomer(this.cscustomer)
  //   this.getlisthrlist();
  //   this.getlistcslist();
  //   if (this.orderDetail.Status == SALOrderDetailStatusEnum.OwnerInfo) {
  //     this.orderDetail.Status = SALOrderDetailStatusEnum.ContactInfo;
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
  // onNavigate(field: string, item: SALOrderDetailCusDTO) {
  //   if (field == 'to-list') {
  //     this.router.navigate(['/mtbike/collection']);
  //   }
  //   else if (field == '/mtbike/collection/other') {
  //     const phoneRegex = /^0\d{9}$/;
  //     if (!phoneRegex.test(this.cscustomer.Cellphone1)) {
  //       this.notification.onWarning('Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng 0)');
  //       return;
  //     }
  //     this.orderDetail.Phone = this.cscustomer.Cellphone1;
  //     this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
  //     this.router.navigate([field]);
  //   }
  //   else {
  //     this.router.navigate([field]);
  //   }
  // }

  // public onValueChange(field: string) {
  //   if (this.cscustomer[field] === this.cscustomerCOPY[field]) {
  //     return;
  //   }
  //   if (field === 'FreeStartTime') {
  //     console.log(this.cscustomer.FreeStartTime);

  //     const d = new Date(this.cscustomer.FreeStartTime);
  //     const newDate = PSDate.setHours(d, d.getHours(), d.getMinutes(), 0, 0
  //     );
  //     this.cscustomer.FreeStartTime = newDate;
  //   } else if (field === 'FreeEndTime') {
  //     const d = new Date(this.cscustomer.FreeEndTime);
  //     const newDate = PSDate.setHours(d, d.getHours(), d.getMinutes(), 0, 0
  //     );
  //     this.cscustomer.FreeEndTime = newDate;
  //   }

  //   if (field == 'Email') {
  //     const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //     if (!regex.test(this.cscustomer.Email)) {
  //       this.notification.onWarning('Email không hợp lệ');
  //       return;
  //     }
  //   }

  //   let param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //     DTO: this.cscustomer,
  //     Properties: [field]
  //   };
  //   this.UpdateLoyalCustomer(param);
  // }

  // public onchecked(e: boolean) {
  //   this.cscustomer.IsCellPhone = e;
  //   this.onValueChange('IsCellPhone');
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

  // private getlistcslist() {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListCSList(CSListTypeDataEnum.FREETIME).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.listtype = res.ObjectReturn;
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách thể loại thời gian: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách thể loại thời gian: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlisthrlist() {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListHRList(HRListTypeDataEnum.OCCUPATION).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.listjob = res.ObjectReturn;
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách thông tin nghề nghiệp: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách thông tin nghề nghiệp: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private UpdateSALDetail(param: SALOrderDetailCusDTO) {
  //   this.subLoader.loader(true);
  //   param.DeliveryStatus = null;
  //   const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(res => {
  //     if (res.StatusCode === 0) {
  //       // this.notification.onSuccess(`Thành công`);
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
  //       if (this.cscustomer.FreeStartTime) {
  //         this.cscustomer.FreeStartTime = new Date(this.cscustomer.FreeStartTime);
  //       }

  //       if (this.cscustomer.FreeEndTime) {
  //         this.cscustomer.FreeEndTime = new Date(this.cscustomer.FreeEndTime);
  //       }
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
}

