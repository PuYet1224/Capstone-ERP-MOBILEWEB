import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
} from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PsFilterTextboxComponent } from 'src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component';
import { ActionColumnDTO } from 'src/app/components/ps-table/models/dtos/action-column.dto';
import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { WHIOMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-io-master.dto';
import { WHIOMasterStatusEnum } from '../../../../models/enums/e-status/wh-io-master-status.enum';
import {
  WHIOMasterTypeOfMasterEnum,
  WHIOMasterTypeOfMasterConfig,
} from '../../../../models/enums/e-type/wh-io-master-type-of-master.enum';
import { WHIOMasterTypeDataEnum } from '../../../../models/enums/e-type/wh-io-master-type-data.enum';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { PSHeaderService } from 'src/app/layouts/main-layout/services/ps-header.service';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';

@Component({
  selector: 'prt006-outbound',
  templateUrl: './prt006-outbound.component.html',
  styleUrls: ['./prt006-outbound.component.scss'],
})
export class Prt006OutboundComponent implements OnDestroy, OnInit {
  constructor(
    private partapi: PSPartApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
    private cache: PSCache,
    private router: Router,
    private route: ActivatedRoute,
    private header: PSHeaderService
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public LSStatusTypeDataEnum = LSStatusTypeDataEnum;
  public selectedTypeId: number = WHIOMasterTypeOfMasterEnum.Internal;

  ngOnInit(): void {
    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.getListIOMaster(this.filter);
        this.header.headChange.next(null);
      }
    });
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region navigation bar
  public outboundTypeList = Object.values(WHIOMasterTypeOfMasterConfig).filter(
    (k) =>
      k.id != WHIOMasterTypeOfMasterEnum.AfterStock &&
      k.id != WHIOMasterTypeOfMasterEnum.Supplier
  );

  public createOutbound(item: { id: number | null }): void {
    if (item?.id == null) {
      return;
    }
    const dto = new WHIOMasterCusDTO();
    dto.TypeOfMaster = item.id as WHIOMasterTypeOfMasterEnum;
    dto.TypeOfMasterName = WHIOMasterTypeOfMasterConfig[dto.TypeOfMaster].text;
    dto.TypeData = WHIOMasterTypeDataEnum.Out;
    this.cache.setItem(KeyLocalStorageEnum.IOMASTER_OBJECT, dto);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;

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
  private typedataFilter: FilterDescriptor = {
    field: 'TypeData',
    operator: 'eq',
    ignoreCase: false,
    value: WHIOMasterTypeDataEnum.Out,
  };

  private typeofmasterFilter: FilterDescriptor = {
    field: 'TypeOfMaster',
    operator: 'eq',
    value: this.selectedTypeId,
  };

  private filter: State = {
    filter: this.groupfilter,
    skip: 0,
    take: 25,
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  public listfiltertext = [
    'DocumentID',
    'RefDocumentID',
    'SupplierName',
    'OutHeadName',
    'InHeadName',
    'Description',
  ];
  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;

  private handleFilter(
    filter: FilterDescriptor[] = null,
    type: 'text' | 'status' | null = null,
    resetPage = true
  ) {
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
    if (
      this.filterstatus.filters.length != 0 ||
      this.filtertext.filters.length != 0
    ) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus);

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(
          (f) => f.value
        );
        let listmap = [
          WHIOMasterStatusEnum.SENT,
          WHIOMasterStatusEnum.PENDING,
          WHIOMasterStatusEnum.RECEIVING,
        ];
        if (PSArray.areEqual(listfilter, listmap)) {
          this.isDisabledReset = true;
        } else this.isDisabledReset = false;
      }

      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
        this.isDisabledReset = false;
      }
    } else {
      this.isDisabledClear = true; //##
      this.isDisabledReset = false; //##
    }

    this.groupfilter.filters.push(this.typedataFilter);
    this.groupfilter.filters.push(this.typeofmasterFilter);
  }

  public typeMasterList = Object.values(WHIOMasterTypeOfMasterConfig).filter(
    (t) => t.id !== WHIOMasterTypeOfMasterEnum.Supplier
  );

  public onIOMasterTypeSelect(id: number | null): void {
    this.selectedTypeId = id;
    this.typeofmasterFilter.value = id;
    this.handleFilter();
    this.getListIOMaster(this.filter);
  }

  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.getListIOMaster(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getListIOMaster(this.filter);
  }

  public statusFilterClear(e, key = '') {
    if (key == 'reset') {
      this.selectedTypeId = WHIOMasterTypeOfMasterEnum.Internal;
      this.typeofmasterFilter.value = WHIOMasterTypeOfMasterEnum.Internal;
    }
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.handleFilter(e, 'status');
    this.filterTextbox.clear();

    this.getListIOMaster(this.filter);
  }

  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];

  public onActionColumnFocus(e) {
    this.actionColumn = [];
    if (e.Status == WHIOMasterStatusEnum.NEW) {
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({
        iconClass: 'edit',
        text: 'Chỉnh sửa',
        action: 'edit',
      });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({

        icon: 'assignment_turned_in',
        text: 'Xác nhận',
        action: 'pending',
      });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({
        iconClass: 'trash',
        text: 'Xoá',
        action: 'delete',
      });
    } else if (e.Status == WHIOMasterStatusEnum.SENT) {
      this.actionColumn.push({
        iconClass: 'eye',
        text: 'Xem chi tiết',
        action: 'view',
      });
      this.actionColumn.push({ separator: true });
      this.actionColumn.push({
        icon: 'assignment_turned_in',
        text: 'Xác nhận',
        action: 'pending',
      });
    } else {
      this.actionColumn.push({
        iconClass: 'eye',
        text: 'Xem chi tiết',
        action: 'view',
      });

    }
  }
  public pendingConfirmOpen = false;
  public pendingItem: WHIOMasterCusDTO | null = null;

  public onActionClick(e: ActionColumnDTO) {
    const item = e.data as WHIOMasterCusDTO;

    if (e.action === 'view' || e.action === 'edit') {
      this.cache.setItem(KeyLocalStorageEnum.IOMASTER_OBJECT, item);
      this.router.navigate(['detail'], { relativeTo: this.route });
    } else if (e.action === 'delete') {
      this.deleteItem = item;
      this.popupConfirmOpen = true;
    } else if (e.action === 'pending') {
      if (item.Status === WHIOMasterStatusEnum.NEW) {
        this.UpdateIOMasterStatus({
          ListDTO: [item],
          Status: WHIOMasterStatusEnum.PENDING,
        });
        return;
      }
      if (item.TotalQuantity !== item.TotalConfirmQuantity) {
        this.pendingItem = item;
        this.pendingConfirmOpen = true;
      } else {
        this.UpdateIOMasterStatus({
          ListDTO: [item],
          Status: WHIOMasterStatusEnum.PENDING,
        });
      }
    }
  }
  /** Gọi API khi user xác nhận dialog */
  public confirmPending(): void {
    if (!this.pendingItem) {
      return;
    }
    this.UpdateIOMasterStatus({
      ListDTO: [this.pendingItem],
      Status: WHIOMasterStatusEnum.PENDING,
    });
    this.pendingConfirmOpen = false;
    this.pendingItem = null;
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getListIOMaster(this.filter);
  }

  private getListIOMaster(filter: State) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListIOMaster(filter).subscribe(
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
            `Lỗi lấy danh sách phiếu xuất: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy danh sách phiếu xuất: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public UpdateIOMasterStatus(
    param: UpdateStatusInterface<WHIOMasterCusDTO>
  ): void {
    this.subLoader.loader(true);

    let txt = '';
    switch (param.Status) {
      case WHIOMasterStatusEnum.PENDING:
        txt = 'xác nhận';
        break;
      case WHIOMasterStatusEnum.DONE:
        txt = 'hoàn tất';
        break;
    }

    const sub = this.partapi.UpdateIOMasterStatus(param).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.getListIOMaster(this.filter);
          this.notification.onSuccess(`Đã ${txt}`);
        } else {
          this.notification.onError(
            `Lỗi ${txt} không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi ${txt} không thành công: ${err.message}`
        );
      }
    );

    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region delete confirm dialog
  public popupConfirmOpen = false;
  public deleteItem: WHIOMasterCusDTO | null = null;

  public DeleteIOMaster(param: WHIOMasterCusDTO[] | null): void {
    if (!param || param.length === 0) {
      return;
    }

    this.subLoader.loader(true);

    const sub = this.partapi.DeleteIOMaster(param).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.getListIOMaster(this.filter);
          this.popupConfirmOpen = false;
          this.notification.onSuccess('Đã xoá phiếu xuất');
        } else {
          this.notification.onError(
            `Lỗi xoá không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá không thành công: ${err.message}`);
      }
    );

    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
