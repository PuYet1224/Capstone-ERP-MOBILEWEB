import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { Subscription } from "rxjs";
import { LSVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle.dto";
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { SelectionEvent } from "@progress/kendo-angular-grid";
import { LSPartCategoryTypeDataEnum } from "src/app/models/enums/e-type/ls-part-category-type-data.enum";
import { LSPartCategoryCusDTO } from "src/app/models/dtos/e-dtos/ls-part-category.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { FileDTO } from "src/app/models/dtos/file.dto";
import { PSString } from "src/app/services/utilities/ps-string";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { PSArray } from "src/app/services/utilities/ps-array";
import { FolderPathEnum } from "src/app/models/enums/folder-path.enum";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { LSVehicleConfigStatus } from "src/app/models/enums/e-status/ls-vehicle-config-status.enum";

@Component({
  selector: 'mtb012-model',
  templateUrl: './mtb012-model.component.html',
  styleUrls: ['./mtb012-model.component.scss'],
})

export class Mtb012ModelComponent implements OnInit, OnDestroy {
  constructor(
    private subLoader: PsLayoutLoaderService,
    private mtbikeapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private coreapi: PSCoreApiService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public perdto = FunctionPermissionDTO;

  ngOnInit(): void {
    //filter
    this.getlisttypeofvehicle();
    this.getlistcolor();

    //list
    this.getlistvehicleconfig(this.filter);

    this.getliststatus();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region header
  public onAddNewColor(e = null): void {
    this.colorupdate = new LSVehicleColorCusDTO();
    this.colorupdate.IsModify = true;

    if (e == null) {
      this.colorupdate.CategoryName = this.vehicle_active.CategoryName;
      this.colorupdate.TypeOfVehicleName = this.vehicle_active.TypeOfVehicleName;
      this.colorupdate.Vehicle = this.vehicle_active.Code;
      this.colorupdate.VehicleName = this.vehicle_active.VehicleName;
    }
    else {
      this.colorupdate.CategoryName = e.CategoryName;
      this.colorupdate.TypeOfVehicleName = e.TypeOfVehicleName;
      this.colorupdate.Vehicle = e.Code;
      this.colorupdate.VehicleName = e.VehicleName;
    }

    this.title = 'THÔNG TIN MÀU XE';
    this.typedrawer = 'color';
    this.isDrawerOpen = true;
  }

  public onAddNewVehicle(): void {
    this.vehicleupdate = new LSVehicleCusDTO();
    this.vehicleupdate.IsModify = true;
    if (this.dataactive == 'type') {
      this.vehicleupdate.CategoryName = this.type_active.CategoryName;
      this.vehicleupdate.TypeOfVehicle = this.type_active.Code;
      this.vehicleupdate.TypeOfVehicleName = this.type_active.TypeOfVehicle;
    }
    if (this.dataactive == 'vehicle') {
      this.vehicleupdate.CategoryName = this.vehicle_active.CategoryName;
      this.vehicleupdate.TypeOfVehicle = this.vehicle_active.TypeOfVehicle;
      this.vehicleupdate.TypeOfVehicleName = this.vehicle_active.TypeOfVehicleName;
    }

    this.title = 'THÔNG TIN LOẠI XE';
    this.typedrawer = 'vehicle';
    this.liststatus = this.liststatuscopy.filter(f => f.TypeOfStatus != LSVehicleConfigStatus.Stop)
    this.isDrawerOpen = true;
  }

  public onAddNewType(): void {
    this.typeupdate = new LSTypeOfVehicleCusDTO();
    this.typeupdate.CategoryName = this.type_active.CategoryName;
    this.typeupdate.Category = this.type_active.Category;
    this.typeupdate.IsModify = true;

    if (!this.hascategory)
      this.getlistpartcategory();

    this.title = 'THÔNG TIN DÒNG XE';
    this.typedrawer = 'type';
    this.liststatus = this.liststatuscopy.filter(f => f.TypeOfStatus != LSVehicleConfigStatus.Stop)
    this.isDrawerOpen = true;
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;
  private listtypedatacopy: LSTypeOfVehicleCusDTO[] = [{ Code: null, TypeOfVehicle: "Không lựa chọn" } as LSTypeOfVehicleCusDTO];
  public listtypedata: LSTypeOfVehicleCusDTO[] = [];
  public typedataactive: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
  private listcolorcopy: string[] = ["Không lựa chọn"];
  public listcolor: string[] = [];
  public coloractive: string = '';
  public isDisabledClear: boolean = true;
  public isDisabledReset: boolean = true;
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filter: State = { filter: this.groupfilter };
  public listfiltertext = ['ID', 'TypeOfVehicleName', 'CategoryName', 'VehicleName', 'Version', 'Engine', 'Cylinder', 'Torque'];
  private lasttextvalue = '';

  public statusFilterClear() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.typedataactive.Code = null;
    this.coloractive = 'Không lựa chọn';
    this.filterTextbox.clear();
    this.handleFilter();
    this.getlistvehicleconfig(this.filter);
  }

  public onReload() {
    this.getlistvehicleconfig(this.filter);
  }

  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.getlistvehicleconfig(this.filter);
      this.lasttextvalue = text;
    }
  }

  private handleFilter(filter: FilterDescriptor[] = null, type: 'text' = null, resetPage = true) {
    //đưa filter về [], kiểm tra loại filter
    this.groupfilter.filters = [];
    if (type == 'text') {
      this.filtertext.filters = filter;
    }

    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần
    if (this.filtertext.filters.length != 0 || (this.typedataactive != null && this.typedataactive.Code != null) ||
      (!PSString.isNullOrWhitespace(this.coloractive) && this.coloractive != 'Không lựa chọn')) {
      this.isDisabledClear = false; //##
      this.isDisabledReset = false;

      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
        this.isDisabledReset = false;
      }
    }
    else {
      this.isDisabledClear = true; //##
      this.isDisabledReset = true; //##
    }
  }

  public dropdownchange(p, e) {
    if (p === 'vehicle')
      this.typedataactive = e;
    else
      this.coloractive = e;

    this.handleFilter();
    this.getlistvehicleconfig(this.filter);
  }

  private getlisttypeofvehicle(): void {
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

  private getlistcolor(): void {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListColor().subscribe((res) => {
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
  //#endregion

  //#region list
  public data: LSTypeOfVehicleCusDTO[] = [];
  public actionColumn: ActionColumnDTO[] = [];
  public actiontype: string = '';

  public onActionClick(e: ActionColumnDTO, p: string) {
    this.actiontype = e.action as string;
    if (e.action == 'view' || e.action == 'edit') {
      if (p == 'type') {
        if (!this.hascategory)
          this.getlistpartcategory();

        this.title = 'THÔNG TIN DÒNG XE';
        this.typedrawer = 'type';
      }

      if (p == 'vehicle') {
        this.title = 'THÔNG TIN LOẠI XE';
        this.typedrawer = 'vehicle';
      }

      if (p == 'type' || p == 'vehicle') {
        if (e.data.Status == LSVehicleConfigStatus.New) {
          this.liststatus = this.liststatuscopy.filter(f => f.TypeOfStatus != LSVehicleConfigStatus.Stop)
        }

        if (e.data.Status != LSVehicleConfigStatus.New) {
          this.liststatus = this.liststatuscopy.filter(f => f.TypeOfStatus != LSVehicleConfigStatus.New)
        }
      }

      this.isDrawerOpen = true;
    }
    else if (e.action == 'delete') {
      this.showpopup = true;
    }
    else if (e.action == 'add_type') {
      this.onAddNewType();
    }
    else if (e.action == 'add_vehicle') {
      this.onAddNewVehicle();
    }
    else if (e.action == 'add_color') {
      this.onAddNewColor();
    }
    else if (e.action == 'type_approved') {
      this.typeupdate.Status = LSVehicleConfigStatus.Approved;
      this.updatetypeofvehicle();
    }
    else if (e.action == 'type_Stop') {
      this.typeupdate.Status = LSVehicleConfigStatus.Stop;
      this.showpopupwarining = true;
    }
    else if (e.action == 'vehicle_approved' || e.action == 'vehicle_stop') {
      this.vehicleupdate.Status = e.action == 'vehicle_stop' ? LSVehicleConfigStatus.Stop : LSVehicleConfigStatus.Approved;
      this.updatevehicle();
    }
  }

  public istypeactive = ({ dataItem, index }): boolean => {
    if (this.dataactive != 'type')
      this.type_active = new LSTypeOfVehicleCusDTO();

    return this.dataactive == 'type' && this.type_active && this.type_active.Code == dataItem.Code;
  }

  public isvehicleactive = ({ dataItem, index }): boolean => {
    if (this.dataactive != 'vehicle')
      this.vehicle_active = new LSVehicleCusDTO();

    return this.dataactive == 'vehicle' && this.vehicle_active && this.vehicle_active.Code == dataItem.Code;
  }

  public ontypeselectionchange(e: SelectionEvent): void {
    if (e.selectedRows.length > 0) {
      this.type_active = this.typeupdate = this.typeupdatecopy = e.selectedRows[0].dataItem;
      this.dataactive = 'type';
    }
    else {
      this.type_active = this.typeupdate = this.typeupdatecopy = new LSTypeOfVehicleCusDTO();
      this.dataactive = null;
    }
  }

  public onvehicleselectionchange(e: SelectionEvent): void {
    if (e.selectedRows.length > 0) {
      this.vehicle_active = this.vehicleupdate = this.vehicleupdatecopy = e.selectedRows[0].dataItem;
      this.dataactive = 'vehicle';
    }
    else {
      this.vehicle_active = this.vehicleupdate = this.vehicleupdatecopy = new LSVehicleCusDTO();
      this.dataactive = null;
    }
  }

  public onActionColumnFocus(e: LSTypeOfVehicleCusDTO | LSVehicleCusDTO | LSVehicleColorCusDTO, t: 'type' | 'vehicle'): void {
    this.actionColumn = [];

    // if (e.IsModify == false)
    //   this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })
    // else
    //   this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
    this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });

    switch (t) {
      case 'type':
        this.typeupdate = { ...e } as LSTypeOfVehicleCusDTO;
        this.typeupdatecopy = { ...this.typeupdate };
        this.type_active = { ...this.typeupdate };

        if (this.typeupdate.Status != LSVehicleConfigStatus.Stop) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'bike_scooter', text: 'Thêm mới dòng xe', action: 'add_type' });
          this.actionColumn.push({ icon: 'motorcycle', text: 'Thêm mới loại xe', action: 'add_vehicle' });
        }

        if (this.typeupdate.Status == LSVehicleConfigStatus.New || this.typeupdate.Status == LSVehicleConfigStatus.Stop) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'check_circle', text: 'Đưa vào kinh doanh', action: 'type_approved' });
        }
        if (this.typeupdate.Status == LSVehicleConfigStatus.Approved) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'cancel', text: 'Ngừng kinh doanh', action: 'type_Stop' });
        }
        break;

      case 'vehicle':
        this.vehicleupdate = { ...e } as LSVehicleCusDTO;
        this.vehicleupdatecopy = { ...this.vehicleupdate };
        this.vehicle_active = { ...this.vehicleupdate };

        if (this.vehicleupdate.Status != LSVehicleConfigStatus.Stop && this.vehicleupdate.TypeOfVehicleStatus != LSVehicleConfigStatus.Stop) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'motorcycle', text: 'Thêm mới loại xe', action: 'add_vehicle' });
          this.actionColumn.push({ icon: 'colors', text: 'Thêm mới màu xe', action: 'add_color' });
        }

        if ((this.vehicleupdate.Status == LSVehicleConfigStatus.New || this.vehicleupdate.Status == LSVehicleConfigStatus.Stop) && this.vehicleupdate.TypeOfVehicleStatus != LSVehicleConfigStatus.Stop) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'check_circle', text: 'Đưa vào kinh doanh', action: 'vehicle_approved' });
        }
        if (this.vehicleupdate.Status == LSVehicleConfigStatus.Approved) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'cancel', text: 'Ngừng kinh doanh', action: 'vehicle_stop' });
        }
        break;
    }

    if (e.IsModify == true) {
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
    this.dataactive = t
  }

  public getlistvehicleconfig(filter: State): void {
    this.subLoader.loader(true);
    var typeofvehicle = null
    if (this.typedataactive && this.typedataactive.Code && this.typedataactive.Code != 0)
      typeofvehicle = this.typedataactive.Code;

    var colorname = null;
    if (!PSString.isNullOrWhitespace(this.coloractive) && this.coloractive != 'Không lựa chọn')
      colorname = this.coloractive;

    var temp = this.mtbikeapi.GetListVehicleConfig(filter, typeofvehicle, colorname).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.data = res.ObjectReturn;
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

  //#region drawer
  public title: string = '';
  public isDrawerOpen: boolean = false;

  public type_active: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
  public typeupdate: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
  public typeupdatecopy: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();

  public vehicle_active: LSVehicleCusDTO = new LSVehicleCusDTO();
  public vehicleupdate: LSVehicleCusDTO = new LSVehicleCusDTO();
  public vehicleupdatecopy: LSVehicleCusDTO = new LSVehicleCusDTO();

  public color_active: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public colorupdate: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public colorupdatecopy: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();

  public hascategory: boolean = false;
  public listcatrgory: LSPartCategoryCusDTO[] = [];
  public dataactive: 'type' | 'vehicle' | 'color' = null;
  public isOpen: boolean = false;
  public typedrawer: 'type' | 'vehicle' | 'color';

  public liststatus: LSStatusCusDTO[] = [];
  public liststatuscopy: LSStatusCusDTO[] = [];

  public enumstt = LSVehicleConfigStatus;
  public showpopupwarining: boolean = false;

  public onupdate(type: 'type' | 'vehicle' | 'color'): void {
    switch (type) {
      case 'type':
        if (PSString.isNullOrWhitespace(this.typeupdate.ID)) {
          this.notification.onWarning('Chưa có thông tin mã dòng xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.typeupdate.TypeOfVehicle)) {
          this.notification.onWarning('Chưa có thông tin tên dòng xe');
          return;
        }

        if (!this.typeupdate.Category) {
          this.notification.onWarning('Chưa có thông tin phân nhóm xe');
          return;
        }

        var listprop = Object.keys(this.typeupdate);
        var ischange = listprop.some(prop => this.typeupdate[prop] !== this.typeupdatecopy[prop]);
        if (ischange) {
          if (this.typeupdate.Status != this.typeupdatecopy.Status && this.typeupdate.Status == this.enumstt.Stop) {
            this.showpopupwarining = true;
          }
          else
            this.updatetypeofvehicle();
        }
        break;

      case 'vehicle':
        if (PSString.isNullOrWhitespace(this.vehicleupdate.ID)) {
          this.notification.onWarning('Chưa có thông tin mã loại xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.vehicleupdate.VehicleName)) {
          this.notification.onWarning('Chưa có thông tin tên loại xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.vehicleupdate.Version)) {
          this.notification.onWarning('Chưa có thông tin đời xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.vehicleupdate.Engine)) {
          this.notification.onWarning('Chưa có thông tin động cơ xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.vehicleupdate.Cylinder)) {
          this.notification.onWarning('Chưa có thông tin dung tích xi lanh xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.vehicleupdate.Torque)) {
          this.notification.onWarning('Chưa có thông tin mô-men xoắn');
          return;
        }

        if (!this.vehicleupdate.InsuranceTime) {
          this.notification.onWarning('Chưa có thông tin thời gian bảo hành');
          return;
        }

        if (!this.vehicleupdate.InsuranceKM) {
          this.notification.onWarning('Chưa có thông tin số kilometer bảo hành');
          return;
        }

        if (!this.vehicleupdate.InsurancePeriod) {
          this.notification.onWarning('Chưa có thông tin số lần bảo hành');
          return;
        }

        var listprop = Object.keys(this.vehicleupdate);
        var ischange = listprop.some(prop => this.vehicleupdate[prop] !== this.vehicleupdatecopy[prop]);
        if (ischange)
          this.updatevehicle();

        break;

      case 'color':
        if (PSString.isNullOrWhitespace(this.colorupdate.ID)) {
          this.notification.onWarning('Chưa có thông tin mã màu xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.colorupdate.ColorName)) {
          this.notification.onWarning('Chưa có thông tin tên màu xe');
          return;
        }

        if (PSString.isNullOrWhitespace(this.colorupdate.ColorCode)) {
          this.notification.onWarning('Chưa có thông tin hình ảnh màu hiển thị trên website');
          return;
        }

        if (!this.colorupdate.Price || this.colorupdate.Price <= 0) {
          this.notification.onWarning('Chưa có thông tin giá tham khảo');
          return;
        }

        if (PSString.isNullOrWhitespace(this.colorupdate.ImageSetting1)) {
          this.notification.onWarning('Chưa có thông tin hình ảnh đại diện');
          return;
        }

        if (!this.colorupdate.AmountPaid || this.colorupdate.AmountPaid == 0) {
          this.notification.onWarning('Chưa có thông tin tiền cọc');
          return;
        }

        var listprop = Object.keys(this.colorupdate);
        var ischange = listprop.some(prop => this.colorupdate[prop] !== this.colorupdatecopy[prop]);
        if (ischange)
          this.updatevehiclecolor();
        break;
    }
  }

  public ondrawercollapse(e): void {
    this.isDrawerOpen = e;
  }

  public getlistpartcategory() {
    var filter: State = { filter: { logic: 'and', filters: [{ field: 'TypeData', operator: 'eq', value: LSPartCategoryTypeDataEnum.VEHICLE }] } };
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListPartCategory(filter).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listcatrgory = res.ObjectReturn.Data;
        this.hascategory = true;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phán nhóm xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phán nhóm xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  public updatetypeofvehicle() {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateTypeOfVehicle(this.typeupdate).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistvehicleconfig(this.filter);
        this.isDrawerOpen = false;
        this.showpopupwarining = false;
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

  public updatevehicle() {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateVehicle(this.vehicleupdate).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistvehicleconfig(this.filter);
        this.isDrawerOpen = false;
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

  public updatevehiclecolor() {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateVehicleColor(this.colorupdate).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistvehicleconfig(this.filter);
        this.isDrawerOpen = false;
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

  private getliststatus() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListStatus(LSStatusTypeDataEnum.VEHICLECONFIG).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.liststatus = res.ObjectReturn;
        this.liststatuscopy = [...res.ObjectReturn]
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

  //#region popup
  public showpopup: boolean = false;

  public onviewcolor(e) {
    this.dataactive = 'color';
    this.actiontype = 'view'
    this.color_active = { ...e }
    this.colorupdate = { ...e };
    this.colorupdatecopy = { ...e }
    this.title = 'THÔNG TIN MÀU XE';
    this.typedrawer = 'color';
    this.isDrawerOpen = true;
  }

  public oneditcolor(e) {
    this.dataactive = 'color';
    this.color_active = { ...e }
    this.colorupdate = { ...e };
    this.colorupdatecopy = { ...e }
    this.title = 'THÔNG TIN MÀU XE';
    this.typedrawer = 'color';
    this.isDrawerOpen = true;
  }

  public onclickdeletecolor(e) {
    this.dataactive = 'color';
    this.color_active = e
    this.colorupdate = e;
    this.showpopup = true;
  }

  public onpopupconfirmdelete(): void {
    this.subLoader.loader(true);
    var apiname: string;
    var param: any[] = [];
    if (this.dataactive === 'type') {
      apiname = 'DeleteTypeOfVehicle';
      param = [this.typeupdate];
    }
    else if (this.dataactive === 'vehicle') {
      apiname = 'DeleteVehicle';
      param = [this.vehicleupdate];
    }
    else {
      apiname = 'DeleteVehicleColor';
      param = [this.colorupdate];
    }

    var temp = this.mtbikeapi[apiname](param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.showpopup = false;
        if (this.dataactive === 'type')
          this.type_active = this.typeupdate = this.typeupdatecopy = new LSTypeOfVehicleCusDTO();
        else if (this.dataactive === 'vehicle')
          this.vehicle_active = this.vehicleupdate = this.vehicleupdatecopy = new LSVehicleCusDTO();
        else
          this.color_active = this.colorupdate = this.colorupdatecopy = new LSVehicleColorCusDTO();
        this.dataactive = null;
        this.getlistvehicleconfig(this.filter);
        this.isDrawerOpen = false;
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

  //#region popup upload
  public listimage: FileDTO[];
  public uploadtype: string = '';
  public isImageHeight: boolean = false;
  public isCodeHeight: boolean = false;
  public key = FolderPathEnum;

  onOpen(type: string) {
    this.uploadtype = type;
    if (type === 'code')
      this.getlistimage('GetListVehicleColorCodeImage');
    if (type === 'image')
      this.getlistimage('GetListVehicleSettingImage');

    this.isOpen = true;
  }

  onFileChosen(file: FileDTO) {
    if (this.uploadtype === 'code') {
      this.colorupdate.ColorCode = file.Path;
      this.isCodeHeight = file.Height > file.Width
    }
    if (this.uploadtype === 'image') {
      this.colorupdate.ImageSetting1 = file.Path;
      this.isImageHeight = file.Height > file.Width
    }
    this.isOpen = false;
  }

  public onFileChange() {
    if (this.uploadtype === 'code')
      this.getlistimage('GetListVehicleColorCodeImage');
    if (this.uploadtype === 'image')
      this.getlistimage('GetListVehicleSettingImage');
  }

  private getlistimage(p: string) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi[p]().subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.listimage = res.ObjectReturn;
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
