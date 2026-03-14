import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SystemRouting } from './system.routing';
import { Sys001LoginComponent } from './views/sys001-login/sys001-login.component';
import { PsLayoutModule } from 'src/app/components/ps-layout/ps-layout.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PsButtonModule } from 'src/app/components/ps-button/ps-button.module';
import { IconModule } from '@progress/kendo-angular-icons';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { Sys002StoreComponent } from './views/sys002-store/sys002-store.component';
import { Sys003FunctionComponent } from './views/sys003-function/sys003-function.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SystemRouting,
        InputsModule,
        IconModule,
        ButtonModule,
        PsLayoutModule,
        PsButtonModule
    ],
    declarations: [
        Sys001LoginComponent,
        Sys002StoreComponent,
        Sys003FunctionComponent
    ]
})

export class SystemModule { }
