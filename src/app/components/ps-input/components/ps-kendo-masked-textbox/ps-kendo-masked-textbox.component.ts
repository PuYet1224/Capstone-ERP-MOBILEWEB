import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ps-kendo-masked-textbox',
  templateUrl: './ps-kendo-masked-textbox.component.html',
  styleUrls: ['./ps-kendo-masked-textbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PSKendoMaskeTextboxComponent),
      multi: true
    }
  ]
})

export class PSKendoMaskeTextboxComponent implements ControlValueAccessor {
  constructor(private renderer: Renderer2) { }

  @ViewChild('maskedtextbox', { read: ElementRef }) phoneMask!: ElementRef;

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

  ngAfterViewInit(): void {
    if (this.type === 'tel') {
      const input = this.phoneMask.nativeElement.querySelector('input');
      if (input) {
        this.renderer.setAttribute(input, 'inputmode', 'numeric');
        this.renderer.setAttribute(input, 'pattern', '[0-9]*');
        this.renderer.setAttribute(input, 'type', 'tel');
      }
    }
  }

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() width: number;
  @Input() hasPrefix: boolean = false;
  @Input() mask: string;
  @Input() type: 'tel' | string;

  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() keydownEnter = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<any>();

  public value: string = '';

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
}
