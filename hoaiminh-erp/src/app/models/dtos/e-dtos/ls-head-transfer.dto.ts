import { LSHeadTypeDataEnum } from "src/app/models/enums/e-type/ls-head-type-data.enum";
import { ProcessStatusEnum } from "../../enums/process-status.enum";

export class LSHeadTransferDTO {
  Code: number = 0;
  ToHead: number;
  FromHead: number;
  OrderBy: number;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class LSHeadTransferCusDTO extends LSHeadTransferDTO {
  FromHeadBriefName: string = '';
  FromHeadTradeName: string = '';
  FromHeadID: string = '';
  FromHeadStatus: ProcessStatusEnum;
  FromHeadStatusName: string = '';
}