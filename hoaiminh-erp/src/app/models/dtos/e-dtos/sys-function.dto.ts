export class SYSFunctionDTO {
  Code: number = 0;
  Product?: number | null;
  ModuleID: number;
  Vietnamese: string = '';
  English: string = '';
  Japanese: string = '';
  Chinese: string = '';
  OrderBy?: number | null;
  Hotkey: string;
  TypeData: number;
  DLLPackage: string;
  ImageSetting: string;
  PermissionConf: string;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SYSFunctionCusDTO extends SYSFunctionDTO {
  FunctionName: string = '';
  Icon: string;
  FunctionURL: string;
}