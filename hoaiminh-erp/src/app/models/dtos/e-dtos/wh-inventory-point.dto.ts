import { InventoryMasterStatusEnum } from "../../enums/e-status/wh-inventory-master-status.enum";
import { WHInventoryStaffCusDTO } from "./wh-inventory-staff.dto";

class WHInventoryPointDTO {
  Code: number = 0;
  InventoryMaster: number;
  Warehouse: number;
  Owner: number;
  FromDate: Date | string;
  ToDate: Date | string;
  IsAll: boolean = true;
  TypeData: number;
  StatusID: number = InventoryMasterStatusEnum.NEW;
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHInventoryPointCusDTO extends WHInventoryPointDTO {
  StatusName: string = "Lập kế hoạch";
  InventoryName: string = '';
  InventoryDescription: string = '';
  InventoryOwnerName: string = '';
  InventoryHiddenStock: boolean = false;
  WarehouseName: string = '';
  ListStaffJoin: WHInventoryStaffCusDTO[] = [];
  OwnerName: string = '';
}