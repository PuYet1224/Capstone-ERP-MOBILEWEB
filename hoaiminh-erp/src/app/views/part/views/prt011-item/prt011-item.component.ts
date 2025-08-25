import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
import { LSTypeOfPartOfStatusEnum } from 'src/app/models/enums/e-status/ls-type-of-part-of-status.enum';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSHeaderService } from 'src/app/layouts/main-layout/services/ps-header.service';
import { LSPartItemCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-item.dto';

@Component({
  selector: 'prt011-item',
  templateUrl: './prt011-item.component.html',
  styleUrls: ['./prt011-item.component.scss']
})
export class Prt011ItemComponent implements OnInit, OnDestroy {
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
  FunctionPermissionDTO = FunctionPermissionDTO;
  ngOnInit(): void {
    this.GetListPartCategory(this.filter);
    this.getListPartItemConfig(this.filter);
    this.GetListVehicleForPartItem();
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
  public createPartItem(): void {
    const dto = new LSPartItemCusDTO();
    dto.PartCategory = 1;
    dto.TypeOfPart = 16554;
    dto.TypeOfPartSpecs = 134;
    dto.TypeData = 1;
    // dto.IsModify = true;
    this.cache.setItem(KeyLocalStorageEnum.PART_ITEM_OBJECT, dto);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  //#endregion

  //#region filter
  private allVehicles: { Code: number; VehicleName: string }[] = [];
  public vehicleDropdown: Array<{ id: number; text: string }> = [];
  public selectedVehicleId: number | null = null;
  private allTypes: LSTypeOfPartCusDTO[] = [];
  public filteredTypes: LSTypeOfPartCusDTO[] = [];
  public selectedCategoryId: LSPartCategoryCusDTO = { Code: null, Category: 'Tất cả' } as LSPartCategoryCusDTO;
  public selectedTypeOfPartId: LSTypeOfPartCusDTO = { Code: null, TypeOfPart: 'Tất cả' } as LSTypeOfPartCusDTO;
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
    'TypePartItemName',
    'Barcode',
    'Poscode',
    'Manufacturer'
  ];

  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;
  public filterOfficial = true;
  public filterExternal = true;

  public onCategoryChange(cat: LSPartCategoryCusDTO) {
    this.selectedCategoryId = cat;
    this.selectedTypeOfPartId = { Code: null, TypeOfPart: 'Tất cả' } as any;
    this.filteredTypes = [];

    if (cat.Code != null) {
      const typeState: State = {
        filter: { logic: 'and', filters: [{ field: 'Category', operator: 'eq', value: cat.Code }] } as CompositeFilterDescriptor,
        skip: 0,
        take: 9999,
        sort: []
      };
      this.GetListTypeOfPart(typeState);
    }
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  public onTypeOfPartChange(type: LSTypeOfPartCusDTO) {
    this.selectedTypeOfPartId = type;
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  public onVehicleChange(vehicleId: number) {
    this.selectedVehicleId = vehicleId;
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  public onOfficialChange(e: Event) {
    this.filterOfficial = (e.target as HTMLInputElement).checked;
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  public onExternalChange(e: Event) {
    this.filterExternal = (e.target as HTMLInputElement).checked;
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  public onStatusChange(status: LSTypeOfPartOfStatusEnum) {
    this.selectedBusinessStatus = status;
    this.handleFilter();
    this.getListPartItemConfig(this.filter);
  }

  private handleFilter(textFilters: FilterDescriptor[] | null = null, type: 'text' | null = null, resetPage = true) {
    if (resetPage) {
      this.filter.skip = this.skip = 0;
    }

    const filtersArray: (FilterDescriptor | CompositeFilterDescriptor)[] = [];
    if (type === 'text' && textFilters?.length) {
      filtersArray.push({
        logic: 'or',
        filters: textFilters
      } as CompositeFilterDescriptor);
    }

    if (this.selectedCategoryId?.Code != null) {
      filtersArray.push({ field: 'PartCategory', operator: 'eq', value: this.selectedCategoryId.Code });
    }
    if (this.selectedTypeOfPartId?.Code != null) {
      filtersArray.push({ field: 'TypeOfPart', operator: 'eq', value: this.selectedTypeOfPartId.Code });
    }
    if (this.filterOfficial !== this.filterExternal) {
      filtersArray.push({ field: 'IsHonda', operator: 'eq', value: this.filterOfficial });
    }
    if (this.selectedVehicleId != null) {
      filtersArray.push({ field: 'ListVehicleCode', operator: 'contains', value: this.selectedVehicleId });
    }
    if (this.selectedBusinessStatus != null) {
      filtersArray.push({
        field: 'StatusWhole',
        operator: 'eq',
        value: this.selectedBusinessStatus
      });
    }
    this.filter.filter = { logic: 'and', filters: filtersArray } as CompositeFilterDescriptor;
  }


  public typeMasterList: Array<{ id: number; text: string }> = [];

  public textFilterChange(e: FilterDescriptor[]) {
    const term = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (term === this.lasttextvalue) {
      return;
    }
    this.lasttextvalue = term;
    if (term) {
      const textFilters: FilterDescriptor[] = this.listfiltertext.map(field => ({
        field,
        operator: 'contains',
        value: term
      }));
      this.handleFilter(textFilters, 'text');
    } else {
      this.handleFilter(null, null);
    }
    this.getListPartItemConfig(this.filter);
  }

  public resetFilter() {
    this.selectedCategoryId = { Code: null, Category: 'Tất cả' } as LSPartCategoryCusDTO;
    this.selectedTypeOfPartId = { Code: null, TypeOfPart: 'Tất cả' } as LSTypeOfPartCusDTO;
    this.filterTextbox.clear();
    this.lasttextvalue = ''
    this.filtertext.filters = [];
    this.handleFilter();
  }

  public selectedBusinessStatus: LSTypeOfPartOfStatusEnum | null = null;
  public businessStatuses = [
    { id: null, text: 'Tất cả' },
    { id: LSTypeOfPartOfStatusEnum.BusinessActive, text: 'ĐANG KINH DOANH' },
    { id: LSTypeOfPartOfStatusEnum.BusinessInactive, text: 'NGỪNG KINH DOANH' }
  ];

  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];

  public onActionColumnFocus(item: LSTypeOfPartCusDTO): void {
    const canEdit = this.isMaster || this.isCreator;

    this.actionColumn = canEdit
      ? [
        { iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' }
      ]
      : [
        { iconClass: 'eye', text: 'Xem chi tiết', action: 'view' }
      ];
  }

  public pendingConfirmOpen = false;
  public pendingItem: LSTypeOfPartCusDTO | null = null;

  public onActionClick(e: ActionColumnDTO) {
    const item = e.data as LSTypeOfPartCusDTO;

    if (e.action === 'edit') {
      if (!(this.isMaster || this.isCreator)) {
        this.notification.onWarning('Bạn không có quyền chỉnh sửa.');
        return;
      }
      item.IsModify = true;
    } else {
      item.IsModify = false;
    }

    this.cache.setItem(KeyLocalStorageEnum.PART_ITEM_OBJECT, item);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getListPartItemConfig(this.filter);
  }

  private getListPartItemConfig(filter: State) {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartItemConfig(filter).subscribe(
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

  private GetListTypeOfPart(state: State) {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListTypeOfPart(state).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.allTypes = res.ObjectReturn.Data;
          this.filteredTypes = [...this.allTypes];
        } else {
          this.notification.onError(`Lỗi lấy danh sách phân loại: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phân loại: ${err.message}`);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListVehicleForPartItem() {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListVehicleForPartItem().subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.allVehicles = res.ObjectReturn as Array<{ Code: number; VehicleName: string }>;
          this.vehicleDropdown = [
            { id: null, text: 'Tất cả' },
            ...this.allVehicles
              .map(v => ({ id: v.Code, text: v.VehicleName || '' }))
              .filter(item => !!item.text)
          ];
        } else {
          this.notification.onError(`Lỗi lấy xe: ${res.ErrorString}`);
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy xe: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  //#endregion
}
