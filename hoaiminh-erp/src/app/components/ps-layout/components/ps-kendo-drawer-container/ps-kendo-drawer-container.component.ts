import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'ps-kendo-drawer-container',
    templateUrl: './ps-kendo-drawer-container.component.html',
    styleUrls: ['./ps-kendo-drawer-container.component.scss']
})
export class PsKendoDrawerContainerComponent {
    constructor() { }
    @Input() title: string = '';
    @Input() expanded: boolean = false;

    @Output() collapse = new EventEmitter<boolean>();

    public onCollapse() {
        this.expanded = false
        this.collapse.emit(this.expanded);
    }
}