import { NgModule } from '@angular/core';
import { PsKendoDropdownListComponent } from './components/ps-kendo-dropdown-list/ps-kendo-dropdown-list.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { CommonModule } from '@angular/common';
import { PsFilterStatusComponent } from './components/ps-filter-status/ps-filter-status.component';
import { FormsModule } from '@angular/forms';
import { PSButtonModule } from '../ps-button/ps-button.module';
import { PsKendoMultiselectComponent } from './components/ps-kendo-multiselect/ps-kendo-multiselect.component';
import { PsKendoAutocompleteComponent } from './components/ps-kendo-autocomplete/ps-kendo-autocomplete.component';
import { PsFilterStatus1Component } from './components/ps-filter-status1/ps-filter-status1.component';

@NgModule({
  imports: [
    DropDownsModule,
    LabelModule,
    CommonModule,
    FormsModule,
    PSButtonModule,
  ],
  declarations: [
    PsKendoDropdownListComponent,
    PsFilterStatusComponent,
    PsFilterStatus1Component,
    PsKendoMultiselectComponent,
    PsKendoAutocompleteComponent
  ],
  exports: [
    PsKendoDropdownListComponent,
    PsFilterStatusComponent,
    PsFilterStatus1Component,

    PsKendoMultiselectComponent,
    PsKendoAutocompleteComponent
  ],
})
export class PSDropdownModule { }
