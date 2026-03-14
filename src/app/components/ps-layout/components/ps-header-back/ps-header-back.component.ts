import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'ps-header-back',
    templateUrl: './ps-header-back.component.html',
    styleUrls: ['./ps-header-back.component.scss']
})

export class PsHeaderBackComponent {
    constructor(
        private router: Router
    ) {
    }

    onBack() {
        this.router.navigate(['/menu']);
    }
}