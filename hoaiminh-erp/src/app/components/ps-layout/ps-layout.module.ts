import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsFooterCopyrightComponent } from './components/ps-footer-copyright/ps-footer-copyright.component';
import { PsHeaderMainComponent } from './components/ps-header-main/ps-header-main.component';
import { PsButtonModule } from '../ps-button/ps-button.module';

@NgModule({
  imports: [
    CommonModule,
    PsButtonModule
  ],
  declarations: [
    PsFooterCopyrightComponent,
    PsHeaderMainComponent
  ],
  exports: [
    PsFooterCopyrightComponent,
    PsHeaderMainComponent
  ]
})

export class PsLayoutModule { }
