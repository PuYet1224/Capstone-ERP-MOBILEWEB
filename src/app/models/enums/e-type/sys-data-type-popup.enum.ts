export enum SysDataTypePopupEnum {
  None = 1, // Cho điều chỉnh tất cả
  NoneHead = 2, // Không chọn head nhưng được chọn nhiều kỳ
  All = 3, //được chọn tất cả,
  Day = 4, // Disable ngày nhưng thời gian theo ngày vẫn được chọn và head hiện tại
  Month = 5, // Disable tháng nhưng thời gian theo tháng vẫn được chọn và head hiện tại
  Quarter = 6, // Disable quý nhưng thời gian theo quý vẫn được chọn và head hiện tại
  Year = 7, // Disable năm nhưng thời gian theo năm vẫn được chọn và head hiện tại
}