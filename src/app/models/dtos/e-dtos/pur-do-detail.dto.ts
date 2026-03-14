import { PURDODetailStatusEnum } from "../../enums/e-status/pur-do-detail-status.enum";
import { PURDOMasterStatusEnum } from "../../enums/e-status/pur-do-master-status.enum";

class PURDODetailDTO {
  Code: number = 0;
  DO: number;
  CSVehicle: number;
  StatusID: PURDODetailStatusEnum = PURDODetailStatusEnum.NOTRECEIVED;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class PURDODetailCusDTO extends PURDODetailDTO {
  StatusName: string = 'Tạo mới';
  FrameSeri: string = '';
  EngineSeri: string = '';
  PlateNo: string = '';
  InsuranceNumber: string = '';
  InHeadName: string = '';
  TypeOfVehicle: number;
  Vehicle: number;
  VehicleColor: number;
  Version: string = '';
  InsurancePeriod: number = 0;
  InsuranceTime: number = 0;
  VehicleImage: string = '';
  VehicleName: string = '';
}
