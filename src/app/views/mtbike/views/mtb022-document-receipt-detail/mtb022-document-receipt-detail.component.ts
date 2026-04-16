import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderReceiptDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt-detail.dto';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { SALOrderReceiptStatusEnum } from 'src/app/models/enums/e-status/sal-order-receipt-status.enum';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { SALOrderDetailPaymentTypeEnum } from 'src/app/models/enums/e-type/sal-order-detail-payment-type.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PSDate } from 'src/app/services/utilities/ps-date';
import { PsString } from 'src/app/services/utilities/ps-string';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb022-document-receipt-detail',
  templateUrl: './mtb022-document-receipt-detail.component.html',
  styleUrls: ['./mtb022-document-receipt-detail.component.scss'],
})

export class Mtb022DocumentReceiptDetailComponent {
  constructor(
    private api: MtbikeApiService,
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private configCache: ConfigCacheService,
    private configService: GetConfigService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    var master = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.womMaster = this.cache.parseValue(master) || new SALOrderMasterCusDTO();

    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    var receipt = this.cache.parseValue(temp) || new SALOrderReceiptCusDTO();

    this.receiptcopy = { ...this.receipt };

    // Bypass API get receipt for testing
    // if (receipt.Code != 0) {
    this.getsalreceipt(receipt, true)
    // }
    this.getlistlslist();

    // Mock vehicle list for testing
    this.listvehicle = [
      { Code: 1, VehicleName: 'Honda Wave', CollectedAmount: 5000000, RemainingAmount: 5000000, PaymentType: 1, IsChecked: false } as any
    ];
    this.listvehiclecopy = this.listvehicle.map(x => ({ ...x }));
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region core
  public womMaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public receipt: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  public receiptcopy: SALOrderReceiptCusDTO = new SALOrderReceiptCusDTO();
  public enumreceiptstt = SALOrderReceiptStatusEnum;
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public onnavigate(field: string) {
    this.router.navigate([field]);
  }

  public getStatusClass(status: number): string {
    switch (status) {
      case SALOrderReceiptStatusEnum.Success: return 'status-complete';
      case SALOrderReceiptStatusEnum.New: return 'status-new';
      case SALOrderReceiptStatusEnum.Cancled: return 'status-cancel';
      default: return 'status-pending';
    }
  }
  //#endregion

  //#region phiếu thu
  public currentheader: LSHeadCusDTO = this.configService.GetHead();
  public enumpayment = SALOrderDetailPaymentTypeEnum;

  public onValueChange(field: string) {
    if (this.receipt[field] === this.receiptcopy[field]) {
      return;
    }

    if (field === 'CellPhone') {
      const cellPhoneValue = this.receipt.CellPhone.trim() || '';
      if (PsString.isNullOrWhitespace(cellPhoneValue) || cellPhoneValue.length < 10) {
        this.receipt.CustomerName = '';
        this.receipt.Address = '';
        this.receipt.CellPhone = '';
        this.receipt.Signature = null;
        this.receipt.Description = '';
        this.receipt.EffDate = null;
        this.receiptcopy.CustomerName = '';
        this.receiptcopy.Address = '';
        this.receiptcopy.CellPhone = '';
        this.receiptcopy.Signature = null;

        this.listvehicle = [];
        this.listvehiclecopy = [];

        this.receipt.TotalAmount = 0;
        this.receipt.TotalReceiptAmount = 0;
        this.receipt.RemainingAmount = 0;
        this.receipt.CollectedAmount = 0;
        this.receiptcopy.TotalAmount = 0;
        this.receiptcopy.TotalReceiptAmount = 0;
        this.receiptcopy.RemainingAmount = 0;
        this.receiptcopy.CollectedAmount = 0;

        return;
      }
    }

    if (field === 'EffDate') {
      const newDate = PSDate.setHours(new Date(this.receipt.EffDate), 0, 0, 0, 0);
      this.receipt.EffDate = newDate;
    }

    var param: UpdatePropertiesInterface<SALOrderReceiptCusDTO>;

    if (this.receipt.Code === 0) {
      param = {
        DTO: {
          ...this.receipt,
          OrderMaster: this.womMaster.Code,
          Head: this.currentheader.Head,
          Status: this.enumreceiptstt.New,
          PaymentMethod: this.listpaymentmethod[0].TypeOfList
        },
        Properties: ["Head", "OrderMaster", "ReceiptSerial", "ReceiptNo", "Status", "PaymentMethod", "CollectedAmount", field]
      };
    } else {
      param = {
        DTO: this.receipt,
        Properties: [field]
      };
    }
  }

  public onupdatestatus(enumstt: SALOrderReceiptStatusEnum) {
    if (enumstt == SALOrderReceiptStatusEnum.Success) {
      if (PsString.isNullOrWhitespace(this.receipt.CellPhone) || this.receipt.CellPhone.length < 10) {
        this.notification.onWarning("Chưa có thông tin số điện thoại hoặc số điện thoại không hợp lệ");
        return;
      }

      if (PsString.isNullOrWhitespace(this.receipt.CustomerName)) {
        this.notification.onWarning("Chưa có thông tin tên khách hàng");
        return;
      }

      if (!this.receipt.EffDate) {
        this.notification.onWarning("Chưa có thông tin ngày hiệu lực");
        return;
      }

      if (PsString.isNullOrWhitespace(this.receipt.Description)) {
        this.notification.onWarning("Chưa có thông tin nội dung thu tiền");
        return;
      }

      if (!this.receipt.PaymentMethod) {
        this.notification.onWarning("Chưa có thông tin phương thức thanh toán");
        return;
      }

      if (!this.receipt.CollectedAmount) {
        this.notification.onWarning("Chưa có thông tin số tiền thu");
        return;
      }

      if (PsString.isNullOrWhitespace(this.receipt.Signature)) {
        this.notification.onWarning("Chưa có chữ ký khách hàng");
        return;
      }
    }

    // Kiểm tra số điện thoại khi hủy giao dịch
    if (enumstt == SALOrderReceiptStatusEnum.Cancled) {
      const cellPhoneValue = this.receipt.CellPhone?.trim() || '';
      if (PsString.isNullOrWhitespace(cellPhoneValue) || cellPhoneValue.length < 10) {
        this.notification.onWarning("Chưa có thông tin số điện thoại hoặc số điện thoại không hợp lệ");
        return;
      }
    }

    this.receipt.Status = enumstt;
    var param = { DTO: this.receipt, Properties: ['Status'] }
  }
  //#endregion

  //#region chi tiết phiếu thu
  public listvehicle: SALOrderReceiptDetailCusDTO[] = [];
  public listvehiclecopy: SALOrderReceiptDetailCusDTO[] = [];

  public oncheckdetail(dto: SALOrderReceiptDetailCusDTO, e: boolean) {
    if (this.receipt.Status == this.enumreceiptstt.Success)
      return;

    dto.IsChecked = e;
    if ((dto.PaymentType == SALOrderDetailPaymentTypeEnum.LUMPSUM) ||
      (dto.PaymentType == SALOrderDetailPaymentTypeEnum.DEPOSIT)) {
      this.updatesalreceiptdetail(dto);
    }
  }

  public onupdatedetail(item: SALOrderReceiptDetailCusDTO) {
    if (item.PaymentType == this.enumpayment.DEPOSIT && item.CollectedAmount > item.RemainingAmount) {
      this.notification.onWarning("Số tiền thu không được lớn hơn số tiền còn lại");
      return
    };
    if (item.CollectedAmount != this.listvehiclecopy.find(f => f.Code == item.Code).CollectedAmount)
      this.updatesalreceiptdetail(item);
  }

  public checklistdetail() {
    return this.listvehicle.some(f => f.IsChecked == true && f.Code != 0)
  }
  //#endregion

  //#region tổng phiếu thu
  public listpaymentmethod: ListDTO[] = [];
  //#endregion

  //#region footer
  public showSignaturePopup = false;
  public showpopup = false;

  public closeSignaturePopup() {
    this.showSignaturePopup = false;
  }

  public openSignaturePopup() {
    this.showSignaturePopup = true;
  }

  public save(e) {
    if (!e || PsString.isNullOrWhitespace(e))
      return;

    const properties = ['Signature'];
    const param: UpdatePropertiesInterface<SALOrderReceiptCusDTO> = {
      DTO: {
        ...this.receipt,
        Signature: e
      },
      Properties: properties,
    };

    this.loader.loader(true);
    const sub = this.api.UpdateSALReceipt(param.DTO).subscribe(
      (res) => {
        this.loader.loader(false);
        if (res.StatusCode === 0) {
          this.receipt.Signature = e;
          this.receiptcopy.Signature = e;
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, this.receipt);
          this.notification.onSuccess('Thành công');
          this.closeSignaturePopup();
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

  print() {
    window.print()
  }
  //#endregion

  //#region api get

  private getlistlslist() {
    this.loader.loader(true);
    var temp = this.configCache.GetListLSList(LSListTypeDataEnum.PaymentMethod).subscribe((data) => {
      this.listpaymentmethod = data;
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phương thức thanh toán: ${err.message || err}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getsalreceipt(param: SALOrderReceiptCusDTO, loadpage = false) {
    this.loader.loader(true);
    var temp = this.api.GetSALReceipt(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        const result = res.ObjectReturn || {};
        const receiptData = result.Receipt || {};
        const orderInfo = result.OrderInfo || {};

        // Map Receipt basic info
        this.receipt = Object.assign(new SALOrderReceiptCusDTO(), receiptData);

        // Map OrderInfo to womMaster for breakdown details
        this.womMaster.VehiclePrice = orderInfo.VehicleAmount || 0;
        this.womMaster.ServiceTotal = orderInfo.ServiceAmount || 0;
        this.womMaster.PartTotal = orderInfo.PartAmount || 0;
        this.womMaster.DiscountAmount = orderInfo.PromotionAmount || 0;
        this.womMaster.VatPrice = orderInfo.VATAmount || 0;
        this.womMaster.TotalPayment = orderInfo.TotalBillAmount || 0;
        this.womMaster.TotalBeforeDiscount = (orderInfo.VehicleAmount || 0) + (orderInfo.ServiceAmount || 0) + (orderInfo.PartAmount || 0);

        // Map OrderInfo to bottom summary fields
        this.receipt.TotalOrderValue = orderInfo.TotalPrice || 0;
        this.receipt.PriorCollections = orderInfo.AmountPaid || 0;
        this.receipt.CurrentRemainingDebt = orderInfo.DebtAmount || 0;
        this.receipt.OrderNo = orderInfo.OrderID || this.receipt.OrderNo;

        if (this.receipt.EffDate)
          this.receipt.EffDate = new Date(this.receipt.EffDate);

        this.receiptcopy = { ...this.receipt };

        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region api set
  private updatesalreceiptdetail(param: SALOrderReceiptDetailCusDTO) {
    this.loader.loader(true);
    var temp = this.api.UpdateSALReceiptDetail(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.getsalreceipt(this.receipt);
          this.notification.onSuccess(`Thành công`);
          this.loader.loader(false);
        } else {
          this.notification.onError(`Lỗi cập nhật xe vào phiếu: ${res.ErrorString}`);
        }
        this.loader.loader(false);
      },
      (err) => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi cập nhật xe vào phiếu: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}