import { SALOrderDetailCusDTO } from "./sal-order-detail.dto";
import { SALOrderMasterStatusEnum } from "../../enums/e-status/sal-order-master-status.enum";
class SALOrderMasterDTO {
  Code: number = 0;
  ID: string = '';
  Customer: number;
  Partner: number;
  SaleDate?: Date | null;
  SaleStaff: number;
  IsNewCustomer: boolean;
  TechnicalStaff: number;
  AmountPaid: number = 0;
  PaymentMethod: number;
  PaymentCount: number = 0;
  HeadOut: number;
  WHOut: number;
  TypeData: number;
  Status: SALOrderMasterStatusEnum = SALOrderMasterStatusEnum.NEW;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SALOrderMasterCusDTO extends SALOrderMasterDTO {
  StatusName: string = 'Tạo mới';
  Email: string = '';
  TotalPrice: number = 0;
  TotalVehicle: number = 0;
  CustomerName: string = '';
  Phone: string = '';
  Address: string = '';
  SaleStaffName: string = '';
  PaymentMethodName: string = '';
  FullName: string = '';
  PartnerName: string = '';
  ListDetail: SALOrderDetailCusDTO[] = [];
  PartnerOccupationName: string = '';
  PartnerPhone: string = '';
  PartnerFullAddress: string = '';
  PartnerEmail: string = '';
  PartnerAddress: string = '';
  PartnerWardName: string = '';
  PartnerDistrictName: string = '';
  PartnerProvinceName: string = '';
}