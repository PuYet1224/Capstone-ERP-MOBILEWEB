import { SALOrderInvoiceDetailTypeDataEnum } from "../../enums/e-type/sal-order-invoice-detail-type-data.enum";
import { SALOrderDetailPartItemCusDTO } from "./sal-order-detail-part-item.dto";
import { SALOrderDetailServiceCusDTO } from "./sal-order-detail-service.dto";

export class SALOrderInvoiceDetailDTO {
  Code: number = 0;
  InvoiceMaster: number = 0;
  OrderDetail: number;
  OrderDetailPartItem: number;
  OrderDetailService: number;
  TypeData: SALOrderInvoiceDetailTypeDataEnum;
  CreatedTime: Date;
  CreatedBy: string = '';
  LastModifiedTime: Date;
  LastModifiedBy: string = '';
}

export class SALOrderInvoiceDetailCusDTO extends SALOrderInvoiceDetailDTO {
  TypeOfVehicleName: string;
  VehicleName: string;
  VehicleColorName: string;
  ServiceName: string;
  TypeOfPartName: string;
  ServicePrice: number;
  PartPrice: number;
  Quantity: number;
  IsChecked: boolean = false;
  VehiclePrice: number;
  DiscountAmount: number;
  VATAmount: number;
  TotalAmount: number;
  TotalPayment: number;
  ListService: SALOrderDetailServiceCusDTO[];
  ListPart: SALOrderDetailPartItemCusDTO[];
  IsExisted: boolean = false;
}
