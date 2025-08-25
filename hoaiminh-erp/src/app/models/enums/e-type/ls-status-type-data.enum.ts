import { ProcessStatusConfig } from "../process-status.enum";

export enum LSStatusTypeDataEnum {
  PROCESS = 1,
  STAFF = 2,
  INVENTORY = 3,
  IO = 4,
  WHOLE = 5,
  BUY = 6,
  SALE = 7,
  CSVehicle = 8,
  SALOrderDetail = 9,
  PURDOMaster = 10,
  PURDODetail = 11,
  VEHICLECONFIG = 12,
}

export const LSStatusType: Record<LSStatusTypeDataEnum, any> = {
  [LSStatusTypeDataEnum.PROCESS]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.STAFF]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.INVENTORY]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.IO]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.WHOLE]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.BUY]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.SALE]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.CSVehicle]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.SALOrderDetail]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.PURDOMaster]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.PURDODetail]: ProcessStatusConfig,
  [LSStatusTypeDataEnum.VEHICLECONFIG]: ProcessStatusConfig,
}
