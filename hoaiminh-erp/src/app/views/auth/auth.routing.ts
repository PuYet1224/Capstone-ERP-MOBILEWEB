import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Ath001LoginComponent } from './views/ath001-login/ath001-login.component';
import { Ath002StoreComponent } from './views/ath002-store/ath002-store.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Ath001LoginComponent
    },
    {
        path: 'login/store',
        component: Ath002StoreComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AuthRouting { };
