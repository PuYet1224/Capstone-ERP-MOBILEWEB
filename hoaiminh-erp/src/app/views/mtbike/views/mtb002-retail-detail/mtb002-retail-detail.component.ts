import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { PSObject } from "src/app/services/utilities/ps-object";
import { LSVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { HREmployeeCusDTO } from "src/app/models/dtos/e-dtos/hr-employee.dto";
import { LSWarehouseCusDTO } from "src/app/models/dtos/e-dtos/ls-warehouse.dto";
import { HRListTypeDataEnum } from "src/app/models/enums/e-type/hr-list-type-data.enum";
import { CSLoyalCustomerCusDTO } from "src/app/models/dtos/e-dtos/cs-loyal-customer.dto";
import { LSProvinceDTO } from "src/app/models/dtos/e-dtos/ls-province.dto";
import { LSDistrictDTO } from "src/app/models/dtos/e-dtos/ls-district.dto";
import { LSWardDTO } from "src/app/models/dtos/e-dtos/ls-ward.dto";
import { PSDate } from "src/app/services/utilities/ps-date";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { PSString } from "src/app/services/utilities/ps-string";
import { LSListTypeOfListEnum } from "src/app/models/enums/e-type/ls-list-type-of-list.enum";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { SALOrderMasterTypeDataEnum } from "src/app/models/enums/e-type/sal-order-master-type-data.enum";
import { SALOrderMasterStatusEnum } from "src/app/models/enums/e-status/sal-order-master-status.enum";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { Router } from "@angular/router";
import { RouterEnum } from "src/app/models/enums/router.enum";

@Component({
  selector: 'mtb002-retail-detail',
  templateUrl: './mtb002-retail-detail.component.html',
  styleUrls: ['./mtb002-retail-detail.component.scss'],
})

export class Mtb002RetailDetailComponent implements OnInit, OnDestroy {
  constructor(
    private cache: PSCache,
    private subLoader: PsLayoutLoaderService,
    private mtbapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private psConfig: PSGetConfigService,
    private coreapi: PSCoreApiService,
    private header: PSHeaderService,
    private router: Router
  ) {
    var last = new Date().getFullYear() - 15
    this.listyear = PSDate.getYears(last);
  }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public sodetailcace: SALOrderDetailCusDTO;
  public isMaster: boolean = FunctionPermissionDTO.master;
  public isCreator: boolean = FunctionPermissionDTO.creator;
  public isApprover: boolean = FunctionPermissionDTO.approver;

  ngOnInit(): void {
    var itemcache = this.cache.getItem(KeyLocalStorageEnum.RETAIL);
    this.sodetailcace = this.cache.parseValue(itemcache);
    if (this.sodetailcace.Code != 0)
      this.getretail(this.sodetailcace);
    //thông tin xe
    this.getlisttypeofvehicle();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.router.navigateByUrl(RouterEnum.mtb001);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  public addNewRetail() {
    this.sodetail = new SALOrderDetailCusDTO();
    this.refsodetail = new SALOrderDetailCusDTO();
    this.somaster = new SALOrderMasterCusDTO();
    this.refsomaster = new SALOrderMasterCusDTO();
    this.cscustomer = new CSLoyalCustomerCusDTO();
    this.cscustomerref = new CSLoyalCustomerCusDTO();
    this.cache.removeItem(KeyLocalStorageEnum.RETAIL);
  }

  public checkdisable(block: number, prop: string) {
    if ([SALOrderMasterStatusEnum.OK, SALOrderMasterStatusEnum.CANCLE].includes(this.somaster.Status) && prop != 'new')
      return true;

    if ((block == 1 || block == 3) && (this.isApprover && !this.isMaster))
      return true;

    if ((block == 2 && !['RegisterDate', 'PlateDeliveryDate', 'TechnicalStaff', 'RegisterStaff'].includes(prop) &&
      (!this.isCreator && !this.isMaster)) || (this.somaster.Status == SALOrderMasterStatusEnum.NEW && !this.isMaster))
      return true;

    switch (block) {
      case 1:
        if (this.somaster.Status != SALOrderMasterStatusEnum.NEW)
          return true;

        if ((prop == 'PlateNo' && PSObject.isNullOfUndefined(this.sodetail.CSVehicle)) ||
          ((prop == 'FrameSeri' || prop == 'EngineSeri') && (!this.sodetail.Vehicle || !this.sodetail.TypeOfVehicle || !this.sodetail.VehicleColor)) ||
          (prop == 'vehicle' && !this.sodetail.TypeOfVehicle) || (prop == 'color' && !this.sodetail.Vehicle))
          return true;
        break;

      case 2:
        if (((prop == 'Price' || prop == 'AmountPaid' || prop == 'PaymentMethod' || prop == 'PlateDeliveryDate' ||
          prop == 'RegisterDate' || prop == 'RegisterStaff' || prop == 'TechnicalStaff') && PSObject.isNullOfUndefined(this.sodetail.CSVehicle)) ||
          (prop == 'PaymentCount' && this.somaster.PaymentMethod == LSListTypeOfListEnum.LUMPSUM) ||
          (['Price', 'PaymentMethod', 'PaymentCount', 'AmountPaid', 'SaleDate', 'SaleStaff', 'WHOut'].includes(prop) && this.somaster.Status != SALOrderMasterStatusEnum.NEW))
          return true;
        break;

      case 3:
        if (this.somaster.Status != SALOrderMasterStatusEnum.WATITINGDELIVERY && this.somaster.Status != SALOrderMasterStatusEnum.NEW)
          return true;

        if ((prop == 'Gender' || prop == 'BirthYear' || prop == 'BirthMonth' || prop == 'BirthDay' || prop == 'Cellphone1' || prop == 'Email' ||
          prop == 'Province' || prop == 'District' || prop == 'Ward' || prop == 'Address' || prop == 'Occupation') && PSString.isNullOrWhitespace(this.cscustomer.FullName) ||
          (prop == 'BirthMonth' && !this.cscustomer.BirthYear) || (prop == 'BirthDay' && !this.cscustomer.BirthMonth) ||
          (prop == 'District' && !this.cscustomer.Province) || (prop == 'Ward' && !this.cscustomer.District))
          return true;
        break;
    }

    return false;
  }

  private getretail(param: SALOrderDetailCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetRetail(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.sodetail = res.ObjectReturn;
        this.refsodetail = { ...this.sodetail }

        //thông tin xe
        if (!PSObject.isNullOfUndefined(this.sodetail.PlateDeliveryDate))
          this.sodetail.PlateDeliveryDate = new Date(res.ObjectReturn.PlateDeliveryDate);
        if (!PSObject.isNullOfUndefined(this.sodetail.RegisterDate))
          this.sodetail.RegisterDate = new Date(res.ObjectReturn.RegisterDate);

        this.checkvehicle(this.sodetail.TypeOfVehicle, 'type');
        this.checkvehicle(this.sodetail.Vehicle, 'vehicle');

        //thông tin bán hàng
        this.somaster.Code = res.ObjectReturn.Master;
        this.getlistlslist();
        this.getlistemployee();
        this.getlistwarehouse();
        this.getsomaster();

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu bán lẻ: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu bán lẻ: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region header
  public showpopup: boolean = false;
  public enumstt = SALOrderMasterStatusEnum;

  public onshowpopup() {
    this.showpopup = true;
  }

  public updatemasterstatus(status, statusname) {
    if (status == SALOrderMasterStatusEnum.WATITINGDELIVERY) {
      if (this.cscustomer.Code == 0)
        return this.notification.onWarning('Chưa có thông tin khách hàng');
      if (PSString.isNullOrWhitespace(this.cscustomer.Cellphone1))
        return this.notification.onWarning('Chưa có thông tin liên hệ của khách hàng');
      if (PSObject.isNullOfUndefined(this.cscustomer.Province) || PSObject.isNullOfUndefined(this.cscustomer.District) ||
        PSObject.isNullOfUndefined(this.cscustomer.Ward) || PSString.isNullOrWhitespace(this.cscustomer.Address))
        return this.notification.onWarning('Chưa có thông tin giao xe cho khách hàng');
      if (PSObject.isNullOfUndefined(this.somaster.WHOut))
        return this.notification.onWarning('Chưa có thông tin kho xuất hàng');
      if (PSObject.isNullOfUndefined(this.somaster.SaleStaff))
        return this.notification.onWarning('Chưa có thông tin nhân sự bán hàng');
      if (PSObject.isNullOfUndefined(this.sodetail.Price) || this.sodetail.Price == 0)
        return this.notification.onWarning('Chưa có thông tin giá bán');
    }
    this.updatesomasterstatus(status, statusname);
  }

  public deletesomaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.DeleteSOMaster([param]).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.showpopup = false;
        this.showpopupdetail = false;
        this.somaster = new SALOrderMasterCusDTO();
        this.sodetail = new SALOrderDetailCusDTO();
        this.refsodetail = new SALOrderDetailCusDTO();
        this.cscustomer = new CSLoyalCustomerCusDTO();
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  public updatesomasterstatus(status: number, statusname: string) {
    this.subLoader.loader(true);
    var dto: UpdateStatusInterface<SALOrderMasterCusDTO> = {
      ListDTO: [this.somaster],
      Status: status
    }

    var temp = this.mtbapi.UpdateSOMasterStatus(dto).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.somaster.Status = status;
        this.somaster.StatusName = statusname;
        this.notification.onSuccess(`Thành công`);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region thông tin xe
  public sodetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public refsodetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public listtypedata: LSTypeOfVehicleCusDTO[] = [];
  public listvehicle: LSVehicleCusDTO[] = [];
  public listcolor: LSVehicleColorCusDTO[] = [];
  public showpopupdetail: boolean = false;

  public onblurseri(field: 'FrameSeri' | 'EngineSeri') {

    this.sodetail[field] = this.sodetail[field]?.trim();

    if (PSString.isNullOrWhitespace(this.sodetail[field]) && this.sodetail.Code != 0) {
      this.notification.onWarning("Số khung hoặc số máy không được để trống")
      this.sodetail = { ...this.refsodetail }
      return;
    }

    if (this.sodetail[field] == this.refsodetail[field])
      return;

    if (!this.sodetail.FrameSeri && !this.sodetail.EngineSeri) {
      const { VehicleImage, Vehicle, TypeOfVehicle, VehicleColor } = this.sodetail;
      this.sodetail = new SALOrderDetailCusDTO();
      this.sodetail.VehicleImage = VehicleImage;
      this.sodetail.Vehicle = Vehicle;
      this.sodetail.TypeOfVehicle = TypeOfVehicle;
      this.sodetail.VehicleColor = VehicleColor;
      this.somaster = new SALOrderMasterCusDTO();
      this.refsomaster = new SALOrderMasterCusDTO();
      this.cscustomer = new CSLoyalCustomerCusDTO();
      this.cscustomerref = new CSLoyalCustomerCusDTO();
      return;
    }
    this.getseri(field);
  }


  public updatedetail(prop: string) {
    if (typeof this.sodetail[prop] === 'string') {
      this.sodetail[prop] = this.sodetail[prop].trim();
    }

    if (!this.isDetailDateChanged && (prop == 'SaleDate' || prop == 'RegisterDate' || prop == 'PlateDeliveryDate')) {
      return;
    }
    this.isDetailDateChanged = false;

    const oldValue = this.refsodetail[prop];
    const newValue = this.sodetail[prop];

    const isChanged = oldValue instanceof Date
      ? oldValue?.getTime() !== newValue?.getTime()
      : oldValue !== newValue;

    if (isChanged) {
      this.sodetail.Master = this.somaster.Code;
      this.updatesoretaildetail([prop]);
    }

  }


  public vehiclechange(v: any, type: string) {
    if (['type', 'vehicle', 'color'].includes(type))
      this.sodetail.CSVehicle = null;

    switch (type) {
      case 'type':
        this.resetValueVehicle();
        if (v.Code != null) {
          this.sodetail.TypeOfVehicle = v.Code;
          this.getlistvehicle(v);
        }
        break;

      case 'vehicle':
        this.sodetail.Vehicle = v.Code;
        this.resetValueColor();
        if (v.Code != null)
          this.getlistvehiclecolor(v);
        break;

      case 'color':
        this.sodetail.VehicleColor = v.Code;
        this.sodetail.VehicleImage = v.ImageSetting1;
        break;
    }
  }

  private resetValueVehicle() {
    this.sodetail.Vehicle = null;
    this.resetValueColor();
  }

  private resetValueColor() {
    this.sodetail.VehicleColor = null;
  }

  private checkvehicle(v: number | null, type: 'type' | 'vehicle' | 'color') {
    if (!PSObject.isNullOfUndefined(v)) {
      switch (type) {
        case "type":
          var typeo = new LSTypeOfVehicleCusDTO();
          typeo.Code = v;
          this.getlistvehicle(typeo)
          break;

        case "vehicle":
          var vehicle = new LSVehicleCusDTO();
          vehicle.Code = v;
          this.getlistvehiclecolor(vehicle)
          break;
      }
    }
  }

  private getlisttypeofvehicle() {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetListTypeOfVehicle().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listtypedata = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistvehicle(params: LSTypeOfVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetListVehicle(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listvehicle = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách dòng xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách dòng xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistvehiclecolor(params: LSVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetListVehicleColor(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listcolor = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách màu xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách màu xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getseri(field: 'FrameSeri' | 'EngineSeri') {
    this.subLoader.loader(true);
    this.sodetail.CSVehicle = 0;
    const sub = this.mtbapi.GetSeri(this.sodetail).subscribe(res => {
      if (res.StatusCode === 0) {
        this.sodetail.FrameSeri = res.ObjectReturn.FrameSeri;
        this.sodetail.EngineSeri = res.ObjectReturn.EngineSeri;
        this.sodetail.InsuranceNumber = res.ObjectReturn.InsuranceNumber;
        this.sodetail.InsuranceTime = res.ObjectReturn.InsuranceTime ?? this.sodetail.InsuranceTime;
        this.sodetail.InsurancePeriod = res.ObjectReturn.InsurancePeriod ?? this.sodetail.InsurancePeriod;
        this.sodetail.VehicleImage = res.ObjectReturn.VehicleImage;
        this.sodetail.CSVehicle = res.ObjectReturn.Code;
        this.sodetail.PlateNo = res.ObjectReturn.PlateNo;

        this.updatedetail('CSVehicle');
        this.subLoader.loader(false);
      } else {
        // Nếu lỗi thì chỉ clear trường vừa nhập, không clear trường còn lại
        this.sodetail.FrameSeri = this.refsodetail.FrameSeri;
        this.sodetail.EngineSeri = this.refsodetail.EngineSeri;
        this.notification.onError(`Lỗi lấy thông tin xe: ${res.ErrorString}`);
        this.subLoader.loader(false);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private updatesoretaildetail(list: string[]) {
    this.subLoader.loader(true);
    var param: UpdatePropertiesInterface<SALOrderDetailCusDTO> = {
      DTO: this.sodetail,
      Properties: list
    }

    var temp = this.mtbapi.UpdateSORetailDetail(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        //thông tin bán hàng
        if (this.sodetail.Code == 0) {
          this.somaster = {
            Code: res.ObjectReturn.Master,
            HeadOut: this.outhead.Head,
            TypeData: SALOrderMasterTypeDataEnum.RETAIL,
            Status: res.ObjectReturn.MasterStatus
          } as SALOrderMasterCusDTO;
          this.getlistlslist();
          this.getlistemployee();
          this.getlistwarehouse();
          this.getsomaster();
        }

        // if (this.somaster.PaymentMethod == LSListTypeOfListEnum.LUMPSUM && list.includes('Price'))
        //   this.somaster.AmountPaid = this.sodetail.Price;

        this.sodetail = {
          ...res.ObjectReturn,
          InsuranceTime: res.ObjectReturn.InsuranceTime ?? this.sodetail.InsuranceTime,
          InsurancePeriod: res.ObjectReturn.InsurancePeriod ?? this.sodetail.InsurancePeriod
        };
        this.refsodetail = { ...res.ObjectReturn };

        if (!PSObject.isNullOfUndefined(this.sodetail.PlateDeliveryDate))
          this.sodetail.PlateDeliveryDate = new Date(res.ObjectReturn.PlateDeliveryDate);
        if (!PSObject.isNullOfUndefined(this.sodetail.RegisterDate))
          this.sodetail.RegisterDate = new Date(res.ObjectReturn.RegisterDate);

        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region thông tin bán hàng
  public somaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public refsomaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public outhead = this.psConfig.GetHead();
  public listpaymentmethod: ListDTO[] = [];
  public listEmployeecopy: HREmployeeCusDTO[] = [{ Code: null, FullName: 'Không lựa chọn' }];
  public listEmployee: HREmployeeCusDTO[] = [];
  public listWH: LSWarehouseCusDTO[] = [];

  private isDateChanged = false;
  private isDetailDateChanged = true;
  public onDateChange(e: Date, p: string) {
    const newDate = PSDate.setHours(new Date(e), 0, 0, 0, 0);

    if (p == 'SaleDate') {
      if (this.somaster.SaleDate?.getTime() !== newDate?.getTime()) {
        this.somaster.SaleDate = newDate;
        this.isDateChanged = true;
      }
    } if (p === 'RegisterDate' || p === 'PlateDeliveryDate') {
      const oldValue = this.sodetail[p];
      if (oldValue?.getTime() !== newDate?.getTime()) {
        this.sodetail[p] = newDate;
        this.isDetailDateChanged = true;
      }
    }
  }

  public updatemaster(prop: string) {
    const oldValue = this.refsomaster[prop];
    const newValue = this.somaster[prop];

    const isChanged = oldValue instanceof Date
      ? oldValue?.getTime() !== newValue?.getTime()
      : oldValue !== newValue;

    if (!isChanged) return;

    const temppp = [prop];
    if (prop === 'PaymentMethod') {
      temppp.push('PaymentCount');
      this.somaster.PaymentCount = 1;
    }
    this.updatesomaster(temppp);
  }

  private getsomaster() {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetSOMaster(this.somaster).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.somaster = res.ObjectReturn;
        this.refsomaster = { ...this.somaster };
        //thông tin mua hàng
        if (!PSObject.isNullOfUndefined(this.somaster.SaleDate))
          this.somaster.SaleDate = new Date(res.ObjectReturn.SaleDate);

        //thồng tin khách hàng
        this.getlisthrlist(HRListTypeDataEnum.GENDER);
        this.getlistcustomer()
        if (!PSObject.isNullOfUndefined(this.somaster.Customer))
          this.getcustomer(this.somaster);

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistlslist() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListLSList(LSListTypeDataEnum.PaymentMethod).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listpaymentmethod = []
        this.listpaymentmethod.push(...res.ObjectReturn);
        this.somaster.PaymentMethod = this.listpaymentmethod[0].TypeOfList;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hình thức thanh toán: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách hình thức thanh toán: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistemployee() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListEmployee().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listEmployee = [...this.listEmployeecopy]
        this.listEmployee.push(...res.ObjectReturn);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin nhân sự: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin nhân sự: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private getlistwarehouse() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListWarehouse(this.outhead.Head).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listWH = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${err.ErrorString}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private updatesomaster(list: string[]) {
    this.subLoader.loader(true);
    var param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
      DTO: this.somaster,
      Properties: list
    }

    var temp = this.mtbapi.UpdateSOMaster(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.somaster = { ...res.ObjectReturn };
        this.refsomaster = { ...res.ObjectReturn };

        //thông tin khách hàng
        if (!PSObject.isNullOfUndefined(res.ObjectReturn.Customer))
          this.getcustomer(res.ObjectReturn);

        if (!PSObject.isNullOfUndefined(this.somaster.SaleDate))
          this.somaster.SaleDate = new Date(res.ObjectReturn.SaleDate);

        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.ErrorString}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region thông tin người mua hàng
  public listgender: ListDTO[] = [];
  public listoppcopy: ListDTO[] = [{ Code: null, ListName: 'Không lựa chọn' } as ListDTO];
  public listopp: ListDTO[] = [];
  public cscustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public cscustomerref: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public provincelist: LSProvinceDTO[] = [];
  public districtlist: LSDistrictDTO[] = [];
  public wardlist: LSWardDTO[] = [];
  public listcus: CSLoyalCustomerCusDTO[] = [];
  public listyear: number[];
  public listmonth: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public listday: number[] = [];

  public updatecustomer(prop) {
    if (typeof this.cscustomer[prop] === 'string') {
      this.cscustomer[prop] = this.cscustomer[prop].trim();
    }

    if (prop == 'BirthMonth')
      this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);

    if (prop == "Province")
      this.getlistdistrict();

    if (prop == "District")
      this.getlistward();

    if (this.cscustomer[prop] != this.cscustomerref[prop])
      this.updateloyalcustomer([prop]);
  }

  public customerchange(e) {
    this.cscustomer.FullName = e.trim();
    var temp = this.listcus.find(f => f.FullName == e)
    if (!PSObject.isNullOfUndefined(temp)) {
      this.somaster.Customer = temp.Code;
      this.cscustomer = { ...temp };
      this.cscustomerref = { ...temp };
      this.getlistprovince();
      this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);
      this.updatesomaster(['Customer']);
    }
    else {
      if (e != '') {
        this.cscustomer.FullName = e;
        this.updateloyalcustomer(['FullName', 'Gender'])
      }
      else {
        this.cscustomer = new CSLoyalCustomerCusDTO();
      }
    }
  }

  private getlisthrlist(param: HRListTypeDataEnum) {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHRList(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        if (param == HRListTypeDataEnum.GENDER)
          this.listgender = res.ObjectReturn;

        if (param == HRListTypeDataEnum.OCCUPATION) {
          this.listopp = [...this.listoppcopy]
          this.listopp.push(...res.ObjectReturn);
        }

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin giới tính: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin giới tính: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getcustomer(master: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetCustomer(master).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.cscustomer = { ...res.ObjectReturn };
        this.cscustomerref = { ...res.ObjectReturn };
        this.getlistprovince();
        this.getlisthrlist(HRListTypeDataEnum.OCCUPATION);

        if (!PSObject.isNullOfUndefined(this.cscustomer.BirthMonth) && !PSObject.isNullOfUndefined(this.cscustomer.BirthYear))
          this.listday = PSDate.getDays(this.cscustomer.BirthMonth, this.cscustomer.BirthYear);

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin khách hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin  khách hàng: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistprovince() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListProvince().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.provincelist = res.ObjectReturn;

        if (!PSObject.isNullOfUndefined(this.cscustomer.Province))
          this.getlistdistrict();

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistdistrict() {
    this.subLoader.loader(true);
    var province: LSProvinceDTO = new LSProvinceDTO();
    province.Code = this.cscustomer.Province;
    var temp = this.coreapi.GetListDistrict(province).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.districtlist = res.ObjectReturn;

        if (!PSObject.isNullOfUndefined(this.cscustomer.District))
          this.getlistward();

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistward() {
    this.subLoader.loader(true);
    var district: LSDistrictDTO = new LSDistrictDTO();
    district.Code = this.cscustomer.District;
    district.Province = this.cscustomer.Province;
    var temp = this.coreapi.GetListWard(district).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.wardlist = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phường/xã: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phường/xã: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistcustomer() {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetListCustomer().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listcus = [];
        this.listcus.push(...res.ObjectReturn);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin khách hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin khách hàng: ${err.ErrorString}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private updateloyalcustomer(list: string[]) {
    this.subLoader.loader(true);
    var param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
      DTO: this.cscustomer,
      Properties: list
    }

    var temp = this.mtbapi.UpdateLoyalCustomer(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        if (this.cscustomer.Code == 0) {
          this.somaster.Customer = res.ObjectReturn.Code;
          this.somaster.IsNewCustomer = true;
          this.updatesomaster(['Customer', 'IsNewCustomer']);
        }

        this.cscustomer = { ...res.ObjectReturn };
        this.cscustomerref = { ...res.ObjectReturn };
        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.ErrorString}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
