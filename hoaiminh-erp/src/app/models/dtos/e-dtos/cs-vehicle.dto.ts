class CSVehicleDTO {
  Code: number = 0;
  Vehicle: number;
  VehicleColor: number;
  FrameSeri: string = '';
  EngineSeri: string = '';
  PlateNo: string = '';
  CurrentKm: number;
  TradeDate: Date | null;
  WarrantyKm: number;
  WarrantyDate: Date | null;
  CurrentPoint: number;
  CurrentDiscount: number;
  StartDiscountDate: Date | null;
  FinishDiscountDate: Date | null;
  LastLoyalCustomer: number;
  TypeData: number;
  InsuranceNumber: string;
  SaleAgent: string;
  IsHoaiMinh: boolean = true;
  Status: number = 1;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class CSVehicleCusDTO extends CSVehicleDTO {
  TypeOfVehicle: number;
  TypeOfVehicleName: string = '';
  Master: number = 0;
  DODetail: number = 0;
  VehicleName: string = '';
  VehicleColorName: string = '';
  Version: string = '';
  InsurancePeriod: number;
  InsuranceTime: number;
  VehicleImage: string = '';
} 