import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ps-kendo-button',
  templateUrl: './ps-kendo-button.component.html',
  styleUrls: ['./ps-kendo-button.component.scss']
})

export class PsKendoButtonComponent {
  @Input() title: string = '';
  @Input() icon: string;
  @Input() disabled: boolean = false;
  @Input() theme: 'primary' | 'primary-outline' | 'error' | 'error-outline' | 'warning' | 'warning-outline' | 'info' | 'info-outline' | '' = '';
  @Output() onClick = new EventEmitter<any>()

  public click() {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
