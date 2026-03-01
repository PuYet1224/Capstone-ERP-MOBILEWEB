import { Component } from '@angular/core';

@Component({
  selector: 'mtb021-sal-collection-services',
  templateUrl: './mtb021-sal-collection-services.component.html',
  styleUrls: ['./mtb021-sal-collection-services.component.scss'],
})

export class Mtb021SalCollectionServicesComponent {
  // public retailMaster: SALOrderMasterCusDTO;
  // public orderDetail: SALOrderDetailCusDTO;
  // private arrUnsubscribe: Subscription[] = [];
  // public enummasterstt = SALOrderMasterStatusRetailEnum;
  // public enumdetailstt = SALOrderDetailStatusEnum;
  // public servicesList: CSServiceMasterCusDTO[] = [];
  // public FunctionPermissionDTO = FunctionPermissionDTO;

  // //#region lifecycle
  // constructor(
  //   private router: Router,
  //   private cache: PsCache,
  //   private subLoader: SystemLoaderService,
  //   private notification: PsKendoNotificationService,
  //   private mtbikeapi: MtbikeApiService,
  // ) { }

  // ngOnInit(): void {
  //   var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
  //   let retailMaster = this.cache.parseValue(temp);
  //   this.retailMaster = retailMaster;

  //   if (!retailMaster || !retailMaster.Code) {
  //     this.notification.onError('Không tìm thấy thông tin đơn hàng');
  //     return;
  //   }

  //   var orderDetailTemp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
  //   if (orderDetailTemp) {
  //     this.orderDetail = this.cache.parseValue(orderDetailTemp);
  //     if (this.orderDetail && this.orderDetail.Code) {
  //       this.loadVehicleInfoAndServices();
  //       return;
  //     }
  //   }

  //   if (retailMaster.ListDetail && retailMaster.ListDetail.length > 0) {
  //     this.orderDetail = retailMaster.ListDetail[0];
  //     if (this.orderDetail && this.orderDetail.Code) {
  //       this.loadVehicleInfoAndServices();
  //       return;
  //     }
  //   }

  //   if (retailMaster.ListBuyVehicle && retailMaster.ListBuyVehicle.length > 0) {
  //     this.orderDetail = retailMaster.ListBuyVehicle[0];
  //     if (this.orderDetail && this.orderDetail.Code) {
  //       this.loadVehicleInfoAndServices();
  //       return;
  //     }
  //   }
  // }

  // ngOnDestroy(): void {
  //   this.subLoader.reset();
  //   this.arrUnsubscribe.forEach(e => e.unsubscribe());
  //   this.arrUnsubscribe = [];
  // }

  // //#endregion

  // //#endregion

  // // KHỐI XỬ LÝ NGHIỆP VỤ
  // /**
  //  * Điều hướng đến các trang khác
  //  */
  // onNavigate(field: string) {
  //   if (field == 'back') {
  //     this.router.navigate(['/mtbike/collection/vehicle']);
  //   } else if (field == 'to-list') {
  //     this.router.navigate(['/mtbike/collection']);
  //   } else if (field == 'continue') {
  //     this.router.navigate(['/mtbike/collection/part']);
  //   } else if (field == 'to-selection') {
  //     this.router.navigate(['/mtbike/collection']);
  //   }
  // }

  // /**
  //  * Format giá tiền với dấu chấm phân cách hàng nghìn
  //  * @param price - Giá tiền cần format
  //  * @returns Chuỗi giá tiền đã được format
  //  */
  // formatPrice(price: number): string {
  //   if (price == null || price === undefined) {
  //     return '0';
  //   }
  //   return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // }

  // /**
  //  * Đếm số lượng dịch vụ đã được chọn
  //  * @returns Số lượng dịch vụ đã chọn
  //  */
  // getSelectedServicesCount(): number {
  //   if (!this.servicesList || this.servicesList.length === 0) {
  //     return 0;
  //   }
  //   return this.servicesList.filter(service => service.IsChecked).length;
  // }

  // /**
  //  * Toggle trạng thái chọn/bỏ chọn dịch vụ
  //  */
  // onToggleService(service: CSServiceMasterCusDTO) {
  //   if (this.orderDetail.Status > this.enumdetailstt.RePayment || this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
  //     return;

  //   if (!this.orderDetail) {
  //     this.notification.onError('Không tìm thấy thông tin đơn hàng');
  //     return;
  //   }

  //   service.IsChecked = !service.IsChecked;

  //   const updateParam: CSServiceMasterCusDTO = {
  //     Code: service.Code,
  //     OrderDetail: this.orderDetail.Code,
  //     IsChecked: service.IsChecked,
  //     ServiceVehicle: service.ServiceVehicle || null,
  //     ServiceName: service.ServiceName || '',
  //     Price: service.Price || 0,
  //     TypeData: service.TypeData || 0,
  //     CreateBy: service.CreateBy || '',
  //     LastModifiedBy: service.LastModifiedBy || ''
  //   };

  //   this.UpdateSALService(updateParam);
  // }

  // /**
  //  * Load thông tin xe và danh sách dịch vụ
  //  */
  // private loadVehicleInfoAndServices() {
  //   if (!this.orderDetail || !this.orderDetail.Code) {
  //     this.notification.onError('Không tìm thấy thông tin đơn hàng chi tiết');
  //     return;
  //   }

  //   this.GetListSALService();
  // }

  // // KHỐI XỬ LÝ API
  // /**
  //  * Lấy danh sách dịch vụ từ API
  //  */
  // private GetListSALService() {
  //   if (!this.orderDetail || !this.orderDetail.Code) {
  //     this.notification.onError('Không tìm thấy thông tin đơn hàng chi tiết');
  //     return;
  //   }

  //   this.subLoader.loader(true);
  //   // const sub = this.mtbikeapi.GetListSALService(this.orderDetail).subscribe(
  //   //   (res) => {
  //   //     if (res.StatusCode === 0) {
  //   //       this.servicesList = res.ObjectReturn || [];
  //   //       this.subLoader.loader(false);
  //   //     } else {
  //   //       this.subLoader.loader(false);
  //   //       this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${res.ErrorString}`);
  //   //     }
  //   //   },
  //   //   (err) => {
  //   //     this.subLoader.loader(false);
  //   //     this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${err.message}`);
  //   //   }
  //   // );
  //   // this.arrUnsubscribe.push(sub);
  // }

  // /**
  //  * Cập nhật trạng thái dịch vụ
  //  * @param param - Thông tin dịch vụ cần cập nhật
  //  */
  // private UpdateSALService(param: CSServiceMasterCusDTO) {
  //   this.subLoader.loader(true);
  //   // const sub = this.mtbikeapi.UpdateSALService(param).subscribe(
  //   //   (res) => {
  //   //     if (res.StatusCode === 0) {
  //   //       const index = this.servicesList.findIndex(s => s.Code === param.Code);
  //   //       if (index !== -1) {
  //   //         if (res.ObjectReturn) {
  //   //           this.servicesList[index].OrderDetailService = res.ObjectReturn.OrderDetailService;
  //   //         }
  //   //       }
  //   //       this.subLoader.loader(false);
  //   //       this.notification.onSuccess('Thành công');
  //   //     } else {
  //   //       const index = this.servicesList.findIndex(s => s.Code === param.Code);
  //   //       if (index !== -1) {
  //   //         this.servicesList[index].IsChecked = !param.IsChecked;
  //   //       }
  //   //       this.subLoader.loader(false);
  //   //       this.notification.onError(`Lỗi cập nhật dịch vụ: ${res.ErrorString}`);
  //   //     }
  //   //   },
  //   //   (err) => {
  //   //     const index = this.servicesList.findIndex(s => s.Code === param.Code);
  //   //     if (index !== -1) {
  //   //       this.servicesList[index].IsChecked = !param.IsChecked;
  //   //     }
  //   //     this.subLoader.loader(false);
  //   //     this.notification.onError(`Lỗi cập nhật dịch vụ: ${err.message}`);
  //   //   }
  //   // );
  //   // this.arrUnsubscribe.push(sub);
  // }
}

