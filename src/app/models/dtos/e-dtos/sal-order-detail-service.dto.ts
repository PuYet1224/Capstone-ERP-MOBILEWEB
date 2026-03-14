export class SALOrderDetailServiceDTO {
  Code: number;
  OrderDetail: number;
  ServiceMaster: number;
  ServiceDetail: number;
  TypeData: number;
  CreateBy: string;
  CreateTime?: Date | null;
  LastModifiedBy: string;
  LastModifiedTime?: Date | null;
}

export class SALOrderDetailServiceCusDTO extends SALOrderDetailServiceDTO {
  ServiceName: string = '';
  Price: number;
  IsChecked: boolean = false;
  IsExisted: boolean = false;
}