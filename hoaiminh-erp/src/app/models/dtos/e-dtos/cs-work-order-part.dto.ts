export class CSWorkOrderPartDTO {
  Code: number;                       // Mã phiếu phụ tùng
  WorkOrder: number;                  // Mã phiếu tiếp nhận
  TypeOfPart: number;                 // Mã loại phụ tùng
  TypeOfPartSpecs?: number;           // Mã phân nhóm chi tiết
  PartItem?: number;                  // Mã phụ tùng
  StatusChecked?: number;             // Trạng thái chọn
  Quantity?: number;                  // Số lượng
  UnitPrice?: number;                 // Đơn giá
  OrderTask?: number;                 // Mã công việc liên kết
  CreateBy: string;                   // Người tạo
  CreateTime?: Date | null;           // Thời gian tạo
  LastModifiedBy: string;             // Người sửa
  LastModifiedTime?: Date | null;     // Thời gian sửa
}

export class CSWorkOrderPartCusDTO extends CSWorkOrderPartDTO {
  
}
