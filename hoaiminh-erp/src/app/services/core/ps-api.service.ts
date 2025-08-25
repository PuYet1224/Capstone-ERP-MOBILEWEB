import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpOptionsInterface } from "../../models/dtos/http-options.interface";
import { environment } from "src/environments/environment.dev";

@Injectable({
    providedIn: 'root'
})

export class PSAPIService {
    constructor(private http: HttpClient) { }

    private getOptions(isForm: boolean, withCredentials: boolean, observe: any, responseType: any): HttpOptionsInterface {
        var header = new HttpHeaders();

        if (isForm) {
            header = new HttpHeaders({
                'Access-Control-Allow-Origin': '*',
                'Language': 'vi-VN',
                'Product': environment.productionID,
            });
        }
        else {
            header = new HttpHeaders({
                'Access-Control-Allow-Origin': '*',
                'Language': 'vi-VN',
                'Product': environment.productionID,
                'Data-type': 'json',
                'Content-Type': 'application/json;charset=utf-8'
            });
        }

        var opt: HttpOptionsInterface = {
            headers: header,
            withCredentials: withCredentials,
            observe: observe,
            responseType: responseType
        };
        return opt;
    }

    public post<T>(url: string, body: unknown = null, isForm: boolean = false, withCredentials: boolean = false, observe: any = 'body', responseType: any = 'json'): Observable<T> {
        return this.http.post<T>(url, body, this.getOptions(isForm, withCredentials, observe, responseType));
    }

    public get<T>(url: string, body: unknown = null, isForm: boolean = false, withCredentials: boolean = false, observe: any = 'body', responseType: any = 'json'): Observable<T> {
        var opt = this.getOptions(isForm, withCredentials, observe, responseType);
        opt.params = body;
        return this.http.get<T>(url, opt);
    }
}