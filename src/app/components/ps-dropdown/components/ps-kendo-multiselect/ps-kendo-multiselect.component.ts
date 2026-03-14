import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-multiselect',
  templateUrl: './ps-kendo-multiselect.component.html',
  styleUrls: ['./ps-kendo-multiselect.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoMultiselectComponent),
      multi: true
    }
  ]
})
export class PsKendoMultiselectComponent implements ControlValueAccessor, OnChanges {
  //#region handle value
  public onChange: (_: any) => void = () => { };
  public onTouched: (_: any) => void = () => { };

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  //#endregion

  @Input() data: any[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() valueField: string;
  @Input() textField: string;
  @Input() filterable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() width: number;
  @Input() hasPrefix: boolean = false;

  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<any>();
  @Output() removeTag = new EventEmitter<any>();

  public filteredItems: any[] = [];
  public value: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.filteredItems = this.data.slice();
    }
  }

  public onValueChange(e) {
    this.valueChange.emit(e);
  }

  public onRemoveTag(tag) {
    this.removeTag.emit(tag);
  }

  public onBlur(): void {
    this.blur.emit();
  }

  public onFocus(): void {
    this.focus.emit();
  }

  public onFilterChange(searchTerm: string): void {
    const contains =
      (value: string) => (item: any) =>
        item[this.textField].toLowerCase().includes(value?.toLowerCase());
    this.filteredItems = this.data.filter(contains(searchTerm));
  }
}
