import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { Sys003FunctionComponent } from './system/views/sys003-function/sys003-function.component';
import { ViewsComponent } from './views.component';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'menu',
  //   pathMatch: 'full'
  // },
  // {
  //   path: 'menu',
  //   component: Sys003FunctionComponent
  // },
  // {
  //   path: 'mtbike',
  //   loadChildren: () => import('./mtbike/mtbike.module').then(m => m.MtbikeModule),
  // }
  {
    path: '',
    component: ViewsComponent,
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        data: { animation: 'LayoutPage' },
        children: [
          {
            path: 'menu',
            component: Sys003FunctionComponent
          },
          {
            path: 'mtbike',
            loadChildren: () => import('./mtbike/mtbike.module').then(m => m.MtbikeModule),
          }
        ]
      },
      {
        path: '',
        loadChildren: () => import('./system/system.module').then(t => t.SystemModule),
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ViewsRouting { }
