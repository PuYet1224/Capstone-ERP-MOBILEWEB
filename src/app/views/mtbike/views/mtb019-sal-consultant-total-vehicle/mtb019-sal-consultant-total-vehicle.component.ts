declare var Hammer: any;
import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderDetailPaymentTypeEnum } from 'src/app/models/enums/e-type/sal-order-detail-payment-type.enum';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { ConfigCacheService } from "src/app/services/core/config-cache.service";
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';

@Component({
  selector: 'mtb019-sal-consultant-total-vehicle',
  templateUrl: './mtb019-sal-consultant-total-vehicle.component.html',
  styleUrls: ['./mtb019-sal-consultant-total-vehicle.component.scss'],
  animations: [
    trigger('slideSwitch', [
      transition('* => left', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition('* => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition('left => *', []),
      transition('right => *', []),
    ]),
  ],
})
export class Mtb019SalConsultantTotalVehicleComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private coreApi: PSCoreApiService,
    private renderer: Renderer2,
    private configCache: ConfigCacheService,
  ) { }

  //#region fields
  retailMaster: SALOrderMasterCusDTO | null = null;
  orderDetail: SALOrderDetailCusDTO & Record<string, any> = new SALOrderDetailCusDTO() as any;
  listSalVehicleParts: SALOrderDetailCusDTO[] = [];
  listOrderDetailCode: number[] = [];
  currentVehicleIndex = 0;
  slideDirection: 'left' | 'right' | '' = '';
  private arrUnsubscribe: Subscription[] = [];

  enumPaymentType = SALOrderDetailPaymentTypeEnum;

  listFinanceCompany: any[] = [];
  listpaymentmethod: any[] = [];
  statusContext: { Status: number; StatusName: string } | null = null;
  private paymentCache: Record<number, any> = {};
  private hasLoadedPartnerFinance = false;
  private focusListener?: () => void;
  private blurListener?: () => void;
  //#endregion

  //#region view refs
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  @ViewChild('bodyInner') bodyInner!: ElementRef<HTMLElement>;
  //#endregion

  //#region getters
  get hasServices(): boolean {
    const list = this.orderDetail && (this.orderDetail as any).ListService;
    return Array.isArray(list) && list.length > 0;
  }
  get hasParts(): boolean {
    const list = this.orderDetail && (this.orderDetail as any).ListPart;
    return Array.isArray(list) && list.length > 0;
  }
  get listService(): any[] {
    const list = this.orderDetail && (this.orderDetail as any).ListService;
    return Array.isArray(list) ? list : [];
  }
  get listPart(): any[] {
    const list = this.orderDetail && (this.orderDetail as any).ListPart;
    return Array.isArray(list) ? list : [];
  }
  get tottalindex(): number {
    if (this.listOrderDetailCode.length > 0) return this.listOrderDetailCode.length;
    return this.listSalVehicleParts.length;
  }
  //#endregion

  //#region lifecycle
  ngOnInit(): void {
    this.getlistlslist();
    this.retailMaster = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER)) || null;
    const orderDetailTemp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    if (orderDetailTemp) {
      this.orderDetail = this.cache.parseValue(orderDetailTemp) || this.orderDetail;
      this.setdetailimg(this.orderDetail);
      this.setStatusContext(this.orderDetail);
    }
    const vcolor = this.cache.getItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR);
    const vehiclecolor = vcolor ? this.cache.parseValue(vcolor) : null;
    if (vehiclecolor && vehiclecolor.ListOrderDetailCode && vehiclecolor.ListOrderDetailCode.length) {
      this.listOrderDetailCode = vehiclecolor.ListOrderDetailCode;
      const selectedCode = this.orderDetail != null ? this.orderDetail.Code : null;
      const idx = selectedCode != null ? this.listOrderDetailCode.indexOf(selectedCode) : -1;
      this.currentVehicleIndex = idx >= 0 ? idx : 0;
      const code = this.listOrderDetailCode[this.currentVehicleIndex];
      (this.orderDetail as any).Code = code;
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
      this.GetSALPayment();
      return;
    }
    if (this.orderDetail && this.orderDetail.Code) {
      this.GetSALPayment();
      return;
    }
    this.subLoader.loader(false);
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
    if (this.focusListener) this.focusListener();
    if (this.blurListener) this.blurListener();
  }

  ngAfterViewInit(): void {
    if (!this.wrapper.nativeElement || !this.content.nativeElement) return;
    const w = this.wrapper.nativeElement.clientWidth;
    const c = this.content.nativeElement.scrollWidth;
    this.content.nativeElement.classList.toggle('running', c > w);

    if (this.bodyInner && this.bodyInner.nativeElement) {
      const mc = new Hammer(this.bodyInner.nativeElement, { touchAction: 'pan-y' });
      mc.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    }

    this.focusListener = this.renderer.listen('document', 'touchstart', (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') this.disableIOSZoom();
    });
    this.blurListener = this.renderer.listen('document', 'focusout', (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        setTimeout(() => this.enableIOSZoom(), 100);
      }
    });
  }
  //#endregion

  //#region iOS zoom 
  private disableIOSZoom(): void {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
  }

  private enableIOSZoom(): void {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) viewport.setAttribute('content', 'width=device-width, initial-scale=1');
  }
  //#endregion

  //#region navigate
  onNavigate(field: string): void {
    const routes: Record<string, string> = { back: '/mtbike/consultant/cart', 'to-list': '/mtbike/consultant', continue: '/mtbike/consultant/total', customer: '/mtbike/consultant/detail', cart: '/mtbike/consultant/cart' };
    if (routes[field]) this.router.navigate([routes[field]]);
  }
  //#endregion

  //#region vehicle switch
  onSlideSwitchDone(): void {
    setTimeout(() => { this.slideDirection = ''; }, 0);
  }
  canGoPrev(): boolean {
    return this.tottalindex > 0 && this.currentVehicleIndex > 0;
  }
  canGoNext(): boolean {
    return this.tottalindex > 0 && this.currentVehicleIndex < this.tottalindex - 1;
  }
  ontoleftclick(): void {
    if (this.slideDirection !== '') return;
    if (!this.canGoPrev()) return;
    this.slideDirection = 'left';
    this.currentVehicleIndex--;
    this.setcurrent(this.currentVehicleIndex);
  }
  ontorightclick(): void {
    if (this.slideDirection !== '') return;
    if (!this.canGoNext()) return;
    this.slideDirection = 'right';
    this.currentVehicleIndex++;
    this.setcurrent(this.currentVehicleIndex);
  }
  goPrev(): void {
    this.ontoleftclick();
  }
  goNext(): void {
    this.ontorightclick();
  }

  private syncCurrentDetailToList(): void {
    const code = this.orderDetail != null ? this.orderDetail.Code : null;
    if (code != null) this.paymentCache[code] = { ...this.orderDetail };
    if (this.listSalVehicleParts.length === 0) return;
    if (this.currentVehicleIndex < 0 || this.currentVehicleIndex >= this.listSalVehicleParts.length) return;
    this.listSalVehicleParts[this.currentVehicleIndex] = { ...this.orderDetail } as SALOrderDetailCusDTO;
  }

  private setcurrent(index: number): void {
    if (this.bodyInner && this.bodyInner.nativeElement) this.bodyInner.nativeElement.scrollTop = 0;
    if (this.listSalVehicleParts.length > 0) {
      const list = this.listSalVehicleParts;
      if (index < 0 || index >= list.length) return;
      const item = list[index];
      const code = item.Code;
      this.orderDetail = { ...item } as any;
      this.setdetailimg(this.orderDetail);
      this.setStatusContext(this.orderDetail);
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
      if (!code) return;
      if (this.paymentCache[code] != null) {
        const cached = this.paymentCache[code] as Record<string, any>;
        Object.keys(cached).forEach(k => (this.orderDetail as any)[k] = cached[k]);
        this.setdetailimg(this.orderDetail);
        this.setStatusContext(this.orderDetail);
        if (this.orderDetail.PaymentType === SALOrderDetailPaymentTypeEnum.INSTALLMENT)
          this.loadListPartnerFinance();
        this.syncCurrentDetailToList();
        return;
      }
      this.GetSALPayment();
      return;
    }
    if (this.listOrderDetailCode.length === 0 || index < 0 || index >= this.listOrderDetailCode.length) return;
    const code = this.listOrderDetailCode[index];
    (this.orderDetail as any).Code = code;
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
    if (this.paymentCache[code] != null) {
      const cached = this.paymentCache[code] as Record<string, any>;
      Object.keys(cached).forEach(k => (this.orderDetail as any)[k] = cached[k]);
      this.setdetailimg(this.orderDetail);
      this.setStatusContext(this.orderDetail);
      if (this.orderDetail.PaymentType === SALOrderDetailPaymentTypeEnum.INSTALLMENT)
        this.loadListPartnerFinance();
      return;
    }
    this.GetSALPayment();
  }
  //#endregion

  //#region status & discount
  getDiscountLabel(): string {
    const pct = (this.orderDetail as any).DiscountPercent;
    const percent = pct != null ? Number(pct) : 0;
    return percent === 0 ? '0 CTKM' : 'giảm giá ' + percent.toFixed(2) + '%';
  }

  private setdetailimg(d: SALOrderDetailCusDTO | null): void {
    if (!d) return;
    const o = d as any;
    if (!o.VehicleImage && o.ImageSetting1) o.VehicleImage = o.ImageSetting1;
  }

  private setStatusContext(d: SALOrderDetailCusDTO | null): void {
    if (!d) { this.statusContext = null; return; }
    const type = (d as any).TypeData ?? SALOrderDetailTypeDataEnum.BUY;
    const n = type === SALOrderDetailTypeDataEnum.CARE ? SALOrderDetailTypeDataEnum.BUY : type;
    const StatusName = n === SALOrderDetailTypeDataEnum.TRANSFER ? 'Điều xe' : n === SALOrderDetailTypeDataEnum.BOOK ? 'Đặt xe' : 'Có sẵn';
    this.statusContext = { Status: n, StatusName };
  }
  //#endregion

  //#region payment
  onPaymentTypeChange(): void {
    this.listFinanceCompany = [];
    (this.orderDetail as any).FinanceCompany = null;
    (this.orderDetail as any).FinanceCompanyName = '';
    if (this.orderDetail.PaymentType === SALOrderDetailPaymentTypeEnum.INSTALLMENT)
      this.loadListPartnerFinance();
    this.syncCurrentDetailToList();
    this.UpdateSALDetail();
  }

  onFinanceCompanyChangeByCode(code: number | null): void {
    const f = code != null ? this.listFinanceCompany.find((x: any) => (x.Code || x.ID) === code) : null;
    (this.orderDetail as any).FinanceCompanyName = f && f.ListName ? f.ListName : '';
    this.syncCurrentDetailToList();
    this.UpdateSALDetail();
  }

  onDepositAmountBlur(): void {
    this.syncCurrentDetailToList();
    const amt = this.orderDetail != null ? this.orderDetail.DepositAmount : null;
    if (amt == null || amt === 0) return;
    this.UpdateSALDetail();
  }
  //#endregion

  //#region API
  private getlistlslist() {
    this.subLoader.loader(true);
    var temp = this.configCache.GetListLSList(LSListTypeDataEnum.PaymentType).subscribe((data) => {
      this.listpaymentmethod = data;
      this.subLoader.loader(false);
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách hình thức : ${err.message || err}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALDetail(): void {
    if (!this.orderDetail || !this.orderDetail.Code) return;
    const sub = this.mtbikeapi.UpdateSALDetail(this.orderDetail).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.GetSALPayment();
          this.notification.onSuccess('Thành công');
        } else if (res.ErrorString) {
          this.notification.onError(res.ErrorString);
        }
      },
      err => {
        const msg = err && err.message ? err.message : 'Không lưu được thông tin thanh toán';
        this.notification.onError(msg);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private loadListPartnerFinance(): void {
    const bindFinanceName = (): void => {
      const cur = (this.orderDetail as any).FinanceCompany;
      if (cur != null && this.listFinanceCompany.length > 0) {
        const f = this.listFinanceCompany.find((x: any) => (x.Code || x.ID) === cur);
        if (f && f.ListName) (this.orderDetail as any).FinanceCompanyName = f.ListName;
      }
    };
    if (this.hasLoadedPartnerFinance) {
      bindFinanceName();
      return;
    }
    const sub = this.coreApi.GetListPartnerFinance().subscribe(
      res => {
        if (res.StatusCode === 0 && Array.isArray(res.ObjectReturn)) {
          this.listFinanceCompany = (res.ObjectReturn as any[]).map((x: any) => ({ ...x, ListName: x.ListName || x.Name || '', Code: x.Code || x.ID }));
          this.hasLoadedPartnerFinance = true;
          bindFinanceName();
        }
      },
      err => {
        let msg = 'Không tải được danh sách công ty tài chính';
        if (err && err.message) msg = err.message;
        this.notification.onError(msg);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private GetSALPayment(): void {
    const code = this.orderDetail.Code;
    if (!code) return;
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetSALPayment({ Code: code }).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0 && res.ObjectReturn) {
          this.orderDetail = res.ObjectReturn;
          if (this.orderDetail.PaymentType === SALOrderDetailPaymentTypeEnum.INSTALLMENT)
            this.loadListPartnerFinance();
          this.syncCurrentDetailToList();
        } else if (res.ErrorString) this.notification.onError(res.ErrorString);
      },
      err => {
        this.subLoader.loader(false);
        let msg = 'Lỗi lấy thông tin thanh toán';
        if (err && err.message) msg = err.message;
        this.notification.onError(msg);
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
