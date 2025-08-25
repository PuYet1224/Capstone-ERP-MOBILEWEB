import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { IconModule } from '@progress/kendo-angular-icons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PsKendoGridComponent } from './components/ps-kendo-grid/ps-kendo-grid.component';
import { DropDownButtonModule } from '@progress/kendo-angular-buttons';

@NgModule({
  imports: [
    CommonModule,
    GridModule,
    IconModule,
    InputsModule,
    DropDownButtonModule
  ],
  declarations: [
    PsKendoGridComponent
  ],
  exports: [
    PsKendoGridComponent
  ]
})

export class PSTableModule { }
