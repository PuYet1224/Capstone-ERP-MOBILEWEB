import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartModule } from '@progress/kendo-angular-charts';
import { DatePickerModule, DateTimePickerModule, TimePickerModule } from '@progress/kendo-angular-dateinputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { icons, LucideAngularModule } from "lucide-angular";
import { PsBarcodeModule } from 'src/app/components/ps-barcodes/ps-barcode.module';
import { PsButtonModule } from "src/app/components/ps-button/ps-button.module";
import { PSDialogModule } from 'src/app/components/ps-dialog/ps-dialog.module';
import { PSDropdownModule } from "src/app/components/ps-dropdown/ps-dropdown.module";
import { PSInputModule } from 'src/app/components/ps-input/ps-input.module';
import { PsLayoutModule } from 'src/app/components/ps-layout/ps-layout.module';
import { SALOrderDetailStatusPipe } from 'src/app/pipes/e-style/sal-order-detail-status.pipe';
import { SALOrderDetailTypeDataPipe } from 'src/app/pipes/e-style/sal-order-detail-type-data.pipe.';
import { SALOrderInvoiceStatusPipe } from 'src/app/pipes/e-style/sal-order-invoice-status.pipe';
import { SALOrderMasterProcessRetailPipe } from 'src/app/pipes/e-style/sal-order-master-process-retail.pipe';
import { SALOrderMasterStatusRetailPipe } from 'src/app/pipes/e-style/sal-order-master-status-retail.pipe ';
import { SALOrderReceiptStatusPipe } from 'src/app/pipes/e-style/sal-order-receipt-status.pipe';
import { WOMProgressStatusPipe } from 'src/app/pipes/e-style/wom-progress-status.pipe';
import { MtbikeRouting } from './mtbike.routing';
import { Mtb000DashboardComponent } from './views/mtb000-dashboard/mtb000-dashboard.component';
import { Mtb001RepairComponent } from './views/mtb001-repair/mtb001-repair.component';
import { Mtb002ScanComponent } from './views/mtb002-scan/mtb002-scan.component';
import { Mtb003CSVehicleComponent } from './views/mtb003-cs-vehicle/mtb003-cs-vehicle.component';
import { Mtb004CsWorkOrderComponent } from './views/mtb004-cs-work-order/mtb004-cs-work-ordercomponent';
import { Mtb005CSTaskComponent } from './views/mtb005-cs-task/mtb005-cs-task.component';
import { Mtb006CsOtherTaskComponent } from './views/mtb006-cs-other-task/mtb006-cs-other-task.component';
import { Mtb007CSWOCastComponent } from './views/mtb007-cs-wo-cast/mtb007-cs-wo-cast.component';
import { Mtb008CSWOSignComponent } from './views/mtb008-cs-wo-sign/mtb008-cs-wo-sign.component';
import { Mtb009SalConsultantComponent } from './views/mtb009-sal-consultant/mtb009-sal-consultant.component';
import { Mtb010SalConsultantDetailComponent } from './views/mtb010-sal-consultant-detail/mtb010-sal-consultant-detail.component';
import { Mtb011SalConsultantVehicleComponent } from './views/mtb011-sal-consultant-vehicle/mtb011-sal-consultant-vehicle.component';
import { Mtb012SalConsultantCartComponent } from './views/mtb012-sal-consultant-cart/mtb012-sal-consultant-cart.component';
import { Mtb013SalConsultantServicesComponent } from './views/mtb013-sal-consultant-services/mtb013-sal-consultant-services.component';
import { Mtb014SalConsultantServicesDetailComponent } from './views/mtb014-sal-consultant-services-detail/mtb014-sal-consultant-services-detail.component';
import { Mtb015SalConsultantPartComponent } from './views/mtb015-sal-consultant-part/mtb015-sal-consultant-part.component';
import { Mtb016SalConsultantPartDetailComponent } from './views/mtb016-sal-consultant-part-detail/mtb016-sal-consultant-part-detail.component';
import { Mtb017SalConsultantPromotionComponent } from './views/mtb017-sal-consultant-promotion/mtb017-sal-consultant-promotion.component';
import { Mtb018SalConsultantPromotionDetailComponent } from './views/mtb018-sal-consultant-promotion-detail/mtb018-sal-consultant-promotion-detail.component';
import { Mtb019SalConsultantTotalVehicleComponent } from './views/mtb019-sal-consultant-total-vehicle/mtb019-sal-consultant-total-vehicle.component';
import { Mtb020SalConsultantTotalComponent } from './views/mtb020-sal-consultant-total/mtb020-sal-consultant-total.component';
import { Mtb021DocumentReceiptComponent } from './views/mtb021-document-receipt/mtb021-document-receipt.component';
import { Mtb022DocumentReceiptDetailComponent } from './views/mtb022-document-receipt-detail/mtb022-document-receipt-detail.component';
import { Mtb023DocumentReceiptUpdateComponent } from './views/mtb023-document-receipt-update/mtb023-document-receipt-update.component';
import { Mtb024InvoiceListComponent } from './views/mtb024-invoice-list/mtb024-invoice-list.component';
import { Mtb025InvoiceDetailComponent } from './views/mtb025-invoice-detail/mtb025-invoice-detail.component';
import { Mtb026InvoiceIssueComponent } from './views/mtb026-invoice-issue/mtb026-invoice-issue.component';
@NgModule({
  imports: [
    RouterModule.forChild(MtbikeRouting),
    LabelModule,
    FormsModule,
    ChartModule,
    DecimalPipe,
    PSDropdownModule,
    CommonModule,
    PsButtonModule,
    DatePickerModule,
    DateTimePickerModule,
    PsLayoutModule,
    PSInputModule,
    PSDialogModule,
    LucideAngularModule,
    LucideAngularModule.pick(icons),
    PsBarcodeModule,
    TimePickerModule,
    DragDropModule,
  ],
  declarations: [
    Mtb000DashboardComponent,
    Mtb001RepairComponent,
    Mtb002ScanComponent,
    Mtb003CSVehicleComponent,
    Mtb004CsWorkOrderComponent,
    Mtb005CSTaskComponent,
    Mtb006CsOtherTaskComponent,
    Mtb007CSWOCastComponent,
    Mtb008CSWOSignComponent,
    Mtb009SalConsultantComponent,
    Mtb010SalConsultantDetailComponent,
    Mtb011SalConsultantVehicleComponent,
    Mtb012SalConsultantCartComponent,
    Mtb013SalConsultantServicesComponent,
    Mtb014SalConsultantServicesDetailComponent,
    Mtb015SalConsultantPartComponent,
    Mtb016SalConsultantPartDetailComponent,
    Mtb017SalConsultantPromotionComponent,
    Mtb018SalConsultantPromotionDetailComponent,
    Mtb019SalConsultantTotalVehicleComponent,
    Mtb020SalConsultantTotalComponent,
    Mtb021DocumentReceiptComponent,
    Mtb022DocumentReceiptDetailComponent,
    Mtb023DocumentReceiptUpdateComponent,
    Mtb024InvoiceListComponent,
    Mtb025InvoiceDetailComponent,
    Mtb026InvoiceIssueComponent,
    WOMProgressStatusPipe,
    SALOrderMasterStatusRetailPipe,
    SALOrderDetailStatusPipe,
    SALOrderReceiptStatusPipe,
    SALOrderInvoiceStatusPipe,
    SALOrderMasterProcessRetailPipe,
    SALOrderDetailTypeDataPipe,
  ],
  exports: []
})
export class MtbikeModule { }

