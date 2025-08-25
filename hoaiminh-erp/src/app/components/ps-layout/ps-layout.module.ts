import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { PsHeaderComponent } from '../../layouts/main-layout/components/ps-header/ps-header.component';
import { PsFooterComponent } from '../../layouts/main-layout/components/ps-footer/ps-footer.component';
import { PsToolbarTopComponent } from './components/ps-toolbar-top/ps-toolbar-top.component';
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { IconModule } from '@progress/kendo-angular-icons';
import { PopupModule } from '@progress/kendo-angular-popup';
import { PSButtonModule } from '../ps-button/ps-button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PsKendoDrawerContainerComponent } from './components/ps-kendo-drawer-container/ps-kendo-drawer-container.component';
import { DrawerModule } from '@progress/kendo-angular-layout';
import { Ps404Component } from './components/ps-404/ps-404.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ButtonsModule,
    NavigationModule,
    IconModule,
    PopupModule,
    PSButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputsModule,
    DrawerModule
  ],
  declarations: [
    PsHeaderComponent,
    PsFooterComponent,
    PsToolbarTopComponent,
    PsKendoDrawerContainerComponent,
    Ps404Component
  ],
  exports: [
    PsHeaderComponent,
    PsFooterComponent,
    PsToolbarTopComponent,
    PsKendoDrawerContainerComponent,
    Ps404Component
  ]
})

export class PSLayoutModule { }
