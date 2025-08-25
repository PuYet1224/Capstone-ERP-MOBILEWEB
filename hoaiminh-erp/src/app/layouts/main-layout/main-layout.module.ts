import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { MainLayoutRouting } from './main-layout.routing';
import { LoaderModule } from '@progress/kendo-angular-indicators';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LayoutModule,
        MainLayoutRouting,
        LoaderModule
    ],
    declarations: [
    ]
})

export class MainLayoutModule { }
