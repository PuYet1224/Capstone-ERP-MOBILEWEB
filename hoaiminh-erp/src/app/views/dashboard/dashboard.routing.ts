import { Routes } from '@angular/router';
import { Dsb001MotorbikeComponent } from './views/dsb001-motorbike/dsb001-motorbike.component';

export const DashboardRouting: Routes = [
  { path: '', redirectTo: 'mtbike', pathMatch: 'full' },
  {
    path: '',
    data: { text: 'Dashboard', disabled: true },
    children: [
      {
        path: 'mtbike',
        data: { text: 'Xe máy', disabled: true },
        component: Dsb001MotorbikeComponent
      }
    ]
  }
];
