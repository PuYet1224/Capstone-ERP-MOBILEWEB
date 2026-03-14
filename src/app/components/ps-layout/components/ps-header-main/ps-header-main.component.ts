import { Component } from '@angular/core';
import { SystemService } from 'src/app/views/system/services/system.service';

@Component({
    selector: 'ps-header-main',
    templateUrl: './ps-header-main.component.html',
    styleUrls: ['./ps-header-main.component.scss']
})

export class PsHeaderMainComponent {
    constructor(
        private sysservices: SystemService
    ) { }

    public onconfirmlogout: boolean = false;

    public onlogout() {
        this.sysservices.logout();
    }
}