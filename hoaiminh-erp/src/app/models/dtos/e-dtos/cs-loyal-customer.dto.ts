
export class CSLoyalCustomerDTO {
  Code: number = 0;               // Mã khách hàng
  Cellphone1: string = '';         // SDT khách hàng
  FullName: string = '';           // Họ tên chủ xe
  Address: string = '';            // Địa chỉ liên hệ
  Province: number;           // Mã tỉnh thành
  District: number;
  Ward: number;               // Mã phường/xã
  CardNo: string = '';
  CitizenCardNo: string = '';
  DateOfIssue: Date;
  Zalo: string;
  FreeStartTime: Date;
  FreeEndTime: Date;
  FreeTimeType: number;
  Email: string;
  Occupation: number;
  MyHonda: number;
  MyHondaReason: number;
  MyHondaReasonDetail: string;
  OA: number;
  OAReason: number;
  OAaReasonDetail: string;
  IsCellPhone: boolean;
}

export class CSLoyalCustomerCusDTO extends CSLoyalCustomerDTO {
  WorkOrderMaster?: number = null;   // Mã phiếu tiếp nhận
  FullAddress?: string = '';
  LastTrading: Date;
  BirthDay: number | null = null;
  BirthMonth: number | null = null;
  BirthYear: number | null = null;
  Gender: number;
  IsCustomerOwner: boolean = false;
}

