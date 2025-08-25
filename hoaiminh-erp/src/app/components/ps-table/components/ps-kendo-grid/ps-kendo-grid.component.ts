import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ColumnComponent, CommandColumnComponent, DetailExpandEvent, DetailTemplateDirective, GridComponent, GridDataResult, RowArgs, RowClassArgs, RowSelectedFn, SelectionEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/services/utilities/utility.object';
import { ActionColumnDTO } from '../../models/dtos/action-column.dto';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PSArray } from 'src/app/services/utilities/ps-array';

@Component({
  selector: 'ps-kendo-grid',
  templateUrl: './ps-kendo-grid.component.html',
  styleUrls: ['./ps-kendo-grid.component.scss'],
})

export class PsKendoGridComponent implements AfterViewInit {
  constructor(private cdr: ChangeDetectorRef) { }

  @Input() @Ps_UtilObjectService.Required data: Array<any> | GridDataResult;
  @Input() pageable: boolean = true;
  @Input() pageSize: number = 25;
  @Input() skip: number = 0;
  @Input() hasColumnCheckbox: boolean = false;
  @Input() sortField: string = '';
  @Input() hasColumnAction: boolean = false;
  @Input() actionColumnWidth: number = 45;
  @Input() actionColumnData: ActionColumnDTO[] = [];
  @Input() header: boolean = true;
  @Input() isDetailExpanded: (args: RowArgs) => boolean;
  @Input() actionColumnSticky: boolean = true;
  @Input() selectable = "";
  @Input() resizable: boolean = false;
  @Input() rowSelected: ({ dataItem, index }) => boolean = () => false;

  @Output() actionSelected: EventEmitter<ActionColumnDTO> = new EventEmitter<ActionColumnDTO>();
  @Output() btnActionFocus: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageChanged: EventEmitter<PageChangeEvent> = new EventEmitter<PageChangeEvent>();
  @Output() checkboxChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() detailExpand: EventEmitter<DetailExpandEvent> = new EventEmitter<DetailExpandEvent>();
  @Output() selectionChange: EventEmitter<SelectionEvent> = new EventEmitter<SelectionEvent>();

  @ViewChild('PsKendoGrid') public diCustomGridRef: GridComponent;
  @ContentChildren(ColumnComponent) columns;
  @ContentChildren(CommandColumnComponent) commandColumns;
  @ContentChildren(DetailTemplateDirective) child;

  public sort: SortDescriptor[] = [];
  public isAllCheckboxChecked: boolean = false;
  public pageSizes: number[] = [25, 50, 75, 100];
  public listItemCheck: any[] = [];

  ngAfterViewInit() {
    this.sort = [
      {
        field: this.sortField,
        dir: 'asc',
      },
    ];

    var arr = [
      this.columns.toArray(),
      this.commandColumns.toArray()
    ]

    //
    var temp = this.diCustomGridRef.columns.toArray();
    if (!PSArray.isNullOrEmpty(temp) && temp[0].headerClass == "checkboxColumn")
      arr.unshift(temp)
    else {
      if (this.hasColumnAction)
        arr.push(temp)
    }

    this.diCustomGridRef.columns.reset(arr);
    if (this.child.toArray().length > 0) {
      this.diCustomGridRef.detailTemplateChildren.reset([this.child.toArray()]);
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.listItemCheck = [];
    }
  }

  public ondetailexpand(e) {
    this.detailExpand.emit(e);
  }

  public rowCallback = (context: RowClassArgs) => {
    if (context.index % 2 == 0) {
      return { white: true };
    } else {
      return { transparent: true };
    }
  };

  public onItemClick(e: ActionColumnDTO, d: any) {
    e.data = d;
    this.actionSelected.emit(e);
  }

  public onBtnActionFocus(d: any) {
    this.btnActionFocus.emit(d);
  }
  public onPageChange(e: PageChangeEvent): void {
    this.pageSize = e.take;
    this.skip = e.skip;
    this.pageChanged.emit(e);
    this.isAllCheckboxChecked = false;
    this.listItemCheck = [];
    this.checkboxChange.emit(this.listItemCheck);
  }

  public setValueAllCheckbox(e) {
    if (e)
      this.listItemCheck = [...(this.data as GridDataResult).data];
    else
      this.listItemCheck = [];
    this.checkboxChange.emit(this.listItemCheck);
  }

  public checkItemChecked(e) {
    if (this.listItemCheck.indexOf(e) >= 0)
      this.listItemCheck.splice(this.listItemCheck.indexOf(e), 1)
    else
      this.listItemCheck.push(e);

    if (this.listItemCheck.length == 0)
      this.isAllCheckboxChecked = false

    this.checkboxChange.emit(this.listItemCheck)
  }

  public checkedItem(e) {
    return this.listItemCheck.indexOf(e) >= 0
  }

  public onSelectionChange(e) {
    this.selectionChange.emit(e);
  }
}
