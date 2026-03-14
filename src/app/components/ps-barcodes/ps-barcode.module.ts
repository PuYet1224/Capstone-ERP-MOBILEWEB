import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { PsBarcodeScanComponent } from './components/ps-barcode-scan/ps-barcode-scan.component';
import { CommonModule } from '@angular/common';
import { LabelModule } from '@progress/kendo-angular-label';
import { SharedModule } from "@progress/kendo-angular-dropdowns";
import { PsButtonModule } from '../ps-button/ps-button.module';

@NgModule({
  imports: [
    ButtonsModule,
    CommonModule,
    LabelModule,
    SharedModule,
    PsButtonModule
  ],
  declarations: [
    PsBarcodeScanComponent
  ],
  exports: [
    PsBarcodeScanComponent
  ],
})
export class PsBarcodeModule { }
