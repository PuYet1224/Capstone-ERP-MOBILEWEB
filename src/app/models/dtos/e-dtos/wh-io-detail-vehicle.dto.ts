class WHIODetailVehicleDTO {
  Code: number = 0;
  Master: number = 0;
  CSVehicle: number = 0;
  DODetail: number = 0;
}

export class WHIODetailVehicleCusDTO extends WHIODetailVehicleDTO {
  TypeOfVehicleName: string = '';
  DOMaster: number = 0;
  VehicleName: string = '';
  VehicleColorName: string = '';
  Version: string = '';
  Quantity: number = 0;
  ListDetail: WHIODetailVehicleCusDTO[] = [];
  FrameSeri: string = '';
  EngineSeri: string = '';
  PlateNo: string = '';
  TotalVehicle: number = 0;
  TotalTypeOfVehicle: number = 0;
  InsuranceNumber: string = '';
  InsurancePeriod: number = 0;
  InsuranceTime: number = 0;
  VehicleImage: string = '';
}
