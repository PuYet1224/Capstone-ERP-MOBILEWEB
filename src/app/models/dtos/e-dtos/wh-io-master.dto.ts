import { WHIOMasterTypeOfMasterConfig, WHIOMasterTypeOfMasterEnum } from '../../enums/e-type/wh-io-master-type-of-master.enum';
import { IOStatusConfig, WHIOMasterStatusEnum } from '../../enums/e-status/wh-io-master-status.enum';
import { WHIOMasterTypeDataEnum } from '../../enums/e-type/wh-io-master-type-data.enum';

export class WHIOMasterDTO {
  Code: number = 0;
  DocumentID: string = '';
  OutHead: number;
  OutWH: number;
  Supplier: number;
  InHead: number;
  InWH: number;
  Reference: number;
  RefDocumentID: string = '';
  IOWHDate: Date;
  Description: string = '';
  TypeData: WHIOMasterTypeDataEnum = WHIOMasterTypeDataEnum.In;
  TypeOfMaster: WHIOMasterTypeOfMasterEnum = WHIOMasterTypeOfMasterEnum.Internal;
  Status: WHIOMasterStatusEnum = WHIOMasterStatusEnum.NEW;
  CreatedBy: string = '';
  CreateTime: Date | string;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string;
}

export class WHIOMasterCusDTO extends WHIOMasterDTO {
  StatusName: string = IOStatusConfig[WHIOMasterStatusEnum.NEW].text;
  TypeOfMasterName: string = WHIOMasterTypeOfMasterConfig[WHIOMasterTypeOfMasterEnum.Internal].text;
  OutHeadName: string = '';
  SupplierName: string = '';
  InHeadName: string = '';
  SentTime: Date;
  DoneTime: Date;
  ReceiveBy: string = '';
  ReceiveTime: Date;
  TotalSKU: number = 0;
  TotalQuantity: number = 0;
  TotalConfirmQuantity: number = 0;
  TotalReceivedQuantity: number = 0;
  TotalSKUNotEqual: number = 0;
  TotalConfirmSKUNotEqual: number = 0;
}
