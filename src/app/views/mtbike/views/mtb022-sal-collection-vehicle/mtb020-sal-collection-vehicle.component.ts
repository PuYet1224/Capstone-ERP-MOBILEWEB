import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb020-sal-collection-vehicle',
  templateUrl: './mtb020-sal-collection-vehicle.component.html',
  styleUrls: ['./mtb020-sal-collection-vehicle.component.scss'],
})
export class Mtb020SalCollectionVehicleComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
  ) { }

  //#region lifecycle hooks
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    this.orderDetail = this.cache.parseValue(temp);

    this.GetSALPayment();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region chung
  public orderDetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public enumstt = SALOrderDetailStatusEnum;

  onNavigate(field: string) {
    this.router.navigate([field]);
  }
  //#endregion

  //#region body
  private GetSALPayment() {
    this.subLoader.loader(true);
    // const sub = this.mtbikeapi.GetSALPayment(this.orderDetail).subscribe(
    //   res => {
    //     if (res.StatusCode === 0 && res.ObjectReturn) {
    //       this.orderDetail = res.ObjectReturn;
    //       // lưu cache để các bước sau (021-023) đọc đúng xe hiện tại
    //       this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
    //       this.subLoader.loader(false);
    //     } else {
    //       this.subLoader.loader(false);
    //       this.notification.onError(`Lỗi lấy thông tin thanh toán: ${res.ErrorString}`);
    //     }
    //   },
    //   err => {
    //     this.subLoader.loader(false);
    //     this.notification.onError(`Lỗi lấy thông tin thanh toán: ${err.message}`);
    //   }
    // );

    // this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region  footer
  public onsent() {
    if (this.orderDetail.Status == this.enumstt.PaymentRequest) {
      this.orderDetail.Status = SALOrderDetailStatusEnum.OwnerInfo;
      this.UpdateSALDetail();
    }
    else {
      this.router.navigate(['/mtbike/collection/owner']);
    }
  }

  private UpdateSALDetail() {
    this.subLoader.loader(true);
    this.orderDetail.DeliveryStatus = null;

    const sub = this.mtbikeapi.UpdateSALDetail(this.orderDetail).subscribe(res => {
      if (res.StatusCode === 0) {
        this.notification.onSuccess(`Thành công`);
        // cập nhật cache sau khi lưu
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, res.ObjectReturn || this.orderDetail);
        this.router.navigate(['/mtbike/collection/owner']);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
