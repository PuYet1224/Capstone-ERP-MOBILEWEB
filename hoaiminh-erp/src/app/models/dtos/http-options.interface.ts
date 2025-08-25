import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export interface HttpOptionsInterface {
  headers?: HttpHeaders | { [header: string]: string | string[]; }
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  } | any;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}