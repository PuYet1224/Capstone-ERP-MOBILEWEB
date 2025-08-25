import { NgModule } from '@angular/core';
import { Prt001InventoryComponent } from './views/prt001-inventory/prt001-inventory.component';
import { PartRouting } from './part.routing';
import { RouterModule } from '@angular/router';
import { PSLayoutModule } from 'src/app/components/ps-layout/ps-layout.module';
import { PSInputModule } from 'src/app/components/ps-input/ps-input.module';
import { PSButtonModule } from 'src/app/components/ps-button/ps-button.module';
import { PSDropdownModule } from '../../components/ps-dropdown/ps-dropdown.module';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { GridModule } from '@progress/kendo-angular-grid';
import { PSTableModule } from 'src/app/components/ps-table/ps-table.module';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { Prt002InventoryDetailComponent } from './views/prt002-inventory-detail/prt002-inventory-detail.component';
import { Prt003InventoryPointDetailComponent } from './views/prt003-inventory-point-detail/prt003-inventory-point-detail.component';
import { PSDialogModule } from 'src/app/components/ps-dialog/ps-dialog.module';
import { PopupModule } from '@progress/kendo-angular-popup';
import { Prt004InboundComponent } from './views/prt004-inbound/prt004-inbound.component';
import { Prt005InboundDetailComponent } from './views/prt005-inbound-detail/prt005-inbound-detail.component';
import { Prt006OutboundComponent } from './views/prt006-outbound/prt006-outbound.component';
import { PrtIODetailComponent } from './components/prt-io-detail/prt-io-detail.component';
import { Prt007OutboundDetailComponent } from './views/prt007-outbound-detail/prt007-outbound-detail.component';
import { Prt008CategoryComponent } from './views/prt008-category/prt008-category.component';
import { PrtCategoryComponent } from './components/prt-category/prt-category.component';
import { Prt009TypeComponent } from './views/prt009-type/prt009-type.component';
import { Prt010TypeDetailComponent } from './views/prt010-type-detail/prt010-type-detail.component';
import { Prt011ItemComponent } from './views/prt011-item/prt011-item.component';
import { Prt012ItemDetailComponent } from './views/prt012-item-detail/prt012-item-detail.component';
import { WHInventoryMasterStatusPipe } from 'src/app/pipes/e-style/wh-inventory-master-status.pipe';
import { PSPipeModule } from 'src/app/pipes/ps-pipe.module';
import { LSTypeOfPartOfStatusPipe } from 'src/app/pipes/e-style/ls-type-of-part-status.pipe';
@NgModule({
  imports: [
    RouterModule.forChild(PartRouting),
    PSLayoutModule,
    PSInputModule,
    PSButtonModule,
    PSDropdownModule,
    ListViewModule,
    GridModule,
    PSTableModule,
    FormsModule,
    DateInputsModule,
    PSInputModule,
    LabelModule,
    PSDialogModule,
    PopupModule,
    PSPipeModule,
    PrtCategoryComponent,
  ],
  declarations: [
    Prt001InventoryComponent,
    Prt002InventoryDetailComponent,
    Prt003InventoryPointDetailComponent,
    Prt004InboundComponent,
    Prt005InboundDetailComponent,
    Prt006OutboundComponent,
    Prt007OutboundDetailComponent,
    Prt008CategoryComponent,
    Prt009TypeComponent,
    Prt010TypeDetailComponent,
    Prt011ItemComponent,
    Prt012ItemDetailComponent,
    PrtIODetailComponent,
    WHInventoryMasterStatusPipe,
    LSTypeOfPartOfStatusPipe,
  ],
})
export class PartModule { }
