import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthRouting } from './auth.routing';
import { Ath001LoginComponent } from './views/ath001-login/ath001-login.component';
import { PsLayoutModule } from 'src/app/components/ps-layout/ps-layout.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PsButtonModule } from 'src/app/components/ps-button/ps-button.module';
import { IconModule } from '@progress/kendo-angular-icons';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { Ath002StoreComponent } from './views/ath002-store/ath002-store.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        AuthRouting,
        InputsModule,
        IconModule,
        ButtonModule,

        PsLayoutModule,
        PsButtonModule
    ],
    declarations: [
        Ath001LoginComponent,
        Ath002StoreComponent
    ]
})

export class AuthModule { }
