import { Routes } from "@angular/router";
import { Sys001StoreComponent } from "./views/sys001-store/sys001-store.component";

export const SystemRouting: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  {
    path: '',
    data: { text: 'Hệ thống', disabled: true },
    children: [
      {
        path: 'store',
        data: { text: 'Danh sách cửa hàng', disabled: true },
        component: Sys001StoreComponent
      }
    ]
  }
];