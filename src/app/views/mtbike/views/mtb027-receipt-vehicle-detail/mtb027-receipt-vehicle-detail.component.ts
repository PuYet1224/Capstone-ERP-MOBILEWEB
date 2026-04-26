import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { SALOrderDetailPaymentTypeEnum } from 'src/app/models/enums/e-type/sal-order-detail-payment-type.enum';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';

@Component({
  selector: 'mtb027-receipt-vehicle-detail',
  templateUrl: './mtb027-receipt-vehicle-detail.component.html',
  styleUrls: ['./mtb027-receipt-vehicle-detail.component.scss'],
})
export class Mtb027ReceiptVehicleDetailComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private api: MtbikeApiService,
    private configCache: ConfigCacheService,
  ) { }

  //#region fields
  listPaymentType: any[] = [];
  listFinanceCompany: any[] = [];
  paymentTypeEnum = SALOrderDetailPaymentTypeEnum;
  receipt: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  orderreceipt: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  ordermaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  receiptNo: string = '';
  orderMaster: number = 0;
  total: number = 0;
  listVehicles: any[] = [];
  private arrUnsubscribe: Subscription[] = [];
  //#endregion

  //#region lifecycle
  ngOnInit(): void {
    const cachedmaster = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    this.ordermaster = this.cache.parseValue(cachedmaster);

    const cachedReceipt = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    const parsed = this.cache.parseValue(cachedReceipt);
    this.orderreceipt = { ...this.orderreceipt, ...parsed };

    const cached = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.SAL_RECEIPT));
    if (cached) {
      this.receipt = cached;
    }
    if (this.receipt?.Code > 0) {
      this.onLoad();
    }
    this.getPaymentTypes();
    this.getFinanceCompanies();
  }

  getPaymentTypes(): void {
    const sub = this.configCache.GetListLSList(LSListTypeDataEnum.PaymentType).subscribe(
      data => {
        this.listPaymentType = data || [];
      },
      err => {
        this.notification.onError('Không tải được danh sách hình thức thanh toán');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  getFinanceCompanies(): void {
    const sub = this.api.GetListPartnerFinance().subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.listFinanceCompany = res.ObjectReturn || [];
        } else {
          this.notification.onError(res.ErrorString || 'Không tải được danh sách công ty tài chính');
        }
      },
      err => {
        this.notification.onError(err?.message || 'Lỗi kết nối');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region API
  onLoad(): void {
    this.subLoader.loader(true);
    const sub = this.api.GetSALReceiptVehicles({ Code: this.receipt.Code }).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0 && res.ObjectReturn) {
          const data = res.ObjectReturn;
          this.receiptNo = data.ReceiptNo || '';
          this.orderMaster = data.OrderMaster || 0;
          this.total = data.Total || 0;
          this.listVehicles = Array.isArray(data.Data) ? data.Data : [];
          this.calculateTotalCollected();
        } else {
          this.notification.onError(res.ErrorString || 'Không tải được danh sách xe');
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(err?.message || 'Lỗi kết nối');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  onNavigate(path: string): void {
    this.router.navigate([path]);
  }

  onValueChange(item: any, field: string, value: any): void {
    item[field] = value;
    this.calculateTotalCollected();
    this.onUpdate(item);
  }

  calculateTotalCollected(): void {
    let total = 0;
    this.listVehicles.forEach(v => {
      if (v.PaymentType === 1) {
        total += (v.Price || 0);
      } else if (v.PaymentType === 3) {
        total += (v.DepositAmount || 0);
      }
      // PaymentType === 2 skip
    });
      this.orderreceipt.CollectedAmount = total;
  }

  onUpdate(item: any): void {
    const payload: any = {
      Code: item.Code,
      PaymentType: item.PaymentType,
    };

    if (item.PaymentType === this.paymentTypeEnum.DEPOSIT) {
      payload.DepositAmount = item.DepositAmount;
    }

    if (item.PaymentType === this.paymentTypeEnum.INSTALLMENT) {
      payload.DurationMethod = item.DurationMethod;
    }

    this.subLoader.loader(true);
    const sub = this.api.UpdateSALReceiptVehicle(payload).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Cập nhật thông tin xe thành công');
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.orderreceipt);

          this.onLoad(); // Refresh data
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi khi cập nhật thông tin xe');
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(err?.message || 'Lỗi kết nối');
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
