import { POLPromotionMasterTypeDataEnum } from "../../enums/e-type/pol-promotion-master-type-data.enum";

export class SALOrderDetailPromotionDTO {
    Code: number = 0;
    OrderDetail: number;
    Promotion: number;
    PromotionName: string = '';
    DiscountPercentage: number = 0;
    DiscountAmount: number = 0;
    PromotionType: POLPromotionMasterTypeDataEnum;
}

export class SALOrderDetailPromotionCusDTO extends SALOrderDetailPromotionDTO {
    IsChecked: boolean = false;
}
