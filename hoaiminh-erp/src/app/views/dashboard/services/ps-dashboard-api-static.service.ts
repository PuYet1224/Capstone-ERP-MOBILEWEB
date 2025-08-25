import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PSDashboardApiStaticService {
  public static loaded: boolean = false;

  public static mtbike = fmtbike;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach((api) => {
      const fullUrl = `${api.ServerURL}${api.URL}${api.APIID}`;

      if (!apiObject[api.FunctionDLL]) {
        apiObject[api.FunctionDLL] = {};
      }

      apiObject[api.FunctionDLL][api.APIID] = fullUrl;
    });

    Object.assign(PSDashboardApiStaticService, apiObject);
  }

  static load() {
    PSDashboardApiStaticService.loaded = true;
  }
}

export namespace fmtbike {
  export let GetMotorbikeOverview: string;
  export let GetListDashboard: string;
}
