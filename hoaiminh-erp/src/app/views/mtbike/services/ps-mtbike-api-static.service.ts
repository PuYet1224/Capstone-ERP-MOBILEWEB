import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PSMtbikeApiStaticService {
  public static loaded: boolean = false;

  public static dashboard = fdashboard;
  public static retail = fretail;
  public static wholesale = fwholesale;
  public static delivery = fdelivery;
  public static m_inbound = fm_inbound;
  public static m_outbound = fm_outbound;
  public static model = fmodel;
  public static w_report = fw_report;
  public static s_report = fs_report;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach((api) => {
      const fullUrl = `${api.ServerURL}${api.URL}${api.APIID}`;

      if (!apiObject[api.FunctionDLL]) {
        apiObject[api.FunctionDLL] = {};
      }

      apiObject[api.FunctionDLL][api.APIID] = fullUrl;
    });

    Object.assign(PSMtbikeApiStaticService, apiObject);
  }

  static load() {
    PSMtbikeApiStaticService.loaded = true;
  }
}

export namespace fdashboard {
  export let GetListTypeOfVehicle: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let GetListStockVehicleColor: string;
}

export namespace fw_report {
  export let GetListTypeOfVehicle: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let GetListStockVehicleColor: string;
}

export namespace fs_report {
  export let GetListTypeOfVehicle: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let GetListStockVehicleColor: string;
}

export namespace fretail {
  export let GetSOMaster: string;
  export let GetListTypeOfVehicle: string;
  export let GetListRetail: string;
  export let GetRetail: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let DeleteSOMaster: string;
  export let UpdateSOMasterStatus: string;
  export let GetSeri: string;
  export let UpdateSORetailDetail: string;
  export let UpdateSOMaster: string;
  export let GetCustomer: string;
  export let GetListCustomer: string;
  export let UpdateLoyalCustomer: string;
}
export namespace fwholesale {
  export let GetListTypeOfVehicle: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let GetListSOMaster: string;
  export let DeleteSOMaster: string;
  export let UpdateSOMasterStatus: string;
  export let GetSOMaster: string;
  export let UpdateSOMaster: string;
  export let GetListSODetail: string;
  export let DeleteSODetail: string;
  export let UpdateSODetail: string;
  export let GetSeri: string;
}
// export namespace fs_report {}
export namespace fdelivery {
  export let GetListDOMaster: string;
  export let DeleteDOMaster: string;
  export let UpdateDOMasterStatus: string;
  export let GetDOMaster: string;
  export let UpdateDOMaster: string;
  export let ImportDODetail: string;
  export let GetListDODetail: string;
  export let GetListTypeOfVehicle: string;
  export let GetListVehicle: string;
  export let GetListVehicleColor: string;
  export let DeleteDODetail: string;
  export let UpdateDODetail: string;
}
export namespace fm_inbound {
  export let UpdateIOMasterVehicleStatus: string;
  export let GetListIOMasterVehicle: string;
  export let DeleteIOMasterVehicle: string;
  export let GetIOMasterVehicle: string;
  export let GetListDO: string;
  export let GetListIODetailVehicle: string;
  export let GetIOSeri: string;
  export let GetIOSeriInternal: string;
  export let UpdateIOMasterVehicle: string;
  export let DeleteDODetailVehicle: string;
  export let UpdateDODetailVehicle: string;
  export let DeleteIODetailVehicle: string;
  export let UpdateIODetailVehicle: string;
  export let GetListTypeOfVehicle: string;
  export let GetListVehicleColor: string;
  export let GetListVehicle: string;
}

export namespace fm_outbound {
  export let UpdateIOMasterVehicleStatus: string;
  export let GetListIOMasterVehicle: string;
  export let DeleteIOMasterVehicle: string;
  export let GetListTypeOfVehicle: string;
  export let GetListVehicleColor: string;
}
// export namespace fw_report {}
// export namespace fm_category {}
export namespace fmodel {
  export let GetListTypeOfVehicle: string;
  export let GetListColor: string;
  export let GetListVehicleConfig: string;
  export let GetListPartCategory: string;
  export let UpdateTypeOfVehicle: string;
  export let UpdateVehicleColor: string;
  export let DeleteTypeOfVehicle: string;
  export let DeleteVehicle: string;
  export let DeleteVehicleColor: string;
  export let GetListVehicleColorImage: string;
  export let GetListVehicleSettingImage: string;
  export let GetListVehicleColorCodeImage: string;
  export let UpdateVehicle: string;
  export let GetListVehicleColor: string;
}