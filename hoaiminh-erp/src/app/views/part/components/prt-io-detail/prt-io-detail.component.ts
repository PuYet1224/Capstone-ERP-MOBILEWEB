import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { WHIOMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-io-master.dto';
import { WHIOMasterStatusEnum } from '../../../../models/enums/e-status/wh-io-master-status.enum';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { ActionColumnDTO } from 'src/app/components/ps-table/models/dtos/action-column.dto';
import { WHIODetailCusDTO } from '../../../../models/dtos/e-dtos/wh-io-detail.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { PSObject } from 'src/app/services/utilities/ps-object';
import { LSPartItemCusDTO } from '../../../../models/dtos/e-dtos/ls-part-item.dto';
import { WHIOMasterTypeDataEnum } from '../../../../models/enums/e-type/wh-io-master-type-data.enum';
import { WHIOMasterTypeOfMasterEnum } from '../../../../models/enums/e-type/wh-io-master-type-of-master.enum';

@Component({
  selector: 'prt-io-detail',
  templateUrl: './prt-io-detail.component.html',
  styleUrls: ['./prt-io-detail.component.scss'],
})
export class PrtIODetailComponent implements AfterViewInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = [];
  public whiomasterstatusenum = WHIOMasterStatusEnum;
  public whiomastertypeofmaster = WHIOMasterTypeOfMasterEnum;
  public WHIOMasterTypeDataEnum = WHIOMasterTypeDataEnum;


  @Input() Master: WHIOMasterCusDTO;
  @Output() CheckQuantity = new EventEmitter<any>();

  constructor(
    private partapi: PSPartApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService
  ) { }

  //#region life cycle
  ngAfterViewInit(): void {
    this.handleFilter([]);
    this.GetListIODetail(this.filter);
  }

  ngOnDestroy() {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region  dialog add
  private oldBarcode: string;
  private filterField: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private stateBarcode: State = { filter: this.filterField, take: 25, skip: 0 };
  public skipAdd: number = 0;
  public takeAdd: number = 25;
  private listItemChecked: LSPartItemCusDTO[] = [];
  public isShowDialogAdd: boolean = false;
  public dataPartItem: Subject<any> = new Subject<any>();
  public listCheckedCount: number = 0;

  public onShowDialogAdd() {
    this.onSearchBarcode([]);
    this.isShowDialogAdd = true;
  }

  public onSearchBarcode(e: FilterDescriptor[]) {
    var barcode = '';
    if (!PSArray.isNullOrEmpty(e))
      barcode = e[0].value;

    if (this.oldBarcode != barcode) {
      this.filterField.filters = e;
      this.GetListPartItem(this.stateBarcode, barcode);
    }
  }

  public checkboxChange(e) {
    this.listItemChecked = e;
    this.listCheckedCount = this.listItemChecked.length;
  }

  public onPagePArtItemChanged(e: PageChangeEvent) {
    this.stateBarcode.skip = e.skip;
    this.stateBarcode.take = e.take;
    this.skipAdd = e.skip;
    this.GetListPartItem(this.stateBarcode, this.oldBarcode);
  }

  public closeDialogAdd() {
    this.oldBarcode = null;
    this.isShowDialogAdd = false;
    this.listItemChecked = [];
    this.listCheckedCount = 0;
  }

  public GetListPartItem(filter: State, barcode: string) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListPartItem(filter, this.Master.Code).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.dataPartItem.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total });
          this.oldBarcode = barcode;
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin phụ tùng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phụ tùng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public UpdateListIODetail(param: Array<LSPartItemCusDTO>) {
    this.subLoader.loader(true);
    var list = [];
    param.forEach((f) => {
      var dto = new WHIODetailCusDTO();
      dto.IOMaster = this.Master.Code;
      dto.PartItem = f.Code;
      dto.IsNew = this.Master.TypeData == WHIOMasterTypeDataEnum.Out && this.Master.Reference != null;
      list.push(dto);
    });
    var temp = this.partapi.UpdateListIODetail(list).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.closeDialogAdd();
          this.GetListIODetail(this.filter);
          this.subLoader.loader(false);
          this.notification.onSuccess('Thành công');
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi cập nhật thông tin phụ tùng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi cập nhật thông tin phụ tùng: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region filter - import
  public listfiltertext = ['Barcode', 'TypePartItemName'];
  public skip: number = 0;
  public take: number = 25;
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25 };

  private handleFilter(filter: FilterDescriptor[], resetPage = true) {
    if (resetPage) {
      this.filter.skip = 0;
      this.skip = 0;
    }
    this.groupfilter.filters = [];
    this.filtertext.filters = filter;

    if (this.filtertext.filters.length != 0)
      this.groupfilter.filters.push(this.filtertext);

    this.groupfilter.filters.push({
      field: 'IOMaster',
      operator: 'eq',
      value: this.Master.Code,
    });

    this.filter.filter = this.groupfilter;
  }

  public textFilterChange(e) {
    this.handleFilter(e);
    const currentFilterStr = JSON.stringify(this.filter);
    if (currentFilterStr !== this.lastFilterStringified) {
      this.lastFilterStringified = currentFilterStr;
      this.GetListIODetail(this.filter);
    }
  }

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.GetListIODetail(this.filter);
  }

  public uploadEventHandler(e: File) {
    this.ImportIODetail(e);
  }

  public fillReceivedWithConfirmed(): void {
    this.UpdateIOQuantity(this.Master);
  }

  public ImportIODetail(file: File) {
    this.subLoader.loader(true);
    this.partapi.ImportIODetail(file, this.Master.Code).subscribe(
      (res) => {
        if (!PSObject.isNullOfUndefined(res) && res.StatusCode === 0) {
          this.GetListIODetail(this.filter);
          this.subLoader.loader(false);
          this.notification.onSuccess('Import chi tiết phiếu thành công');
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Import chi tiết phiếu không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Import chi tiết phiếu không thành công: ${err.message}`
        );
      }
    );
  }

  private UpdateIOQuantity(param: WHIOMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateIOQuantity(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListIODetail(this.filter);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi điền số lượng nhập = số lượng xác nhận: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi điền số lượng nhập = số lượng xác nhận: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  private objReturn: { data: Array<WHIODetailCusDTO>; total: number } = { data: [], total: 0 };
  public actionColumn: ActionColumnDTO[] = [];
  public popupConfirmOpen = false;
  public detailActive: WHIODetailCusDTO;
  public dataItem: any = {};
  private lastFilterStringified = '';
  public isShowQuantity: boolean = true;

  public formatListLocation(list: string[] | string): { shortText: string; fullText: string; } {
    const items = Array.isArray(list)
      ? list.filter((x) => x && typeof x === 'string')
      : typeof list === 'string'
        ? list
          .split(',')
          .map((x) => x.trim())
          .filter((x) => x)
        : [];

    const total = items.length;
    const fullText = items.join(', ');
    const shortText =
      total <= 5
        ? fullText
        : `${items.slice(0, 5).join(', ')} + ${total - 5} vị trí khác`;

    return { shortText, fullText };
  }

  public onActionClick(e: ActionColumnDTO) {
    const item = e.data as WHIODetailCusDTO;

    if (item.Code === 0) {
      const index = this.objReturn.data.indexOf(item);
      if (index !== -1) {
        this.objReturn.data = this.objReturn.data.filter(
          (x) => x.Code !== item.Code
        );
        this.data.next(this.objReturn);
      }
      this.editingField = '';
    } else {
      this.detailActive = item;
      this.popupConfirmOpen = true;
      this.editingField = '';
    }
  }

  private GetListIODetail(filter: State) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListIODetail(filter).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.objReturn = {
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          };
          this.data.next(this.objReturn);
          this.isShowQuantity = !res.ObjectReturn.Data.every(f => f.ConfirmQuantity == f.ReceivedQuantity);

          var propcheckA = '';
          var propcheckB = '';
          if (this.Master.TypeData == WHIOMasterTypeDataEnum.In) {
            propcheckA = 'ConfirmQuantity';
            propcheckB = 'ReceivedQuantity';
          }
          else {
            propcheckA = 'Quantity';
            propcheckB = 'ConfirmQuantity';
          }
          this.CheckQuantity.emit(res.ObjectReturn.Data.filter(f => f[propcheckA] != f[propcheckB]).length);
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

  public DeleteIODetail(param: WHIODetailCusDTO[]) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeleteIODetail(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListIODetail(this.filter);
          this.popupConfirmOpen = false;
          this.subLoader.loader(false);
          this.notification.onSuccess(`Xoá thông tin phụ tùng thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi xoá thông tin phụ tùng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá thông tin phụ tùng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateIODetail(param: WHIODetailCusDTO) {
    this.subLoader.loader(true);
    if (this.Master.TypeData == WHIOMasterTypeDataEnum.Out && this.Master.Status == WHIOMasterStatusEnum.NEW) {
      param.ConfirmQuantity = param.Quantity
    }
    var temp = this.partapi.UpdateIODetail(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.handleFilter([]);
          this.GetListIODetail(this.filter);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi ${param.Code == 0 ? 'thêm mới' : 'cập nhật'
            } thông tin phụ tùng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi ${param.Code == 0 ? 'thêm mới' : 'cập nhật'
          } thông tin phụ tùng: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //Hàm chỉnh sửa cho phép sửa cột theo trạng thái
  canEditField(field: string): boolean {
    switch (this.Master.Status) {
      case WHIOMasterStatusEnum.NEW: // NEW
        return ['Quantity', 'Remark'].includes(field);
      case WHIOMasterStatusEnum.SENT: // NEW
        return ['ConfirmQuantity'].includes(field);
      case WHIOMasterStatusEnum.RECEIVING: // RECEIVING
        return ['ReceivedQuantity'].includes(field);
      default:
        return false;
    }
  }

  //double click chỉnh sửa input
  @ViewChildren('rowInput') rowInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private itemFocus: WHIODetailCusDTO = new WHIODetailCusDTO();
  editingRowIndex: number;
  editingField: string;

  startEdit(rowIndex: number, field: string) {
    this.editingRowIndex = rowIndex;
    this.editingField = field;

    setTimeout(() => {
      const inputs = this.rowInputs.toArray();
      if (inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    });
  }

  isEditing(rowIndex: number, field: string): boolean {
    return (
      this.editingRowIndex === rowIndex &&
      this.editingField === field &&
      this.canEditField(field)
    );
  }

  public getItemFocus(item: WHIODetailCusDTO) {
    this.itemFocus = { ...item };
  }

  saveEdit(item: WHIODetailCusDTO) {
    // const currentValue = item[this.editingField];
    // if (currentValue === this.originalValue) {
    //   console.log('a');

    //   this.editingRowIndex = -1;
    //   this.editingField = '';
    //   return;
    // }
    if (item[this.editingField] == null) {
      item[this.editingField] = 0
    }
    if (item[this.editingField] != this.itemFocus[this.editingField])
      this.UpdateIODetail(item);

    this.editingRowIndex = -1;
    this.editingField = '';
  }

  public isNotAllowEditField(field: string): boolean {
    //true = đen
    //false = xanh
    if (
      field == 'ConfirmQuantity' &&
      this.Master.TypeData == WHIOMasterTypeDataEnum.Out &&
      this.Master.Status == WHIOMasterStatusEnum.SENT
    )
      return false;
    if (
      field == 'ReceivedQuantity' &&
      this.Master.TypeData == WHIOMasterTypeDataEnum.In &&
      this.Master.Status == WHIOMasterStatusEnum.RECEIVING
    )
      return false;
    return true;
  }
}
