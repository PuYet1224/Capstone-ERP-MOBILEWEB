export class LSPartItemDTO {
  Code: number = 0;                          // Code phụ tùng
  TypeOfPart: number = null;                // Code phân loại phụ tùng
  TypeOfPartSpecs: number = null;           // Code chi tiết phân loại phụ tùng
  Barcode: string = '';                     // Barcode phụ tùng
  Poscode: string = '';                     // Mã nội bộ
  PartName: string = '';                    // Tên phụ tùng
  Supplier: number = null;                  // Code nhà cung cấp
  Manufacturer: string = '';                // Hãng sản xuất
  Origin: string = '';                      // Xuất xứ
  BaseUnit: number = null;                  // Code đơn vị bán lẻ
  BuyerUnit: number = null;                 // Code đơn vị mua hàng
  SellerUnit: number = null;                // Code đơn vị bán sỉ
  WHUnit: number = null;                    // Code đơn vị điều phối hàng
  IsDate: boolean = false;                  // Quản lý theo date (true/false)

  AvgPriceTime: number = 0;                 // Giá bình quân theo thời gian
  AvgPriceMonth: number = 0;                // Giá bình quân theo tháng
  UnitPriceWVAT: number = 0;                // Giá có VAT
  UnitPrice: number = 0;                    // Giá không VAT

  StatusBuyer: number = null;               // Tình trạng mua hàng (Code)
  StatusWhole: number = null;               // Tình trạng bán sỉ (Code)
  URLThumbImage: string = '';               // Hình ảnh
  TypeData: number = null;                  // Loại phụ tùng

  CreateBy: string = '';
  CreateTime: Date = null;
  LastModifiedBy: string = '';
  LastModifiedTime: Date = null;
}

export class LSPartItemCusDTO extends LSPartItemDTO {
  TypePartItemName: string = '';            // Tên xuất hóa đơn
  ListLocation: string[] = [];              // Danh sách vị trí kệ
  PartCategory: number = null;              // Code nhóm phân loại
  PartCategoryName: string = '';            // Tên nhóm phân loại
  BaseUnitName: string = '';                // Tên đơn vị tính
  IsHonda: boolean = null;                  // Chính hãng (true/false)
  TypeOfStatus: number;
  StatusBuyerName: string = '';
  StatusWholeName: string = '';
}
