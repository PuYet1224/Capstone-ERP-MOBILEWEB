import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { LSTypeOfVehicleCusDTO } from "../../../../models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "../../../../models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "../../../../models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { SALOrderMasterStatusEnum } from "src/app/models/enums/e-status/sal-order-master-status.enum";
import { PSArray } from "src/app/services/utilities/ps-array";
import { PSObject } from "src/app/services/utilities/ps-object";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { LSListTypeOfListEnum } from "src/app/models/enums/e-type/ls-list-type-of-list.enum";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { SALOrderMasterTypeDataEnum } from "src/app/models/enums/e-type/sal-order-master-type-data.enum";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";

@Component({
  selector: 'mtb001-retail',
  templateUrl: './mtb001-retail.component.html',
  styleUrls: ['./mtb001-retail.component.scss'],
})

export class Mtb001RetailComponent implements OnInit, OnDestroy {
  constructor(
    private subLoader: PsLayoutLoaderService,
    private mtbikeapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private cache: PSCache,
    private router: Router,
    private route: ActivatedRoute,
    private coreapi: PSCoreApiService,
    private psConfig: PSGetConfigService,
    private header: PSHeaderService
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit() {
    this.getlisttypeofvehicle();
    this.getlistlslist();
    this.getliststatus();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.getlistretail(this.filter);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach(f => { f.unsubscribe(); });
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region  header
  public addnewitem() {
    this.cache.setItem(KeyLocalStorageEnum.RETAIL, new SALOrderDetailCusDTO());
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;
  private listtypedatacopy: LSTypeOfVehicleCusDTO[] = [{ Code: null, TypeOfVehicle: "Không lựa chọn" } as LSTypeOfVehicleCusDTO];
  public listtypedata: LSTypeOfVehicleCusDTO[] = [];
  public typedataactive: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
  private listvehiclecopy: LSVehicleCusDTO[] = [{ Code: null, VehicleName: "Không lựa chọn" } as LSVehicleCusDTO];
  public listvehicle: LSVehicleCusDTO[] = [...this.listvehiclecopy];
  public vehicleactive: LSVehicleCusDTO = new LSVehicleCusDTO();
  private listcolorcopy: LSVehicleColorCusDTO[] = [{ Code: null, ColorName: "Không lựa chọn" } as LSVehicleColorCusDTO];
  public listcolor: LSVehicleColorCusDTO[] = [...this.listcolorcopy];
  public coloractive: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public listpaymentmethodcopy: ListDTO[] = [{ TypeOfList: null, ListName: "Không lựa chọn" } as ListDTO];
  public listpaymentmethod: ListDTO[] = [];
  public paymentmethodactive: ListDTO = new ListDTO();
  public liststatus: LSStatusCusDTO[] = [];
  public statusactive: LSStatusCusDTO = new LSStatusCusDTO();
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25, sort: [{ field: 'Code', dir: 'desc' }] };
  private ftypeofvehicle: FilterDescriptor = { field: 'TypeOfVehicle', operator: 'eq' };
  private fvehicle: FilterDescriptor = { field: 'Vehicle', operator: 'eq' };
  private fcolor: FilterDescriptor = { field: 'VehicleColor', operator: 'eq' };
  private fpaymentmethod: FilterDescriptor = { field: 'PaymentMethod', operator: 'eq' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;
  public listfiltertext = ['TypeOfVehicleName', 'VehicleName', 'VehicleColorName', 'FrameSeri', 'EngineSeri', 'PlateNo', 'ID', 'CustomerName', 'Address', 'Phone', 'SaleStaffName', 'RegisterStaffName', 'TechnicalStaffName'];
  private lasttextvalue = '';
  public FunctionPermissionDTO = FunctionPermissionDTO;

  private handleFilter(filter: FilterDescriptor[] = null, type: 'text' | 'status' | null = null, resetPage = true) {
    //nếu tìm kiếm thì reset page lại là 1
    if (resetPage) {
      this.filter.skip = 0;
      this.skip = 0;
    }
    //đưa filter về [], kiểm tra loại filter
    this.groupfilter.filters = [];
    if (type == 'status') {
      this.filterstatus.filters = filter;
    }
    if (type == 'text') {
      this.filtertext.filters = filter;
    }
    if (!PSObject.isNullOfUndefined(this.typedataactive.Code) && this.typedataactive.Code != 0)
      this.groupfilter.filters.push(this.ftypeofvehicle)
    if (!PSObject.isNullOfUndefined(this.vehicleactive.Code) && this.vehicleactive.Code != 0)
      this.groupfilter.filters.push(this.fvehicle)
    if (!PSObject.isNullOfUndefined(this.coloractive.Code) && this.coloractive.Code != 0)
      this.groupfilter.filters.push(this.fcolor)
    if (!PSObject.isNullOfUndefined(this.paymentmethodactive.TypeOfList) && this.paymentmethodactive.TypeOfList != 0)
      this.groupfilter.filters.push(this.fpaymentmethod)
    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần

    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0 ||
      this.ftypeofvehicle.value != null || this.fpaymentmethod.value != null) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(f => f.value);
        let listmap = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY, SALOrderMasterStatusEnum.WATITINGREGISTER]
        if (PSArray.areEqual(listfilter, listmap) && this.filtertext.filters.length == 0 &&
          this.ftypeofvehicle.value == null && this.fpaymentmethod.value == null) {
          this.isDisabledReset = true;
        }
        else
          this.isDisabledReset = false;
      }

      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
        this.isDisabledReset = false;
      }
    }
    else {
      this.isDisabledClear = true; //##
      this.isDisabledReset = false; //##
    }
  }

  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.getlistretail(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterClear() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.typedataactive = this.listtypedata[0];
    this.ftypeofvehicle.value = null;
    this.vehicleactive.Code = null;
    this.fvehicle.value = null
    this.coloractive.Code = null;
    this.fcolor.value = null;
    this.paymentmethodactive = this.listpaymentmethod[0];
    this.fpaymentmethod.value = null
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({ ...item, IsActive: false }));
  }

  public statusFilterReset() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.typedataactive = this.listtypedata[0];
    this.ftypeofvehicle.value = null;
    this.vehicleactive.Code = null;
    this.fvehicle.value = null
    this.coloractive.Code = null;
    this.fcolor.value = null;
    this.paymentmethodactive = this.listpaymentmethod[0];
    this.fpaymentmethod.value = null
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({
      ...item, IsActive: item.IsActive = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY, SALOrderMasterStatusEnum.WATITINGREGISTER].includes(item.TypeOfStatus)
    }));
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getlistretail(this.filter);
  }

  public dropdownvehiclechange(key: string, e) {
    switch (key) {
      case 'type':
        this.typedataactive = e;
        if (e.Code == null)
          this.resetValueVehicle();
        else {
          this.getlistvehicle(this.typedataactive);
          this.ftypeofvehicle.value = e.Code;
        }
        break;
      case 'vehicle':
        this.vehicleactive = e;
        if (e.Code == null)
          this.resetValueColor();
        else {
          this.getlistvehiclecolor(this.vehicleactive);
          this.fvehicle.value = e.Code;
        }
        break;
      case 'color':
        this.coloractive = e;
        this.fcolor.value = e.Code;
        break;
      case 'method':
        this.paymentmethodactive = e;
        this.fpaymentmethod.value = e.TypeOfList;
        break;
    }
    this.handleFilter();
    this.getlistretail(this.filter);
  }

  private resetValueColor() {
    this.listcolor = [...this.listcolorcopy];
    this.coloractive = this.listcolor[0];
  }

  private resetValueVehicle() {
    this.listvehicle = [...this.listvehiclecopy];
    this.vehicleactive = this.listvehicle[0];
    this.resetValueColor();
  }

  public onReload() {
    this.getlistretail(this.filter);
  }

  private getlisttypeofvehicle() {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListTypeOfVehicle().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listtypedata = [...this.listtypedatacopy];
        this.listtypedata.push(...res.ObjectReturn);
        this.typedataactive = this.listtypedata[0];
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

  private getlistvehicle(params: LSTypeOfVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListVehicle(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listvehicle = [...this.listvehiclecopy];
        this.listvehicle.push(...res.ObjectReturn);
        this.vehicleactive = this.listvehicle[0];
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
        this.listcolor = [...this.listcolorcopy];
        this.listcolor.push(...res.ObjectReturn);
        this.coloractive = this.listcolor[0];
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

  private getlistlslist() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListLSList(LSListTypeDataEnum.PaymentMethod).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listpaymentmethod = [...this.listpaymentmethodcopy]
        this.listpaymentmethod.push(...res.ObjectReturn);
        this.paymentmethodactive = this.listpaymentmethod[0];
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

  private getliststatus() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListStatus(LSStatusTypeDataEnum.SALE).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.liststatus = res.ObjectReturn;
        this.liststatus.forEach(item => {
          item.IsActive = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY, SALOrderMasterStatusEnum.WATITINGREGISTER].includes(item.TypeOfStatus);
        });
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách trạng thái: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách trạng thái: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];
  public skip = 0;
  public itemAction: SALOrderMasterCusDTO | null = new SALOrderMasterCusDTO();
  public showpopup: boolean = false;
  private head = this.psConfig.GetHead();

  public cast(d): SALOrderDetailCusDTO {
    return d;
  }

  public onActionClick(e: ActionColumnDTO) {
    var detail = e.data as SALOrderDetailCusDTO;
    this.itemAction = {
      Code: detail.Master,
      ID: detail.ID,
      HeadOut: this.head.Head,
      TypeData: SALOrderMasterTypeDataEnum.RETAIL,
      Status: detail.MasterStatus
    } as SALOrderMasterCusDTO;

    if (e.action == 'view' || e.action == 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.RETAIL, e.data);
      this.router.navigate(['detail'], { relativeTo: this.route });
    }
    else if (e.action == 'delete') {
      this.showpopup = true;
    }
    if (typeof (e.action) == 'number') {
      this.updatesomasterstatus(e.action);
    }
  }

  public onActionColumnFocus(e: SALOrderDetailCusDTO) {
    this.actionColumn = [];
    //go to detail
    if (e.MasterStatus == SALOrderMasterStatusEnum.NEW && (FunctionPermissionDTO.master || FunctionPermissionDTO.creator))
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
    else
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })

    //action status
    switch (e.MasterStatus) {
      case SALOrderMasterStatusEnum.NEW:
        if ((FunctionPermissionDTO.master || FunctionPermissionDTO.creator)) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'payments', text: e.PaymentMethod == LSListTypeOfListEnum.LUMPSUM ? 'Đã đặt cọc' : 'Nhận cọc', action: SALOrderMasterStatusEnum.WATITINGDELIVERY });
          this.actionColumn.push({ icon: 'cancel', text: 'Huỷ', action: SALOrderMasterStatusEnum.CANCLE });
        }
        break;
      case SALOrderMasterStatusEnum.WATITINGDELIVERY:
        if ((FunctionPermissionDTO.master || FunctionPermissionDTO.approver)) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'bike_lane', text: 'Đã giao xe', action: SALOrderMasterStatusEnum.WATITINGREGISTER });
        }
        break;
      case SALOrderMasterStatusEnum.WATITINGREGISTER:
        if ((FunctionPermissionDTO.master || FunctionPermissionDTO.approver)) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'done_all', text: 'Hoàn tất', action: SALOrderMasterStatusEnum.OK });
        }
        break;
      default:
        break;
    }

    //action
    if (e.MasterStatus == SALOrderMasterStatusEnum.NEW && (FunctionPermissionDTO.master || FunctionPermissionDTO.creator)) {
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getlistretail(this.filter);
  }

  private getlistretail(filter: State) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListRetail(filter).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.data.next({
          data: res.ObjectReturn.Data,
          total: res.ObjectReturn.Total,
        });
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phiếu bán lẻ: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu bán lẻ: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  public deletesomaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.DeleteSOMaster([param]).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.showpopup = false;
        this.getlistretail(this.filter);
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

  public updatesomasterstatus(status: number) {
    this.subLoader.loader(true);
    var dto: UpdateStatusInterface<SALOrderMasterCusDTO> = {
      ListDTO: [this.itemAction],
      Status: status
    }

    var temp = this.mtbikeapi.UpdateSOMasterStatus(dto).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.getlistretail(this.filter);
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
