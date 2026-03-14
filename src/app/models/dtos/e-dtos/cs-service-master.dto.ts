import { SALOrderDetailCusDTO } from "./sal-order-detail.dto";

class CSServiceMasterDTO {
  Code: number = 0;
  ServiceName: string = '';
  Price: number = 0;
  TypeData: number = 0;
  CreateBy: string = '';
  CreateTime?: Date | null;
  LastModifiedBy: string = '';
  LastModifiedTime?: Date | null;
}

export class CSServiceMasterCusDTO extends CSServiceMasterDTO {
  IsChecked: boolean = false;
  OrderDetailService?: number | null = null;
  OrderDetail?: number = null;
  ServiceVehicle?: number | null = null;
  ListOrderDetail: Array<SALOrderDetailCusDTO> = [];
  IsAll: boolean = false;
}

