import { Component } from '@angular/core';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';

@Component({
  selector: 'mtb024-sal-collection-owner',
  templateUrl: './mtb024-sal-collection-owner.component.html',
  styleUrls: ['./mtb024-sal-collection-owner.component.scss'],
})
export class Mtb024SalCollectionOwnerComponent {
  // constructor(
  //   private router: Router,
  //   private cache: PsCache,
  //   private subLoader: SystemLoaderService,
  //   private notification: PsKendoNotificationService,
  //   private mtbikeapi: MtbikeApiService,
  //   private coreapi: PSCoreApiService,
  //   private configCache: ConfigCacheService,
  // ) {
  //   var last = new Date().getFullYear() - 15
  //   this.listyear = PSDate.getYears(last);
  // }

  // ngOnInit(): void {
  //   var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
  //   let retaildetail = this.cache.parseValue(temp);
  //   this.retaildetail = retaildetail;
  //   this.cscustomer.Code = retaildetail.Owner;
  //   this.oldCustomerCode = retaildetail.Customer;
  //   this.getlisthrlist(HRListTypeDataEnum.GENDER);
  //   this.getlistprovince();
  //   if (this.retaildetail.Owner) {
  //     this.GetCustomer(this.cscustomer)
  //   } else {
  //     this.cscustomer.Code = 0;
  //   }

  //   if (this.retaildetail.Status == SALOrderDetailStatusEnum.PaymentRequest) {
  //     this.retaildetail.Status = SALOrderDetailStatusEnum.OwnerInfo;

  //     this.UpdateSALDetail(this.retaildetail)
  //   }

  // }
  // ngOnDestroy(): void {
  //   this.subLoader.reset();
  //   this.arrUnsubscribe.forEach(e => e.unsubscribe());
  //   this.arrUnsubscribe = [];
  // }

  // public retaildetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  // private arrUnsubscribe: Subscription[] = [];
  // public listyear: number[];
  // public listmonth: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // public listday: number[] = [];
  // public provincelist: LSProvinceDTO[] = [];
  // public districtlist: LSDistrictDTO[] = [];
  // public listgender: ListDTO[] = [];
  // public cscustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public cscustomerCOPY: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public FunctionPermissionDTO = FunctionPermissionDTO;
  // public SALOrderDetailStatusEnum = SALOrderDetailStatusEnum;
  // public isopenscan: boolean = false;
  // public showpopup: boolean = false;
  // public oldCitizenCardNo: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public oldCustomerCode: number;
  // public oldOwner: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  // public scanResult: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();

  // onNavigate(field: string, item?: SALOrderDetailCusDTO) {
  //   if (field === '/mtbike/collection/contact') {
  //     if (!this.validateCustomer())
  //       return;
  //     else {
  //       if (this.retaildetail.Status <= SALOrderDetailStatusEnum.OwnerInfo) {
  //         this.retaildetail.Status = SALOrderDetailStatusEnum.ContactInfo;
  //         this.UpdateSALDetail(this.retaildetail);
  //       }
  //     }
  //   }
  //   this.router.navigate([field]);
  // }


  // private validateCustomer(): boolean {
  //   if (!this.cscustomer.CitizenCardNo) {
  //     this.notification.onWarning('Vui lòng nhập Số căn cước công dân');
  //     return false;
  //   }

  //   const cardRegex = /^0\d{11}$/;
  //   if (!cardRegex.test(this.cscustomer.CitizenCardNo)) {
  //     this.notification.onWarning('Số căn cước không hợp lệ (phải gồm 12 số và bắt đầu bằng 0)');
  //     return false;
  //   }

  //   if (!this.cscustomer.DateOfIssue) {
  //     this.notification.onWarning('Vui lòng chọn Ngày cấp');
  //     return false;
  //   }

  //   if (!this.cscustomer.FullName) {
  //     this.notification.onWarning('Vui lòng nhập Họ và tên');
  //     return false;
  //   }

  //   if (!this.cscustomer.Gender) {
  //     this.notification.onWarning('Vui lòng chọn Giới tính');
  //     return false;
  //   }

  //   if (!this.cscustomer.BirthYear) {
  //     this.notification.onWarning('Vui lòng chọn Năm sinh');
  //     return false;
  //   }

  //   if (!this.cscustomer.BirthMonth) {
  //     this.notification.onWarning('Vui lòng chọn Tháng sinh');
  //     return false;
  //   }

  //   if (!this.cscustomer.BirthDay) {
  //     this.notification.onWarning('Vui lòng chọn Ngày sinh');
  //     return false;
  //   }

  //   if (!this.cscustomer.Province) {
  //     this.notification.onWarning('Vui lòng chọn Tỉnh/Thành phố');
  //     return false;
  //   }

  //   if (!this.cscustomer.District) {
  //     this.notification.onWarning('Vui lòng chọn Phường/Xã');
  //     return false;
  //   }

  //   if (!this.cscustomer.Address) {
  //     this.notification.onWarning('Vui lòng nhập Địa chỉ cụ thể');
  //     return false;
  //   }

  //   return true;
  // }


  // onValueChange(field: string[]) {
  //   if (this.cscustomer[field[0]] === this.cscustomerCOPY[field[0]]) {
  //     this.isopenscan = false;
  //     return;
  //   }
  //   if (field.includes('DateOfIssue')) {
  //     const newDate = PSDate.setHours(new Date(this.cscustomer.DateOfIssue), 0, 0, 0, 0);
  //     this.cscustomer.DateOfIssue = newDate;
  //   }
  //   if (field[0] == 'Province') {
  //     this.getlistdistrict(this.cscustomer.Province);
  //     field = ['Province', 'District'];
  //   } else if (field[0] === 'BirthMonth' || field[0] === 'BirthYear') {
  //     if (field[0] == 'BirthYear') {
  //       this.cscustomer.BirthMonth = null;
  //       this.cscustomer.BirthDay = null;
  //       field = ['BirthYear', 'BirthMonth', 'BirthDay'];
  //     } else if (field[0] == 'BirthMonth') {
  //       this.cscustomer.BirthDay = null;
  //       field = ['BirthMonth', 'BirthDay'];
  //     }
  //     this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);
  //   }
  //   let param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //     DTO: this.cscustomer,
  //     Properties: field
  //   };
  //   this.UpdateLoyalCustomer(param);
  // }

  // public onCitizenChange(field: string[]) {
  //   this.oldCitizenCardNo = { ...this.cscustomer };
  //   if (this.cscustomer[field[0]] === this.cscustomerCOPY[field[0]]) {
  //     this.isopenscan = false;
  //     return;
  //   }
  //   if (field[0] == 'CitizenCardNo') {
  //     if (!this.retaildetail.IsCustomerOwner) { this.cscustomer.Code = 0; }
  //     const cardRegex = /^0\d{11}$/;
  //     if (!cardRegex.test(this.cscustomer.CitizenCardNo)) {
  //       this.notification.onWarning('Số căn cước không hợp lệ (phải gồm 12 số và bắt đầu bằng 0)');
  //       return;
  //     }
  //     if (this.retaildetail.IsCustomerOwner) {
  //       let paramupdate: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //         DTO: this.cscustomer,
  //         Properties: field
  //       };
  //       this.UpdateLoyalCustomer(paramupdate);
  //     } else {
  //       this.GetCustomerByID(this.cscustomer, field);
  //     }
  //   }
  // }

  // public onChecked(e: boolean) {
  //   this.retaildetail.IsCustomerOwner = e;
  //   if (!this.retaildetail.IsCustomerOwner) {
  //     this.cscustomer = new CSLoyalCustomerCusDTO();
  //     this.cscustomerCOPY = { ...this.cscustomer }
  //     this.retaildetail.Owner = null;
  //     this.retaildetail.Status = SALOrderDetailStatusEnum.OwnerInfo;
  //     this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.retaildetail);
  //   }
  //   else if (this.retaildetail.IsCustomerOwner) {
  //     this.cscustomer.Code = this.oldCustomerCode
  //     this.GetCustomer(this.cscustomer)
  //   }
  //   this.UpdateSALDetail(this.retaildetail)
  // }

  // public onscannbarcode() {
  //   this.isopenscan = true;
  // }

  // public onScanResult(value: any) {
  //   const parsed = this.parseScanResult(value);
  //   if (!parsed) {
  //     this.notification.onWarning('Không đọc được mã hợp lệ');
  //     return;
  //   }

  //   // BINDING VÀO MODEL
  //   this.cscustomer.CitizenCardNo = parsed.CitizenCardNo;
  //   this.cscustomer.FullName = parsed.FullName;
  //   // Xử lý ngày sinh (ddMMyyyy → tách ngày/tháng/năm)
  //   if (parsed.BirthDayRaw?.length === 8) {
  //     this.cscustomer.BirthDay = Number(parsed.BirthDayRaw.substring(0, 2));
  //     this.cscustomer.BirthMonth = Number(parsed.BirthDayRaw.substring(2, 4));
  //     this.cscustomer.BirthYear = Number(parsed.BirthDayRaw.substring(4, 8));
  //   }
  //   // Giới tính
  //   if (parsed.GenderRaw) {
  //     this.cscustomer.Gender = this.mapGender(parsed.GenderRaw);
  //   }
  //   // Địa chỉ
  //   this.cscustomer.Address = parsed.Address;
  //   // Ngày cấp căn cước
  //   if (parsed.DateOfIssueRaw?.length === 8) {
  //     const d = Number(parsed.DateOfIssueRaw.substring(0, 2));
  //     const m = Number(parsed.DateOfIssueRaw.substring(2, 4)) - 1;
  //     const y = Number(parsed.DateOfIssueRaw.substring(4, 8));

  //     this.cscustomer.DateOfIssue = new Date(Date.UTC(y, m, d));
  //   }
  //   this.scanResult = { ...this.cscustomer };

  //   // Gọi get
  //   if (this.retaildetail.IsCustomerOwner) {
  //     let paramupdate: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //       DTO: this.cscustomer,
  //       Properties: ['CitizenCardNo', 'CardNo', 'FullName', 'BirthDay', 'BirthMonth', 'BirthYear', 'Gender', 'Address', 'DateOfIssue']
  //     };
  //     this.UpdateLoyalCustomer(paramupdate);
  //   } else {
  //     this.cscustomer.Code = 0;
  //     this.GetCustomerByID(this.cscustomer, ['CitizenCardNo', 'CardNo', 'FullName', 'BirthDay', 'BirthMonth', 'BirthYear', 'Gender', 'Address', 'DateOfIssue'])
  //   }
  // }

  // private parseScanResult(raw: string) {
  //   if (!raw) return null;

  //   // Chuẩn hóa chuỗi
  //   raw = raw.replace(/\|\|/g, '|').trim();
  //   const parts = raw.split('|').map(x => x.trim());

  //   // SIX fields -> không có CardNo
  //   if (parts.length === 6) {
  //     return {
  //       CitizenCardNo: parts[0] || null,
  //       CardNo: null,
  //       FullName: parts[1] || null,
  //       BirthDayRaw: parts[2] || null,
  //       GenderRaw: parts[3] || null,
  //       Address: parts[4] || null,
  //       DateOfIssueRaw: parts[5] || null
  //     };
  //   }

  //   // SEVEN fields -> có CardNo
  //   if (parts.length === 7) {
  //     return {
  //       CitizenCardNo: parts[0] || null,
  //       CardNo: parts[1] || null,
  //       FullName: parts[2] || null,
  //       BirthDayRaw: parts[3] || null,
  //       GenderRaw: parts[4] || null,
  //       Address: parts[5] || null,
  //       DateOfIssueRaw: parts[6] || null
  //     };
  //   }

  //   return null; // format không hợp lệ
  // }


  // private mapGender(text: string): number {
  //   const genderText = text.trim().toLowerCase();
  //   const found = this.listgender.find(x =>
  //     x.ListName.toLowerCase() === genderText
  //   );
  //   return found ? found.OrderBy : null;
  // }

  // public onclosescanbarcode() {
  //   this.isopenscan = false;
  // }

  // public onReject() {
  //   this.retaildetail.Status = SALOrderDetailStatusEnum.Canceled;
  //   this.UpdateSALDetail(this.retaildetail);

  // }
  // //#region CALL API
  // private GetCustomer(param: CSLoyalCustomerCusDTO) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbikeapi.GetCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.cscustomer = res.ObjectReturn;
  //       this.retaildetail.Owner = this.cscustomer.Code;
  //       this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.retaildetail);
  //       if (this.cscustomer.DateOfIssue) {
  //         const d = new Date(this.cscustomer.DateOfIssue);
  //         this.cscustomer.DateOfIssue = new Date(
  //           d.getFullYear(),
  //           d.getMonth(),
  //           d.getDate()
  //         );
  //       } else {
  //         this.cscustomer.DateOfIssue = null;
  //       }

  //       if (this.cscustomer.Province) {
  //         this.getlistdistrict(this.cscustomer.Province)
  //       }

  //       this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);
  //       this.cscustomerCOPY = { ...this.cscustomer };
  //       this.oldOwner = { ...this.cscustomer };
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${res.ErrorString}`);
  //     }
  //   },
  //     (err) => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(temp);
  // }

  // private GetCustomerByID(param: CSLoyalCustomerCusDTO, field: string[]) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbikeapi.GetCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.cscustomer = res.ObjectReturn;
  //       if (this.cscustomer == null) {
  //         if (field.length == 9) {
  //           this.scanResult.Code = 0;
  //           this.cscustomer = { ...this.scanResult };
  //         } else {
  //           this.cscustomer = new CSLoyalCustomerCusDTO();
  //           this.cscustomer.CitizenCardNo = this.oldCitizenCardNo.CitizenCardNo
  //         }
  //       }
  //       let paramupdate: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
  //         DTO: this.cscustomer,
  //         Properties: field
  //       };
  //       this.UpdateLoyalCustomer(paramupdate);

  //       if (this.cscustomer.DateOfIssue) {
  //         const d = new Date(this.cscustomer.DateOfIssue);
  //         this.cscustomer.DateOfIssue = new Date(
  //           d.getFullYear(),
  //           d.getMonth(),
  //           d.getDate()
  //         );
  //       } else {
  //         this.cscustomer.DateOfIssue = null;
  //       }
  //       this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);
  //       this.cscustomerCOPY = { ...this.cscustomer };
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${res.ErrorString}`);
  //     }
  //   },
  //     (err) => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin chủ xe: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlistprovince() {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListProvince().subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.provincelist = res.ObjectReturn;
  //       if (this.cscustomer.Province) {
  //         this.getlistdistrict(this.cscustomer.Province);
  //       }
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${res.ErrorString}`);
  //     }
  //   },
  //     (err) => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlistdistrict(number: number) {
  //   this.subLoader.loader(true);
  //   var province: LSProvinceDTO = new LSProvinceDTO();
  //   province.Code = number;
  //   var temp = this.coreapi.GetListDistrict(province).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.districtlist = res.ObjectReturn;
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách phường/xã: ${res.ErrorString}`);
  //     }
  //   },
  //     (err) => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách phường/xã: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlisthrlist(param: HRListTypeDataEnum, forceReload: boolean = false) {
  //   this.subLoader.loader(true);
  //   var temp = this.configCache.GetListHRList(param, forceReload).subscribe((res) => {
  //     if (res) {
  //       this.listgender = res;
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách thông tin giới tính`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách thông tin giới tính: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private UpdateLoyalCustomer(param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO>) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbikeapi.UpdateLoyalCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.cscustomer = res.ObjectReturn;
  //       this.retaildetail.Owner = this.cscustomer.Code;
  //       this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.retaildetail);
  //       if (this.oldOwner.Code != this.cscustomer.Code || this.oldOwner.Code == this.cscustomer.Code && this.cscustomer.IsCustomerOwner == false) {
  //         this.UpdateSALDetail(this.retaildetail);
  //         this.oldOwner = { ...this.cscustomer }
  //       }
  //       if (this.cscustomer.Province) {
  //         this.getlistdistrict(this.cscustomer.Province)
  //       }
  //       if (this.cscustomer.DateOfIssue) {
  //         const d = new Date(this.cscustomer.DateOfIssue);
  //         this.cscustomer.DateOfIssue = new Date(
  //           d.getFullYear(),
  //           d.getMonth(),
  //           d.getDate()
  //         );
  //       } else {
  //         this.cscustomer.DateOfIssue = null;
  //       }
  //       this.cscustomerCOPY = { ...this.cscustomer };
  //       this.notification.onSuccess('Thành công');
  //       this.subLoader.loader(false);
  //       this.isopenscan = false;
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${res.ErrorString}`);
  //       this.isopenscan = false;
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private UpdateSALDetail(param: SALOrderDetailCusDTO) {
  //   this.subLoader.loader(true);
  //   param.DeliveryStatus = null;
  //   const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(res => {
  //     if (res.StatusCode === 0) {
  //       this.notification.onSuccess(`Thành công`);
  //       this.subLoader.loader(false);
  //       this.showpopup = false;
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
  //       this.showpopup = false;
  //     }
  //   }, err => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi cập nhật: ${err.message}`);
  //     this.showpopup = false;
  //   });
  //   this.arrUnsubscribe.push(sub);
  // }

}