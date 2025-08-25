import { NumberFormatOptions } from '@progress/kendo-angular-intl';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'ps-kendo-numeric-textbox',
  templateUrl: './ps-kendo-numeric-textbox.component.html',
  styleUrls: ['./ps-kendo-numeric-textbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PsKendoNumericTextboxComponent),
      multi: true
    }
  ]
})
export class PsKendoNumericTextboxComponent
  implements OnInit, ControlValueAccessor, AfterViewInit {

  @ViewChild('numericTextbox', { static: true }) numericTextboxRef!: ElementRef;

  @Input() label: string = '';
  @Input() size: string = '';
  @Input() placeholder: string = '';
  @Input() title: string = '';
  @Input() width: number;
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() spinners: boolean = false;
  @Input() decimals: number;
  /**
   * Định dạng đầu vào:
   * - 'n123', 'c2', ... cho decimal/currency với số bất kỳ
   * - 'p' cho percent (không kèm số)
   * - Hoặc object NumberFormatOptions để tùy chỉnh sâu hơn
   */
  @Input() format: `${'n' | 'c'}${number}` | 'p' | NumberFormatOptions;
  @Input() min: number;
  @Input() max: number = Number.POSITIVE_INFINITY;
  @Input() autoCorrect: boolean = true;
  @Input() step: number = 0;

  public input: number | null = null;

  @Output() valueChange = new EventEmitter<number>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() keyDownEnter = new EventEmitter<void>();
  @Output() doubleClick = new EventEmitter<void>();

  private onChange: (v: any) => void = () => { };
  private onTouched: () => void = () => { };

  /**
   * Khởi tạo: nếu format là string và bắt đầu bằng 'p' mà kèm số,
   * tự động điều chỉnh về 'p'.
   */
  ngOnInit(): void {
    if (typeof this.format === 'string' && this.format.startsWith('p')) {
      const rest = this.format.substring(1);
      if (rest.length > 0 && !isNaN(Number(rest))) {
        this.format = 'p';
      }
    }
  }

  ngAfterViewInit(): void {
  }

  writeValue(value: number): void {
    this.input = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputValueChange(value: number): void {
    if (this.disabled) return;
    this.input = value;
    this.valueChange.emit(this.input);
    this.onChange(this.input);
  }

  onBlurEvent(): void {
    this.onTouched();
    this.blur.emit();
  }

  onFocusEvent(): void {
    this.focus.emit();
  }

  onKeyDownEnterEvent(): void {
    this.keyDownEnter.emit();
  }

  onDoubleClick(): void {
    this.doubleClick.emit();
  }
}
