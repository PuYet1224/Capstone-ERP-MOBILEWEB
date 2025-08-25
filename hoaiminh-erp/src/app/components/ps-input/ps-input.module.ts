import { NgModule } from '@angular/core';
import { PsKendoTextboxComponent } from './components/ps-kendo-textbox/ps-kendo-textbox.component';
import { InputsModule, MaskedTextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from '@progress/kendo-angular-dropdowns';
import { PsFilterTextboxComponent } from './components/ps-filter-textbox/ps-filter-textbox.component';
import { PSButtonModule } from '../ps-button/ps-button.module';
import { PsKendoRadioButtonComponent } from './components/ps-kendo-radiobutton/ps-kendo-radiobutton.component';
import { PsKendoNumericTextboxComponent } from './components/ps-kendo-numeric-textbox/ps-kendo-numeric-textbox.component';
import { PsKendoTextareaComponent } from './components/ps-kendo-textarea/ps-kendo-textarea.component';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { PsKendoDatepickerComponent } from './components/ps-kendo-datepicker/ps-kendo-datepicker.component';
import { PSKendoCheckboxComponent } from './components/ps-kendo-checkbox/ps-kendo-checkbox.component';
import { PSKendoMaskeTextboxComponent } from './components/ps-kendo-masked-textbox/ps-kendo-masked-textbox.component';

@NgModule({
  imports: [
    InputsModule,
    LabelModule,
    CommonModule,
    FormsModule,
    PSButtonModule,
    InputsModule,
    AutoCompleteModule,
    DatePickerModule,
    MaskedTextBoxModule
  ],
  declarations: [
    PsKendoTextboxComponent,
    PsFilterTextboxComponent,
    PsKendoRadioButtonComponent,
    PsKendoNumericTextboxComponent,
    PsKendoTextareaComponent,
    PsKendoDatepickerComponent,
    PSKendoCheckboxComponent,
    PSKendoMaskeTextboxComponent
  ],
  exports: [
    PsKendoTextboxComponent,
    PsFilterTextboxComponent,
    PsKendoRadioButtonComponent,
    PsKendoNumericTextboxComponent,
    PsKendoTextareaComponent,
    PsKendoDatepickerComponent,
    PSKendoCheckboxComponent,
    PSKendoMaskeTextboxComponent
  ],
})
export class PSInputModule { }
