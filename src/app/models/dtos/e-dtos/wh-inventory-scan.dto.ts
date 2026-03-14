class WHInventoryScanDTO {
  Code: number = 0;
  InventorySession: number;
  Barcode: string = '';
  PartItem: number;
  Vehicle: number;
  WHLocation: number;
  Quantity: number;
  IME: string = '';
  CreateBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHInventoryScanCusDTO extends WHInventoryScanDTO {
  Location: string = '';
  TypePartItemName: string = '';
  CategoryPartItemName: string = '';
}