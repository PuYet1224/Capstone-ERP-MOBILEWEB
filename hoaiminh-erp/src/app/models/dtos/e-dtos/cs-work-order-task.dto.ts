export class CSWorkOrderTaskDTO {
  Code: number;                       // Mã công việc
  WorkOrder: number;                  // Mã phiếu tiếp nhận
  TaskID?: number;                    // ID công việc (nếu có)
  TypeOfTask: StatusCheckedItem[];                 // Loại phương pháp
  StatusChecked?: boolean;             // Lựa chọn yêu cầu rửa xe
  Quantity?: number;                  // Số lượng
  UnitPrice?: number;                 // Đơn giá
  CreateBy: string;                   // Người tạo
  CreateTime?: Date | null;           // Thời gian tạo
  LastModifiedBy: string;             // Người chỉnh sửa
  LastModifiedTime?: Date | null;     // Thời gian chỉnh sửa

  constructor() {
    this.TypeOfTask = [
      { name: 'Kiểm tra', checked: false },
      { name: 'Thay thế', checked: false },
      { name: 'Bôi trơn', checked: false },
      { name: 'Vệ sinh', checked: false }
    ];
  }
}

export class CSWorkOrderTaskCusDTO extends CSWorkOrderTaskDTO {
  TaskName: string = '';                   // Tên công việc
  OrderBy?: number;                   // Số thứ tự
  PartCategory?: number = null;              // Mã phân nhóm phụ tùng
  TypeOfPart?: number;                // Mã loại phụ tùng
  TypeOfPartSpecs?: number;           // Phân nhóm chi tiết
  TypeOfPartName: string;             // Tên loại phụ tùng
  TypeOfPartSpecsName: string;        // Tên phân nhóm chi tiết
  TypeOfPartDetail: string; // tên phụ tùng - chi tiết
  ListMethod: ListMethod[];
  UnitName: string;
}

export interface StatusCheckedItem {
  name: string;
  checked: boolean;
}
export interface ListMethod {
  Name: string;
  Checked: boolean;
}