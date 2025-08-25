import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-textarea',
  templateUrl: './ps-kendo-textarea.component.html',
  styleUrls: ['./ps-kendo-textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoTextareaComponent),
      multi: true
    }
  ]
})
export class PsKendoTextareaComponent implements ControlValueAccessor {

  @Input() title: string = '';
  @Input() disabled: boolean = false;
  @Input() value: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() width: number;
  @Input() height: number = 80;
  @Input() maxHeight: number = 80;

  @Input() hasPrefix: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() onClick = new EventEmitter<any>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() keydownEnter = new EventEmitter<void>();

  private onChange: any = () => { };
  private onTouched: any = () => { };

  public onValueChange(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);  // Update the control value when changed
  }

  public handleClick() {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    if (value !== undefined) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  public onKeydownEnter() {
    this.keydownEnter.emit();
  }
  public onBlur(): void {
    this.blur.emit();
  }

  public onFocus(): void {
    this.focus.emit();
  }
}
