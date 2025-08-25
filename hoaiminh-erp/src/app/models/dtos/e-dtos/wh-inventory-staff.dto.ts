import { InventoryMasterStatusEnum } from "../../enums/e-status/wh-inventory-master-status.enum";

class WHInventoryStaffDTO {
  Code: number = 0;
  InventoryMaster: number;
  InventoryPoint: number;
  StaffID: number;
  TypeData: number;
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHInventoryStaffCusDTO extends WHInventoryStaffDTO {
  FullName: string = "";
}