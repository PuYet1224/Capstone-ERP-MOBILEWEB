import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsFooterCopyrightComponent } from './components/ps-footer-copyright/ps-footer-copyright.component';
import { PsHeaderMainComponent } from './components/ps-header-main/ps-header-main.component';
import { PsButtonModule } from '../ps-button/ps-button.module';
import { PSDialogModule } from '../ps-dialog/ps-dialog.module';
import { PsHeaderBackComponent } from './components/ps-header-back/ps-header-back.component';
import { PsFooterActionComponent } from './components/ps-footer-action/ps-footer-action.component';

@NgModule({
  imports: [
    CommonModule,
    PsButtonModule,
    PSDialogModule
  ],
  declarations: [
    PsFooterCopyrightComponent,
    PsHeaderMainComponent,
    PsHeaderBackComponent,
    PsFooterActionComponent
  ],
  exports: [
    PsFooterCopyrightComponent,
    PsHeaderMainComponent,
    PsHeaderBackComponent,
    PsFooterActionComponent
  ]
})

export class PsLayoutModule { }
