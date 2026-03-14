export class ListDTO {
  Code: number = 0;
  ListID: string = '';
  ListName: string = '';
  TypeData: number;
  TypeOfList: number;
  OrderBy: number;
  ConfigExt: string;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}