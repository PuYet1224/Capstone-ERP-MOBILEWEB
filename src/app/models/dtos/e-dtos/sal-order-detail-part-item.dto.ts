export class SALOrderDetailPartItemDTO {
  Code: number = 0;
  OrderDetail: number;
  TypeOfPart: number;
  TypeOfPartSpecs: number;
  Quantity: number;
  UnitPrice: number;
  BaseUnit: number;
  Remark: string = '';
  CreateBy: string = '';
  CreateTime: Date;
  LastModifiedBy: string = '';
  LastModifiedTime: Date;
}

export class SALOrderDetailPartItemCusDTO extends SALOrderDetailPartItemDTO {
  TypeOfPartName: string = '';
  TypeOfPartSpecName: string = '';
  BaseUnitName: string = '';
  IsChecked: boolean = false;
  IsExisted: boolean = false;
}
