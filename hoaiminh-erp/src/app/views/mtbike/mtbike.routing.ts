import { Routes } from '@angular/router';
import { Mtb001RetailComponent } from './views/mtb001-retail/mtb001-retail.component';
import { Mtb002RetailDetailComponent } from './views/mtb002-retail-detail/mtb002-retail-detail.component';
import { Mtb003WholesaleComponent } from './views/mtb003-wholesale/mtb003-wholesale.component';
import { Mtb004WholesaleDetailComponent } from './views/mtb004-wholesale-detail/mtb004-wholesale-detail.component';
import { Mtb005DeliveryComponent } from './views/mtb005-delivery/mtb005-delivery.component';
import { Mtb006DeliveryDetailComponent } from './views/mtb006-delivery-detail/mtb006-delivery-detail.component';
import { Mtb007InboundComponent } from './views/mtb007-inbound/mtb007-inbound.component';
import { Mtb008InboundDetailComponent } from './views/mtb008-inbound-detail/mtb008-inbound-detail.component';
import { Mtb010OutboundDetailComponent } from './views/mtb010-outbound-detail/mtb010-outbound-detail.component';
import { Mtb009OutboundComponent } from './views/mtb009-outbound/mtb009-outbound.component';
import { Mtb000DashboardComponent } from './views/mtb000-dashboard/mtb000-dashboard.component';
import { Mtb011WhReportComponent } from './views/mtb011-wh-report/mtb011-wh-report.component';
import { Mtb012ModelComponent } from './views/mtb012-model/mtb012-model.component';
import { Mtb013SaleReportComponent } from './views/mtb013-sale-report/mtb013-sale-report.component';
import { Mtb014CategoryComponent } from './views/mtb014-category/mtb014-category.component';

export const MtbikeRouting: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    data: { text: 'Xe máy', disabled: true },
    children: [
      {
        path: 'dashboard',
        data: { text: 'Dashboard', disabled: true },
        component: Mtb000DashboardComponent
      },
      // {
      //   path: 'm_lookup',
      //   data: { text: 'Tra cứu xe', disabled: true },
      //   component: Mtb015LookupComponent
      // },
      {
        path: 'sale',
        data: { text: 'Bán hàng', disabled: true },
        children: [
          {
            path: 'retail',
            data: { text: 'Bán lẻ', disabled: true },
            component: Mtb001RetailComponent
          },
          {
            path: 'retail',
            data: { text: 'Bán lẻ', disabled: false, Links: ['mtbike', 'sale', 'retail'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết bán lẻ', disabled: true },
                component: Mtb002RetailDetailComponent,
              }
            ]
          },
          {
            path: 'wholesale',
            data: { text: 'Bán sỉ', disabled: true },
            component: Mtb003WholesaleComponent
          },
          {
            path: 'wholesale',
            data: { text: 'Bán sỉ', disabled: false, Links: ['mtbike', 'sale', 'wholesale'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết bán sỉ', disabled: true },
                component: Mtb004WholesaleDetailComponent,
              }
            ]
          },
          {
            path: 's_report',
            data: { text: 'Báo cáo', disabled: true },
            component: Mtb013SaleReportComponent
          },
        ]
      },
      {
        path: 'warehouse',
        data: { text: 'Kho hàng', disabled: true },
        children: [
          {
            path: 'delivery',
            data: { text: 'Phiếu giao hàng', disabled: true },
            component: Mtb005DeliveryComponent
          },
          {
            path: 'delivery',
            data: { text: 'Phiếu giao hàng', disabled: false, Links: ['mtbike', 'warehouse', 'delivery'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết phiếu', disabled: true },
                component: Mtb006DeliveryDetailComponent,
              }
            ]
          },
          {
            path: 'm_inbound',
            data: { text: 'Nhập hàng', disabled: true },
            component: Mtb007InboundComponent
          },
          {
            path: 'm_inbound',
            data: { text: 'Nhập hàng', disabled: false, Links: ['mtbike', 'warehouse', 'm_inbound'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Mtb008InboundDetailComponent,
              }
            ]
          },
          {
            path: 'm_outbound',
            data: { text: 'Xuất hàng', disabled: true },
            component: Mtb009OutboundComponent
          },
          {
            path: 'm_outbound',
            data: { text: 'Xuất hàng', disabled: false, Links: ['mtbike', 'warehouse', 'm_outbound'] },
            children: [
              {
                path: 'detail',
                data: { text: 'Chi tiết', disabled: true },
                component: Mtb010OutboundDetailComponent,
              }
            ]
          },
          {
            path: 'w_report',
            data: { text: 'Báo cáo', disabled: true },
            component: Mtb011WhReportComponent
          },
        ]
      },
      {
        path: 'config',
        data: { text: 'Cấu hình', disabled: true },
        children: [
          {
            path: 'm_category',
            data: { text: 'Phân nhóm', disabled: true },
            component: Mtb014CategoryComponent
          },
          {
            path: 'model',
            data: { text: 'Mẫu xe', disabled: true },
            component: Mtb012ModelComponent
          }
        ]
      }
    ]
  }
];
