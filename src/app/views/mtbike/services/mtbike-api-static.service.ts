export const fdashboard = {
  loader: false,
  GetListTypeOfVehicle: '',
  GetListTypeOfVehicleCategory: '',
  GetListVehicle: '',
  GetListVehicleColor: '',
  GetListStockVehicleColor: '',
  GetListDashboard: '',
  GetMotorbikeOverview: '',
  GetWOMVehicle: '',
  GetListWOMCustomer: '',
  GetListWOTask: '',
  GetListCSList: '',
  UpdateWOMVehicle: '',
  UpdateWOMConsultant: '',
  DeleteWOMConsultant: '',
  GetListPartCategory: '',
  GetListTypeOfPart: '',
  GetListTypeOfPartSpecs: '',
  GetListTaskBank: '',
  GetListServiceMaster: '',
  UpdateWOTask: '',
  UpdateWOMCustomer: '',
};

export const frepair = {
  loader: false,
  GetListWOMConsultant: '',
};

export const fconsultant = {
  loader: false,
  //Gets
  GetListSALMaster: '',
  GetListSALVehicle: '',
  GetListVehicleOptions: '',
  GetListSALCompareVehicleSpecs: '',
  GetListStockForOrder: '',
  GetListSALSelectedVehicle: '',
  GetListSALSelectedWH: '',
  GetListSALVehicleParts: '',
  GetListSALPartVehicle: '',
  GetListSALServiceGroup: '',
  GetListSALPartCategory: '',
  GetListSALTypeOfPart: '',
  GetListSALTypeOfPartSpecs: '',
  GetListSALService: '',
  GetListSALPromotionGroup: '',

  //Get
  GetSALMaster: '',
  GetConsutantOrderDetail: '',
  GetSALPayment: '',

  //Update
  UpdateSALMaster: '',
  UpdateSALMasterStatus: '',
  UpdateSALDetail: '',
  UpdateSALSelectedVehicleLock: '',
  UpdateSALStatus: '',
  UpdateSALService: '',
  UpdateSALPromotion: '',
  UpdateSALPartItem: '',

  //Add
  AddSALSelectedVehicles: '',

  //Delete
  DeleteSALDetail: '',
  DeleteSALSelectedVehicles: '',
};

export const fpolicy = {
  loader: false,
  GetListSALPolicy: '',
  GetSALPolicy: '',
  UpdateSALPolicy: '',
  DeleteSALPolicy: '',
};

export const fsale_wh = {
  loader: false,
  GetListSALWarehouse: '',
  GetSALWarehouse: '',
  UpdateSALWarehouse: '',
  GetSeri: '',
};

export const fcollection = {
  loader: false,
  GetListSALCollection: '',
  GetCustomer: '',
  SALOrderDetailCusDTO: '',
  UpdateLoyalCustomer: '',
  UpdateSALDetail: '',
};

export const fpayment = {
  loader: false,
  GetListSALPayment: '',
  GetListSALReceipt: '',
  GetListSALInvoice: '',
  GetListSALOrderItem: '',
  GetListSALTypeItem: '',
  GetListSALInvoiceDetail: '',
  UpdateSALReceipt: '',
  GetSALReceipt: '',
  GetSALInvoice: '',
  UpdateSALInvoiceInfo: '',
  GetListVehicleReceipt: '',
  UpdateSALReceiptDetail: '',
  UpdateSALReceiptStatus: '',
  ExportSALInvoicePdf: '',
};

const namespaceMap: Record<string, any> = {
  dashboard: fdashboard,
  repair: frepair,
  consultant: fconsultant,
  policy: fpolicy,
  promotion: fpolicy,
  sale_wh: fsale_wh,
  collection: fcollection,
  payment: fpayment,
  document: fpayment,
};

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MtbikeApiStaticService {
  static assignApi(apiList: any[]) {
    apiList.forEach((api) => {
      const ns = namespaceMap[api.FunctionDLL];
      if (ns) {
        ns[api.APIID] = `${environment.apiServer}${api.URL}${api.APIID}`;
        ns.loader = true;
      }
    });
  }

  static getNamespace(name: string) {
    return namespaceMap[name];
  }
}
