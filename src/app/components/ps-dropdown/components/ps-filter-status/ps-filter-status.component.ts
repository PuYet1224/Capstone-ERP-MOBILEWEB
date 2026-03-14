import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { LSStatusCusDTO } from 'src/app/models/dtos/e-dtos/ls-status.dto';
import { PsArray } from 'src/app/services/utilities/ps-array';
import { PSFilterStatusItem } from '../../models/dtos/ps-filter-status-item.interface';

@Component({
  selector: 'ps-filter-status',
  templateUrl: './ps-filter-status.component.html',
  styleUrls: ['./ps-filter-status.component.scss'],
})
export class PsFilterStatusComponent implements OnChanges {
  @Input() data: LSStatusCusDTO[] = [];
  @Input() valueField: string;
  @Input() field: string;
  @Input() label: string;
  @Output() changedValue: EventEmitter<any> = new EventEmitter();

  public value: LSStatusCusDTO[] = [];
  public defaultStatus: LSStatusCusDTO[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !PsArray.isNullOrEmpty(this.data))
      this.getStatusListByType(this.data);
  }

  private getStatusListByType(listdata: LSStatusCusDTO[]) {
    var item: LSStatusCusDTO = new LSStatusCusDTO();
    item[this.valueField] = null;
    item.StatusName = 'Tất cả';
    item.ListStatus = listdata;
    this.data = [item];
    this.value = listdata.filter(item => item.IsActive);
    this.defaultStatus = this.value;
    this.changedValue.emit(this.filterChange());
  }

  public isOpen = false;
  public filter: FilterDescriptor[] = [];

  private filterChange() {
    this.filter = [];
    this.value.forEach(element => {
      if (element[this.valueField] != null) {
        var filterdes = { field: this.field, operator: 'eq', value: element[this.valueField] }
        this.filter.push(filterdes)
      }
    });
    return this.filter;
  }

  public fChange(e) {
    this.filterChange();
    this.changedValue.emit(this.filterChange());
  }

  public tagMapper(tags: PSFilterStatusItem[]) {
    const selectedOnlyChildren = tags.filter((tag) => tag.id !== 0);
    const count = selectedOnlyChildren.length;
    return [count > 0 ? `- ${count} trạng thái được chọn -` : `Lọc theo trạng thái`];
  }
}
