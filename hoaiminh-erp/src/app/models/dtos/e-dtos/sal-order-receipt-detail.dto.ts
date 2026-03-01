import { SALOrderDetailPaymentTypeEnum } from "../../enums/e-type/sal-order-detail-payment-type.enum";

class SALOrderReceiptDetailDTO {
  Code: number = 0;
  Receipt: number;
  OrderDetail: number;
  CollectedAmount: number = 0;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SALOrderReceiptDetailCusDTO extends SALOrderReceiptDetailDTO {
  IsChecked: boolean = false;
  TypeOfVehicleName: string = '';
  VehicleName: string = '';
  VehicleColorName: string = '';
  PaymentType: SALOrderDetailPaymentTypeEnum;
  PaymentTypeName: string = '';
  TotalAmount: number = 0;
  RemainingAmount: number = 0;
  PaidAmount: number = 0;
  TotalPart: number = 0;
  TotalService: number = 0;
  DiscountPercent: number = 0;
}
