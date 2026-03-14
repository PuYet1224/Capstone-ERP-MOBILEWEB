export class LSPartItemVehicleDTO {
  Code: number = 0;
  PartItem: number;
  Vehicle: number;
  VehicleColor: number = 0;
  TypeData: number;
  CreatedBy: string = '';
  CreateTime: string | Date;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}
export class LSPartItemVehicleCusDTO extends LSPartItemVehicleDTO {
  TypeOfVehicle?: number;           // dùng để bind Code từ dropdown
  TypeOfVehicleName?: string;       // dùng để hiển thị text trong ô
  VehicleName: string;
  VehicleVersion: string;
  ColorVehicleName: string;
}
