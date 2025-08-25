import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { PsDialogConfirmComponent } from './components/ps-dialog-confirm/ps-dialog-confirm.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { PsDialogUploadComponent } from './components/ps-dialog-upload/ps-dialog-upload.component';
import { PSInputModule } from '../ps-input/ps-input.module';
import { PsKendoDialogComponent } from './components/ps-kendo-dialog/ps-kendo-dialog.component';
import { PSButtonModule } from '../ps-button/ps-button.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    UploadModule,
    PopupModule,
    TreeViewModule,
    PSInputModule,
    PSButtonModule
  ],
  declarations: [
    PsDialogConfirmComponent,
    PsDialogUploadComponent,
    PsKendoDialogComponent,
  ],
  exports: [
    PsDialogConfirmComponent,
    PsDialogUploadComponent,
    PsKendoDialogComponent,
  ],
})
export class PSDialogModule { }
