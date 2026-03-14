export class LSWarehouseDTO {
  Code: number = 0;
  Head: number;
  WHName: string = '';
  ShortName: string = '';
}

export class LSWarehouseCusDTO extends LSWarehouseDTO {
  Disabled: boolean = false;
}