export class LSDistrictDTO {
  Code: number = 0;
  DistrictID: string = '';
  Province: number;
  VNDistrict: string = '';
  ENDistrict: string = '';
  JPDistrict: string = '';
  OrderBy: number = 1;
  IsDelete: boolean = false;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}