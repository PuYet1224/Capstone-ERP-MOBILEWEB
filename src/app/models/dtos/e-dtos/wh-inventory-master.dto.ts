import { PSDate } from "src/app/services/utilities/ps-date";

class WHInventoryMasterDTO {
  Code: number = 0;
  InventoryName: string = '';
  Description: string = '';
  Owner: number;
  FromDate: Date = PSDate.addDays(new Date(), 5);
  ToDate: Date = PSDate.addDays(new Date(), 25);
  HiddenStock: boolean = false;
  TypeData: number;
  StatusID: number = 1;
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHInventoryMasterCusDTO extends WHInventoryMasterDTO {
  OwnerName: string = '';
  StaffJoinQty: number = 0;
  FirstInvPointName: string = '';
  InvPointOtherQty: number = 0;
  StatusName: string = 'Lập kế hoạch';
}