import { InventoryMasterStatusEnum } from "../../enums/e-status/wh-inventory-master-status.enum";

class WHInventorySessionDTO {
  Code: number = 0;
  InventoryPoint: number;
  SessionName: string = '';
  Description: string = '';
  StatusID: number = InventoryMasterStatusEnum.DOING;
  TypeData: number;
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHInventorySessionCusDTO extends WHInventorySessionDTO {
  StatusName: string = '';
}