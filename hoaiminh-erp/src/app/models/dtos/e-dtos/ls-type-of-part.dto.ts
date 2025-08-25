export class LSTypeOfPartDTO {
  Code: number = 0;
  TypeOfPart: string = '';
  Description: string = '';
  Category: number;
  OrderBy: number;
  TypeData: number = 1;
  CreatedBy: string = '';
  CreateTime: string | Date;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}
export class LSTypeOfPartCusDTO extends LSTypeOfPartDTO {
  IsModify: boolean = true;
  PartItem: number
}
