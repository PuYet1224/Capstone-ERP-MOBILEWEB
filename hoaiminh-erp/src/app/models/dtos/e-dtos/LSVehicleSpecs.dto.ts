
class LSVehicleSpecs {
  Code: number = 0;
  Vehicle: number;
  Name: string;
  Value: string;
  OrderBy: number;
  Unit: string;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class LSVehicleSpecsCusDTO extends LSVehicleSpecs {
}