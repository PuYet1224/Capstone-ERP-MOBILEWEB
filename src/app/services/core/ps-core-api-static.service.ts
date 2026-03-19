import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})

export class CoreApiStaticService {
  public static GetListWarehouse: string;
  public static GetListEmployee: string;
  public static GetTemplate: string;
  public static GetListProvince: string;
  public static GetListDistrict: string;
  public static GetListWard: string;
  public static UploadImage: string;
  public static DeleteImage: string;
  public static GetListLSList: string;
  public static GetListCSList: string;
  public static GetListStatus: string;
  public static GetListHRList: string;
  public static GetListHead: string;
  public static GetListSupplier: string;
  public static GetListReport: string;

  public static ExportExcel: string;
  public static ExportExcelPDF: string;
  public static GetListPartnerCustomer: string;
  public static GetListPartnerFinance: string;

  static assignApi(apiList: any[]) {
    const apiObject = {};
    apiList.forEach(api => {
      const fullUrl = `${environment.apiServer}${api.URL}${api.APIID}`;
      apiObject[api.APIID] = fullUrl;
    });
    Object.assign(CoreApiStaticService, apiObject);
  }
}
