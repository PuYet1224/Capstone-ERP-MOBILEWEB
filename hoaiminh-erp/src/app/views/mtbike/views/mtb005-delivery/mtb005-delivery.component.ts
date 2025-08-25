import { Component, OnInit, ViewChild } from "@angular/core";
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { Subject, Subscription } from "rxjs";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { PSArray } from "src/app/services/utilities/ps-array";
import { PURDOMasterStatusEnum } from "src/app/models/enums/e-status/pur-do-master-status.enum";
import { PSObject } from "src/app/services/utilities/ps-object";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { PSString } from "src/app/services/utilities/ps-string";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";

@Component({
  selector: 'mtb005-delivery',
  templateUrl: './mtb005-delivery.component.html',
  styleUrls: ['./mtb005-delivery.component.scss'],
})

export class Mtb005DeliveryComponent implements OnInit {
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

  ngOnInit(): void {
    //header
    this.getlisthead();
    this.getliststatus();

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.getlistdomaster(this.filter);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }
  //#endregion

  //#region header
  public addnewitem() {
    this.cache.setItem(KeyLocalStorageEnum.DO, new PURDOMasterCusDTO());
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  public listheadcopy: LSHeadCusDTO[] = [{ Code: null, BriefName: 'Không lựa chọn' } as LSHeadCusDTO];
  public listhead: LSHeadCusDTO[] = [];
  public headactive: LSHeadCusDTO = new LSHeadCusDTO();
  public liststatus: LSStatusCusDTO[] = [];
  public listfiltertext = ['DO', 'SupplierName', 'HeadName', 'PONo'];
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25, sort: [{ field: 'Code', dir: 'desc' }] };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private fhead: FilterDescriptor = { field: 'POHead', operator: 'eq' };
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;

  public statusFilterReset() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.headactive = this.listhead[0];
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({
      ...item, IsActive: item.IsActive = [PURDOMasterStatusEnum.NEW, PURDOMasterStatusEnum.WAITINGDELIVERY].includes(item.TypeOfStatus)
    }));
  }

  public statusFilterClear() {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.headactive = this.listhead[0];
    this.filterTextbox.clear();
    this.liststatus = this.liststatus.map(item => ({ ...item, IsActive: false }));
  }

  public onReload() {
    this.getlistdomaster(this.filter);
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getlistdomaster(this.filter);
  }

  public onStoreChange(e) {
    this.headactive = e;
    this.handleFilter();
    this.getlistdomaster(this.filter);
  }

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

    if (!PSObject.isNullOfUndefined(this.headactive.Code) && this.headactive.Code != 0) {
      this.fhead.value = this.headactive.Code;
      this.groupfilter.filters.push(this.fhead)
    }
    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần

    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0 || this.fhead.value != null) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(f => f.value);
        let listmap = [PURDOMasterStatusEnum.NEW, PURDOMasterStatusEnum.WAITINGDELIVERY]
        if (PSArray.areEqual(listfilter, listmap) && this.filtertext.filters.length == 0 && this.fhead.value == null)
          this.isDisabledReset = true;
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
      this.getlistdomaster(this.filter);
      this.lasttextvalue = text;
    }
  }

  private getlisthead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listhead = [...this.listheadcopy]
        this.listhead.push(...res.ObjectReturn);
        this.headactive = this.listhead[0]
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

  private getliststatus() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListStatus(LSStatusTypeDataEnum.PURDOMaster).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.liststatus = res.ObjectReturn;
        this.liststatus.forEach(item => {
          item.IsActive = [PURDOMasterStatusEnum.NEW, PURDOMasterStatusEnum.WAITINGDELIVERY].includes(item.TypeOfStatus);
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

  //#region danh sách
  public actionColumn: ActionColumnDTO[] = [];
  public data: Subject<any> = new Subject<any>();
  public skip = 0;
  public showpopup: boolean = false;
  public itemAction: PURDOMasterCusDTO = new PURDOMasterCusDTO();

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getlistdomaster(this.filter);
  }

  public onActionClick(e: ActionColumnDTO) {
    this.itemAction = e.data;
    if (e.action == 'view' || e.action == 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.DO, e.data);
      this.router.navigate(['detail'], { relativeTo: this.route });
    }
    else if (e.action == 'delete') {
      this.showpopup = true;
    }

    if (typeof (e.action) == 'number') {
      this.onupdatedomasterstatus(e.action)
    }
  }

  public onupdatedomasterstatus(status) {
    if (status == PURDOMasterStatusEnum.WAITINGDELIVERY) {
      if (PSString.isNullOrWhitespace(this.itemAction.DO))
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin DO');

      if (!this.itemAction.EstEffDate)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin ngày dự kiến giao');

      if (!this.itemAction.POHead)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin cửa hàng đặt hàng');

      if (PSString.isNullOrWhitespace(this.itemAction.PONo))
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin mã đơn hàng');

      if (!this.itemAction.PODate)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin ngày đặt hàng');

      if (!this.itemAction.POSupplier)
        return this.notification.onWarning('Phiếu giao nhận chưa có thông tin nhà cung cấp');
    }
    this.updatedomasterstatus(status);
  }

  public onActionColumnFocus(e: PURDOMasterCusDTO) {
    this.actionColumn = [];
    //go to detail
    if (e.StatusID == PURDOMasterStatusEnum.NEW && (FunctionPermissionDTO.master || FunctionPermissionDTO.creator))
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
    else
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })

    //action status
    switch (e.StatusID) {
      case PURDOMasterStatusEnum.NEW:
        if ((FunctionPermissionDTO.master || FunctionPermissionDTO.creator)) {
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'local_shipping', text: 'Chờ giao nhận', action: PURDOMasterStatusEnum.WAITINGDELIVERY });
        }
        break;
    }

    //action
    if (e.StatusID == PURDOMasterStatusEnum.NEW && (FunctionPermissionDTO.master || FunctionPermissionDTO.creator)) {
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
  }

  private getlistdomaster(filter: State) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListDOMaster(filter).subscribe((res) => {
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

  public deletedomaster(param: PURDOMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.DeleteDOMaster(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.showpopup = false;
        this.notification.onSuccess(`Thành công`);
        this.getlistdomaster(this.filter);
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

  public updatedomasterstatus(status: number) {
    this.subLoader.loader(true);
    var dto: UpdateStatusInterface<PURDOMasterCusDTO> = {
      ListDTO: [this.itemAction],
      Status: status
    }

    var temp = this.mtbikeapi.UpdateDOMasterStatus(dto).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getlistdomaster(this.filter);
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
