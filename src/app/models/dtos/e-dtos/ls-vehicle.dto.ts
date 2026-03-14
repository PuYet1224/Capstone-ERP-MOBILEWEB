import { LSVehicleConfigStatus } from "../../enums/e-status/ls-vehicle-config-status.enum";
import { LSVehicleColorCusDTO } from "./ls-vehicle-color.dto";
import { LSVehicleSpecsCusDTO } from "./LSVehicleSpecs.dto";

class LSVehicleDTO {
  Code: number = 0;
  ID: string = '';
  TypeOfVehicle: number;
  VehicleName: string = '';
  Version: string = '';
  Engine: string = '';
  Cylinder: string = '';
  Torque: string = '';
  TypeData: number;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
  InsuranceTime: number = 0;
  InsuranceKM: number = 0;
  InsurancePeriod: number = 0;
  Status: LSVehicleConfigStatus = LSVehicleConfigStatus.New
}

export class LSVehicleCusDTO extends LSVehicleDTO {
  TotalVehicleColor: number;
  TypeOfVehicleName: string = '';
  ListVehicleColor: Array<LSVehicleColorCusDTO> = [];
  IsModify: boolean;
  CategoryName: string = '';
  StatusName: string = "Tạo mới";
  TypeOfVehicleStatus: LSVehicleConfigStatus;
  MinPrice: number;
  MaxPrice: number;
  ListPromotionName = []
  Category: number
  ListSpecs: LSVehicleSpecsCusDTO[] = []
  VehicleColor: number;
  ColorName: string;
  ImageSetting1: string;
  IsImportant: boolean;
  IsChecked: boolean = false;
  IsExisted: boolean = false;
}