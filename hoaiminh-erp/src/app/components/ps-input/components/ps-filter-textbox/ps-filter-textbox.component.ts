import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'ps-filter-textbox',
  templateUrl: './ps-filter-textbox.component.html',
  styleUrls: ['./ps-filter-textbox.component.scss']
})
export class PsFilterTextboxComponent {
  public filter: FilterDescriptor[] = [];
  public value: string = '';

  @Input() placeholder: string = '';
  @Input() hasLabel: boolean = true;
  @Input() listField: string[] = [];
  @Output() onFilter = new EventEmitter<any>();

  private handelFilter() {
    this.filter = [];
    const trimmedValue = this.value.trim();
    if (trimmedValue != '') {
      this.listField.forEach(f => {
        this.filter.push({ field: f, value: trimmedValue, operator: "contains", ignoreCase: true })
      })
    }

    this.onFilter.emit(this.filter);
  }

  public onKeydownEnter() {
    this.handelFilter();
  }


  public oFilter() {
    this.handelFilter();
  }

  public clear() {
    this.value = '';
    // this.filter = [];
    // this.handelFilter();
  }
}
