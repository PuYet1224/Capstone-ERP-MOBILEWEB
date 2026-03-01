import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { PsDialogConfirmComponent } from './components/ps-dialog-confirm/ps-dialog-confirm.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { PsDialogConfirmSignatureComponent } from './components/ps-dialog-confirm-signature/ps-dialog-confirm-signature.component';
import { PsButtonModule } from "src/app/components/ps-button/ps-button.module";
import { PsDialogConfirmBottomComponent } from './components/ps-dialog-confirm-bottom/ps-dialog-confirm-bottom.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    UploadModule,
    PopupModule,
    TreeViewModule,
    PsButtonModule
  ],
  declarations: [
    PsDialogConfirmComponent,
    PsDialogConfirmSignatureComponent,
    PsDialogConfirmBottomComponent
  ],
  exports: [
    PsDialogConfirmComponent,
    PsDialogConfirmSignatureComponent,
    PsDialogConfirmBottomComponent
  ],
})
export class PSDialogModule { }
