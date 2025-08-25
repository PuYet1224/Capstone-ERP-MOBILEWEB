import { Component, Input } from "@angular/core";

@Component({
  selector: 'ps-kendo-dialog',
  templateUrl: './ps-kendo-dialog.component.html',
  styleUrls: ['./ps-kendo-dialog.component.scss'],
})
export class PsKendoDialogComponent {
  @Input() theme: 'primary' | 'error' | 'warning' | 'info' | '' = '';
  @Input() open: boolean = false;
}
