export class LSProvinceDTO {
  Code: number = 0;
  ProvinceID: string = '';
  VNProvince: string = '';
  ENProvince: string = '';
  JPProvince: string = '';
  Country: number = 1;
  OrderBy: number = 1;
  IsDelete: boolean = false;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}