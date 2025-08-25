import { Component, OnInit } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { CompositeFilterDescriptor, State } from "@progress/kendo-data-query";
import { LSWarehouseCusDTO } from "src/app/models/dtos/e-dtos/ls-warehouse.dto";
import { LSProvinceDTO } from "src/app/models/dtos/e-dtos/ls-province.dto";
import { LSDistrictDTO } from "src/app/models/dtos/e-dtos/ls-district.dto";
import { LSWardDTO } from "src/app/models/dtos/e-dtos/ls-ward.dto";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { HREmployeeCusDTO } from "src/app/models/dtos/e-dtos/hr-employee.dto";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PSObject } from "src/app/services/utilities/ps-object";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { SALOrderMasterTypeDataEnum } from "src/app/models/enums/e-type/sal-order-master-type-data.enum";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { SALOrderMasterStatusEnum } from "src/app/models/enums/e-status/sal-order-master-status.enum";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { HRListTypeDataEnum } from "src/app/models/enums/e-type/hr-list-type-data.enum";
import { LSListTypeOfListEnum } from "src/app/models/enums/e-type/ls-list-type-of-list.enum";
import { SALOrderDetailStatusEnum } from "src/app/models/enums/e-status/sal-order-detail-status.enum";
import { PSString } from "src/app/services/utilities/ps-string";
import { LSTypeOfPartnerCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-partner.dto";
import { PSDate } from "src/app/services/utilities/ps-date";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { Router } from "@angular/router";
import { RouterEnum } from "src/app/models/enums/router.enum";

@Component({
  selector: 'mtb004-wholesale-detail',
  templateUrl: './mtb004-wholesale-detail.component.html',
  styleUrls: ['./mtb004-wholesale-detail.component.scss'],
})

export class Mtb004WholesaleDetailComponent implements OnInit {
  constructor(
    private cache: PSCache,
    private subLoader: PsLayoutLoaderService,
    private mtbapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private psConfig: PSGetConfigService,
    private coreapi: PSCoreApiService,
    private header: PSHeaderService,
    private router: Router
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public FPDTO = FunctionPermissionDTO;
  public cachevalue: any

  ngOnInit(): void {
    //thông tin bán hàng
    const itemcache = this.cache.getItem(KeyLocalStorageEnum.WHOLESALE);
    this.cachevalue = this.cache.parseValue(itemcache);

    if (this.cachevalue.Code != 0)
      this.GetSOMaster(this.cachevalue);

    // this.getlistprovince();
    // this.getlisthrlist();
    this.GetListWarehouse();
    this.getlistlslist();
    this.getlistemployee();
    this.getlistpartnercustomer();

    //drawer
    this.getlisttypeofvehicle()

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.router.navigateByUrl(RouterEnum.mtb003);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }
  //#endregion

  //#region header
  public updatemasterstatus(status, statusname) {
    if (status == SALOrderMasterStatusEnum.WATITINGDELIVERY) {
      if (!this.somaster.Partner)
        return this.notification.onWarning('Chưa có thông tin khách hàng');
      // if (PSString.isNullOrWhitespace(this.somastercus.Phone))
      //   return this.notification.onWarning('Chưa có thông tin liên hệ của khách hàng');
      // if (PSObject.isNullOfUndefined(this.somastercus.Province) || PSObject.isNullOfUndefined(this.somastercus.District) ||
      //   PSObject.isNullOfUndefined(this.somastercus.Ward) || PSString.isNullOrWhitespace(this.somastercus.Address))
      //   return this.notification.onWarning('Chưa có thông tin giao xe cho khách hàng');
      if (PSObject.isNullOfUndefined(this.somaster.WHOut))
        return this.notification.onWarning('Chưa có thông tin kho xuất hàng');
      if (PSObject.isNullOfUndefined(this.somaster.SaleStaff))
        return this.notification.onWarning('Chưa có thông tin nhân sự bán hàng');
      if (!this.somaster.AmountPaid || this.somaster.AmountPaid == 0)
        return this.notification.onWarning('Chưa có thông tin tiền tiền đặt cọc');
      if (this.detailcount == 0)
        return this.notification.onWarning('Chưa có thông tin xe bán');
    }
    this.updatesomasterstatus(status, statusname);
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
        this.GetListSODetail();
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

  //#region thông tin bán hàng
  public somaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  private somastercopy: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public outhead = this.psConfig.GetHead();
  public listWH: LSWarehouseCusDTO[] = [];
  public listcus: LSTypeOfPartnerCusDTO[] = [];
  public provincelsit: LSProvinceDTO[] = [];
  public districtlsit: LSDistrictDTO[] = [];
  public wardlsit: LSWardDTO[] = [];
  public listoppcopy: ListDTO[] = [{ Code: null, ListName: 'Không lựa chọn' } as ListDTO];
  public listopp: ListDTO[] = [];
  public enumpaymentmethod = LSListTypeOfListEnum;

  public onCustomerChange(e) {
    this.somaster.Partner = e.Code;
    this.onFieldChanged('Partner')
  }

  public onFieldChanged(props: string) {
    var p = [props];

    if (this.somaster[props] == this.somastercopy[props]) {
      if (props == 'WHOut') {

      } else {
        return;
      }
    }

    if (this.somaster.Code == 0) {
      const newDate = new Date();
      this.somaster.SaleDate = PSDate.setHours(newDate, 0, 0, 0, 0);
      p.push('SaleDate')
      this.somaster.TypeData = SALOrderMasterTypeDataEnum.WHOLESALE
      this.somaster.PaymentCount = 0;
      this.somaster.AmountPaid = 0;
      p.push('TypeData', 'PaymentCount', 'AmountPaid');
    }

    if (props == 'PaymentMethod' && this.somaster.PaymentMethod == this.enumpaymentmethod.LUMPSUM) {
      p.push('PaymentCount');
      this.somaster.PaymentCount = 1;
    }

    const param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = { DTO: this.somaster, Properties: p };
    this.UpdateSOMaster(param);
  }

  // public onCustomerChange(field) {
  //   if (this.somastercus[field] == this.somastercuscopy[field])
  //     return;

  //   const param: UpdatePropertiesInterface<LSTypeOfPartnerCusDTO> = {
  //     DTO: this.somastercus,
  //     Properties: [field]
  //   };
  // }

  // public customerchange(e) {
  //   var temp = this.listcus.find(f => f.Name == e)
  //   if (!PSObject.isNullOfUndefined(temp)) {
  //     this.somaster.Customer = temp.Code;
  //     this.somastercus = { ...temp };
  //     this.somastercuscopy = { ...temp };
  //     this.onFieldChanged('Partner');
  //   }
  //   else {
  //     if (e != '') {
  //       this.somastercus.Name = e;
  //       this.onCustomerChange('Name')
  //     }
  //     else {
  //       this.somastercus = new LSTypeOfPartnerCusDTO();
  //     }
  //   }
  // }

  public onsetdatechange(e, prop) {
    const newDate = new Date(e);
    this.somaster[prop] = PSDate.setHours(newDate, 0, 0, 0, 0);
  }

  private GetSOMaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetSOMaster(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        //thông tin bán hàng
        this.somaster = res.ObjectReturn;
        const newDate = new Date(res.ObjectReturn.SaleDate);
        this.somaster.SaleDate = PSDate.setHours(newDate, 0, 0, 0, 0);
        this.somastercopy = { ...this.somaster };


        //chi tiết đơn hàng
        this.GetListSODetail();
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private GetListWarehouse() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListWarehouse(this.outhead.Head).subscribe(res => {
      if (res.StatusCode == 0) {
        this.listWH = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  // private getlisthrlist() {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListHRList(HRListTypeDataEnum.OCCUPATION).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.listopp = [...this.listoppcopy]
  //       this.listopp.push(...res.ObjectReturn);

  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách thông tin nghề nghiệp: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy danh sách thông tin nghề nghiệp: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  // private getlistprovince() {
  //   this.subLoader.loader(true);
  //   var temp = this.coreapi.GetListProvince().subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.provincelsit = res.ObjectReturn;
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

  // private getlistdistrict(provinceCode: number): void {
  //   this.subLoader.loader(true);
  //   const provinceDto = new LSProvinceDTO();
  //   provinceDto.Code = provinceCode;
  //   const sub = this.coreapi.GetListDistrict(provinceDto).subscribe(
  //     res => {
  //       this.subLoader.loader(false);
  //       if (res.StatusCode === 0) {
  //         this.districtlsit = res.ObjectReturn;
  //       } else {
  //         this.notification.onError(`Lỗi lấy danh sách quận/huyện: ${res.ErrorString}`);
  //       }
  //     },
  //     err => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách quận/huyện: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(sub);
  // }

  // private getlistward(districtCode: number): void {
  //   this.subLoader.loader(true);
  //   const districtDto = new LSDistrictDTO();
  //   districtDto.Code = districtCode;
  //   const sub = this.coreapi.GetListWard(districtDto).subscribe(
  //     res => {
  //       this.subLoader.loader(false);
  //       if (res.StatusCode === 0) {
  //         this.wardlsit = res.ObjectReturn;
  //       } else {
  //         this.notification.onError(`Lỗi lấy danh sách phường/xã: ${res.ErrorString}`);
  //       }
  //     },
  //     err => {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy danh sách phường/xã: ${err.message}`);
  //     }
  //   );
  //   this.arrUnsubscribe.push(sub);
  // }

  // private GetCustomer(param: SALOrderMasterCusDTO) {
  //   this.subLoader.loader(true);
  //   var temp = this.mtbapi.GetCustomer(param).subscribe((res) => {
  //     if (res.StatusCode == 0) {
  //       this.somastercus = res.ObjectReturn || new LSTypeOfPartnerCusDTO();
  //       this.somastercuscopy = { ...res.ObjectReturn };

  //       if (this.somastercus.Province != null) {
  //         this.getlistdistrict(this.somastercus.Province);
  //       }

  //       if (this.somastercus.District != null) {
  //         this.getlistward(this.somastercus.District);
  //       }
  //       this.subLoader.loader(false);
  //     } else {
  //       this.subLoader.loader(false);
  //       this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${res.ErrorString}`);
  //     }
  //   }, (err) => {
  //     this.subLoader.loader(false);
  //     this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${err.message}`);
  //   });
  //   this.arrUnsubscribe.push(temp);
  // }

  private UpdateSOMaster(param: UpdatePropertiesInterface<SALOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.UpdateSOMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.somaster = res.ObjectReturn;
          this.somastercopy = { ...this.somaster };

          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi cập nhật phiếu: ${res.ErrorString}`);
        }
      }, (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật phiếu: ${err.message}`);
      });
    this.arrUnsubscribe.push(temp);
  }

  private getlistpartnercustomer() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListPartnerCustomer().subscribe((res) => {
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

  private getlistemployee() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListEmployee().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listEmployee = res.ObjectReturn;
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

  private getlistlslist() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListLSList(LSListTypeDataEnum.PaymentMethod).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listpaymentmethod = res.ObjectReturn;
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
  //#endregion

  //#region chi tiết đơn hàng
  public wholesaleDetailData: Subject<any> = new Subject<any>();
  public detailcount: number = 0;
  public actionColumn: ActionColumnDTO[] = [];
  public showpopupdetail: boolean = false;
  public showpopupmaster: boolean = false;

  public ondeletedetail() {
    this.showpopupdetail = true;
  }
  public ondeletemaster() {
    this.showpopupmaster = true;
  }
  public onActionClick(e: ActionColumnDTO) {
    this.sodetail = { ...e.data };
    this.sodetailcopy = { ...e.data };
    this.actiontype = e.action as string;

    if (e.action == 'view' || e.action == 'edit') {
      if (this.sodetail.TypeOfVehicle)
        this.ongetvehicle();

      if (this.sodetail.Vehicle)
        this.ongetcolor();

      this.isDrawerOpen = true;
    }
    else if (e.action == 'delete') {
      this.ondeletedetail();
    }
    else if (e.action == SALOrderDetailStatusEnum.DELIVERED) {
      this.sodetail.DeliveryStatus = SALOrderDetailStatusEnum.DELIVERED;
      this.updatesodetail(this.sodetail)
    }
  }

  public onAddNew() {
    this.sodetail.DeliveryStatus = SALOrderDetailStatusEnum.DELIVERED;
    this.updatesodetail(this.sodetail)
  }
  public onActionColumnFocus(e) {
    this.actionColumn = [];
    if ((FunctionPermissionDTO.master || FunctionPermissionDTO.creator) && this.somaster.Status == SALOrderMasterStatusEnum.NEW) {
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
    else {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })
      if (e.DeliveryStatus == SALOrderDetailStatusEnum.NOTDELIVERED) {
        this.actionColumn.push({ separator: true });
        this.actionColumn.push({ iconClass: 'check', text: 'Đã giao', action: SALOrderDetailStatusEnum.DELIVERED });
      }
    }
  }

  private GetListSODetail() {
    this.subLoader.loader(true);

    let groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
    let filter: State = { filter: groupfilter };
    groupfilter.filters.push({ field: 'Master', operator: 'eq', value: this.somaster.Code });

    var temp = this.mtbapi.GetListSODetail(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.detailcount = res.ObjectReturn.Total;
        if (res.ObjectReturn.Data.filter(x => x.DeliveryStatus == SALOrderDetailStatusEnum.DELIVERED).length == res.ObjectReturn.Total && res.ObjectReturn.Data.length > 0) {
          this.somaster.Status = SALOrderMasterStatusEnum.OK;
          this.somaster.StatusName = 'Hoàn tất'
        }
        this.wholesaleDetailData.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total });
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu bán sỉ: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  public DeleteSODetail(dto: SALOrderDetailCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.mtbapi.DeleteSODetail(dto).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.GetListSODetail();
        this.sodetail = new SALOrderDetailCusDTO();
        this.sodetailcopy.FrameSeri = null
        this.sodetailcopy.EngineSeri = null
        this.showpopupdetail = false;
        this.isDrawerOpen = false;
        this.subLoader.loader(false);
        this.notification.onSuccess('Thành công');
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(err.message);
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region drawer
  public listtypeofvehicle: LSTypeOfVehicleCusDTO[] = [];
  public listvehicle: LSVehicleCusDTO[] = [];
  public listcolor: LSVehicleColorCusDTO[] = [];
  public listpaymentmethod: ListDTO[] = [];
  public listEmployee: HREmployeeCusDTO[] = [];
  public enumstt = SALOrderMasterStatusEnum;
  public sodetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public sodetailcopy: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public isDrawerOpen = false;
  public actiontype = '';
  public PURDODSTT = SALOrderDetailStatusEnum;

  public onblurseri(p) {
    if ((p == 'FrameSeri' && this.sodetail.FrameSeri && this.sodetail.FrameSeri != this.sodetailcopy.FrameSeri) ||
      (p == 'EngineSeri' && this.sodetail.EngineSeri && this.sodetail.EngineSeri != this.sodetailcopy.EngineSeri))
      this.getseri();
  }

  public dropdownvehiclechange(key: string, e) {
    switch (key) {
      case 'type':
        this.sodetail = new SALOrderDetailCusDTO();
        this.sodetail.TypeOfVehicle = e.Code;
        this.ongetvehicle();
        break;
      case 'vehicle':
        this.sodetail.Vehicle = e.Code;
        this.sodetail.Version = e.Version;
        this.sodetail.VehicleColor = null;
        this.sodetail.FrameSeri = '';
        this.sodetail.EngineSeri = '';
        this.sodetail.Price = 0;
        this.sodetail.InsuranceNumber = '';
        this.sodetail.InsurancePeriod = e.InsurancePeriod;
        this.sodetail.InsuranceTime = e.InsuranceTime;
        this.sodetail.VehicleImage = '';
        this.ongetcolor();
        break;
      case 'color':
        this.sodetail.VehicleColor = e.Code;
        this.sodetail.VehicleImage = e.ImageSetting1;
        this.sodetail.VehicleColor = e.ColorName;
        this.sodetail.FrameSeri = '';
        this.sodetail.EngineSeri = '';
        this.sodetail.Price = 0;
        this.sodetail.InsuranceNumber = '';
        // this.sodetail.InsurancePeriod = e.InsurancePeriod;
        // this.sodetail.InsuranceTime = e.InsuranceTime;
        this.sodetail.VehicleImage = '';
        break;
    }
    this.sodetail.CSVehicle = 0;
  }

  private ongetvehicle() {
    let param: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
    param.Code = this.sodetail.TypeOfVehicle;
    this.getlistvehicle(param);
  }

  private ongetcolor() {
    let param: LSVehicleCusDTO = new LSVehicleCusDTO();
    param.Code = this.sodetail.Vehicle;
    param.TypeData = 0;
    this.getlistvehiclecolor(param);
  }

  public onDrawerCollapse(): void {
    this.sodetail = new SALOrderDetailCusDTO();
    this.sodetailcopy = new SALOrderDetailCusDTO();
    this.isDrawerOpen = false;
  }

  public onCreateNew(): void {
    this.sodetail = new SALOrderDetailCusDTO();
    this.isDrawerOpen = true;
  }

  onRefreshAll(): void {
    this.somaster = new SALOrderMasterCusDTO()
    this.sodetail = new SALOrderDetailCusDTO();
  }
  private getlisttypeofvehicle() {
    this.subLoader.loader(true);
    const sub = this.mtbapi.GetListTypeOfVehicle().subscribe(res => {
      if (res.StatusCode === 0) {
        this.listtypeofvehicle = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistvehicle(params: LSTypeOfVehicleCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbapi.GetListVehicle(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listvehicle = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy dòng xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy dòng xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistvehiclecolor(params: LSVehicleCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbapi.GetListVehicleColor(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listcolor = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy màu xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy màu xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  public updatesodetail(params: SALOrderDetailCusDTO) {
    if (!this.sodetail.Vehicle)
      return this.notification.onWarning('Chưa có thông tin dòng xe')

    if (!this.sodetail.Price || this.sodetail.Price == 0)
      return this.notification.onWarning('Chưa có thông tin giá bán')

    var listprop = Object.keys(this.sodetail);
    var ischange = false;
    for (const prop of listprop) {
      if (this.sodetail[prop] !== this.sodetailcopy[prop]) {
        ischange = true;
      }
    }

    if (!ischange)
      return;

    params.Master = this.somaster.Code;
    this.subLoader.loader(true);

    var temp = this.mtbapi.UpdateSODetail(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.GetListSODetail();
        this.isDrawerOpen = false;
        const param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
          DTO: this.somaster,
          Properties: ['Code']
        };
        this.GetSOMaster(this.somaster);
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

  private getseri() {
    this.subLoader.loader(true);
    const sub = this.mtbapi.GetSeri(this.sodetail).subscribe(res => {
      if (res.StatusCode === 0) {
        this.sodetail.FrameSeri = res.ObjectReturn.FrameSeri;
        this.sodetail.EngineSeri = res.ObjectReturn.EngineSeri;
        this.sodetail.InsuranceNumber = res.ObjectReturn.InsuranceNumber;
        this.sodetail.InsuranceTime = res.ObjectReturn.InsuranceTime;
        this.sodetail.InsurancePeriod = res.ObjectReturn.InsurancePeriod;
        this.sodetail.VehicleImage = res.ObjectReturn.VehicleImage;
        this.sodetail.CSVehicle = res.ObjectReturn.Code;

        this.subLoader.loader(false);
      } else {
        this.sodetail = this.sodetailcopy
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  public deletesomaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.DeleteSOMaster([param]).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.onRefreshAll();
        this.showpopupmaster = false;
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
}
