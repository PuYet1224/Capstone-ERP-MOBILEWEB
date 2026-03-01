export class CSVehicleDTO {
  Code: number = 0;                 // Mã thông tin xe
  PlateNo: string = '';             // Biển số xe
  VehicleColor: number;             // Mã màu xe
  FrameSeri: string = '';           // Số khung
  EngineSeri: string = '';          // Số máy
  InsuranceNumber: string = '';     // Số sổ bảo hiểm
  CurrentKm: number = 0;                // Số km hiện tại
  PURHeadName: string;         // Cửa hàng mua xe
}

export class CSVehicleCusDTO extends CSVehicleDTO {
  WarrantyDate: Date;        // Thời gian bảo hiểm
  WarrantyKm: number = 0;               // Số km được bảo hiểm
  Category: number;                 // Mã nhóm xe
  TypeOfVehicle: number;            // Mã dòng xe
  Vehicle: number;                  // Mã loại xe
  FuelType: number;                 // Loại nhiên liệu
  BatteryNo: string = '';           // Mã pin xe điện
  LastTrading: Date;         // Ngày mua xe
  SOH: string;                 // Sức khỏe pin
  WorkOrderMaster: number = 0;          // Mã phiếu tiếp nhận
  NotFound: boolean = false;
  WorkOrderNo: string = '';
  IsNewCSVehicle: boolean;
  Progress: number;

}
