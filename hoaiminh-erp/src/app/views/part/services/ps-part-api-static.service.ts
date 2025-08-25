import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PSPartApiStaticService {
  public static loaded: boolean = false;

  public static p_inbound = fp_inbound;
  public static p_outbound = fp_outbound;
  public static inventory = finventory;
  public static category = fcategory;
  public static type = ftype;
  public static item = fitem;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach((api) => {
      const fullUrl = `${api.ServerURL}${api.URL}${api.APIID}`;

      if (!apiObject[api.FunctionDLL]) {
        apiObject[api.FunctionDLL] = {};
      }

      apiObject[api.FunctionDLL][api.APIID] = fullUrl;
    });

    Object.assign(PSPartApiStaticService, apiObject);
  }

  static load() {
    PSPartApiStaticService.loaded = true;
  }
}
export namespace fp_inbound {
  export let GetListIOMaster: string;
  export let GetIOMaster: string;
  export let GetListWarehouse: string;
  export let GetListIODetail: string;
  export let UpdateIOMaster: string;
  export let UpdateIODetail: string;
  export let DeleteIODetail: string;
  export let DeleteIOMaster: string;
  export let GetListPartItem: string;
  export let UpdateListIODetail: string;
  export let UpdateIOMasterStatus: string;
  export let ImportIODetail: string;
  export let UpdateIOQuantity: string;
}

export namespace fp_outbound {
  export let GetListIOMaster: string;
  export let GetIOMaster: string;
  export let GetListWarehouse: string;
  export let GetListIODetail: string;
  export let UpdateIOMaster: string;
  export let UpdateIODetail: string;
  export let DeleteIODetail: string;
  export let DeleteIOMaster: string;
  export let GetListPartItem: string;
  export let UpdateListIODetail: string;
  export let UpdateIOMasterStatus: string;
}

export namespace finventory {
  export let GetListInventoryMaster: string;
  export let GetInventoryMaster: string;
  export let UpdateInventoryMasterStatus: string;
  export let DeleteInventoryMaster: string;
  export let GetListWareHouse: string;
  export let GetListEmployee: string;
  export let GetListInventoryPoint: string;
  export let GetInventoryPoint: string;
  export let UpdateInventoryPointStatus: string;
  export let GetListInventorySession: string;
  export let GetListSessionLocation: string;
  export let GetListSessionScanLocation: string;
  export let GetListInventoryPointStock: string;
  export let GetListPartItemError: string;
  export let GetListPartItemErrorDetail: string;
  export let UpdateInventoryScan: string;
  export let GetListInventoryOnSession: string;
  export let UpdateInventorySession: string;
  export let UpdateAndCreateInventorySession: string;
  export let UpdateInventoryMaster: string;
  export let UpdateInventoryPoint: string;
  export let DeleteInventoryPoint: string;
  export let ImportInventoryStock: string;
  export let ImportInventoryScan: string;
  export let ExportInventorySummary: string;
  export let ExportInventorySession: string;
  export let UpdateListInventoryStaff: string;
  export let GetListInventoryStaff: string;
  export let DeletePartItemScanByBarcode: string;
}

export namespace fcategory {
  export let GetListPartCategory: string;
  export let DeletePartCategory: string;
  export let UpdatePartCategory: string;
}

export namespace ftype {
  export let GetListPartCategory: string;
  export let GetListTypeOfPart: string;
  export let GetTypeOfPart: string;
  export let UpdateTypeOfPart: string;
  export let DeleteTypeOfPart: string;
  export let GetListTypeOfPartSpecs: string;
  export let UpdateTypeOfPartSpecs: string;
  export let DeleteTypeOfPartSpecs: string;
}

export namespace fitem {
  export let GetListPartItemConfig: string;
  export let GetPartItemConfig: string;
  export let GetListPartCategory: string;
  export let GetListVehicleForPartItem: string;
  export let GetListTypeOfPart: string;
  export let GetListSupplier: string;
  export let GetListStatus: string;
  export let GetListLSList: string;
  export let GetListPartItemVehicle: string;
  export let GetListTypeOfVehicle: string;
  export let GetListTypeOfPartSpecs: string;
  export let UpdatePartItem: string;
  export let GetListPartItemImage: string;
  export let GetListVehicle: string;
  export let DeletePartItemVehicle: string;
  export let GetListVehicleColor: string;
  export let UpdatePartItemVehicle: string;
}

