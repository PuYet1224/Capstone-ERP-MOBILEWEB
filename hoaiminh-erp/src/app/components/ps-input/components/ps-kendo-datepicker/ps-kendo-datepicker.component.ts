import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-datepicker',
  templateUrl: './ps-kendo-datepicker.component.html',
  styleUrls: ['./ps-kendo-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoDatepickerComponent),
      multi: true
    }
  ]
})

export class PsKendoDatepickerComponent implements ControlValueAccessor {
  //#region handle value
  public onChange: (_: any) => void = () => { };
  public onTouched: (_: any) => void = () => { };

  public value: Date | null = null;

  writeValue(value: string | Date | null) {
    this.value = value
      ? (value instanceof Date ? value : new Date(value))
      : null;
  }


  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  //#endregion

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() width: number;
  @Input() hasPrefix: boolean = false;

  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() keydownEnter = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<any>();


  public onKeydownEnter() {
    this.keydownEnter.emit();
  }

  public onValueChange() {
    this.valueChange.emit(this.value);
  }

  public onBlur(): void {
    this.blur.emit();
  }

  public onFocus(): void {
    this.focus.emit();
  }
  public handleDateChange(v: Date) {
    this.value = v;
    this.onChange(v);
    this.valueChange.emit(v);
  }
}
