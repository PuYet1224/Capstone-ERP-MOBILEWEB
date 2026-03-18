import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemApiStaticService {
  public static GetHead: string = environment.apiServer + '/api/admin/GetHead';
  public static GetModule: string = environment.apiServer + '/api/admin/GetModule';
  public static GetAPIByFunctionPackage: string = environment.apiServer + '/api/admin/GetAPIByFunctionPackage';
  public static GetEmployeeAccount: string = environment.apiServer + '/api/admin/GetEmployeeAccount';
  public static GetPermissionDLL: string = environment.apiServer + '/api/admin/GetPermissionDLL';
  public static GetConfig: string = environment.apiServer + '/api/admin/GetConfig';
}