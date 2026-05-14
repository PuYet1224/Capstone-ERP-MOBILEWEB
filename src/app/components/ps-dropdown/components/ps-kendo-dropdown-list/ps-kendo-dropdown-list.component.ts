import { Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { PsArray } from 'src/app/services/utilities/ps-array';

@Component({
  selector: 'ps-kendo-dropdown-list',
  templateUrl: './ps-kendo-dropdown-list.component.html',
  styleUrls: ['./ps-kendo-dropdown-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoDropdownListComponent),
      multi: true
    }
  ]
})

export class PsKendoDropdownListComponent implements ControlValueAccessor, OnChanges {
  //#region handle value
  public onChange = (_: any) => { };
  public onTouched: (_: any) => void = () => { };
  public value: any;
  public data1: any[];

  @ViewChild('dropdownlist') public diCustomGridRef: DropDownListComponent;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.data1 = [...this.data].slice();
      if (PsArray.isNullOrEmpty(this.data))
        this.value = null;
    }
  }

  @Input() label: string = '';
  @Input() data: any[];
  @Input() textField: string;
  @Input() valueField: string;
  @Input() disabled: boolean;
  @Input() filterable = false;
  @Input() valuePrimitive: boolean = false;
  @Input() popupSettings = { animate: true, appendTo: 'root' };
  @Output() valueChange = new EventEmitter<any>();
  @Output() selectChange = new EventEmitter<any>();
  @Output() focus = new EventEmitter<any>();
  @Output() open = new EventEmitter<any>();

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public handleValueChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  public itemDisabled(itemArgs) {
    return itemArgs.dataItem.Disabled == true;
  }

  public onSelectChange(e) {
    this.selectChange.emit(e);
  }

  public onFocus() {
    this.focus.emit();
  }

  public onOpen() {
    this.open.emit();
  }

  public handleFilter(value) {
    this.data1 = this.data.filter(
      (s) => (s[this.textField] || '').toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
}
