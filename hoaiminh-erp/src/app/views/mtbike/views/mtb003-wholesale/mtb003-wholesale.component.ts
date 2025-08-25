import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { LSTypeOfVehicleCusDTO } from "../../../../models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "../../../../models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "../../../../models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { SALOrderMasterStatusEnum } from "src/app/models/enums/e-status/sal-order-master-status.enum";
import { PSArray } from "src/app/services/utilities/ps-array";
import { PSObject } from "src/app/services/utilities/ps-object";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { SALOrderMasterCusDTO } from "../../../../models/dtos/e-dtos/sal-order-master.dto";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { LSListTypeOfListEnum } from "src/app/models/enums/e-type/ls-list-type-of-list.enum";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { SALOrderMasterTypeDataEnum } from "src/app/models/enums/e-type/sal-order-master-type-data.enum";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";

@Component({
  selector: 'mtb003-wholesale',
  templateUrl: './mtb003-wholesale.component.html',
  styleUrls: ['./mtb003-wholesale.component.scss'],
})

export class Mtb003WholesaleComponent implements OnInit, OnDestroy {
  constructor(
    private subLoader: PsLayoutLoaderService,
    private mtbikeapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private cache: PSCache,
    private router: Router,
    private route: ActivatedRoute,
    private psConfig: PSGetConfigService,
    private header: PSHeaderService,
    private coreapi: PSCoreApiService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit() {
    this.getlisttypeofvehicle();
    this.getlistlslist();
    this.getliststatus();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.getlistsomaster(this.filter);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region  header
  public addnewitem() {
    this.cache.setItem(KeyLocalStorageEnum.WHOLESALE, new SALOrderDetailCusDTO());
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;
  private fTypeData: FilterDescriptor = {
    field: 'TypeData',
    operator: 'eq',
    value: SALOrderMasterTypeDataEnum.WHOLESALE
  };
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
  private groupfilter: CompositeFilterDescriptor = { filters: [this.fTypeData], logic: 'and' };
  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25, sort: [{ field: 'Code', dir: 'desc' }] };
  private fpaymentmethod: FilterDescriptor = { field: 'PaymentMethod', operator: 'eq' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;
  public listfiltertext = ['ID', 'PartnerName', 'PartnerFullAddress', 'PartnerPhone'];
  private lasttextvalue = '';
  public FunctionPermissionDTO = FunctionPermissionDTO;

  private handleFilter(filter: FilterDescriptor[] = null, type: 'text' | 'status' | null = null, resetPage = true) {
    //nếu tìm kiếm thì reset page lại là 1
    if (resetPage) {
      this.filter.skip = 0;
      this.skip = 0;
    }
    //đưa filter về [], kiểm tra loại filter
    this.groupfilter.filters = [this.fTypeData];
    if (type == 'status') {
      this.filterstatus.filters = filter;
    }
    if (type == 'text') {
      this.filtertext.filters = filter;
    }
    // if (!PSObject.isNullOfUndefined(this.typedataactive.Code) && this.typedataactive.Code != 0)
    //   this.groupfilter.filters.push(this.ftypeofvehicle)
    // if (!PSObject.isNullOfUndefined(this.vehicleactive.Code) && this.vehicleactive.Code != 0)
    //   this.groupfilter.filters.push(this.fvehicle)
    // if (!PSObject.isNullOfUndefined(this.coloractive.Code) && this.coloractive.Code != 0)
    //   this.groupfilter.filters.push(this.fcolor)
    if (!PSObject.isNullOfUndefined(this.paymentmethodactive.TypeOfList) && this.paymentmethodactive.TypeOfList != 0)
      this.groupfilter.filters.push(this.fpaymentmethod)
    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần

    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0 ||
      this.typedataactive.Code != null || this.fpaymentmethod.value != null) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(f => f.value);
        let listmap = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY]
        if (PSArray.areEqual(listfilter, listmap) && this.filtertext.filters.length == 0 &&
          this.typedataactive.Code == null && this.fpaymentmethod.value == null) {
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
      this.getlistsomaster(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterClear() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.typedataactive = this.listtypedata[0];
    this.typedataactive.Code = null;
    this.vehicleactive.Code = null;
    this.coloractive.Code = null;
    this.paymentmethodactive = this.listpaymentmethod[0];
    this.fpaymentmethod.value = null
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({ ...item, IsActive: false }));
  }

  public statusFilterReset() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.typedataactive = this.listtypedata[0];
    this.vehicleactive.Code = null;
    this.coloractive.Code = null;
    this.paymentmethodactive = this.listpaymentmethod[0];
    this.fpaymentmethod.value = null
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({
      ...item, IsActive: item.IsActive = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY].includes(item.TypeOfStatus)
    }));
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getlistsomaster(this.filter);
  }

  public dropdownvehiclechange(key: string, e) {
    switch (key) {
      case 'type':
        this.typedataactive = e;
        if (e.Code == null)
          this.resetValueVehicle();
        else {
          this.getlistvehicle(this.typedataactive);
          // this.ftypeofvehicle.value = e.Code;
        }
        break;
      case 'vehicle':
        this.vehicleactive = e;
        if (e.Code == null)
          this.resetValueColor();
        else {
          this.getlistvehiclecolor(this.vehicleactive);
          // this.fvehicle.value = e.Code;
        }
        break;
      case 'color':
        this.coloractive = e;
        // this.fcolor.value = e.Code;
        break;
      case 'method':
        this.paymentmethodactive = e;
        this.fpaymentmethod.value = e.TypeOfList;
        break;
    }
    this.handleFilter();
    this.getlistsomaster(this.filter);
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
    this.getlistsomaster(this.filter);
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
        this.liststatus = this.liststatus.filter(x => x.TypeOfStatus != SALOrderMasterStatusEnum.WATITINGREGISTER)
        this.liststatus.forEach(item => {
          item.IsActive = [SALOrderMasterStatusEnum.NEW, SALOrderMasterStatusEnum.WATITINGDELIVERY].includes(item.TypeOfStatus);
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
      TypeData: SALOrderMasterTypeDataEnum.WHOLESALE,
      Status: detail.MasterStatus
    } as SALOrderMasterCusDTO;

    if (e.action == 'view' || e.action == 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.WHOLESALE, e.data);
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
          this.actionColumn.push({ icon: 'payments', text: e.PaymentMethod == LSListTypeOfListEnum.LUMPSUM ? 'Đã thanh toán' : 'Nhận cọc', action: SALOrderMasterStatusEnum.WATITINGDELIVERY });
          this.actionColumn.push({ icon: 'cancel', text: 'Huỷ', action: SALOrderMasterStatusEnum.CANCLE });
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
    this.getlistsomaster(this.filter);
  }

  private getlistsomaster(filter: State) {
    this.subLoader.loader(true);
    this.mtbikeapi.GetListSOMaster(filter, this.typedataactive.Code, this.vehicleactive.Code, this.coloractive.Code).subscribe(res => {
      if (res.StatusCode === 0) {
        const mapped = res.ObjectReturn.Data.map((item: any) => {
          const dto = Object.assign(new SALOrderDetailCusDTO(), item);
          dto.MasterStatus = item.Status;
          dto.Master = item.Code;
          return dto;
        });
        this.data.next({
          data: mapped,
          total: res.ObjectReturn.Total
        });
      }
      this.subLoader.loader(false);
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu bán sỉ: ${err.message}`);
    });
  }


  public deletemaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.DeleteSOMaster([param]).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.showpopup = false;
        this.getlistsomaster(this.filter);
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
        this.getlistsomaster(this.filter);
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
