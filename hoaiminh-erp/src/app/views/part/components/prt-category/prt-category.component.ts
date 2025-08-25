import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State } from "@progress/kendo-data-query";
import { PSArray } from "src/app/services/utilities/ps-array";
import { WHIOMasterStatusEnum } from "../../../../models/enums/e-status/wh-io-master-status.enum";
import { WHIOMasterTypeOfMasterEnum } from "../../../../models/enums/e-type/wh-io-master-type-of-master.enum";
import { Subject, Subscription } from "rxjs";
import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { PSPartApiService } from "../../services/ps-part-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { LSPartCategoryCusDTO } from "../../../../models/dtos/e-dtos/ls-part-category.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { LSPartCategoryTypeDataEnum } from "src/app/models/enums/e-type/ls-part-category-type-data.enum";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PSPipeModule } from "src/app/pipes/ps-pipe.module";
import { ChartModule } from "@progress/kendo-angular-charts";
import { GridModule } from "@progress/kendo-angular-grid";
import { ListViewModule } from "@progress/kendo-angular-listview";
import { PSDialogModule } from "src/app/components/ps-dialog/ps-dialog.module";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { PSLayoutModule } from "src/app/components/ps-layout/ps-layout.module";
import { PSTableModule } from "src/app/components/ps-table/ps-table.module";
import { PSInputModule } from "src/app/components/ps-input/ps-input.module";
import { PSButtonModule } from "src/app/components/ps-button/ps-button.module";


@Component({
  selector: 'prt-category',
  templateUrl: './prt-category.component.html',
  styleUrls: ['./prt-category.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GridModule,
    ListViewModule,
    PSDialogModule,
    PSPipeModule,
    ChartModule,
    PSLayoutModule,
    PSTableModule,
    PSInputModule,
    PSButtonModule,
    PSLayoutModule
  ]
})
export class PrtCategoryComponent implements OnInit {

  @Input() TypeCategory: number = LSPartCategoryTypeDataEnum.PART;

  constructor(
    private partapi: PSPartApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public LSStatusTypeDataEnum = LSStatusTypeDataEnum;
  public selectedTypeId: number = WHIOMasterTypeOfMasterEnum.Internal;
  public LSPartCategoryTypeDataEnum = LSPartCategoryTypeDataEnum;
  ngOnInit(): void {
    this.handleFilter();
    this.GetListPartCategory(this.filter)
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

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent;

  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private typedataFilter: FilterDescriptor = { field: 'TypeData', operator: 'eq', ignoreCase: false, value: this.TypeCategory };

  private filter: State = {
    filter: this.groupfilter,
    skip: 0,
    take: 25,
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  public listfiltertext = [
    'Category', 'Description'
  ];
  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;

  private handleFilter(filter: FilterDescriptor[] = null, type: 'text' | 'status' | null = null, resetPage = true) {
    this.typedataFilter.value = this.TypeCategory
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
        let listmap = [WHIOMasterStatusEnum.SENT, WHIOMasterStatusEnum.PENDING, WHIOMasterStatusEnum.RECEIVING]
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
    this.groupfilter.filters.push(this.typedataFilter)
    // this.groupfilter.filters.push(this.typeofmasterFilter)
  }
  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.GetListPartCategory(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.GetListPartCategory(this.filter);
  }
  public statusFilterClear(e, key = '') {
    if (key == 'reset') {
      // this.selectedTypeId = WHIOMasterTypeOfMasterEnum.Internal;
      // this.typeofmasterFilter.value = WHIOMasterTypeOfMasterEnum.Internal;
      this.handleFilter();
      this.GetListPartCategory(this.filter)
    }
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.handleFilter(e, 'status');
    this.filterTextbox.clear();

    this.GetListPartCategory(this.filter);
  }
  //#endregion

  //#region list
  public sort: SortDescriptor[] = [{ field: 'Category', dir: 'asc' }];
  public data: Subject<any> = new Subject<any>();
  public popupConfirmOpen = false;
  public detailActive: LSPartCategoryCusDTO;

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.GetListPartCategory(this.filter);
  }

  public items: LSPartCategoryCusDTO[] = [];
  public total = 0;
  public newItem: LSPartCategoryCusDTO | null = null;
  // helper: đẩy ra grid, nếu đang tạo mới thì unshift vào đầu
  public refreshGrid() {
    const gridData = this.newItem
      ? [this.newItem, ...this.items]
      : this.items;
    this.data.next({ data: gridData, total: this.total });
  }

  private GetListPartCategory(filter: State) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListPartCategory(filter).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          // Lưu lại data cũ
          this.items = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total;
          // Đẩy lên grid: nếu có newItem thì nó sẽ ở đầu
          this.refreshGrid();
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy danh sách phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy danh sách phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public DeletePartCategory(param: LSPartCategoryCusDTO[]) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeletePartCategory(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListPartCategory(this.filter);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Xoá phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'} thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi xoá phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  public UpdatePartCategory(param: UpdatePropertiesInterface<LSPartCategoryCusDTO>) {
    this.subLoader.loader(true);
    const sub = this.partapi.UpdatePartCategory(param).subscribe(res => {
      this.subLoader.loader(false);
      if (res.StatusCode === 0) {
        // nếu là insert (Code=0) thì clear newItem để dòng input biến mất
        if (param.DTO.Code === 0) {
          this.newItem = null;
        }
        // reload danh sách
        this.GetListPartCategory(this.filter);
        this.notification.onSuccess(
          param.DTO.Code === 0
            ? `Thêm mới phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'} thành công`
            : `Cập nhật phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'} thành công`
        );
      } else {
        this.notification.onError(`Lỗi ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'}: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }


  /** Bắt đầu edit một cell */
  public editingCell: { row: number; field: keyof LSPartCategoryCusDTO } | null = null;
  public startEdit(
    rowIndex: number,
    item: LSPartCategoryCusDTO,
    field: keyof LSPartCategoryCusDTO
  ): void {
    if (!(this.isMaster || this.isCreator) || !item.IsModify) {
      return;
    }
    this.editingCell = { row: rowIndex, field };

    // chờ Angular render ngIf => input xuất hiện và focus
    setTimeout(() => {
      const el = document.getElementById(`input-${field}-${rowIndex}`) as HTMLInputElement;
      if (el) {
        el.focus();
      }
    }, 0);
  }

  public itemFocus: LSPartCategoryCusDTO = new LSPartCategoryCusDTO();
  public getItemFocus(item: LSPartCategoryCusDTO) {
    this.itemFocus = { ...item };
  }
  public saveEdit(item: LSPartCategoryCusDTO, field: keyof LSPartCategoryCusDTO): void {
    this.editingCell = null;
    item.TypeData = this.TypeCategory;
    if (typeof item[field] === 'string') {
      (item as any)[field] = (item[field] as string).trim();
    }

    const oldValue = this.itemFocus[field] ?? '';
    const newValue = (item[field] ?? '').toString().trim();

    if (field === 'Category' && newValue === '') {
      if (item.Code === 0) {
        this.newItem = null;
        this.refreshGrid();
        return;
      }
      this.subLoader.loader(true);
      this.partapi.DeletePartCategory([item]).subscribe({
        next: res => {
          this.subLoader.loader(false);
          this.GetListPartCategory(this.filter);
        },
        error: () => {
          this.subLoader.loader(false);
        }
      });
      return;
    }
  
    if (oldValue === newValue) return;
  
    const payload: UpdatePropertiesInterface<LSPartCategoryCusDTO> = {
      DTO: item,
      Properties: [field as string, 'TypeData']
    };
    this.UpdatePartCategory(payload);
  }

  //#region confirm delete
  public onDeleteClick(item: LSPartCategoryCusDTO): void {
    if (item.Code == 0) {
      this.newItem = null;
      this.notification.onSuccess(`Xoá phân nhóm ${this.TypeCategory == LSPartCategoryTypeDataEnum.PART ? 'phụ tùng' : 'xe máy'} thành công`);
      this.refreshGrid();
    } else {
      this.detailActive = item;
      this.popupConfirmOpen = true;
    }
  }

  public confirmDelete(): void {
    if (!this.detailActive) return;
    this.DeletePartCategory([this.detailActive]);
    this.popupConfirmOpen = false;
    this.detailActive = null;
  }

  //#endregion

  // khi click + Thêm mới
  public onAddNew(): void {
    this.newItem = new LSPartCategoryCusDTO();
    setTimeout(() => {
      const el = document.getElementById(`input-Category-0`) as HTMLInputElement;
      if (el) {
        el.focus();
      }
    }
    )
    this.refreshGrid();


    //#endregion
  }

}
