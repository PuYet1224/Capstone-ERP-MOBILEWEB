import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { POLPromotionMasterCusDTO } from 'src/app/models/dtos/e-dtos/pol-promotion-master.dto';
import { SALOrderDetailPromotionCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-promotion.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { POLPromotionMasterTypeDataEnum } from 'src/app/models/enums/e-type/pol-promotion-master-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsString } from 'src/app/services/utilities/ps-string';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb017-sal-consultant-promotion',
  templateUrl: './mtb017-sal-consultant-promotion.component.html',
  styleUrls: ['./mtb017-sal-consultant-promotion.component.scss'],
})

export class Mtb017SalConsultantPromotionComponent implements OnInit, OnDestroy {
  //#region chung
  public master: SALOrderMasterCusDTO;
  private arrUnsubscribe: Subscription[] = [];
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public enumdetailstt = SALOrderDetailStatusEnum;
  public promotionlist: POLPromotionMasterCusDTO[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public enumpmttype = POLPromotionMasterTypeDataEnum;

  public onnavigate(field: string, event: MouseEvent = null, chill: SALOrderDetailCusDTO = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (chill) {
      this.cache.removeItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR);
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, chill);
    }

    var temp = '/mtbike/consultant' + field;
    this.router.navigate([temp]);
  }
  //#endregion

  //#region lifecycle
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    this.master = this.cache.parseValue(temp);

    if (!this.master || !this.master.Code) {
      this.notification.onError('Không lấy được thông tin phiếu bán hàng');
      return;
    }

    this.getlistsalpromotiongroup();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }
  //#endregion

  //#region header
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;

  private enableAutoSlide() {
    const wrapperWidth = this.wrapper.nativeElement.clientWidth;
    const contentWidth = this.content.nativeElement.scrollWidth;

    const content = this.content.nativeElement;
    content.classList.remove('running');

    if (contentWidth > wrapperWidth) {
      content.classList.add('running');
    }
  }
  //#endregion

  //#region chương trình khuyễn mãi
  public onuncheck(promotion: POLPromotionMasterCusDTO) {
    if (promotion.IsChecked)
      return;

    promotion.IsAll = false;
    this.oncheckall(promotion);
  }

  public oncheckall(promotion: POLPromotionMasterCusDTO) {
    if (this.master.Status != this.enummasterstt.NEW || this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
      return;

    const list = promotion.ListOrderDetail
      .map(m => ({
        OrderDetail: m.Code,
        Promotion: promotion.Code,
        PromotionName: promotion.InternalName,
        DiscountPercentage: promotion.DiscountPercentage,
        DiscountAmount: promotion.Amount,
        PromotionType: promotion.TypeData,
        IsChecked: promotion.IsAll,
      } as SALOrderDetailPromotionCusDTO));

    this.updatesalpromotion(list, promotion.ListOrderDetail);
  }

  public countchecked(promotion: POLPromotionMasterCusDTO) {
    var aaa = promotion.ListOrderDetail.filter(x => x.IsChecked == true).length;
    return aaa + '/' + promotion.ListOrderDetail.length;
  }

  public onitemchecked(promotion: POLPromotionMasterCusDTO, detail: SALOrderDetailCusDTO) {
    if (detail.Status != this.enumdetailstt.NEW || this.master.Status != this.enummasterstt.NEW || this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
      return;

    var dto = new SALOrderDetailPromotionCusDTO();
    dto.OrderDetail = detail.Code;
    dto.Promotion = promotion.Code;
    dto.PromotionName = promotion.InternalName;
    dto.DiscountPercentage = promotion.DiscountPercentage;
    dto.DiscountAmount = promotion.Amount;
    dto.PromotionType = promotion.TypeData;
    dto.IsChecked = detail.IsChecked;

    this.updatesalpromotion(dto, promotion.ListOrderDetail, false);
  }

  public formatprice(price: number) {
    return PsString.formatPrice(price);
  }

  public onserviceschecked(a) {
    setTimeout(() => {
      console.log(a.IsChecked);
    }, 3000);
  }

  private getlistsalpromotiongroup() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALPromotionGroup(this.master)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.promotionlist = res.ObjectReturn || [];
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${res.ErrorString}`);
        }
      },
        (err) => {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${err.message}`);
        }
      );
    this.arrUnsubscribe.push(sub);
  }

  private updatesalpromotion(param, list: SALOrderDetailCusDTO[], islist: boolean = true) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALPromotion(param)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          var totalcheck = list.filter(x => x.IsChecked == true).length;
          if (list.length == totalcheck && islist == false)
            this.promotionlist.find(f => f.Code == param.Promotion).IsAll = true;

          if (islist == true) {
            this.promotionlist.forEach(f => {
              f.ListOrderDetail.forEach(ff => {
                ff.IsChecked = f.IsAll;
              })
            });
          }

          this.subLoader.loader(false);
          this.notification.onSuccess('Thành công');
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi cập nhật dịch vụ: ${res.ErrorString}`);
        }
      },
        (err) => {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi cập nhật dịch vụ: ${err.message}`);
        }
      );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
