import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ps-filter-button',
  templateUrl: './ps-filter-button.component.html',
  styleUrls: ['./ps-filter-button.component.scss'],
})
export class PsFilterButtonComponent {
  @Input() clearDisabled: boolean;
  @Input() resetDisabled: boolean;
  @Output() reset: EventEmitter<any> = new EventEmitter();
  @Output() clear: EventEmitter<any> = new EventEmitter();
  @Output() reload: EventEmitter<any> = new EventEmitter();

  public onReload() {
    this.reload.emit();
  }

  public onReset() {
    this.reset.emit();
  }

  public onClear() {
    this.clear.emit();
  }
}
