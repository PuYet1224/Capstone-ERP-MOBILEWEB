import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PsReportApiStaticService {
  public static loaded: boolean = false;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach((api) => {
      const fullUrl = `${api.ServerURL}${api.URL}${api.APIID}`;

      if (!apiObject[api.FunctionDLL]) {
        apiObject[api.FunctionDLL] = {};
      }

      apiObject[api.FunctionDLL][api.APIID] = fullUrl;
    });

    Object.assign(PsReportApiStaticService, apiObject);
  }

  static load() {
    PsReportApiStaticService.loaded = true;
  }
}