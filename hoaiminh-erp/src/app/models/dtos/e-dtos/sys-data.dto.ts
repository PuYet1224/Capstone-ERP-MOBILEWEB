export class SYSDataDTO {
  Code: number = 0;
  ID: string = '';
  Name: string = '';
  Description: string = '';
  TypeData: number = 0;
  Function: string = '';
  TypeOfData: number = 0;
  ReportConfig: string = '';
  TypePopup: number = 0;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SYSDataCusDTO extends SYSDataDTO {}