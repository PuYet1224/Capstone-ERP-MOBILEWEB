import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CSServiceMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-service-master.dto';
import { LSVehicleColorCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle-color.dto';
import { SALOrderDetailServiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-service.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsString } from 'src/app/services/utilities/ps-string';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb014-sal-consultant-services-detail',
  templateUrl: './mtb014-sal-consultant-services-detail.component.html',
  styleUrls: ['./mtb014-sal-consultant-services-detail.component.scss'],
  animations: [
    trigger('slideSwitch', [
      transition('* => left', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ]),
      transition('* => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ])
    ])
  ]
})
export class Mtb014SalConsultantServicesDetailComponent implements OnInit, OnDestroy {
  //#region chung
  public typedata = 'vehiclecolor';
  public currentindex: number = 0;
  public tottalindex: number = 0;
  public detail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  private arrUnsubscribe: Subscription[] = [];
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public enumdetailstt = SALOrderDetailStatusEnum;
  public servicesList: CSServiceMasterCusDTO[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public vehiclecolor: LSVehicleColorCusDTO;
  public slideDirection: 'left' | 'right' = 'left';

  public onnavigate(field: string) {
    if (field == 'back') {
      this.location.back();
      return;
    }

    var temp = '/mtbike/consultant' + field;
    this.router.navigate([temp]);
  }

  public onslideok() {
    this.slideDirection = undefined;
  }

  public ontoleftclick() {
    if (this.currentindex == 0 || this.typedata != 'vehiclecolor')
      return;

    this.slideDirection = 'left';
    this.currentindex -= 1;
    this.getconsutantorderdetail(this.vehiclecolor.ListOrderDetailCode[this.currentindex]);
  }

  public ontorightclick() {
    if (this.currentindex == this.tottalindex - 1 || this.typedata != 'vehiclecolor')
      return;

    this.slideDirection = 'right';
    this.currentindex += 1;
    this.getconsutantorderdetail(this.vehiclecolor.ListOrderDetailCode[this.currentindex]);
  }
  //#endregion

  //#region lifecycle
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private location: Location
  ) { }

  ngOnInit(): void {
    var vcolor = this.cache.getItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR);
    if (vcolor) {
      this.vehiclecolor = this.cache.parseValue(vcolor);
      if (this.vehiclecolor && this.vehiclecolor.ListOrderDetailCode.length > 0) {
        this.tottalindex = this.vehiclecolor.ListOrderDetailCode.length;
        this.getconsutantorderdetail(this.vehiclecolor.ListOrderDetailCode[this.currentindex]);
      }
    }
    else {
      var orderdetail = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
      var temp = this.cache.parseValue(orderdetail);
      this.typedata = 'orderdetail';
      this.getconsutantorderdetail(temp.Code);
    }
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

  //#region xe
  public getconsutantorderdetail(code: number) {
    this.subLoader.loader(true);
    var dto = new SALOrderDetailCusDTO();
    dto.Code = code;
    const sub = this.mtbikeapi.GetConsutantOrderDetail(dto)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.detail = res.ObjectReturn;

          this.getlistsalservice();
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy thông tin xe trong phiếu: ${res.ErrorString}`);
        }
      }, (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin xe trong phiếu: ${err.message}`);
      });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region dịch vụ
  public formatprice(price: number) {
    return PsString.formatPrice(price);
  }

  public onservicechecked(service: CSServiceMasterCusDTO) {
    if (this.detail.MasterStatus != this.enummasterstt.NEW || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
      return;

    const updateParam: SALOrderDetailServiceCusDTO = {
      OrderDetail: this.detail.Code,
      ServiceMaster: service.Code,
      ServiceDetail: service.ServiceVehicle || null,
      Price: service.Price || 0,
      ServiceName: service.ServiceName || '',
      IsChecked: service.IsChecked,
    } as SALOrderDetailServiceCusDTO;

    this.updatesalservice({ IsGroup: false, DTO: updateParam });
  }

  private getlistsalservice() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALService(this.detail)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.servicesList = res.ObjectReturn || [];
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${res.ErrorString}`);
        }
      }, (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${err.message}`);
      });
    this.arrUnsubscribe.push(sub);
  }

  private updatesalservice(param) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALService(param)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.getconsutantorderdetail(this.detail.Code);
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