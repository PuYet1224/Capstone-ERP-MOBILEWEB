import { Component, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ActionColumnDTO } from 'src/app/components/ps-table/models/dtos/action-column.dto';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { WHInventoryMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-master.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { PsFilterTextboxComponent } from 'src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { InventoryMasterStatusEnum } from '../../../../models/enums/e-status/wh-inventory-master-status.enum';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { WHInventoryMasterTypeEnum } from 'src/app/models/enums/e-type/wh-inventory-master-type.enum';
import { PSArray } from 'src/app/services/utilities/ps-array';

@Component({
  selector: 'prt001-inventory',
  templateUrl: './prt001-inventory.component.html',
  styleUrls: ['./prt001-inventory.component.scss'],
})

export class Prt001InventoryComponent implements OnDestroy {
  constructor(
    private partapi: PSPartApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
    private cache: PSCache,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public LSStatusTypeDataEnum = LSStatusTypeDataEnum;

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region navigation bar
  public createInventory() {
    this.cache.setItem(
      KeyLocalStorageEnum.INVENTORY_OBJECT,
      new WHInventoryMasterCusDTO()
    );
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox: PsFilterTextboxComponent;

  private filterstatus: CompositeFilterDescriptor = {
    filters: [],
    logic: 'or',
  };
  private filtertext: CompositeFilterDescriptor = {
    filters: [],
    logic: 'or',
  };
  private groupfilter: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };
  private typeFilter: FilterDescriptor = {
    field: "TypeData",
    ignoreCase: false,
    operator: "eq",
    value: WHInventoryMasterTypeEnum.InventoryPart
  }
  private filter: State = {
    filter: this.groupfilter,
    skip: 0,
    take: 25,
    sort: [{ field: "Code", dir: "desc" }]
  };

  public listfiltertext = ['InventoryName', 'Description', 'OwnerName'];
  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;

  private handleFilter(filter: FilterDescriptor[], type: 'text' | 'status', resetPage = true) {
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
    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần
    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(f => f.value);
        let listmap = [InventoryMasterStatusEnum.NEW, InventoryMasterStatusEnum.DOING]
        if (PSArray.areEqual(listfilter, listmap)) {
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

    this.groupfilter.filters.push(this.typeFilter)
  }

  public textFilterChange(e) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.getListInventoryMaster(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getListInventoryMaster(this.filter);
  }

  public statusFilterClear(e) {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.handleFilter(e, 'status');
    this.filterTextbox.clear();
    this.getListInventoryMaster(this.filter);
  }

  public statusFilterReset(e) {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.handleFilter(e, 'status');
    this.filterTextbox.clear();
    this.getListInventoryMaster(this.filter);
  }
  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];

  public onActionClick(e: ActionColumnDTO) {
    if (e.action == 'view' || e.action == 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.INVENTORY_OBJECT, e.data);
      this.router.navigate(['detail'], { relativeTo: this.route });
    }
    else if (e.action == 'delete') {
      this.masterdelete = e.data;
      this.popupConfirmOpen = true;
    }
    else {
      const temp: UpdateStatusInterface<WHInventoryMasterCusDTO> = {
        ListDTO: [e.data],
        Status: InventoryMasterStatusEnum.CANCLE
      }
      this.UpdateInventoryMasterStatus(temp);
    }
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getListInventoryMaster(this.filter);
  }

  public onActionColumnFocus(e) {
    this.actionColumn = [];
    if (e.StatusID == InventoryMasterStatusEnum.NEW) {
      this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
    }
    else {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })
      if (e.StatusID == InventoryMasterStatusEnum.DOING) {
        this.actionColumn.push({ separator: true });
        this.actionColumn.push({ iconClass: 'cancel', text: 'Huỷ', action: 'cancel' })
      }
    }
  }

  private getListInventoryMaster(filter: State) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListInventoryMaster(filter).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.data.next({
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          });
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy danh sách kỳ kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách kiểm kê: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public UpdateInventoryMasterStatus(param: UpdateStatusInterface<WHInventoryMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryMasterStatus(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getListInventoryMaster(this.filter);
        this.subLoader.loader(false);
        this.notification.onSuccess(`Cập nhật thông tin trạng thái kỳ kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region delete confirm dialog
  public popupConfirmOpen = false;
  public masterdelete: WHInventoryMasterCusDTO = new WHInventoryMasterCusDTO();

  public DeleteInventoryMaster(param: WHInventoryMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeleteInventoryMaster(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getListInventoryMaster(this.filter);
        this.popupConfirmOpen = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Xoá thông tin kỳ kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá thông tin kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi xoá thông tin kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
