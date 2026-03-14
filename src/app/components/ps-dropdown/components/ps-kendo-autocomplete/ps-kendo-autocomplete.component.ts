import {
  AfterViewInit,
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'ps-kendo-autocomplete',
  templateUrl: './ps-kendo-autocomplete.component.html',
  styleUrls: ['./ps-kendo-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoAutocompleteComponent),
      multi: true,
    },
  ],
})
export class PsKendoAutocompleteComponent implements ControlValueAccessor, OnChanges {
  @ContentChild('kendoAutoCompleteItemTemplate', { static: false }) itemTemplate: TemplateRef<any>;

  @Input() label: string = '';
  @Input() data: string[] = [];
  @Input() placeholder: string = '';
  @Input() valueField: string;
  @Input() disabled: boolean = false;
  @Input() width: number;
  @Input() hasPrefix: boolean = false;
  @Input() filterable: boolean = false;
  @Input() popupSettings;

  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() keydownEnter = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.data1 = [...this.data].slice();
    }
  }

  public value: string = '';
  public data1: any[];

  // ControlValueAccessor
  public onChange: (_: any) => void = () => { };
  public onTouched: () => void = () => { };

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Event binding
  public onInternalValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  public onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  public onFocus(): void {
    this.focus.emit();
  }

  public onKeydownEnter(): void {
    this.keydownEnter.emit();
  }

  public handleFilter(value) {
    this.data1 = this.data.filter(
      (s) => s[this.valueField].toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
}
