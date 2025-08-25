import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('../../views/dashboard/dashboard.module').then(m => m.DashboardModule),
            },
            {
                path: 'part',
                loadChildren: () => import('../../views/part/part.module').then(m => m.PartModule),
            },
            {
                path: 'mtbike',
                loadChildren: () => import('../../views/mtbike/mtbike.module').then(m => m.MtbikeModule),
            },
            {
                path: 'system',
                loadChildren: () => import('../../views/system/system.module').then(m => m.SystemModule),
            },
            {
                path: 'report',
                loadChildren: () => import('../../views/report/report.module').then(m => m.ReportModule),
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MainLayoutRouting { };
