import { ProcessStatusEnum } from "../../enums/process-status.enum";

class POLSalesPolicyDTO {
  Code: number = 0;
  CodePolicy: string = '';
  NamePolicy: string = '';
  Description: string = '';
  StartDate: Date;
  EndDate: Date;
  Status: number = 0;
  CreatedBy: string = '';
  CreatedTime: Date | null = null;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | null = null;
}

export class POLSalesPolicyCusDTO extends POLSalesPolicyDTO {
  IsChecked: boolean = false;
  // Các field khác nếu cần mở rộng cho mobile
}
