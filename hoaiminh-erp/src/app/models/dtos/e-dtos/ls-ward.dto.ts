export class LSWardDTO {
  Code: number = 0;
  WardID: string = '';
  District: number;
  VNWard: string = '';
  ENWard: string = '';
  JPWard: string = '';
  OrderBy: number = 1;
  IsDelete: boolean = false;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}