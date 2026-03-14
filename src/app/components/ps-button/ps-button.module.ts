import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { PsKendoButtonComponent } from './components/ps-kendo-button/ps-kendo-button.component';
import { CommonModule } from '@angular/common';
import { LabelModule } from '@progress/kendo-angular-label';

@NgModule({
  imports: [
    ButtonsModule,
    CommonModule,
    LabelModule
  ],
  declarations: [
    PsKendoButtonComponent
  ],
  exports: [
    PsKendoButtonComponent
  ],
})
export class PsButtonModule { }
