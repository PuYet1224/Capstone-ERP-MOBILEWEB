import { LSVehicleConfigStatus } from "../../enums/e-status/ls-vehicle-config-status.enum";
import { LSVehicleCusDTO } from "./ls-vehicle.dto";

class LSTypeOfVehicleDTO {
  Code: number = 0;
  ID: string = '';
  TypeOfVehicle: string = '';
  Category: number;
  OrderBy: number;
  TypeData: number;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
  Status: LSVehicleConfigStatus = LSVehicleConfigStatus.New
}

export class LSTypeOfVehicleCusDTO extends LSTypeOfVehicleDTO {
  CategoryName: string = '';
  TotalVehicle: number = 0;
  ListVehicle: Array<LSVehicleCusDTO> = [];
  IsModify: boolean;
  StatusName: string = "Tạo mới"
}