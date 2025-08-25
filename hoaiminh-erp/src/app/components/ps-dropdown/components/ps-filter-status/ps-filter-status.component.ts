import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { LSStatusTypeDataEnum, LSStatusType } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { PSFilterStatusItem } from '../../models/dtos/ps-filter-status-item.interface';

@Component({
  selector: 'ps-filter-status',
  templateUrl: './ps-filter-status.component.html',
  styleUrls: ['./ps-filter-status.component.scss'],
})
export class PsFilterStatusComponent implements OnInit {
  public data: PSFilterStatusItem[] = [];
  public value: PSFilterStatusItem[] = [];
  public defaultStatus: PSFilterStatusItem[] = [];
  public isOpen = false;
  public filter: FilterDescriptor[] = [];

  @Input() type: LSStatusTypeDataEnum;
  @Input() clearDisabled: boolean;
  @Input() resetDisabled: boolean;
  @Input() field: string;
  @Output() statusChanged: EventEmitter<any> = new EventEmitter();
  @Output() statusReset: EventEmitter<any> = new EventEmitter();
  @Output() statusClear: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.getStatusListByType(this.type);
  }

  private getStatusListByType(type: LSStatusTypeDataEnum) {
    var statustype = LSStatusType[this.type];
    var arr = Object.values(statustype) as PSFilterStatusItem[];
    this.data = [
      {
        id: 0,
        text: 'Tất cả',
        children: arr,
      }
    ];
    this.value = arr.filter(item => item.active);
    this.defaultStatus = this.value;
    this.statusChanged.emit(this.filterChange());
  }

  private filterChange() {
    this.filter = [];
    this.value.forEach(element => {
      var filterdes = { field: this.field, operator: 'eq', value: element.id }
      this.filter.push(filterdes)
    });
    return this.filter;
  }

  public fChange(e) {
    this.filterChange();
    this.statusChanged.emit(this.filterChange());
  }

  public tagMapper(tags: PSFilterStatusItem[]) {
    const selectedOnlyChildren = tags.filter((tag) => tag.id !== 0);
    const count = selectedOnlyChildren.length;
    return [count > 0 ? `- ${count} trạng thái được chọn -` : `Lọc theo trạng thái`];
  }

  public removeItem(item: any) {
    this.value = this.value.filter((v) => v.id !== item.id);
    this.statusChanged.emit(this.filterChange());
  }

  public resetStatus() {
    this.value = [...this.defaultStatus];
    this.statusReset.emit(this.filterChange());
  }

  public clearStatus() {
    this.value = [];
    this.statusClear.emit(this.filterChange());
  }
}
