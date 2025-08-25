import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: { animation: 'LayoutPage' },
    loadChildren: () => import('./layouts/main-layout/main-layout.module').then(m => m.MainLayoutModule),
  },
  {
    path: 'login',
    component: AuthLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  exports: [RouterModule]
})

export class AppRouting { }

