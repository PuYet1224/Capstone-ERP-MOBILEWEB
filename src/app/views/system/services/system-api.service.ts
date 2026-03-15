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
   * Gọi API GetConfigVersion để lấy version hash từ DB.
   * So sánh với version đã lưu trong localStorage:
   * - Nếu khác → Xóa toàn bộ config cache (in-memory + localStorage) và gọi lại GetConfig
   * - Nếu giống → Không làm gì (dùng cache cũ)
   *
   * Nhờ vậy, khi DB thay đổi, FE tự động biết và cập nhật lại mà không cần xóa cache thủ công.
   */
  public CheckAndRefreshConfig(): Observable<boolean> {
    return new Observable<boolean>(obs => {
      this.api.post(SystemApiStaticService.GetConfigVersion).subscribe(
        (res: ResponseDTO) => {
          if (res.StatusCode == 0) {
            const newVersion = res.ObjectReturn;
            const cachedVersionRaw = this.cache.getItem(KeyLocalStorageEnum.CONFIG_VERSION);
            const cachedVersion = cachedVersionRaw ? this.cache.parseValue(cachedVersionRaw) : null;

            if (cachedVersion !== newVersion) {
              console.log(`[ConfigVersion] DB đã thay đổi: ${cachedVersion} → ${newVersion}. Đang cập nhật cache...`);

              // Xóa toàn bộ cache config cũ
              this.configCache.clearAll();

              // Lưu version mới
              this.cache.setItem(KeyLocalStorageEnum.CONFIG_VERSION, newVersion);

              // Gọi lại GetConfig để cập nhật dữ liệu mới nhất
              this.GetConfig().subscribe({
                next: () => {
                  console.log('[ConfigVersion] Đã cập nhật config mới từ DB thành công.');
                  obs.next(true); // true = có thay đổi
                  obs.complete();
                },
                error: (err) => {
                  console.error('[ConfigVersion] Lỗi khi gọi GetConfig:', err);
                  obs.next(true);
                  obs.complete();
                }
              });
            } else {
              console.log('[ConfigVersion] Config chưa thay đổi, sử dụng cache.');
              obs.next(false); // false = không có thay đổi
              obs.complete();
            }
          } else {
            obs.next(false);
            obs.complete();
          }
        },
        (err) => {
          console.error('[ConfigVersion] Lỗi khi kiểm tra version:', err);
          obs.next(false);
          obs.complete();
        }
      );
    });
  }
}
