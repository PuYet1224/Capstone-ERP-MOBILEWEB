import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { LSTypeOfPartnerCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-partner.dto";
import { PSObject } from "src/app/services/utilities/ps-object";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { PURDOMasterStatusEnum } from "src/app/models/enums/e-status/pur-do-master-status.enum";
import { PSString } from "src/app/services/utilities/ps-string";
import { PURDODetailCusDTO } from "src/app/models/dtos/e-dtos/pur-do-detail.dto";
import { PSArray } from "src/app/services/utilities/ps-array";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { PSDate } from "src/app/services/utilities/ps-date";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { Router } from "@angular/router";
import { RouterEnum } from "src/app/models/enums/router.enum";

@Component({
  selector: 'mtb006-delivery-detail',
  templateUrl: './mtb006-delivery-detail.component.html',
  styleUrls: ['./mtb006-delivery-detail.component.scss'],
})

export class Mtb006DeliveryDetailComponent implements OnInit {
  constructor(
    private mtbikeapi: PSMtbikeApiService,
    private subLoader: PsLayoutLoaderService,
    private notification: PSKendoNotificationService,
    private cache: PSCache,
    private coreapi: PSCoreApiService,
    private header: PSHeaderService,
    private router: Router,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public FPDTO = FunctionPermissionDTO;

  ngOnInit(): void {
    // thông tin giao hàng
    var domastercache = this.cache.getItem(KeyLocalStorageEnum.DO)
    var value = this.cache.parseValue(domastercache);
    if (value.Code != 0)
      this.getdomaster(value);
    this.getlisthead();
    this.getlistsupplier();

    //drawer
    this.getlisttypeofvehicle();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.router.navigateByUrl(RouterEnum.mtb005);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }
  //#endregion

  //#region header
  public showpopup: boolean = false;

  public onshowpopup() {
    this.showpopup = true;
  }

  public addnewitem() {
    this.domaster = new PURDOMasterCusDTO();
    this.domastercopy = new PURDOMasterCusDTO();
    this.data = []
  }

  public onupdatedomasterstatus(status, statusname) {
    if (status == PURDOMasterStatusEnum.WAITINGDELIVERY) {
      if (PSString.isNullOrWhitespace(this.domaster.DO))
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin DO');

      if (!this.domaster.EstEffDate)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin ngày dự kiến giao');

      if (!this.domaster.POHead)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin cửa hàng đặt hàng');

      if (PSString.isNullOrWhitespace(this.domaster.PONo))
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin mã đơn hàng');

      if (!this.domaster.PODate)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin ngày đặt hàng');

      if (!this.domaster.POSupplier)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin nhà cung cấp');

      if (PSArray.isNullOrEmpty(this.data))
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin xe nhận');
    }
    this.updatesomasterstatus(status, statusname);
  }

  public updatesomasterstatus(status: number, statusname: string) {
    this.subLoader.loader(true);
    var dto: UpdateStatusInterface<PURDOMasterCusDTO> = {
      ListDTO: [this.domaster],
      Status: status
    }

    var temp = this.mtbikeapi.UpdateDOMasterStatus(dto).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.domaster.StatusID = status;
        this.domaster.StatusName = statusname;
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

  public deletedomaster(param: PURDOMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.DeleteDOMaster(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.showpopup = false;
        this.addnewitem();
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

  //#region thông tin giao hàng
  public domaster: PURDOMasterCusDTO = new PURDOMasterCusDTO();
  private domastercopy: PURDOMasterCusDTO = new PURDOMasterCusDTO();
  public listhead: LSHeadCusDTO[] = [];
  public listsupplier: LSTypeOfPartnerCusDTO[] = [];
  public enumstt = PURDOMasterStatusEnum;
  public isExpand = true;

  public OpenBlock1() {
    this.isExpand = !this.isExpand;
  }

  public checkdisabled(prop: string) {

    if ((prop != 'DO' && this.domaster.Code == 0) ||
      ((this.FPDTO.creator || this.FPDTO.master) && this.domaster.StatusID != PURDOMasterStatusEnum.NEW) ||
      ((this.FPDTO.approver && !this.FPDTO.master) && this.domaster.StatusID == PURDOMasterStatusEnum.NEW && this.domaster.Code != 0) ||
      this.domaster.StatusID == PURDOMasterStatusEnum.OK)
      return true;
    return false;
  }

  public onupdatedate(prop: string, e) {
    const newDate = new Date(e);
    this.domaster[prop] = PSDate.setHours(newDate, 0, 0, 0, 0);
  }

  public onupdatedomaster(prop: string) {

    if (typeof this.domaster[prop] === 'string') {
      this.domaster[prop] = this.domaster[prop]?.trim();
    }

    if ((prop == 'PODate' || prop == 'EstEffDate')) {
      if ((this.domaster[prop] != null && this.domastercopy[prop] == null) ||
        (this.domaster[prop] != null && this.domastercopy[prop] != null && this.domaster[prop].getTime() != this.domastercopy[prop].getTime()))
        this.updatedomaster([prop]);
    }
    else {
      if (this.domaster[prop] != this.domastercopy[prop])
        this.updatedomaster([prop]);
    }
  }

  public originalValue: PURDOMasterCusDTO
  public onFocus(props: string) {
    if (props == 'Remark' && this.domaster['Remark'] == null) {
      return;
    }
    if (props == 'PONo' && this.domaster['PONo'] == null) {
      return;
    }
    this.originalValue = this.domaster[props].trim();
  }

  private getdomaster(p: PURDOMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetDOMaster(p).subscribe((res) => {
      if (res.StatusCode == 0) {
        // thông tin giao hàng
        this.domaster = { ...res.ObjectReturn };
        this.domastercopy = { ...res.ObjectReturn };

        if (!PSObject.isNullOfUndefined(this.domaster.EstEffDate)) {
          this.domaster.EstEffDate = new Date(this.domaster.EstEffDate);
          this.domastercopy.EstEffDate = new Date(this.domastercopy.EstEffDate);
        }
        if (!PSObject.isNullOfUndefined(this.domaster.PODate)) {
          this.domaster.PODate = new Date(this.domaster.PODate);
          this.domastercopy.PODate = new Date(this.domastercopy.PODate);
        }

        //thông tin chi tiết
        this.getlistdodetail(res.ObjectReturn);

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu nhận hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu nhận hàng: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlisthead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead(true).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listhead = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${err.message}`)
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistsupplier() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListSupplier().subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.listsupplier = [...res.ObjectReturn];
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy thông tin nhà cung cấp: ${res.ErrorString}`);
        }
      }, (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin nhà cung cấp: ${err.message}`);
      });
    this.arrUnsubscribe.push(temp);
  }

  private updatedomaster(list: string[]) {
    this.subLoader.loader(true);
    var param: UpdatePropertiesInterface<PURDOMasterCusDTO> = {
      DTO: this.domaster,
      Properties: list
    }

    var temp = this.mtbikeapi.UpdateDOMaster(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.domaster = { ...res.ObjectReturn };
        this.domastercopy = { ...res.ObjectReturn };
        //thông tin giao nhận
        if (!PSObject.isNullOfUndefined(this.domaster.EstEffDate)) {
          this.domaster.EstEffDate = new Date(this.domaster.EstEffDate);
          this.domastercopy.EstEffDate = new Date(this.domastercopy.EstEffDate);
        }
        if (!PSObject.isNullOfUndefined(this.domaster.PODate)) {
          this.domaster.PODate = new Date(this.domaster.PODate);
          this.domastercopy.PODate = new Date(this.domastercopy.PODate);
        }

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

  //#region thông tin chi tiết
  public data: PURDODetailCusDTO[] = [];

  public uploadEventHandler(e: File) {
    this.importdodetail(e);
  }

  public importdodetail(file) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.ImportDODetail(file, this.domaster.Code).subscribe((res) => {
      if (!PSObject.isNullOfUndefined(res) && res.StatusCode == 0) {
        this.getlistdodetail(this.domaster);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`
      );
    });
    this.arrUnsubscribe.push(temp);
  }

  private getlistdodetail(p: PURDOMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListDODetail(p).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.data = res.ObjectReturn;
        this.updatedomaster(['DO'])
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin danh sách xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin danh sách xe: ${err.message}`)
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region drawer
  public listtypedata: LSTypeOfVehicleCusDTO[] = [];
  public listvehicle: LSVehicleCusDTO[] = [];
  public listcolor: LSVehicleColorCusDTO[] = [];
  public actionColumn: ActionColumnDTO[] = [];
  public detailactive: PURDODetailCusDTO = new PURDODetailCusDTO();
  public detailactivecopy: PURDODetailCusDTO = new PURDODetailCusDTO();
  public showpopupdetail: boolean = false;
  public isDrawerOpen = false;
  public actiontype = '';

  public onCreateNew(): void {
    this.detailactive = new PURDODetailCusDTO();
    this.detailactivecopy = new PURDODetailCusDTO();
    this.isDrawerOpen = true;
    this.actiontype = 'edit'
  }

  public onDrawerCollapse(): void {
    this.detailactive = new PURDODetailCusDTO();
    this.detailactivecopy = new PURDODetailCusDTO();
    this.isDrawerOpen = false;
  }

  public ondeletedetail() {
    this.showpopupdetail = true;
  }

  public dropdownvehiclechange(key: string, e) {
    switch (key) {
      case 'type':
        this.detailactive.TypeOfVehicle = e.Code;
        this.ongetvehicle();
        this.detailactive.Vehicle = null
        this.detailactive.Version = '';
        break;
      case 'vehicle':
        this.detailactive.Vehicle = e.Code;
        this.detailactive.Version = e.Version;
        this.detailactive.InsurancePeriod = e.InsurancePeriod;
        this.detailactive.InsuranceTime = e.InsuranceTime;
        this.ongetcolor();
        break;
      case 'color':
        this.detailactive.VehicleColor = e.Code;
        this.detailactive.VehicleImage = e.ImageSetting1;
        break;
    }
    this.detailactive.VehicleColor = null
  }

  private ongetvehicle() {
    let param: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
    param.Code = this.detailactive.TypeOfVehicle;
    this.getlistvehicle(param);
  }

  private ongetcolor() {
    let param: LSVehicleCusDTO = new LSVehicleCusDTO();
    param.Code = this.detailactive.Vehicle;
    param.TypeData = 0;
    this.getlistvehiclecolor(param);
  }

  public onActionClick(e: ActionColumnDTO) {
    this.detailactive = { ...e.data };
    this.detailactivecopy = { ...e.data };
    this.actiontype = e.action as string;

    if (e.action == 'view' || e.action == 'edit') {
      if (this.detailactive.TypeOfVehicle)
        this.ongetvehicle();

      if (this.detailactive.Vehicle)
        this.ongetcolor();

      this.isDrawerOpen = true;
    }
    else if (e.action == 'delete') {
      this.ondeletedetail();
    }
  }

  public onActionColumnFocus(e: PURDODetailCusDTO) {
    this.actionColumn = [];
    //go to detail
    if (this.domaster.StatusID == PURDOMasterStatusEnum.NEW && (FunctionPermissionDTO.master || FunctionPermissionDTO.creator)) {
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
    else {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })
    }
  }

  private getlisttypeofvehicle() {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListTypeOfVehicle().subscribe((res) => {
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
    var temp = this.mtbikeapi.GetListVehicle(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listvehicle = res.ObjectReturn
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
    var temp = this.mtbikeapi.GetListVehicleColor(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listcolor = res.ObjectReturn
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

  public deletedodetail(params: PURDODetailCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.DeleteDODetail(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistdodetail(this.domaster);
        this.showpopupdetail = false;
        this.isDrawerOpen = false;
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

  public updatedodetail(params: PURDODetailCusDTO) {
    if (!this.detailactive.Vehicle)
      return this.notification.onWarning('Chưa có thông tin dòng xe')

    if (!this.detailactive.VehicleColor)
      return this.notification.onWarning('Chưa có thông tin màu xe')

    if (PSString.isNullOrWhitespace(this.detailactive.FrameSeri))
      return this.notification.onWarning('Chưa có thông tin số khung')

    if (PSString.isNullOrWhitespace(this.detailactive.EngineSeri))
      return this.notification.onWarning('Chưa có thông tin số máy')

    var listprop = Object.keys(this.detailactive);
    var ischange = false;
    for (const prop of listprop) {
      if ((typeof this.detailactive[prop] != 'string' && this.detailactive[prop] !== this.detailactivecopy[prop]) ||
        (typeof this.detailactive[prop] == 'string' && this.detailactive[prop].trim() !== this.detailactivecopy[prop].trim())) {
        ischange = true;
      }
    }

    if (!ischange) {
      this.isDrawerOpen = false;
      return;
    }

    this.subLoader.loader(true);
    params.DO = this.domaster.Code;
    var temp = this.mtbikeapi.UpdateDODetail(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistdodetail(this.domaster);
        this.isDrawerOpen = false;
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
