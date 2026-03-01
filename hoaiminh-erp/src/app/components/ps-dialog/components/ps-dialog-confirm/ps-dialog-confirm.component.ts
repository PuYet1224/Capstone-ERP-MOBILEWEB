import { Component, Input } from '@angular/core';

@Component({
  selector: 'ps-dialog-confirm',
  templateUrl: './ps-dialog-confirm.component.html',
  styleUrls: ['./ps-dialog-confirm.component.scss'],
})
export class PsDialogConfirmComponent {
  @Input() theme: 'primary' | 'error' | 'warning' | 'info' | '' = '';
  @Input() open: boolean = false;
}
