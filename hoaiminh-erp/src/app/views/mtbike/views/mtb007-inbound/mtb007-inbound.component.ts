import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { Subject, Subscription } from "rxjs";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { PSArray } from "src/app/services/utilities/ps-array";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { WHIOMasterTypeOfMasterConfig, WHIOMasterTypeOfMasterEnum } from "src/app/models/enums/e-type/wh-io-master-type-of-master.enum";
import { WHIOMasterVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-master-vehicle.dto";
import { WHIOMasterStatusEnum } from "src/app/models/enums/e-status/wh-io-master-status.enum";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";

@Component({
  selector: 'mtb007-inbound',
  templateUrl: './mtb007-inbound.component.html',
  styleUrls: ['./mtb007-inbound.component.scss'],
})

export class Mtb007InboundComponent implements OnInit, OnDestroy {
  public whStatus = WHIOMasterStatusEnum;

  constructor(
    private subLoader: PsLayoutLoaderService,
    private mtbikeapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
    private coreapi: PSCoreApiService,
    private cache: PSCache,
    private router: Router,
    private route: ActivatedRoute,
    private header: PSHeaderService
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public selectedTypeId: number = WHIOMasterTypeOfMasterEnum.Internal;
  public textvalue: string = ''
  // Biến cờ kiểm soát việc gọi filter
  private isLoadingData = false;

  ngOnInit(): void {
    this.getliststatus();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.GetListIOMasterVehicle(this.filter);
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

  public typeMasterList = [
    ...Object.values(WHIOMasterTypeOfMasterConfig).filter(x => x.active && (x.id == WHIOMasterTypeOfMasterEnum.Internal || x.id == WHIOMasterTypeOfMasterEnum.Supplier))
  ];

  //#region header
  public addnewitem() {
    this.cache.setItem(KeyLocalStorageEnum.INBOUND, new WHIOMasterVehicleCusDTO());
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  public inboundTypeList = Object.values(WHIOMasterTypeOfMasterConfig)
    .filter(k => k.id != WHIOMasterTypeOfMasterEnum.AfterStock && k.id != WHIOMasterTypeOfMasterEnum.Other)

  public createInbound(item: { id: number | null }): void {
    if (item?.id == null) { return; }
    const dto = new WHIOMasterVehicleCusDTO();
    dto.TypeOfMaster = item.id as WHIOMasterTypeOfMasterEnum;
    this.cache.setItem(KeyLocalStorageEnum.INBOUND, dto);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  public WHIOMasterTypeOfMasterEnum = WHIOMasterTypeOfMasterEnum;
  public listheadcopy: LSHeadCusDTO[] = [{ Code: null, BriefName: 'Không lựa chọn' } as LSHeadCusDTO];
  public listhead: LSHeadCusDTO[] = [];
  public headactive: LSHeadCusDTO = new LSHeadCusDTO();
  public liststatus: LSStatusCusDTO[] = [];
  public listfiltertext = ['DocumentID', 'OutWHName', 'InWHName', 'Remark'];
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25, sort: [{ field: 'Code', dir: 'desc' }] };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private typeofmasterFilter: FilterDescriptor = { field: 'TypeOfMaster', operator: 'eq' };
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;

  // Tải lại dữ liệu với bộ lọc hiện tại
  public onReload() {
    if (!this.isLoadingData) {
      // this.executeFilter();
    }
  }

  // Reset bộ lọc trạng thái
  public statusFilterReset() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.selectedTypeId = WHIOMasterTypeOfMasterEnum.Internal;
    this.headactive = this.listhead[0];
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({
      ...item, IsActive: [
        WHIOMasterStatusEnum.NEW,
        WHIOMasterStatusEnum.SENT,
        WHIOMasterStatusEnum.RECEIVING
      ].includes(item.TypeOfStatus)
    }));
    this.getliststatus();
    if (!this.isLoadingData) {
      this.executeFilter();
    }
  }

  // Xoá bộ lọc trạng thái
  public statusFilterClear() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.headactive = this.listhead[0];
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({ ...item, IsActive: false }));
    if (!this.isLoadingData) {
      this.executeFilter();
    }
  }

  // Thay đổi bộ lọc trạng thái
  public statusFilterChange(e) {
    if (!this.isLoadingData) {
      this.executeFilter(e, 'status');
    }
  }

  // Thay đổi bộ lọc cửa hàng
  public onStoreChange(e) {
    this.headactive = e;
    if (!this.isLoadingData) {
      this.executeFilter();
    }
  }

  // Thực hiện filter thực sự
  private executeFilter(filter: FilterDescriptor[] = null, type: 'text' | 'status' | null = null, resetPage = true) {
    if (resetPage) {
      this.filter.skip = 0;
      this.skip = 0;
    }
    this.groupfilter.filters = [];
    if (type == 'status') {
      this.filterstatus.filters = filter;
    }
    if (type == 'text') {
      this.filtertext.filters = filter;
    }


    // Thêm filter trạng thái/text 
    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0) {
      this.isDisabledClear = false;
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus);
        this.isDisabledReset = [1, 2, 4].every(status =>
          this.filterstatus.filters.some(f => 'value' in f && (f as FilterDescriptor).value === status) && this.selectedTypeId == WHIOMasterTypeOfMasterEnum.Internal && this.filterstatus.filters.length == 3
        );
      }
      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
        this.isDisabledReset = false;
      }
    } else {
      this.isDisabledClear = true;
      this.isDisabledReset = false;
    }
    // Luôn thêm filter loại phiếu
    this.typeofmasterFilter.value = this.selectedTypeId;
    this.groupfilter.filters.push(this.typeofmasterFilter);

    // Chỉ gọi API lấy danh sách ở đây duy nhất
    this.GetListIOMasterVehicle(this.filter);
  }

  // Thay đổi loại phiếu nhập
  public onIOMasterTypeSelect(id: number | null): void {
    this.selectedTypeId = id;
    this.typeofmasterFilter.value = id;
    this.isLoadingData = true;
    this.getliststatus();
  }

  // Thay đổi bộ lọc text
  public textFilterChange(e: FilterDescriptor[]) {
    if (this.isLoadingData) return;
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.executeFilter(e, 'text');
      this.lasttextvalue = text;
    }
  }




  // Lấy danh sách trạng thái, sau đó mới filter
  private getliststatus() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListStatus(LSStatusTypeDataEnum.IO).subscribe((res) => {
      if (res.StatusCode == 0) {
        let statuses = res.ObjectReturn;
        if (this.selectedTypeId === WHIOMasterTypeOfMasterEnum.Supplier) {
          statuses = statuses.filter(item => [
            WHIOMasterStatusEnum.NEW,
            WHIOMasterStatusEnum.RECEIVING,
            WHIOMasterStatusEnum.DONE
          ].includes(item.TypeOfStatus));
        }
        this.liststatus = statuses;
        this.liststatus.forEach(item => {
          item.IsActive = [
            WHIOMasterStatusEnum.NEW,
            WHIOMasterStatusEnum.SENT,
            WHIOMasterStatusEnum.RECEIVING
          ].includes(item.TypeOfStatus);
        });
        this.subLoader.loader(false);
        this.isLoadingData = false;
        // this.executeFilter('getliststatus'); // Chỉ gọi sau khi đã có trạng thái
      } else {
        this.subLoader.loader(false);
        this.isLoadingData = false;
        this.notification.onError(`Lỗi lấy danh sách trạng thái: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.isLoadingData = false;
      this.notification.onError(`Lỗi lấy danh sách trạng thái: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region danh sách
  public actionColumn: ActionColumnDTO[] = [];
  public data: Subject<any> = new Subject<any>();
  public skip = 0;
  public showpopup: boolean = false;
  public itemAction: WHIOMasterVehicleCusDTO = new WHIOMasterVehicleCusDTO();
  public isShowDialogDone = false;
  public popupConfirmOpen = false;


  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.GetListIOMasterVehicle(this.filter);
  }

  public onActionColumnFocus(e) {
    this.actionColumn = [];
    // đi đến chi tiết
    if (e.StatusID == WHIOMasterStatusEnum.NEW)
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
    else
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });

    // Phân biệt theo loại phiếu
    if (e.TypeOfMaster === WHIOMasterTypeOfMasterEnum.Supplier) {
      // Nhà cung cấp
      switch (e.StatusID) {
        case WHIOMasterStatusEnum.NEW:
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'local_shipping', text: 'Đang giao nhận', action: 'sent' });
          // Chỉ cho phép xoá khi là NEW
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
          break;
        case WHIOMasterStatusEnum.RECEIVING:
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'view_in_ar', text: 'Hoàn tất', action: 'receiving' });
          break;
        case WHIOMasterStatusEnum.DONE:
        default:
          // DONE chỉ cho xem chi tiết, không có action nào khác
          break;
      }
    } else {
      // Nội bộ
      switch (e.StatusID) {
        case WHIOMasterStatusEnum.NEW:
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'send', text: 'Gửi phiếu', action: 'sent' });
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
          break;
        case WHIOMasterStatusEnum.PENDING:
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'view_in_ar', text: 'Nhận hàng', action: 'receiving' });
          break;
        case WHIOMasterStatusEnum.RECEIVING:
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'done_all', text: 'Hoàn tất', action: 'done' });
          break;
        case WHIOMasterStatusEnum.DONE:
        default:
          // DONE chỉ cho xem chi tiết, không có action nào khác
          break;
      }
    }
  }

  public UpdateIOMasterVehicleStatus(param: UpdateStatusInterface<WHIOMasterVehicleCusDTO>) {
    this.subLoader.loader(true);

    let txt = '';
    switch (param.Status) {
      case WHIOMasterStatusEnum.SENT:
        txt = 'gửi';
        break;
      case WHIOMasterStatusEnum.RECEIVING:
        txt = 'nhận hàng';
        break;
      case WHIOMasterStatusEnum.DONE:
        txt = 'hoàn tất';
        break;
    }

    const sub = this.mtbikeapi.UpdateIOMasterVehicleStatus(param).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListIOMasterVehicle(this.filter);
          this.isShowDialogDone = false;
          this.notification.onSuccess(`Đã ${txt}`);
        } else {
          this.notification.onWarning(`Lỗi ${txt} không thành công: ${res.ErrorString}`);
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi ${txt} không thành công: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  public onUpdateIOMasterStatus(param: WHIOMasterVehicleCusDTO, enumStt: WHIOMasterStatusEnum): void {
    const item: UpdateStatusInterface<WHIOMasterVehicleCusDTO> = {
      ListDTO: [param],
      Status: enumStt
    };
    this.UpdateIOMasterVehicleStatus(item);
  }

  public onActionClick(e: ActionColumnDTO) {
    this.itemAction = e.data;
    if (e.action == 'view' || e.action == 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.INBOUND, this.itemAction);
      this.router.navigate(['detail'], { relativeTo: this.route });
    } else if (e.action == 'sent') {
      if (this.itemAction.TypeOfMaster === WHIOMasterTypeOfMasterEnum.Supplier) {
        this.onUpdateIOMasterStatus(this.itemAction, WHIOMasterStatusEnum.RECEIVING);
      } else {
        this.onUpdateIOMasterStatus(this.itemAction, WHIOMasterStatusEnum.SENT);
      }
    } else if (e.action == 'receiving') {
      // Nếu là Supplier thì nhận xe sẽ chuyển sang DONE luôn
      if (this.itemAction.TypeOfMaster === WHIOMasterTypeOfMasterEnum.Supplier) {
        this.onUpdateIOMasterStatus(this.itemAction, WHIOMasterStatusEnum.DONE);
      } else {
        this.onUpdateIOMasterStatus(this.itemAction, WHIOMasterStatusEnum.RECEIVING);
      }
    } else if (e.action == 'done') {
      if (this.itemAction.TotalDetail > 0)
        this.isShowDialogDone = true;
      else
        this.onUpdateIOMasterStatus(e.data, WHIOMasterStatusEnum.DONE);
    }
    else if (e.action == 'delete') {
      this.popupConfirmOpen = true;
    }
  }

  private GetListIOMasterVehicle(filter: State) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListIOMasterVehicle(filter).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.data.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total });
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phiếu giao nhận: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu giao nhận: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  #endregion

  //#region delete confirm dialog
  public DeleteIOMasterVehicle(param: WHIOMasterVehicleCusDTO[] | null): void {
    if (!param || param.length === 0) {
      return;
    }
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.DeleteIOMasterVehicle(param).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListIOMasterVehicle(this.filter);
          this.popupConfirmOpen = false;
          this.notification.onSuccess('Đã xoá phiếu nhập');
        } else {
          this.notification.onError(`Lỗi xoá không thành công: ${res.ErrorString}`);
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá không thành công: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

}
