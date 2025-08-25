import { NgModule } from '@angular/core';
import { Mtb001RetailComponent } from './views/mtb001-retail/mtb001-retail.component';
import { MtbikeRouting } from './mtbike.routing';
import { RouterModule } from '@angular/router';
import { PSLayoutModule } from 'src/app/components/ps-layout/ps-layout.module';
import { Mtb002RetailDetailComponent } from './views/mtb002-retail-detail/mtb002-retail-detail.component';
import { PSButtonModule } from 'src/app/components/ps-button/ps-button.module';
import { PSDropdownModule } from "../../components/ps-dropdown/ps-dropdown.module";
import { PSInputModule } from "../../components/ps-input/ps-input.module";
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { Mtb003WholesaleComponent } from './views/mtb003-wholesale/mtb003-wholesale.component';
import { Mtb006DeliveryDetailComponent } from './views/mtb006-delivery-detail/mtb006-delivery-detail.component';
import { Mtb004WholesaleDetailComponent } from './views/mtb004-wholesale-detail/mtb004-wholesale-detail.component';
import { Mtb005DeliveryComponent } from './views/mtb005-delivery/mtb005-delivery.component';
import { FormsModule } from '@angular/forms';
import { PSTableModule } from 'src/app/components/ps-table/ps-table.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { SALOrderMasterStatusPipe } from '../../pipes/e-style/sal-order-master-status.pipe';
import { PSDialogModule } from "../../components/ps-dialog/ps-dialog.module";
import { PURDOMasterStatusPipe } from 'src/app/pipes/e-style/pur-do-master-status.pipe';
import { Mtb007InboundComponent } from './views/mtb007-inbound/mtb007-inbound.component';
import { Mtb008InboundDetailComponent } from './views/mtb008-inbound-detail/mtb008-inbound-detail.component';
import { Mtb009OutboundComponent } from './views/mtb009-outbound/mtb009-outbound.component';
import { Mtb010OutboundDetailComponent } from './views/mtb010-outbound-detail/mtb010-outbound-detail.component';
import { SALOrderDetailStatusPipe } from 'src/app/pipes/e-style/sal-order-detail-status.pipe';
import { PSPipeModule } from 'src/app/pipes/ps-pipe.module';
import { Mtb000DashboardComponent } from './views/mtb000-dashboard/mtb000-dashboard.component';
import { Mtb011WhReportComponent } from './views/mtb011-wh-report/mtb011-wh-report.component';
import { Mtb012ModelComponent } from './views/mtb012-model/mtb012-model.component';
import { Mtb013SaleReportComponent } from './views/mtb013-sale-report/mtb013-sale-report.component';
import { ChartModule } from '@progress/kendo-angular-charts';
import { MtbDashboard } from '../dashboard/components/mtb-dashboard/mtb-dashboard.component';
import { MtbReport } from "src/app/views/report/components/mtb-report/mtb-report.component";
import { LSVehicleConfigStatusPipe } from 'src/app/pipes/e-style/ls-vehicle-config-status.pipe';
import { Mtb014CategoryComponent } from './views/mtb014-category/mtb014-category.component';
import { PrtCategoryComponent } from '../part/components/prt-category/prt-category.component';

@NgModule({
  imports: [
    RouterModule.forChild(MtbikeRouting),
    PSLayoutModule,
    PSButtonModule,
    PSDropdownModule,
    PSInputModule,
    DateInputsModule,
    LabelModule,
    PSTableModule,
    FormsModule,
    GridModule,
    ListViewModule,
    PSDialogModule,
    PSPipeModule,
    ChartModule,
    MtbDashboard,
    MtbReport,
    PrtCategoryComponent
  ],
  declarations: [
    Mtb000DashboardComponent,
    Mtb001RetailComponent,
    Mtb002RetailDetailComponent,
    Mtb003WholesaleComponent,
    Mtb004WholesaleDetailComponent,
    Mtb005DeliveryComponent,
    Mtb006DeliveryDetailComponent,
    Mtb007InboundComponent,
    Mtb008InboundDetailComponent,
    Mtb009OutboundComponent,
    Mtb010OutboundDetailComponent,
    Mtb011WhReportComponent,
    Mtb012ModelComponent,
    Mtb013SaleReportComponent,
    Mtb014CategoryComponent,
    SALOrderMasterStatusPipe,
    PURDOMasterStatusPipe,
    SALOrderDetailStatusPipe,
    LSVehicleConfigStatusPipe,
  ],
  exports: []
})
export class MtbikeModule { }
