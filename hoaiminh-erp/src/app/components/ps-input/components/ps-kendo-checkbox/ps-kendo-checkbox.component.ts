import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-checkbox',
  templateUrl: './ps-kendo-checkbox.component.html',
  styleUrls: ['./ps-kendo-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PSKendoCheckboxComponent),
      multi: true
    }
  ]
})
export class PSKendoCheckboxComponent implements ControlValueAccessor {
  @Input() id!: string;
  @Input() name!: string;
  @Input() label!: string;
  @Input() labelPosition: 'left' | 'right' = 'right';
  @Input() disabled: boolean;
  @Output() onchecked = new EventEmitter<any>();

  public innerValue: any;
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
    this.innerValue = !this.innerValue
    this.onChange(this.innerValue);
    this.onTouched();
    this.onchecked.emit();
  }
}
