import { SALOrderReceiptStatusEnum } from "../../enums/e-status/sal-order-receipt-status.enum";
import { SALOrderDetailPaymentTypeEnum } from "../../enums/e-type/sal-order-detail-payment-type.enum";
import { SALOrderReceiptTypeDataEnum } from "../../enums/e-type/sal-order-receipt-type-data.enum";

class SALOrderReceiptDTO {
  Code: number = 0;
  Head: number;
  OrderMaster: number;
  OrderDetail: number;
  ReceiptNo: string = '';
  ReceiptSerial: string = '';
  EffDate: Date;
  Cashier: number;
  Customer: number;
  CustomerName: string = '';
  CellPhone: string = '';
  PaymentMethod: number;
  Description: string = '';
  Address: string = '';
  CollectedAmount: number = 0;
  Signature: string = '';
  Status: SALOrderReceiptStatusEnum = SALOrderReceiptStatusEnum.New;
  TypeData: SALOrderReceiptTypeDataEnum;
  CreatedTime: Date;
  CreatedBy: string = '';
  LastModifiedTime: Date;
  LastModifiedBy: string = '';
}

export class SALOrderReceiptCusDTO extends SALOrderReceiptDTO {
  StatusName: string = 'Mới';
  TotalAmount: number = 0;
  RemainingAmount: number = 0;
  PaymentType: SALOrderDetailPaymentTypeEnum;
  PaymentTypeName: string = '';
  TotalReceiptAmount: number = 0;
}