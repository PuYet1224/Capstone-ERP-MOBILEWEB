import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { PsButtonModule } from '../ps-button/ps-button.module';
import { PsFilterStatusComponent } from './components/ps-filter-status/ps-filter-status.component';
import { PsKendoAutocompleteComponent } from './components/ps-kendo-autocomplete/ps-kendo-autocomplete.component';
import { PsKendoDropdownListComponent } from './components/ps-kendo-dropdown-list/ps-kendo-dropdown-list.component';

@NgModule({
  imports: [
    DropDownsModule,
    LabelModule,
    CommonModule,
    FormsModule,
    PsButtonModule,
  ],
  declarations: [
    PsKendoDropdownListComponent,
    PsKendoAutocompleteComponent,
    PsFilterStatusComponent
  ],
  exports: [
    PsKendoDropdownListComponent,
    PsKendoAutocompleteComponent,
    PsFilterStatusComponent
  ],
})
export class PSDropdownModule { }
