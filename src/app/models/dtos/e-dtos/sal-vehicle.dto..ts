class SALVehicleDTO {
  SALMaster: number;
  IsImportant: boolean = true;
  Price: string;
  VehicleCategory: number;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SALVehicleCusDTO extends SALVehicleDTO {
  TotalQuantityCare: number;
  ListVehicleColor: [] = []
}
