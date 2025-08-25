class WHIODetailDTO {
  Code: number = 0;
  IOMaster: number;
  PartItem: number;
  Quantity: number = 0;
  ConfirmQuantity: number = 0;
  ReceivedQuantity: number = 0;
  Remark: string = 'Ghi chú';
  IsNew: boolean = false;
  CreatedBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHIODetailCusDTO extends WHIODetailDTO {
  Barcode: string = '';
  TypePartItemName: string = '';
  ListLocation: string[] = [];
}