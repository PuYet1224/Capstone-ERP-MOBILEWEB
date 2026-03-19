import { Routes } from '@angular/router';
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
import { Mtb021SalCollectionServicesComponent } from './views/mtb021-sal-collection-services/mtb021-sal-collection-services.component';
import { Mtb022SalCollectionPartComponent } from './views/mtb022-sal-collection-part/mtb022-sal-collection-part.component';
import { Mtb023SalCollectionCouponComponent } from './views/mtb023-sal-collection-coupon/mtb023-sal-collection-coupon.component';
import { Mtb024SalCollectionOwnerComponent } from './views/mtb024-sal-collection-owner/mtb024-sal-collection-owner.component';
import { Mtb025SalCollectionContactComponent } from './views/mtb025-sal-collection-contact/mtb025-sal-collection-contact.component';
import { Mtb026SalCollectionOtherComponent } from './views/mtb026-sal-collection-other/mtb026-sal-collection-other.component';
import { Mtb027SalCollectionPaymentComponent } from './views/mtb027-sal-collection-payment/mtb027-sal-collection-payment.component';
import { Mtb028SalPaymentComponent } from './views/mtb028-sal-payment/mtb028-sal-payment.component';
import { Mtb029SalPaymentDocumentComponent } from './views/mtb029-sal-payment-document/mtb029-sal-payment-document.component';
import { Mtb030SalPaymentReceiptComponent } from './views/mtb030-sal-payment-receipt/mtb030-sal-payment-receipt.component';
import { Mtb031SalPaymentSelectionComponent } from './views/mtb031-sal-payment-selection/mtb031-sal-payment-selection.component';
import { Mtb032SalPaymentTotalComponent } from './views/mtb032-sal-payment-total/mtb032-sal-payment-total.component';
import { Mtb033SalPaymentInvoiceComponent } from './views/mtb033-sal-payment-invoice/mtb033-sal-payment-invoice.component';
import { Mtb034SalPolicyComponent } from './views/mtb034-sal-policy/mtb034-sal-policy.component';
import { Mtb021DocumentTransactionComponent } from './views/mtb021-document-transaction/mtb021-document-transaction.component';


export const MtbikeRouting: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Mtb000DashboardComponent,
  },
  {
    path: 'repair',
    component: Mtb001RepairComponent,
  },
  {
    path: 'repair/scan',
    component: Mtb002ScanComponent
  },
  {
    path: 'repair/vehicle',
    component: Mtb003CSVehicleComponent
  },
  {
    path: 'repair/work-order',
    component: Mtb004CsWorkOrderComponent
  },
  {
    path: 'repair/task',
    component: Mtb005CSTaskComponent
  },
  {
    path: 'repair/other-task',
    component: Mtb006CsOtherTaskComponent
  },
  {
    path: 'repair/wo-cast',
    component: Mtb007CSWOCastComponent
  },
  {
    path: 'repair/wo-sign',
    component: Mtb008CSWOSignComponent
  },
  {
    path: 'consultant',
    component: Mtb009SalConsultantComponent
  },
  {
    path: 'consultant/detail',
    component: Mtb010SalConsultantDetailComponent
  },
  {
    path: 'consultant/vehicle',
    component: Mtb011SalConsultantVehicleComponent
  },
  {
    path: 'consultant/cart',
    component: Mtb012SalConsultantCartComponent
  },
  {
    path: 'consultant/services',
    component: Mtb013SalConsultantServicesComponent
  },
  {
    path: 'consultant/services-detail',
    component: Mtb014SalConsultantServicesDetailComponent
  },
  {
    path: 'consultant/parts',
    component: Mtb015SalConsultantPartComponent
  },
  {
    path: 'consultant/parts-detail',
    component: Mtb016SalConsultantPartDetailComponent
  },
  {
    path: 'consultant/promotion',
    component: Mtb017SalConsultantPromotionComponent
  },
  {
    path: 'consultant/promotion-detail',
    component: Mtb018SalConsultantPromotionDetailComponent
  },
  {
    path: 'consultant/total-vehicle',
    component: Mtb019SalConsultantTotalVehicleComponent,
  },
  {
    path: 'consultant/total',
    component: Mtb020SalConsultantTotalComponent,
  },
  {
    path: 'collection/owner',
    component: Mtb024SalCollectionOwnerComponent,
  },
  {
    path: 'collection/services',
    component: Mtb021SalCollectionServicesComponent,
  },
  {
    path: 'collection/part',
    component: Mtb022SalCollectionPartComponent,
  },
  {
    path: 'collection/coupon',
    component: Mtb023SalCollectionCouponComponent,
  },
  {
    path: 'collection/contact',
    component: Mtb025SalCollectionContactComponent,
  },
  {
    path: 'collection/other',
    component: Mtb026SalCollectionOtherComponent,
  },
  {
    path: 'collection/payment',
    component: Mtb027SalCollectionPaymentComponent,
  },
  {
    path: 'payment',
    component: Mtb028SalPaymentComponent,
  },
  {
    path: 'payment/document',
    component: Mtb029SalPaymentDocumentComponent,
  },
  {
    path: 'payment/receipt',
    component: Mtb030SalPaymentReceiptComponent,
  },
  {
    path: 'payment/selection',
    component: Mtb031SalPaymentSelectionComponent,
  },
  {
    path: 'payment/total',
    component: Mtb032SalPaymentTotalComponent,
  },
  {
    path: 'payment/invoice',
    component: Mtb033SalPaymentInvoiceComponent,
  },
  {
    path: 'promotion',
    component: Mtb034SalPolicyComponent,
  },
  {
    path: 'document',
    component: Mtb021DocumentTransactionComponent,
  },

];
