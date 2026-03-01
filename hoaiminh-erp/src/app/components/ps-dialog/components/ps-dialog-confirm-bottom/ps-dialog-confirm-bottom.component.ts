import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ps-dialog-confirm-bottom',
  templateUrl: './ps-dialog-confirm-bottom.component.html',
  styleUrls: ['./ps-dialog-confirm-bottom.component.scss'],
})
export class PsDialogConfirmBottomComponent {
  @Input() open: boolean = false;
  @Input() title: string;

  @Output() close = new EventEmitter<any>();

  public onclose() {
    this.open = false;
    this.close.emit(this.open);
  }
}
