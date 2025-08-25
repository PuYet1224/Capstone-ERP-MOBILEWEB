import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportRouting } from './report.routing';
import { PSLayoutModule } from "src/app/components/ps-layout/ps-layout.module";
import { Rpt001MtbWarehouseComponent } from './views/rpt001-mtb-warehouse/rpt001-mtb-warehouse.component';
import { Rpt002MtbSaleComponent } from './views/rpt002-mtb-sale/rpt002-mtb-sale.component';
import { MtbReport } from "./components/mtb-report/mtb-report.component";

@NgModule({
  imports: [
    RouterModule.forChild(ReportRouting),
    PSLayoutModule,
    MtbReport
  ],
  declarations: [
    Rpt001MtbWarehouseComponent,
    Rpt002MtbSaleComponent
  ],
  exports: []
})
export class ReportModule { }
