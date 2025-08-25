import { Routes } from '@angular/router';
import { Rpt002MtbSaleComponent } from './views/rpt002-mtb-sale/rpt002-mtb-sale.component';
import { Rpt001MtbWarehouseComponent } from './views/rpt001-mtb-warehouse/rpt001-mtb-warehouse.component';

export const ReportRouting: Routes = [
  { path: '', redirectTo: 'mtbike/m_warehouse', pathMatch: 'full' },
  {
    path: '',
    data: { text: 'Báo cáo', disabled: true },
    children: [
      {
        path: 'mtbike',
        data: { text: 'Xe máy', disabled: true },
        children: [
          {
            path: 'm_warehouse',
            data: { text: 'Báo cáo kho hàng', disabled: true },
            component: Rpt001MtbWarehouseComponent
          },
          {
            path: 'm_sale',
            data: { text: 'Báo cáo bán hàng', disabled: true },
            component: Rpt002MtbSaleComponent
          }
        ]
      }
    ]
  }
];
