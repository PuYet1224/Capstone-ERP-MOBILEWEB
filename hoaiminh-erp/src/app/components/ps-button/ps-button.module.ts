import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { PsKendoButtonComponent } from './components/ps-kendo-button/ps-kendo-button.component';
import { CommonModule } from '@angular/common';
import { FileSelectModule } from '@progress/kendo-angular-upload';
import { PsGroupButtonImportComponent } from './components/ps-group-button-import/ps-group-button-import.component';
import { PsKendoDropdownButtonComponent } from './components/ps-kendo-dropdown-button/ps-kendo-dropdown-button.component';
import { PsFilterButtonComponent } from './components/ps-filter-button/ps-filter-button.component';
import { LabelModule } from '@progress/kendo-angular-label';

@NgModule({
  imports: [
    ButtonsModule,
    CommonModule,
    FileSelectModule,
    LabelModule
  ],
  declarations: [
    PsKendoButtonComponent,
    PsGroupButtonImportComponent,
    PsKendoDropdownButtonComponent,
    PsFilterButtonComponent
  ],
  exports: [
    PsKendoButtonComponent,
    PsGroupButtonImportComponent,
    PsKendoDropdownButtonComponent,
    PsFilterButtonComponent
  ],
})
export class PSButtonModule { }
