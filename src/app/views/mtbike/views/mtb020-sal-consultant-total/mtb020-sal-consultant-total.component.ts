import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { SALOrderDetailPaymentTypeEnum } from 'src/app/models/enums/e-type/sal-order-detail-payment-type.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb020-sal-consultant-total',
  templateUrl: './mtb020-sal-consultant-total.component.html',
  styleUrls: ['./mtb020-sal-consultant-total.component.scss'],
})
export class Mtb020SalConsultantTotalComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly viewportNoZoom = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  private readonly viewportDefault = 'width=device-width, initial-scale=1';

  constructor(
    private router: Router,
    private cache: PsCache,
    private meta: Meta,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
  ) { }

  //#region fields
  SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
  retailMaster: SALOrderMasterCusDTO | null = null;
  listDetails: SALOrderDetailCusDTO[] = [];
  private arrUnsubscribe: Subscription[] = [];
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  private preventZoomHandler = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
  //#endregion

  //#region getters
  get totals() {
    const L = SALOrderDetailPaymentTypeEnum.LUMPSUM;
    const I = SALOrderDetailPaymentTypeEnum.INSTALLMENT;
    const D = SALOrderDetailPaymentTypeEnum.DEPOSIT;

    const list = this.listDetails as any[];
    const z = { v: 0, vat: 0, svc: 0, part: 0, discount: 0, lumpsum: 0, deposit: 0, installmentDeposit: 0 };
    
    const o = list.reduce((acc, r) => {
      if (r.IsOrderLock !== true) return acc;

      const isInstallment = r.PaymentType === I;
      const isDeposit = r.PaymentType === D;
      const isLumpsum = r.PaymentType === L;

      const v_raw = r.BasePrice || r.Price || 0;
      const vat_raw = r.VATAmount || 0;
      const svcArraySum = Array.isArray(r.ListService) ? r.ListService.reduce((s: number, x: any) => s + (x.Price || x.Amount || 0), 0) : 0;
      const svc_raw = svcArraySum || r.ServiceAmount || 0;
      const partArraySum = Array.isArray(r.ListPart) ? r.ListPart.reduce((s: number, x: any) => s + (x.TotalPrice || ((x.UnitPrice || 0) * (x.Quantity || 0))), 0) : 0;
      const part_raw = partArraySum || r.PartAmount || 0;
      const discount_raw = r.DiscountAmount || r.PromotionAmount || r.TotalDiscount || 0;
      const itemNet = v_raw + vat_raw + svc_raw + part_raw - discount_raw;

      // "CHỈ CÓ TRẢ GÓP LÀ KHÔNG TÍNH THÔI NHÉ"
      // Only Installment is excluded from the full price breakdown.
      // LumpSum, Deposit, and Unselected (null) are all included.
      const shouldCountFull = !isInstallment;

      return {
        v: acc.v + (shouldCountFull ? v_raw : 0),
        vat: acc.vat + (shouldCountFull ? vat_raw : 0),
        svc: acc.svc + (shouldCountFull ? svc_raw : 0),
        part: acc.part + (shouldCountFull ? part_raw : 0),
        discount: acc.discount + (shouldCountFull ? discount_raw : 0),
        lumpsum: acc.lumpsum + (isLumpsum ? itemNet : 0),
        deposit: acc.deposit + (isDeposit || isInstallment ? (r.DepositAmount ?? 0) : 0),
        installmentDeposit: acc.installmentDeposit + (isInstallment ? (r.DepositAmount ?? 0) : 0)
      };
    }, z);

    const before = o.v + o.vat + o.svc + o.part;
    // Bill = (Full Price of Non-Installment items) + (Deposit of Installment items)
    const bill = before - o.discount + o.installmentDeposit;
    const paid = o.lumpsum + o.deposit;
    const debt = Math.max(0, bill - paid);

    return { 
      totalVehicleBeforeVat: o.v, 
      totalVat: o.vat, 
      totalService: o.svc, 
      totalPart: o.part, 
      totalBeforeDiscount: before, 
      totalDiscount: o.discount, 
      totalLumpsum: o.lumpsum, 
      totalDeposit: o.deposit, 
      totalPaid: paid, 
      totalPayment: bill, 
      totalDebt: debt 
    };
  }

  ngOnInit(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    this.retailMaster = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER)) ?? null;
    if (!this.retailMaster || !this.retailMaster.Code) {
      this.subLoader.loader(false);
      return;
    }
    this.subLoader.loader(true);
    const param = Object.assign(new SALOrderDetailCusDTO(), { Master: this.retailMaster.Code });
    const sub = this.mtbikeapi.GetListSALVehicleParts(param).subscribe(
      res => {
        this.subLoader.loader(false);
        const raw = res.ObjectReturn;
        this.listDetails = Array.isArray(raw) ? raw : (raw && (raw as any).Data) ? (raw as any).Data : [];
      },
      () => {
        this.subLoader.loader(false);
        this.listDetails = [];
        this.notification.onError('Không tải được danh sách');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportDefault });
    document.removeEventListener('touchmove', this.preventZoomHandler);
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
  }

  ngAfterViewInit(): void {
    if (!this.wrapper || !this.wrapper.nativeElement || !this.content || !this.content.nativeElement) return;
    const w = this.wrapper.nativeElement.clientWidth;
    const c = this.content.nativeElement.scrollWidth;
    this.content.nativeElement.classList.toggle('running', c > w);

    // Block pinch-zoom on this page
    document.addEventListener('touchmove', this.preventZoomHandler, { passive: false });
  }
  //#endregion

  //#region navigate
  onNavigate(field: string): void {
    const r: Record<string, string> = { back: '/mtbike/consultant/cart', 'to-list': '/mtbike/consultant', customer: '/mtbike/consultant/detail', cart: '/mtbike/consultant/cart' };
    if (r[field]) this.router.navigate([r[field]]);
  }
  //#endregion

  //#region API
  onSendPayment(): void {
    if (!this.retailMaster?.Code) {
      this.notification.onWarning('Không có phiếu để gửi thanh toán');
      return;
    }

    const invalidVehicle = null; // this.listDetails.find(v => v.IsOrderLock === true && v.PaymentType == null);
    if (invalidVehicle) {
      this.notification.onWarning(`Xe ${invalidVehicle.VehicleName || ''} ${invalidVehicle.VehicleColorName || ''} chưa chọn hình thức thanh toán`);
      return;
    }

    const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
      ListDTO: [{ Code: this.retailMaster.Code } as SALOrderMasterCusDTO],
      Status: SALOrderMasterStatusRetailEnum.PENDING,
    };
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALMasterStatus(param).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Thành công');
          this.retailMaster = { ...this.retailMaster, Status: SALOrderMasterStatusRetailEnum.PENDING } as any;
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailMaster);
          this.router.navigate(['/mtbike/consultant']);
        } else {
          this.notification.onError(res.ErrorString || 'Thất bại');
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(err && err.message ? err.message : 'Thất bại');
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
