import { Routes } from '@angular/router';
import { Prt001InventoryComponent } from './views/prt001-inventory/prt001-inventory.component';
import { Prt002InventoryDetailComponent } from './views/prt002-inventory-detail/prt002-inventory-detail.component';
import { Prt003InventoryPointDetailComponent } from './views/prt003-inventory-point-detail/prt003-inventory-point-detail.component';
import { Prt004InboundComponent } from './views/prt004-inbound/prt004-inbound.component';
import { Prt005InboundDetailComponent } from './views/prt005-inbound-detail/prt005-inbound-detail.component';
import { Prt006OutboundComponent } from './views/prt006-outbound/prt006-outbound.component';
import { Prt007OutboundDetailComponent } from './views/prt007-outbound-detail/prt007-outbound-detail.component';
import { Prt008CategoryComponent } from './views/prt008-category/prt008-category.component';
import { Prt010TypeDetailComponent } from './views/prt010-type-detail/prt010-type-detail.component';
import { Prt009TypeComponent } from './views/prt009-type/prt009-type.component';
import { Prt011ItemComponent } from './views/prt011-item/prt011-item.component';
import { Prt012ItemDetailComponent } from './views/prt012-item-detail/prt012-item-detail.component';

export const PartRouting: Routes = [
  { path: '', redirectTo: 'warehouse/p_inbound', pathMatch: 'full' },
  {
    path: '',
    data: { text: 'Phụ tùng', disabled: true },
    children: [
      {
        path: 'warehouse',
        data: { text: 'Kho hàng', disabled: true },
        children: [
          {
            path: 'inventory',
            data: { text: 'Kiểm kê hàng hóa', disabled: true },
            component: Prt001InventoryComponent
          },
          {
            path: 'inventory',
            data: { text: 'Kiểm kê hàng hóa', disabled: false, Links: ['part', 'warehouse', 'inventory'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết kiểm kê', disabled: true },
                component: Prt002InventoryDetailComponent,
              },
              {
                path: '',
                data: { text: 'Chi tiết kiểm kê', Links: ['part', 'warehouse', 'inventory', 'detail'] },
                children: [
                  {
                    path: 'point-detail',
                    data: { text: 'Chi tiết điểm kiểm kê', disabled: true },
                    component: Prt003InventoryPointDetailComponent
                  },
                ]
              }
            ]
          },
          {
            path: 'p_inbound',
            data: { text: 'Nhập hàng', disabled: true },
            component: Prt004InboundComponent
          },
          {
            path: 'p_inbound',
            data: { text: 'Nhập hàng', disabled: false, Links: ['part', 'warehouse', 'p_inbound'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Prt005InboundDetailComponent,
              }
            ]
          },
          {
            path: 'p_outbound',
            data: { text: 'Xuất hàng', disabled: true },
            component: Prt006OutboundComponent
          },
          {
            path: 'p_outbound',
            data: { text: 'Xuất hàng', disabled: false, Links: ['part', 'warehouse', 'p_outbound'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Prt007OutboundDetailComponent,
              }
            ]
          },
        ]
      },
      {
        path: 'config',
        data: { text: 'Cấu hình', disabled: true },
        children: [
          {
            path: 'category',
            data: { text: 'Phân nhóm phụ tùng', disabled: true },
            component: Prt008CategoryComponent
          },
          {
            path: 'type',
            data: { text: 'Phân loại phụ tùng', disabled: true },
            component: Prt009TypeComponent
          },
          {
            path: 'type',
            data: { text: 'Phân loại phụ tùng', disabled: false, Links: ['part', 'config', 'type'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Prt010TypeDetailComponent,
              }
            ]
          },
          {
            path: 'item',
            data: { text: 'Danh sách phụ tùng', disabled: true },
            component: Prt011ItemComponent,
          },
          {
            path: 'item',
            data: { text: 'Danh sách phụ tùng', disabled: false, Links: ['part', 'config', 'item'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Prt012ItemDetailComponent,
              }
            ]
          },
        ]
      }
    ]
  }
];
