import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardRouting } from './dashboard.routing';
import { Dsb001MotorbikeComponent } from './views/dsb001-motorbike/dsb001-motorbike.component';
import { MtbDashboard } from './components/mtb-dashboard/mtb-dashboard.component';

@NgModule({
  imports: [
    RouterModule.forChild(DashboardRouting),
    MtbDashboard,
  ],
  declarations: [
    Dsb001MotorbikeComponent
  ],
  exports: []
})
export class DashboardModule { }
