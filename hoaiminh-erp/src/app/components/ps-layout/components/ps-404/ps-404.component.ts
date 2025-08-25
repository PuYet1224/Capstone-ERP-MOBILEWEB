import { Component, Input } from '@angular/core';

@Component({
    selector: 'ps-404',
    templateUrl: './ps-404.component.html',
    styleUrls: ['./ps-404.component.scss']
})

export class Ps404Component {
    @Input() name: string = '';
    constructor() { }
}