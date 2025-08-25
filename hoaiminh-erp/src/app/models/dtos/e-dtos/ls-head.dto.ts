import { LSHeadTypeDataEnum } from "src/app/models/enums/e-type/ls-head-type-data.enum";
import { ProcessStatusEnum } from "../../enums/process-status.enum";

export class LSHeadDTO {
  Code: number = 0;
  HeadID: string = '';
  ReportToHead?: number | null;
  BriefName: string = '';
  TradeName: string = '';
  Address: string = '';
  ImageMap: string;
  Ward?: number | null;
  District?: number | null;
  Province?: number | null;
  Phone: string = '';
  Fax: string = '';
  StatusID: ProcessStatusEnum = ProcessStatusEnum.NEW;
  TypeData: LSHeadTypeDataEnum = LSHeadTypeDataEnum.HEAD;
  ConfigExt: string;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class LSHeadCusDTO extends LSHeadDTO {
  Head: number = 0;
  HeadName: string = '';
  TypeDataName: string = '';
  WardName: string = '';
  DistrictName: string = '';
  ProvinceName: string = '';
  StatusName: string = 'Tạo mới';
  FullAddress: string = '';
  ReportToHeadName: string = '';
}