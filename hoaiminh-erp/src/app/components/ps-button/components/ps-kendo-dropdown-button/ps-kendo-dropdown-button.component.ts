import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ps-kendo-dropdown-button',
  templateUrl: './ps-kendo-dropdown-button.component.html',
  styleUrls: ['./ps-kendo-dropdown-button.component.scss']
})
export class PsKendoDropdownButtonComponent {
  @Input() data: any[] = [];
  @Input() title: string = '';
  @Input() textField!: string;
  @Input() iconField!: string;
  @Input() isIconPrefix = true;
  @Input() align: string = 'right';

  @Output() itemClick = new EventEmitter<any>();

  handleItemClick(e: any): void {
    const item = e.item ?? e;
    this.itemClick.emit(item);
  }
}
