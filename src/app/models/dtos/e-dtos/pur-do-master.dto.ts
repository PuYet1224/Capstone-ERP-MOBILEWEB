import { PURDOMasterStatusEnum } from "../../enums/e-status/pur-do-master-status.enum";

class PURDOMasterDTO {
  Code: number = 0;
  DO: string = '';
  EstEffDate: Date | null;
  PO: number;
  PONo: string = '';
  POHead: number;
  PODate?: Date | null;
  POSupplier: number;
  Remark: string = '';
  StatusID: PURDOMasterStatusEnum = PURDOMasterStatusEnum.NEW;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class PURDOMasterCusDTO extends PURDOMasterDTO {
  StatusName: string = 'Tạo mới';
  SupplierName: string = '';
  HeadName: string = '';
  TotalTypeOfVehicle: number = 0;
  TotalVehicle: number = 0;
  ListInHeadName: string[];
  ListInHeadCode: string;
  TotalDetail: number = 0;
  TotalHead: number = 0;
  DOName: string = '';
}
