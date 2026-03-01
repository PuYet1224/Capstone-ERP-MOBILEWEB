import { Component } from '@angular/core';

@Component({
  selector: 'mtb023-sal-collection-coupon',
  templateUrl: './mtb023-sal-collection-coupon.component.html',
  styleUrls: ['./mtb023-sal-collection-coupon.component.scss'],
})
export class Mtb023SalCollectionCouponComponent {
  // constructor(
  //   private router: Router,
  //   private cache: PsCache,
  //   private subLoader: SystemLoaderService,
  //   private notification: PsKendoNotificationService,
  //   private mtbikeapi: MtbikeApiService,
  // ) { }

  // //#region  lifecycle hooks
  // onNavigate(field: string) {
  //   switch (field) {
  //     case 'back':
  //       this.router.navigate(['/mtbike/collection/part']);
  //       break;
  //     case 'to-list':
  //       this.router.navigate(['/mtbike/collection']);
  //       break;
  //     case 'continue':
  //       if ((this.orderDetail.DiscountPercent || this.orderDetail.DiscountAmount) &&
  //         PsString.isNullOrWhitespace(this.orderDetail.DiscountReason)) {
  //         this.notification.onWarning('Chưa có lý do giảm giá');
  //         return;
  //       }
  //       this.router.navigate(['/mtbike/collection/vehicle']);
  //       break;
  //     case 'customer':
  //     case 'to-customer':
  //       this.router.navigate(['/mtbike/collection/contact']);
  //       break;
  //     case 'cart':
  //       this.router.navigate(['/mtbike/collection/part']);
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // ngOnInit(): void {
  //   var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
  //   let retailMaster = this.cache.parseValue(temp);
  //   this.retailMaster = retailMaster;

  //   var orderDetailTemp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
  //   this.orderDetail = this.cache.parseValue(orderDetailTemp);
  //   this.orderDetailcopy = this.cache.parseValue(orderDetailTemp);
  // }

  // ngOnDestroy(): void {
  //   this.subLoader.reset();
  //   this.arrUnsubscribe.forEach(e => e.unsubscribe());
  //   this.arrUnsubscribe = [];
  // }

  // ngAfterViewInit(): void {
  //   this.enableAutoSlide();
  // }
  // //#endregion

  // //#region  header
  // public retailMaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  // private arrUnsubscribe: Subscription[] = [];
  // public enumstt = SALOrderDetailStatusEnum;
  // public enummasterstt = SALOrderMasterStatusRetailEnum;
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

  // public orderDetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // public orderDetailcopy: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // public FunctionPermissionDTO = FunctionPermissionDTO;
  // //#endregion

  // public onValueChange(field: string) {
  //   if (FunctionPermissionDTO.approver) {
  //     this.notification.onError('Bạn không có quyền cập nhật thông tin khuyến mãi');
  //     this.orderDetail = { ...this.orderDetailcopy };
  //     return;
  //   }
  //   if (this.orderDetail[field] == this.orderDetailcopy[field]) { return }

  //   if (field == 'DiscountPercent')
  //     this.orderDetail.DiscountAmount = this.orderDetail.Price / 100 * this.orderDetail.DiscountPercent;
  //   if (field == 'DiscountAmount')
  //     this.orderDetail.DiscountPercent = this.orderDetail.DiscountAmount * 100 / this.orderDetail.Price;

  //   this.UpdateSALDetail(this.orderDetail);
  // }

  // private UpdateSALDetail(param: SALOrderDetailCusDTO) {
  //   this.subLoader.loader(true);
  //   const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(res => {
  //     if (res.StatusCode === 0) {
  //       this.orderDetail = res.ObjectReturn;
  //       this.orderDetailcopy = { ...this.orderDetail };
  //       this.notification.onSuccess(`Thành công`);
  //       this.subLoader.loader(false);
  //     } else {
  //       this.orderDetail = { ...this.orderDetailcopy };
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
  //     }
  //   }, err => {
  //     this.orderDetail = { ...this.orderDetailcopy };
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi cập nhật: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(sub);
  // }
}

