import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-radiobutton',
  templateUrl: './ps-kendo-radiobutton.component.html',
  styleUrls: ['./ps-kendo-radiobutton.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoRadioButtonComponent),
      multi: true
    }
  ]
})
export class PsKendoRadioButtonComponent implements ControlValueAccessor {
  @Input() id!: string;
  @Input() name!: string;
  @Input() label!: string;
  @Input() labelPosition: 'left' | 'right' = 'right';
  @Input() value: any;
  @Input() disabled: boolean;
  @Output() onchecked = new EventEmitter<any>();

  private innerValue: any;
  onChange = (value: any) => { };
  onTouched = () => { }
  writeValue(value: any): void {
    this.innerValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setValue(): void {
    this.innerValue = this.value;
    this.onChange(this.value);
    this.onTouched();
    this.onchecked.emit();
  }

  isChecked(): boolean {
    return this.innerValue === this.value;
  }
}
