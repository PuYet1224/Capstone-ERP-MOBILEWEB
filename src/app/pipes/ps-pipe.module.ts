import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WHIOMasterStatusPipe } from './e-style/wh-io-master-status.pipe';

@NgModule({
    declarations: [
        WHIOMasterStatusPipe
    ],
    exports: [
        WHIOMasterStatusPipe
    ],
    imports: [
        CommonModule
    ]
})
export class PSPipeModule { }