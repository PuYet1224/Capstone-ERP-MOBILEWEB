class WHIOMasterVehicleDTO {
  Code: number = 0;
  DocumentID: string = '';
  EffDate: Date;
  EstEffDate: Date;
  TypeOfMaster: number = 1;
  DO: number = 0;
  InWH: number = 0;
  OutWH: number = 0;
  Supplier: number = 0;
  SupplierName: string = '';
  StatusID: number = 1;
  Remark: string = '';
  TypeData: number = 1;
  RefNo: string = '';
}

export class WHIOMasterVehicleCusDTO extends WHIOMasterVehicleDTO {
  TotalDetail: number = 0;
  StatusIDName: string = 'Tạo mới';
  TotalTypeOfVehicle: number = 0;
  TotalVehicle: number = 0;
  OutHead: number = 0;
  DORemark: string = ''
}
