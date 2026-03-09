import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { ConfigDTO } from "src/app/models/dtos/config.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { ResponseDTO } from "src/app/models/dtos/reponse.dto";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { APIService } from "src/app/services/core/api.service";
import { PsCache } from "src/app/services/utilities/ps-cache";
import { SystemApiStaticService } from "./system-api-static.service";

@Injectable({
  providedIn: 'root',
})

export class SystemApiService {
  constructor(
    private api: APIService,
    private cache: PsCache
  ) { }

  private _configCache$: Observable<ResponseDTO> | null = null;
  public GetConfig() {
    if (!this._configCache$) {
      this._configCache$ = this.api.post<ResponseDTO>(SystemApiStaticService.GetConfig).pipe(
        shareReplay(1)
      );
    }
    return this._configCache$;
  }

  private _headCache$: Observable<ResponseDTO> | null = null;
  public GetHead() {
    if (!this._headCache$) {
      this._headCache$ = this.api.post<ResponseDTO>(SystemApiStaticService.GetHead).pipe(
        shareReplay(1)
      );
    }
    return this._headCache$;
  }

  private _moduleCache$: Observable<ResponseDTO> | null = null;
  public GetModule() {
    if (!this._moduleCache$) {
      this._moduleCache$ = this.api.post<ResponseDTO>(SystemApiStaticService.GetModule).pipe(
        shareReplay(1)
      );
    }
    return this._moduleCache$;
  }

  public clearCache() {
    this._configCache$ = null;
    this._headCache$ = null;
    this._moduleCache$ = null;
    this._permissionCache$ = {};
  }

  public GetAPIByFunctionPackage(funcdll: string) {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetAPIByFunctionPackage, funcdll).subscribe((res: ResponseDTO) => {
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    });
  }

  GetEmployeeAccount() {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetEmployeeAccount)
        .subscribe((res: ResponseDTO) => {
          ConfigDTO.userinfo = res.ObjectReturn;
          this.cache.setItem(KeyLocalStorageEnum.USER_INFOR, res.ObjectReturn);
          obs.next(res);
          obs.complete();
        }, errors => {
          obs.error(errors);
          obs.complete();
        })
    });
  }

  private _permissionCache$: { [key: string]: Observable<ResponseDTO> } = {};

  public GetPermissionDLL(funcDLL: string): Observable<boolean> {
    let that = this;
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, funcDLL);
    ConfigDTO.dllpackage = funcDLL;

    if (!this._permissionCache$[funcDLL]) {
      this._permissionCache$[funcDLL] = this.api.post<ResponseDTO>(SystemApiStaticService.GetPermissionDLL, JSON.stringify(funcDLL)).pipe(
        shareReplay(1)
      );
    }

    return new Observable<boolean>(obs => {
      this._permissionCache$[funcDLL].subscribe({
        next: (res: ResponseDTO) => {
          FunctionPermissionDTO.set(res.ObjectReturn);
          obs.next(true);
          obs.complete();
        },
        error: (errors) => {
          obs.error(false);
          obs.complete();
        }
      });
    });
  }
}
