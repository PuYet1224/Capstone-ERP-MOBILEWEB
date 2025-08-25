export enum DashboardEnum {
    RevenueDay = 1,                  // doanh thu trong kỳ (8 ngày)
    RevenueMonth = 2,                // doanh thu trong kỳ (1 tháng)
    RevenueQuarter = 3,              // doanh thu trong kỳ (1 quý)
    RevenueYear = 4,                 // doanh thu trong kỳ (1 năm)
    InboundDay = 5,                  // nhập mới trong kỳ (8 ngày)
    InboundMonth = 6,                // nhập mới trong kỳ (1 tháng)
    InboundQuarter = 7,              // nhập mới trong kỳ (1 quý)
    InboundYear = 8,                 // nhập mới trong kỳ (1 năm)
    RevenueStore = 9,                // doanh số theo cửa hàng (chọn 1 cửa hàng - có giá trị)
    RevenueAllStore = 10,            // doanh số theo cửa hàng (tất cả cửa hàng - không có giá trị)
    RevenuePercentageVehicle = 11,   // tỷ trọng doanh số theo dòng xe
    IIAllStore = 12,                 // nhập hàng mới và tồn kho theo cửa hàng (tất cả cửa hàng - không có giá trị)
    IIPercentageVehicle = 13,        // tỷ trọng nhập hàng mới và tồn kho theo dòng xe (chọn 1 cửa hàng - có giá trị)
    IIVehicle = 14                   // nhập hàng mới và tồn kho theo dòng xe
}

