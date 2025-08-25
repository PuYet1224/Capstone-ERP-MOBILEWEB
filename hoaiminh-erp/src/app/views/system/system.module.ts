import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SystemRouting } from "./system.routing";
import { Sys001StoreComponent } from "./views/sys001-store/sys001-store.component";
import { PSLayoutModule } from "src/app/components/ps-layout/ps-layout.module";
import { PSButtonModule } from "../../components/ps-button/ps-button.module";
import { PSDialogModule } from "../../components/ps-dialog/ps-dialog.module";
import { PSInputModule } from "../../components/ps-input/ps-input.module";
import { PSDropdownModule } from "../../components/ps-dropdown/ps-dropdown.module";
import { PSTableModule } from "../../components/ps-table/ps-table.module";
import { GridModule } from '@progress/kendo-angular-grid';
import { CommonModule } from "@angular/common";
import { ProcessStatusPipe } from "src/app/pipes/e-style/process-status.pipe";
import { LabelModule } from "@progress/kendo-angular-label";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [
    RouterModule.forChild(SystemRouting),
    PSLayoutModule,
    PSButtonModule,
    PSDialogModule,
    PSInputModule,
    PSDropdownModule,
    PSTableModule,
    GridModule,
    CommonModule,
    LabelModule,
    FormsModule
  ],
  declarations: [
    Sys001StoreComponent,
    ProcessStatusPipe
  ],
  exports: [],
})
export class SystemModule { }
