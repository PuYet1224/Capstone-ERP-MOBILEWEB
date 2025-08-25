import { SALOrderDetailStatusEnum } from "../../enums/e-status/sal-order-detail-status.enum";
import { LSListTypeOfListEnum } from "../../enums/e-type/ls-list-type-of-list.enum";

class SALOrderDetailDTO {
  Code: number = 0;
  Master: number = 0;
  CSVehicle: number = 0;
  Price: number = 0;
  RegisterDate: Date | null;
  RegisterStaff: number;
  PlateDeliveryDate: Date | null;
  TechnicalStaff: number;
  DeliveryStatus: SALOrderDetailStatusEnum = SALOrderDetailStatusEnum.NEW;
  DeliveryDate: Date | null;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SALOrderDetailCusDTO extends SALOrderDetailDTO {
  ID: string = '';
  TypeOfVehicleName: string = '';
  VehicleName: string = '';
  VehicleColorName: string = '';
  TypeOfVehicle: number;
  Vehicle: number;
  VehicleColor: number;
  SaleDate: Date | null;
  FrameSeri: string = '';
  EngineSeri: string = '';
  PlateNo: string = '';
  CustomerName: string = '';
  Phone: string = '';
  Address: string = '';
  AmountPaid: number = 0;
  SaleStaffName: string = '';
  RegisterStaffName: string = '';
  TechnicalStaffName: string = '';
  MasterStatusName: string = '';
  MasterStatus: number;
  PaymentMethodName: string = '';
  PaymentMethod: LSListTypeOfListEnum.LUMPSUM;
  VehicleImage: string = ''
  InsuranceNumber: string = '';
  InsurancePeriod: number = 0;
  InsuranceTime: number = 0;
  Version: string = '';
  TypeDataName: string = '';
  Cylinder: string = '';
  Quantity: number = 0;
  TotalCost: number = 0;
  ListDetail: SALOrderDetailCusDTO[] = [];
}
