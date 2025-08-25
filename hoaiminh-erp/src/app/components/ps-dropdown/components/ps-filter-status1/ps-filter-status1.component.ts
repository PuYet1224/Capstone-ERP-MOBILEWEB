import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { LSStatusTypeDataEnum, LSStatusType } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { PSFilterStatusItem } from '../../models/dtos/ps-filter-status-item.interface';
import { LSStatusCusDTO } from 'src/app/models/dtos/e-dtos/ls-status.dto';
import { PSArray } from 'src/app/services/utilities/ps-array';

@Component({
  selector: 'ps-filter-status1',
  templateUrl: './ps-filter-status1.component.html',
  styleUrls: ['./ps-filter-status1.component.scss'],
})
export class PsFilterStatus1Component implements OnChanges {
  @Input() data: LSStatusCusDTO[] = [];
  @Input() valueField: string;
  @Input() field: string;
  @Input() label: string;
  @Output() changedValue: EventEmitter<any> = new EventEmitter();

  public value: LSStatusCusDTO[] = [];
  public defaultStatus: LSStatusCusDTO[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !PSArray.isNullOrEmpty(this.data))
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
