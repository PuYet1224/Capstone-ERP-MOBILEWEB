import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { PsString } from 'src/app/services/utilities/ps-string';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { MtbikeApiService } from '../../services/mtbike-api.service';
@Component({
  selector: 'mtb035-document-receipt-update',
  templateUrl: './mtb035-document-receipt-update.component.html',
  styleUrls: ['./mtb035-document-receipt-update.component.scss'],
})
export class Mtb035DocumentReceiptUpdateComponent implements OnInit, OnDestroy {
  public receipt: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  private arrUnsubscribe: Subscription[] = [];

  public listPaymentMethods: ListDTO[] = [
    { TypeOfList: 1, Name: 'Tiền mặt' } as any,
    { TypeOfList: 2, Name: 'Chuyển khoản' } as any,
    { TypeOfList: 3, Name: 'Tiền mặt và chuyển khoản' } as any,
  ];

  public errors: any = {};

  constructor(
    private cache: PsCache,
    private router: Router,
    private api: MtbikeApiService,
    private coreapi: PSCoreApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService
  ) { }

  ngOnInit(): void {
    const cachedReceipt = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    if (cachedReceipt) {
      const parsed = this.cache.parseValue(cachedReceipt);
      this.receipt = { ...this.receipt, ...parsed };

      // Initialize progress and orderInfo from cache if exists
      if (this.receipt['Progress'] > 0) {
        this.orderInfo.Progress = this.receipt['Progress'];
      }

      // Initialize split amounts logic from cache
      this.initPaymentAmounts();
    } else {
      this.notification.onWarning('Không tìm thấy thông tin phiếu thu.');
      this.goBack();
    }
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach((s) => s.unsubscribe());
    this.arrUnsubscribe = [];
  }

  public orderInfo: any = {};

  private initPaymentAmounts(): void {
    // If it's a split payment and amounts are not set, try to default them
    if (this.receipt.PaymentMethod === 3) {
      if (!this.receipt.CashAmount && !this.receipt.TransferAmount) {
        this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
        this.receipt.TransferAmount = 0;
      }
    } else if (this.receipt.PaymentMethod === 1) {
      this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
      this.receipt.TransferAmount = 0;
    } else if (this.receipt.PaymentMethod === 2) {
      this.receipt.TransferAmount = this.receipt.CollectedAmount || 0;
      this.receipt.CashAmount = 0;
    }
  }

  public onPaymentMethodChange(val: any): void {
    const methodId = typeof val === 'object' ? val.TypeOfList : val;
    this.receipt.PaymentMethod = methodId;

    if (methodId === 1) {
      this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
      this.receipt.TransferAmount = 0;
    } else if (methodId === 2) {
      this.receipt.TransferAmount = this.receipt.CollectedAmount || 0;
      this.receipt.CashAmount = 0;
    } else if (methodId === 3) {
      this.receipt.CashAmount = this.receipt.CashAmount || 0;
      this.receipt.TransferAmount = this.receipt.TransferAmount || 0;
    }
    this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);

    this.onBlur();
  }

  public onCashAmountChange(val: number): void {
    this.receipt.CashAmount = val || 0;
    this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
  }

  public onTransferAmountChange(val: number): void {
    this.receipt.TransferAmount = val || 0;
    this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
  }

  public validateForm(): boolean {
    let isValid = true;
    this.errors = {};

    if (PsString.isNullOrWhitespace(this.receipt.CustomerName)) {
      this.errors.CustomerName = true;
      isValid = false;
    }

    if (this.receipt.PaymentMethod === 2 || this.receipt.PaymentMethod === 3) {
      if (PsString.isNullOrWhitespace(this.receipt.Bank)) {
        this.errors.Bank = true;
        isValid = false;
      }
      if (PsString.isNullOrWhitespace(this.receipt.BankAccount)) {
        this.errors.BankAccount = true;
        isValid = false;
      }
    }

    if (!isValid) {
      this.notification.onWarning('Vui lòng nhập đầy đủ thông tin bắt buộc (*).');
    }

    return isValid;
  }

  public confirmPayment(): void {
    if (!this.validateForm()) {
      return;
    }
    this.updateReceipt();
  }

  public receivedMoney(): void {
    if (this.orderInfo.Progress > 0) {
      // Set status to 4 (Đang xử lý) as requested
      this.receipt.Status = 4;
      this.updateReceipt(() => {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
        this.notification.onSuccess('Đã chuyển trạng thái Đang xử lý thành công');
        this.goBack();
      });
    }
  }

  public onBlur(): void {
    this.updateReceipt();
  }

  private updateReceipt(callback?: () => void): void {
    if (!this.receipt || this.receipt.Code === 0) {
      return;
    }

    // Always ensure CollectedAmount is up-to-date before sending
    if (this.receipt.PaymentMethod === 1) {
      this.receipt.CollectedAmount = this.receipt.CashAmount || 0;
    } else if (this.receipt.PaymentMethod === 2) {
      this.receipt.CollectedAmount = this.receipt.TransferAmount || 0;
    } else if (this.receipt.PaymentMethod === 3) {
      this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
    }

    const sub = this.api.UpdateSALReceipt(this.receipt).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          if (callback) {
            callback();
          } else {
            this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
            this.notification.onSuccess('Thành công');
          }
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.notification.onError(`Lỗi: ${err.message || err}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  public goBack(): void {
    this.router.navigate(['/mtbike/document/receipt']);
  }
}
