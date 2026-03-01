import { CSLoyalCustomerDTO } from "./cs-loyal-customer.dto";
import { CSWorkOrderPartDTO } from "./cs-work-order-part.dto";
import { CSWorkOrderTaskCusDTO } from "./cs-work-order-task.dto";

export class CSWorkOrderMasterDTO {
  Code: number = 0;                       // Mã phiếu tiếp nhận
  WorkOrderNo: string = '';                // Số phiếu
  LoyalCustomer?: number;             // Khách hàng
  CSVehicle?: number;                 // Xe
  TypeOfWorkOrder: number;            // Loại dịch vụ
  CurrentKm?: number;                 // Số km hiện tại
  FuelType?: number;                  // Loại nhiên liệu
  FuelName?: string;                // Mức nhiên liệu
  BatteryNo: string;                  // Mã pin
  SOH?: number;                       // Sức khỏe pin
  Head: number;                       // Cửa hàng tiếp nhận
  ReceivingTime?: Date | null;        // Thời gian nhận xe
  EstimateReturnTime?: Date | null;   // Thời gian dự kiến trả
  RealReturnTime?: Date | null;       // Thời gian trả thực tế
  Consultant?: number;                // Cố vấn dịch vụ
  TechnicalConsultant?: number;       // Tư vấn kỹ thuật
  TechnicalRepair?: number;           // Kỹ thuật sửa chữa
  CustomerRequest: string;            // Yêu cầu KH
  ConsultantRemark: string;           // Ghi chú CVDV
  CreateBy: string;                   // Người tạo
  CreateTime?: Date | null;           // Thời gian tạo
  LastModifiedBy: string;             // Người sửa
  LastModifiedTime?: Date | null;     // Thời gian sửa
}

export class CSWorkOrderMasterCusDTO extends CSWorkOrderMasterDTO {
  CustomerName: string;               // Tên KH
  CustomerPhone: string;              // SĐT KH
  CustomerGenderName: string;         // Giới tính KH
  VehiclePlateNo: string = '';             // Biển số xe
  Progress: number;                   // Tiến trình (enum trong C# đang để string)
  ProgressName: string;               // Tên tiến trình
  FullAddress: string;                // Địa chỉ
  VehicleName: string;                // Tên xe
  VehicleColorName: string;           // Màu xe
  ServiceMaster: number;
  TypeOfServiceName: string;          // Tên nhóm dịch vụ
  ListTasks: CSWorkOrderTaskCusDTO[]; // DS công việc
  ListParts: CSWorkOrderPartDTO[]; // DS phụ tùng
  ListOrderTasks: CSWorkOrderTaskCusDTO[]; // DS công việc yêu cầu thêm
  TotalPrice?: number;                // Tổng tiền
  TotalPartPrice?: number;            // Tổng tiền công việc
  Signature: string;                  // Chữ ký
  LastTrading?: Date | null;   // Ngày mua xe
  LoyalCustomerData: CSLoyalCustomerDTO[];
  ImageBase64: string;
  ServiceMasterName: string;
}
