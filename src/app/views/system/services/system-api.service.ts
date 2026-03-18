import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigDTO } from "src/app/models/dtos/config.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { ResponseDTO } from "src/app/models/dtos/reponse.dto";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { APIService } from "src/app/services/core/api.service";
import { PsCache } from "src/app/services/utilities/ps-cache";
import { ConfigCacheService } from "src/app/services/core/config-cache.service";
import { SystemApiStaticService } from "./system-api-static.service";

@Injectable({
  providedIn: 'root',
})

export class SystemApiService {
  constructor(
    private api: APIService,
    private cache: PsCache,
    private configCache: ConfigCacheService,
  ) { }

  public GetHead() {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetHead).subscribe((res: ResponseDTO) => {
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    });
  }

  public GetModule() {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetModule).subscribe((res: ResponseDTO) => {
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    });
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

  public GetPermissionDLL(funcDLL: string) {
    let that = this;
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, funcDLL);
    ConfigDTO.dllpackage = funcDLL;
    return new Observable<boolean>(obs => {
      that.api.post(SystemApiStaticService.GetPermissionDLL, JSON.stringify(funcDLL)).subscribe((res: ResponseDTO) => {
        FunctionPermissionDTO.set(res.ObjectReturn);
        obs.next(true);
        obs.complete();
      }, errors => {
        obs.error(false);
        obs.complete();
      })
    });
  }

  public GetConfig() {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetConfig).subscribe((res: ResponseDTO) => {
        if (res.StatusCode == 0) {
          this.cache.setItem(KeyLocalStorageEnum.SYSTEM_CONFIG, res.ObjectReturn);
        }
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    });
  }

  /**
   * Refactored CheckAndRefreshConfig
   * Bỏ qua gọi API GetConfigVersion, gọi thẳng GetConfig để làm mới cache lúc khởi động.
   */
  public CheckAndRefreshConfig(): Observable<boolean> {
    return new Observable<boolean>(obs => {
      this.configCache.clearAll(); // Xóa in-memory cache để load lại
      this.GetConfig().subscribe({
        next: () => {
          obs.next(true); // Đã refresh thành công
          obs.complete();
        },
        error: (err) => {
          obs.next(false);
          obs.complete();
        }
      });
    });
  }
}
