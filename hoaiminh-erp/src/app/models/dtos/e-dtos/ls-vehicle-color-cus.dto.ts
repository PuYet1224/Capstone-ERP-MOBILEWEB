import { LSVehicleConfigStatus } from "../../enums/e-status/ls-vehicle-config-status.enum";
import { LSVehicleColorTypeDataEnum } from "../../enums/e-type/ls-vehicle-color-type-data.enum";

class LSVehicleColorDTO {
  Code: number = 0;
  ID: string = '';
  Vehicle: number;
  ColorName: string = '';
  ColorCode: string = '';
  ImageSetting1: string = '';
  ImageSetting2: string = '';
  ImageSetting3: string = '';
  ImageSetting4: string = '';
  ImageSetting5: string = '';
  TypeData: LSVehicleColorTypeDataEnum = LSVehicleColorTypeDataEnum.COLOR;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
  Price: number = 0;
  AmountPaid: number = 0;
}

export class LSVehicleColorCusDTO extends LSVehicleColorDTO {
  TypeOfVehicle: number;
  VehicleName: string = '';
  TypeOfVehicleName: string = '';
  IsModify: boolean;
  CategoryName: string = '';
  VehicleStatus: LSVehicleConfigStatus;
  ListStock = [];
}