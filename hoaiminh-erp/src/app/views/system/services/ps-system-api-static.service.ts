import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PsSystemApiStaticService {
  public static loaded: boolean = false;

  public static store = fstore;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach((api) => {
      const fullUrl = `${api.ServerURL}${api.URL}${api.APIID}`;

      if (!apiObject[api.FunctionDLL]) {
        apiObject[api.FunctionDLL] = {};
      }

      apiObject[api.FunctionDLL][api.APIID] = fullUrl;
    });

    Object.assign(PsSystemApiStaticService, apiObject);
  }

  static load() {
    PsSystemApiStaticService.loaded = true;
  }
}

export namespace fstore {
  export let GetListStoreMapImage: string;
  export let GetListStore: string;
  export let GetListStoreTypeData: string;
  export let UpdateStore: string;
  export let GetListStoreManagement: string;
  export let DeleteStore: string;
  export let GetListStoreTransfer: string;
  export let UpdateListStoreTransfer: string;
}