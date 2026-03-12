import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CSServiceMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-service-master.dto';
import { SALOrderDetailServiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-service.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
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
  selector: 'mtb013-sal-consultant-services',
  templateUrl: './mtb013-sal-consultant-services.component.html',
  styleUrls: ['./mtb013-sal-consultant-services.component.scss'],
})
export class Mtb013SalConsultantServicesComponent implements OnInit, OnDestroy {
  //#region chung
  public master: SALOrderMasterCusDTO;
  private arrUnsubscribe: Subscription[] = [];
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public enumdetailstt = SALOrderDetailStatusEnum;
  public servicesList: CSServiceMasterCusDTO[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;

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

    this.GetListSALServiceGroup();
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

  //#region dịch vụ
  public onuncheck(service: CSServiceMasterCusDTO) {
    if (service.IsChecked)
      return;

    service.IsAll = false;
    this.oncheckall(service);
  }

  public oncheckall(service: CSServiceMasterCusDTO) {
    if (this.master.Status != this.enummasterstt.NEW || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
      return;

    const list = service.ListOrderDetail.map(m => ({
      OrderDetail: m.Code,
      ServiceMaster: service.Code,
      ServiceDetail: service.ServiceVehicle || null,
      Price: service.Price || 0,
      ServiceName: service.ServiceName || '',
      IsChecked: service.IsAll
    } as SALOrderDetailServiceCusDTO));

    this.updatesalservice({ IsGroup: true, ListDTO: list }, service.ListOrderDetail);
  }

  public countchecked(service: CSServiceMasterCusDTO) {
    var aaa = service.ListOrderDetail.filter(x => x.IsChecked == true).length;
    return aaa + '/' + service.ListOrderDetail.length;
  }

  public onservicechecked(service: CSServiceMasterCusDTO, detail: SALOrderDetailCusDTO) {
    if (detail.Status != this.enumdetailstt.NEW || this.master.Status != this.enummasterstt.NEW || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))
      return;

    const updateParam: SALOrderDetailServiceCusDTO = {
      OrderDetail: detail.Code,
      ServiceMaster: service.Code,
      ServiceDetail: service.ServiceVehicle || null,
      Price: service.Price || 0,
      ServiceName: service.ServiceName || '',
      IsChecked: detail.IsChecked,
    } as SALOrderDetailServiceCusDTO;

    this.updatesalservice({ IsGroup: false, DTO: updateParam }, service.ListOrderDetail);
  }

  public formatprice(price: number) {
    return PsString.formatPrice(price);
  }

  public onserviceschecked(a) {
    setTimeout(() => {
      console.log(a.IsChecked);
    }, 3000);
  }

  private GetListSALServiceGroup() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALServiceGroup(this.master)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.servicesList = res.ObjectReturn || [];
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

  private updatesalservice(param, list: SALOrderDetailCusDTO[]) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALService(param)
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          var totalcheck = list.filter(x => x.IsChecked == true).length;
          if (list.length == totalcheck && param.IsGroup == false)
            this.servicesList.find(f => f.Code == param.DTO.ServiceMaster).IsAll = true;

          if (param.IsGroup == true) {
            this.servicesList.forEach(f => {
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

