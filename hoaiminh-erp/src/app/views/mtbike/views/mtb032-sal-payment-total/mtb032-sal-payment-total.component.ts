import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderInvoiceDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice-detail.dto';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb032-sal-payment-total',
  templateUrl: './mtb032-sal-payment-total.component.html',
  styleUrls: ['./mtb032-sal-payment-total.component.scss'],
})

export class Mtb032SalPaymentTotalComponent {
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
  ) { }

  private arrUnsubscribe: Subscription[] = [];
  public invoice: SALOrderInvoiceCusDTO = new SALOrderInvoiceCusDTO();
  public listInvoice: SALOrderInvoiceDetailCusDTO[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public SALOrderDetailStatusEnum = SALOrderDetailStatusEnum;
  public showpopup: boolean = false;
  public master: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  private retailMaster: any;

  //#region LIFECYCLE
  ngOnInit(): void {
    const cacheMaster = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.retailMaster = this.cache.parseValue(cacheMaster);
    this.master = this.retailMaster;

    const temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    const invoice = this.cache.parseValue(temp);
    this.invoice = invoice;
    setTimeout(() => {
      this.enableAutoSlide();
    });

    this.GetListSALInvoiceDetail(this.invoice)
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  //#end region

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


  onNavigate(field: string, item: SALOrderInvoiceDetailCusDTO | null = null) {
    if (item) {
      const detail: any = {
        ...item,
        OrderDetail: (item as any).OrderDetail || item.Code || null,
        Code: (item as any).OrderDetail || item.Code || null,
        TypeOfVehicleName: (item as any).TypeOfVehicleName || '',
        VehicleName: (item as any).VehicleName || '',
        VehicleColorName: (item as any).VehicleColorName || '',
      };
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, detail);
    }
    if (field == 'to-list') {
      this.router.navigate(['/mtbike/payment']);
    } else if (field == '/mtbike/collection/services' || field == '/mtbike/collection/part' || field == '/mtbike/collection/coupon') {
      this.cacheVehicleInfoForNextSteps();
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.invoice);
      this.router.navigate([field]);
    }
    else {
      this.router.navigate([field]);
    }
  }

  private cacheVehicleInfoForNextSteps() {
    let detail: any = null;

    const cachedDetail = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    if (cachedDetail) {
      detail = this.cache.parseValue(cachedDetail);
    }

    if ((!detail || !detail.Code) && this.retailMaster) {
      if (this.retailMaster.ListDetail && this.retailMaster.ListDetail.length > 0) {
        detail = this.retailMaster.ListDetail[0];
      } else if (this.retailMaster.ListBuyVehicle && this.retailMaster.ListBuyVehicle.length > 0) {
        detail = this.retailMaster.ListBuyVehicle[0];
      }
    }

    if (!detail) {
      detail = {};
    }

    const retailAny = this.retailMaster || {};
    detail.TypeOfVehicleName = detail.TypeOfVehicleName || retailAny.TypeOfVehicleName || '';
    detail.VehicleName = detail.VehicleName || retailAny.VehicleName || '';
    detail.VehicleColorName = detail.VehicleColorName || retailAny.VehicleColorName || '';

    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, detail);
  }

  //#region CALL API
  private GetListSALInvoiceDetail(param: SALOrderInvoiceCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALInvoiceDetail(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listInvoice = res.ObjectReturn;
        this.cacheVehicleInfoFromInvoiceList(this.listInvoice);
        this.subLoader.loader(false);
        this.showpopup = false;
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy chi tiết hóa đơn: ${res.ErrorString}`);
        this.showpopup = false;
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy chi tiết hóa đơn: ${err.message}`);
      this.showpopup = false;
    });
    this.arrUnsubscribe.push(sub);
  }

  /**
   * Lấy thông tin xe từ danh sách invoice detail
   */
  private cacheVehicleInfoFromInvoiceList(list: SALOrderInvoiceDetailCusDTO[]) {
    if (!list || list.length === 0) {
      return;
    }

    const preferred = list.find(x =>
      (x as any).OrderDetail && (
        (x as any).TypeOfVehicleName ||
        (x as any).VehicleName ||
        (x as any).VehicleColorName)
    ) || list.find(x =>
      (x as any).TypeOfVehicleName ||
      (x as any).VehicleName ||
      (x as any).VehicleColorName
    );

    if (!preferred) {
      return;
    }

    const cachedDetailRaw = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    let detail: any = cachedDetailRaw ? this.cache.parseValue(cachedDetailRaw) : {};

    const orderDetailCode = (preferred as any).OrderDetail || detail.Code || null;

    detail.TypeOfVehicleName = preferred.TypeOfVehicleName || detail.TypeOfVehicleName || '';
    detail.VehicleName = preferred.VehicleName || detail.VehicleName || '';
    detail.VehicleColorName = preferred.VehicleColorName || detail.VehicleColorName || '';

    // Đảm bảo Code gửi xuống BE là mã order detail
    if (orderDetailCode) {
      detail.Code = orderDetailCode;
      (detail as any).OrderDetail = orderDetailCode;
    }

    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, detail);
  }

  //#endregion
}
