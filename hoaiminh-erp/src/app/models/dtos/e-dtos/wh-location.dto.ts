class WHLocationDTO {
  Code: number = 0;
  LocationCode: string = '';
  Descriptions: string = '';
  ZoneID: number;
  StatusID: number = 1;
  TypeData: number;
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHLocationCusDTO extends WHLocationDTO {
  StatusName: string = '';
  HasScan: boolean;
  InventorySession?: number;
}