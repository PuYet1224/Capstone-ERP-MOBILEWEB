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
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
@Component({
  selector: 'mtb023-document-receipt-update',
  templateUrl: './mtb023-document-receipt-update.component.html',
  styleUrls: ['./mtb023-document-receipt-update.component.scss'],
})
export class Mtb023DocumentReceiptUpdateComponent implements OnInit, OnDestroy {
  public receipt: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  public receiptcopy: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  private arrUnsubscribe: Subscription[] = [];
  master: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();

  public listPaymentMethods: ListDTO[] = [
    { TypeOfList: 1, ListName: 'Tiền mặt' } as any,
    { TypeOfList: 2, ListName: 'Chuyển khoản' } as any,
    { TypeOfList: 3, ListName: 'Tiền mặt và chuyển khoản' } as any,
  ];

  public errors: any = {};

  constructor(
    private cache: PsCache,
    private router: Router,
    private api: MtbikeApiService,
    private coreapi: PSCoreApiService,
    private configCache: ConfigCacheService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService
  ) { }

  ngOnInit(): void {
    const cachedReceipt = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    if (cachedReceipt) {
      const parsed = this.cache.parseValue(cachedReceipt);
      this.receipt = { ...this.receipt, ...parsed };
      const masterCached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
      this.master = this.cache.parseValue(masterCached);

      if (this.receipt.Code > 0) {
        this.getsalreceipt(this.receipt);
      } else {
        // Inherit from master if missing for new receipts
        const masterCached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
        this.master = this.cache.parseValue(masterCached);
        if (masterCached) {
          const master = this.cache.parseValue(masterCached);
          if (!this.receipt.CustomerName) this.receipt.CustomerName = master.CustomerName;
          if (!this.receipt.CellPhone) this.receipt.CellPhone = master.CustomerPhone;
        }
      }
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
      if (this.receipt.IsFirstReceipt) {
        if ((this.receipt.CashAmount || 0) > (this.receipt.CollectedAmount || 0)) {
          this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
        }
        this.receipt.TransferAmount = (this.receipt.CollectedAmount || 0) - (this.receipt.CashAmount || 0);
      } else {
        // Subsequent receipts: Calculate total from parts if already set, or default to cash
        if (this.receipt.CashAmount || this.receipt.TransferAmount) {
          this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
        } else {
          this.receipt.CashAmount = this.receipt.CollectedAmount || 0;
          this.receipt.TransferAmount = 0;
        }
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

    if (this.receipt.Code === 0) {
      this.updateReceipt();
    } else {
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
      this.receiptcopy = { ...this.receipt };
    }
  }

  public onCashAmountChange(val: number): void {
    this.receipt.CashAmount = val || 0;
    if (!this.receipt.IsFirstReceipt) {
      this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
    }
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
  }

  public onTransferAmountChange(val: number): void {
    this.receipt.TransferAmount = val || 0;
    if (!this.receipt.IsFirstReceipt) {
      this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
    }

    if (this.receipt.PaymentMethod === 1) {
      this.receipt.TransferAmount = 0;
    } else if (this.receipt.PaymentMethod === 2) {
      this.receipt.CashAmount = 0;
    }
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
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



  public receivedMoney(): void {
    if (this.orderInfo.Progress > 0) {
      this.receipt.Status = 4;
      this.updateReceipt(() => {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
        this.notification.onSuccess('Đã chuyển trạng thái Đang xử lý thành công');
        this.autoAddInvoice();
        this.goBack();
      });
    }
  }

  private autoAddInvoice(): void {
    if (!this.master?.Code) return;
    const sub = this.api.AddSALInvoiceFromOrder(this.master.Code).subscribe({
      next: (res) => {
        if (res.StatusCode === 0 && res.ObjectReturn && !res.ObjectReturn.AlreadyExists) {
          this.notification.onSuccess(`Đã tạo ${res.ObjectReturn.InvoiceCount} hóa đơn chứng từ`);
        }
      },
      error: () => {}
    });
    this.arrUnsubscribe.push(sub);
  }

  public onBlur(): void {
    if (this.checkDataChanged()) {
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
      this.receiptcopy = { ...this.receipt };
    }
  }

  private checkDataChanged(): boolean {
    return this.receipt.CustomerName !== this.receiptcopy.CustomerName ||
      this.receipt.CellPhone !== this.receiptcopy.CellPhone ||
      this.receipt.Description !== this.receiptcopy.Description ||
      this.receipt.PaymentMethod !== this.receiptcopy.PaymentMethod;
  }

  public onAmountBlur(type?: 'cash' | 'transfer'): void {
    const targetAmount = this.receipt.IsFirstReceipt ? (this.receipt.CollectedAmount || 0) : (this.orderInfo.DebtAmount || 0);

    if (this.receipt.PaymentMethod === 3) {
      if (this.receipt.IsFirstReceipt) {
        // First receipt: Always bi-directional auto-fill to reach the fixed CollectedAmount
        if (type === 'transfer') {
          if ((this.receipt.TransferAmount || 0) > targetAmount) {
            this.receipt.TransferAmount = targetAmount;
            this.notification.onWarning('Số tiền vượt quá tổng số tiền cần thu.');
          }
          this.receipt.CashAmount = (targetAmount || 0) - (this.receipt.TransferAmount || 0);
        } else {
          if ((this.receipt.CashAmount || 0) > targetAmount) {
            this.receipt.CashAmount = targetAmount;
            this.notification.onWarning('Số tiền vượt quá tổng số tiền cần thu.');
          }
          this.receipt.TransferAmount = (targetAmount || 0) - (this.receipt.CashAmount || 0);
        }
      } else {
        // Subsequent receipts: Allow flexible entry, only adjust if total sum EXCEEDS targetAmount
        const currentSum = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
        if (currentSum > targetAmount) {
          this.notification.onWarning('Tổng số tiền thu không được vượt quá số nợ thực tế.');
          if (type === 'transfer') {
            // Capping transfer to targetAmount, then calculating cash remainder
            if (this.receipt.TransferAmount > targetAmount) this.receipt.TransferAmount = targetAmount;
            this.receipt.CashAmount = targetAmount - (this.receipt.TransferAmount || 0);
          } else {
            // Capping cash to targetAmount, then calculating transfer remainder
            if (this.receipt.CashAmount > targetAmount) this.receipt.CashAmount = targetAmount;
            this.receipt.TransferAmount = targetAmount - (this.receipt.CashAmount || 0);
          }
        }
      }
    } else {
      // Single payment methods: Cap by targetAmount
      const total = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
      if (total > targetAmount) {
        this.notification.onWarning('Tổng số tiền thu không được vượt quá số nợ thực tế.');

        if (this.receipt.PaymentMethod === 1) {
          this.receipt.CashAmount = targetAmount;
          this.receipt.TransferAmount = 0;
        } else if (this.receipt.PaymentMethod === 2) {
          this.receipt.TransferAmount = targetAmount;
          this.receipt.CashAmount = 0;
        }
      }
    }

    this.receipt.CollectedAmount = (this.receipt.CashAmount || 0) + (this.receipt.TransferAmount || 0);
    this.receipt = { ...this.receipt };
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
  }

  //#region api get
  private getsalreceipt(param: SALOrderReceiptCusDTO) {
    this.loader.loader(true);
    var temp = this.api.GetSALReceipt(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        const result = res.ObjectReturn || {};
        const receiptData = result.Receipt || {};
        const orderInfo = result.OrderInfo || {};

        // Merge API data into local receipt but preserve current edits
        const serverReceipt = Object.assign(new SALOrderReceiptCusDTO(), receiptData);
        this.receipt = {
          ...serverReceipt,
          CollectedAmount: serverReceipt.CollectedAmount,
          CashAmount: this.receipt.CashAmount,
          TransferAmount: this.receipt.TransferAmount,
          PaymentMethod: this.receipt.PaymentMethod,
          Description: this.receipt.Description,
          CustomerName: this.receipt.CustomerName,
          CellPhone: this.receipt.CellPhone,
          Address: this.receipt.Address,
        };

        // Ensure date is valid for kendo-date-picker if any
        if (this.receipt.EffDate) this.receipt.EffDate = new Date(this.receipt.EffDate);
        if (this.receipt.CreatedTime) this.receipt.CreatedTime = new Date(this.receipt.CreatedTime);

        // Map financial breakdown
        this.orderInfo = orderInfo;
        this.receiptcopy = Object.assign(new SALOrderReceiptCusDTO(), this.receipt);

        this.initPaymentAmounts();
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  private updateReceipt(callback?: () => void): void {

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
          // If we just created the receipt, update the Code from response to avoid duplicate creation
          if (!this.receipt.Code && res.ObjectReturn) {
            if (typeof res.ObjectReturn === 'number') {
              this.receipt.Code = res.ObjectReturn;
            } else if (res.ObjectReturn.Code) {
              this.receipt.Code = res.ObjectReturn.Code;
            }
            // Refresh full data after creation
            this.getsalreceipt(this.receipt);
          }

          if (callback) {
            callback();
          } else {
            this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
            this.receiptcopy = Object.assign(new SALOrderReceiptCusDTO(), this.receipt);
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
    if (this.receipt.Code === 0) {
      this.router.navigate(['/mtbike/document']);
    } else {
      this.router.navigate(['/mtbike/document/receipt']);
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
    }
  }
}
