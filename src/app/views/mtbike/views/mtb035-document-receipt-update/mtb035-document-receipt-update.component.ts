import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { PsString } from 'src/app/services/utilities/ps-string';

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
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService
  ) {}

  ngOnInit(): void {
    const cachedReceipt = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    if (cachedReceipt) {
      const parsed = this.cache.parseValue(cachedReceipt);
      this.receipt = { ...this.receipt, ...parsed };

      // Initialize default values if not present
      if (!this.receipt.PaymentMethod) {
        this.receipt.PaymentMethod = 1; // Default to Cash
      }
      
      // Sync numerical fields
      if (this.receipt.PaymentMethod === 1) {
         this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
         this.receipt.TransferAmount = 0;
      } else if (this.receipt.PaymentMethod === 2) {
         this.receipt.TransferAmount = this.receipt.CollectedAmount || 0;
         this.receipt.CashAmount = 0;
      }
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

  public onPaymentMethodChange(val: any): void {
    // Kendo dropdown can return primitive or object
    const methodId = typeof val === 'object' ? val.TypeOfList : val;
    this.receipt.PaymentMethod = methodId;
    
    // Auto-calculate amounts when switching methods
    if (methodId === 1) {
       this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
       this.receipt.TransferAmount = 0;
    } else if (methodId === 2) {
       this.receipt.TransferAmount = this.receipt.CollectedAmount || 0;
       this.receipt.CashAmount = 0;
    } else if (methodId === 3) {
       this.receipt.CashAmount = this.receipt.CashAmount || (this.receipt.CollectedAmount || 0);
       this.receipt.TransferAmount = Math.max(0, (this.receipt.CollectedAmount || 0) - this.receipt.CashAmount);
    }
  }

  public onCashAmountChange(val: number): void {
     this.receipt.CashAmount = val || 0;
     if (this.receipt.PaymentMethod === 3) {
        this.receipt.TransferAmount = Math.max(0, (this.receipt.CollectedAmount || 0) - this.receipt.CashAmount);
     }
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

  public onSave(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loader.loader(true);
    const sub = this.api.UpdateSALReceipt(this.receipt).subscribe(
      (res) => {
        this.loader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Cập nhật thông tin thành công!');
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
          this.goBack();
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi: ${err.message || err}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  public goBack(): void {
    this.router.navigate(['/mtbike/document/receipt']);
  }
}
