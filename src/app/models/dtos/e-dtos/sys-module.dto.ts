import { SYSFunctionCusDTO } from "./sys-function.dto";

export class SYSModuleDTO {
  Code: number = 0;
  Product?: number | null;
  ModuleID: string = '';
  Vietnamese: string = '';
  English: string = '';
  Japanese: string = '';
  Chinese: string = '';
  ImageSetting: string;
  OrderBy?: number | null;
  GroupID?: number | null;
  IsVisible: boolean = false;
  TypeData?: number | null;
  ModuleLevel: number
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SYSModuleCusDTO extends SYSModuleDTO {
  ModuleName: string = '';
  Level?: number | null;
  Parent?: number | null;
  Icon: string;
  ListGroup: SYSModuleCusDTO[] = [];
  ListFunction: SYSFunctionCusDTO[] = [];
}