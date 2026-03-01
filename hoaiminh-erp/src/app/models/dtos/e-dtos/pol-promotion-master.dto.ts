import { POLPromotionMasterTypeDataEnum } from "../../enums/e-type/pol-promotion-master-type-data.enum";
import { ProcessStatusEnum } from "../../enums/process-status.enum";
import { SALOrderDetailCusDTO } from "./sal-order-detail.dto";

class POLPromotionMasterDTO {
  Code: number = 0;
  Name: string = '';
  InternalName: string = '';
  Description: string = '';
  DiscountPercentage: number = 0;
  DiscountAmount: number = 0;
  TypeData: POLPromotionMasterTypeDataEnum;
  StartDate: Date;
  EndDate: Date;
  Status: ProcessStatusEnum = ProcessStatusEnum.NEW;
  CreatedBy: string;
  CreatedTime: Date | null;
  LastModifiedBy: string;
  LastModifiedTime: Date | null;
}

export class POLPromotionMasterCusDTO extends POLPromotionMasterDTO {
  IsChecked: boolean;
  Amount: number = 0;
  ListOrderDetail: SALOrderDetailCusDTO[] = [];
  IsAll: boolean = false;
}
