import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Sys001LoginComponent } from './views/sys001-login/sys001-login.component';
import { Sys002StoreComponent } from './views/sys002-store/sys002-store.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Sys001LoginComponent
    },
    {
        path: 'store',
        component: Sys002StoreComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SystemRouting { };
