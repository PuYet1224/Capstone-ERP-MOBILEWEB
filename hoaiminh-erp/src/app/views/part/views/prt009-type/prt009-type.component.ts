import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ActionColumnDTO } from 'src/app/components/ps-table/models/dtos/action-column.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { LSTypeOfPartCusDTO } from '../../../../models/dtos/e-dtos/ls-type-of-part.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { PsFilterTextboxComponent } from 'src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { LSPartCategoryCusDTO } from '../../../../models/dtos/e-dtos/ls-part-category.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSHeaderService } from 'src/app/layouts/main-layout/services/ps-header.service';

@Component({
  selector: 'prt009-type',
  templateUrl: './prt009-type.component.html',
  styleUrls: ['./prt009-type.component.scss']
})
export class Prt009TypeComponent implements OnInit, OnDestroy {
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
  public selectedType: LSTypeOfPartCusDTO | null = null;
  public IsModify: boolean = false;

  ngOnInit(): void {
    this.GetListPartCategory(this.filter);
    this.getListTypeOfPart(this.filter);
    this.header.headObs$.subscribe(() => {
    });
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  get isMaster(): boolean {
    return FunctionPermissionDTO.master;
  }
  get isCreator(): boolean {
    return FunctionPermissionDTO.creator;
  }
  get isViewer(): boolean {
    return FunctionPermissionDTO.viewer;
  }
  //#endregion

  //#region navigation bar
  public createCategory(): void {
    const dto = new LSTypeOfPartCusDTO();
    dto.IsModify = true;
    this.cache.setItem(KeyLocalStorageEnum.TYPE_PART_OBJECT, dto);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  public selectedCategoryId: LSPartCategoryCusDTO = { Code: null, Category: 'Tất cả' } as LSPartCategoryCusDTO;
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

  private filter: State = {
    filter: this.groupfilter,
    skip: 0,
    take: 25,
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  public listfiltertext = [
    'TypeOfPart',
    'Description',
    'CategoryName',
    'Description'
  ];
  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;

  public onCategoryChange(id: LSPartCategoryCusDTO) {
    this.selectedCategoryId = id;
    this.handleFilter();
  }

  private handleFilter(filter: FilterDescriptor[] = null, type: 'text' | 'status' | null = null, resetPage = true) {
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
    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0) {
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)
      }
      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
      }
    }
    if (this.selectedCategoryId.Code != null) {
      this.groupfilter.filters.push({
        field: 'Category',
        operator: 'eq',
        value: this.selectedCategoryId.Code
      });
    }
    this.filter.filter = this.groupfilter;
    this.getListTypeOfPart(this.filter);
  }

  public typeMasterList: Array<{ id: number; text: string }> = [];

  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.lasttextvalue = text;
    }
  }

  public resetFilter() {
    this.selectedCategoryId = { Code: null, Category: 'Tất cả' } as LSPartCategoryCusDTO;
    this.filterTextbox.clear();
    this.lasttextvalue = ''
    this.filtertext.filters = [];
    this.handleFilter();
  }
  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];

  public onActionColumnFocus(item: LSTypeOfPartCusDTO): void {
    const canEdit = this.isMaster || this.isCreator;
    const actions: ActionColumnDTO[] = [];

    if (item.IsModify === true && canEdit) {
      actions.push(
        { iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' },
        { separator: true },
        { iconClass: 'trash', text: 'Xóa', action: 'delete' }
      );
    } else {
      actions.push(
        { iconClass: 'eye', text: 'Xem chi tiết', action: 'view' }
      );
    }

    this.actionColumn = actions;
  }

  public pendingConfirmOpen = false;
  public pendingItem: LSTypeOfPartCusDTO | null = null;

  public onActionClick(e: ActionColumnDTO) {
    const item = e.data as LSTypeOfPartCusDTO;
    const canEdit = this.isMaster || this.isCreator;

    if (e.action === 'edit') {
      if (!canEdit) return;
      item.IsModify = true;
      this.cache.setItem(KeyLocalStorageEnum.TYPE_PART_OBJECT, item);
      this.router.navigate(['detail'], { relativeTo: this.route });
    }
    else if (e.action === 'view') {
      item.IsModify = false;
      this.cache.setItem(KeyLocalStorageEnum.TYPE_PART_OBJECT, item);
      this.router.navigate(['detail'], { relativeTo: this.route });
    }
    else if (e.action === 'delete') {
      if (!canEdit) return;
      this.deleteItem = item;
      this.popupConfirmOpen = true;
    }
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getListTypeOfPart(this.filter);
  }

  private getListTypeOfPart(filter: State) {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListTypeOfPart(filter).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.data.next({
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          });
        } else {
          this.notification.onError(`Lỗi lấy danh sách phụ tùng: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phụ tùng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private GetListPartCategory(filter: State) {
    const isModifyFilter: FilterDescriptor = {
      field: 'IsModify',
      operator: 'eq',
      value: false
    };

    const typeDataFilter: FilterDescriptor = {
      field: 'TypeData',
      operator: 'eq',
      value: 1
    };

    const existingFilters = Array.isArray((filter.filter as CompositeFilterDescriptor)?.filters)
      ? (filter.filter as CompositeFilterDescriptor).filters
      : [];

    const stateWithFilters: State = {
      ...filter,
      filter: {
        logic: 'and',
        filters: [
          ...existingFilters,
          isModifyFilter,
          typeDataFilter,      
        ]
      } as CompositeFilterDescriptor
    };

    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartCategory(stateWithFilters).subscribe({
      next: (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.typeMasterList = [
            this.selectedCategoryId,
            ...res.ObjectReturn.Data.filter(
              (c: LSPartCategoryCusDTO) => c.Code !== this.selectedCategoryId.Code
            )
          ];
        } else {
          this.notification.onError(`Lỗi lấy danh sách nhóm: ${res.ErrorString}`);
        }
      },
      error: (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách nhóm: ${err.message}`);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  //#endregion

  //#region delete confirm dialog
  public popupConfirmOpen = false;
  public deleteItem: LSTypeOfPartCusDTO | null = null;

  public DeleteTypeOfPart(param: LSTypeOfPartCusDTO[]): void {
    if (!param || param.length === 0) {
      return;
    }

    this.subLoader.loader(true);

    const sub = this.partapi.DeleteTypeOfPart(param).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.getListTypeOfPart(this.filter);
          this.popupConfirmOpen = false;
          this.notification.onSuccess('Đã xoá phụ tùng');
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
