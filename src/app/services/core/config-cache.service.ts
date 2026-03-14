import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { HRListTypeDataEnum } from 'src/app/models/enums/e-type/hr-list-type-data.enum';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { CSListTypeDataEnum } from 'src/app/models/enums/e-type/cs-list-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PSCoreApiService } from '../ps-core-api.service';
import { PsCache } from '../utilities/ps-cache';

/**
 * ConfigCacheService - Service quản lý cache cho các dữ liệu config/lookup
 *
 * Dữ liệu lookup (danh sách giới tính, đơn vị, phương thức thanh toán, ...)
 * sẽ được lưu vào bộ nhớ (in-memory) và localStorage.
 * Khi gọi lại, nếu đã có dữ liệu trong cache thì trả về ngay, không gọi API.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigCacheService {
  // In-memory cache: key là enum value, value là danh sách ListDTO
  private hrListCache: Map<number, ListDTO[]> = new Map();
  private lsListCache: Map<number, ListDTO[]> = new Map();
  private csListCache: Map<number, any[]> = new Map();

  constructor(
    private coreApi: PSCoreApiService,
    private cache: PsCache,
  ) {
    // Khôi phục cache từ localStorage khi khởi tạo service
    this.restoreFromLocalStorage();
  }

  /**
   * Lấy danh sách HR List (giới tính, nghề nghiệp, ...)
   * Nếu đã có trong cache, trả về ngay mà không gọi API
   */
  public GetListHRList(typeData: HRListTypeDataEnum, forceReload: boolean = false): Observable<ListDTO[]> {
    // Nếu đã có trong cache và không yêu cầu reload
    if (!forceReload && this.hrListCache.has(typeData)) {
      return of(this.hrListCache.get(typeData));
    }

    // Gọi API và lưu kết quả vào cache
    return new Observable<ListDTO[]>((obs) => {
      this.coreApi.GetListHRList(typeData).subscribe(
        (res) => {
          if (res.StatusCode === 0) {
            this.hrListCache.set(typeData, res.ObjectReturn);
            this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_HR_LIST, this.mapToObject(this.hrListCache));
            obs.next(res.ObjectReturn);
          } else {
            obs.error(res.ErrorString);
          }
          obs.complete();
        },
        (err) => {
          obs.error(err);
          obs.complete();
        }
      );
    });
  }

  /**
   * Lấy danh sách LS List (đơn vị tính, phương thức thanh toán, ...)
   * Nếu đã có trong cache, trả về ngay mà không gọi API
   */
  public GetListLSList(typeData: LSListTypeDataEnum, forceReload: boolean = false): Observable<ListDTO[]> {
    if (!forceReload && this.lsListCache.has(typeData)) {
      return of(this.lsListCache.get(typeData));
    }

    return new Observable<ListDTO[]>((obs) => {
      this.coreApi.GetListLSList(typeData).subscribe(
        (res) => {
          if (res.StatusCode === 0) {
            this.lsListCache.set(typeData, res.ObjectReturn);
            this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_LS_LIST, this.mapToObject(this.lsListCache));
            obs.next(res.ObjectReturn);
          } else {
            obs.error(res.ErrorString);
          }
          obs.complete();
        },
        (err) => {
          obs.error(err);
          obs.complete();
        }
      );
    });
  }

  /**
   * Lấy danh sách CS List (loại nhiên liệu, ...)
   * Nếu đã có trong cache, trả về ngay mà không gọi API
   */
  public GetListCSList(typeData: CSListTypeDataEnum, forceReload: boolean = false): Observable<any[]> {
    if (!forceReload && this.csListCache.has(typeData)) {
      return of(this.csListCache.get(typeData));
    }

    return new Observable<any[]>((obs) => {
      this.coreApi.GetListCSList(typeData).subscribe(
        (res) => {
          if (res.StatusCode === 0) {
            this.csListCache.set(typeData, res.ObjectReturn);
            this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_CS_LIST, this.mapToObject(this.csListCache));
            obs.next(res.ObjectReturn);
          } else {
            obs.error(res.ErrorString);
          }
          obs.complete();
        },
        (err) => {
          obs.error(err);
          obs.complete();
        }
      );
    });
  }

  /**
   * Xóa toàn bộ cache (khi logout hoặc đổi head)
   */
  public clearAll(): void {
    this.hrListCache.clear();
    this.lsListCache.clear();
    this.csListCache.clear();
    this.cache.removeItem(KeyLocalStorageEnum.CONFIG_HR_LIST);
    this.cache.removeItem(KeyLocalStorageEnum.CONFIG_LS_LIST);
    this.cache.removeItem(KeyLocalStorageEnum.CONFIG_CS_LIST);
  }

  /**
   * Xóa cache theo loại cụ thể
   */
  public clearHRList(typeData?: HRListTypeDataEnum): void {
    if (typeData !== undefined) {
      this.hrListCache.delete(typeData);
    } else {
      this.hrListCache.clear();
    }
    this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_HR_LIST, this.mapToObject(this.hrListCache));
  }

  public clearLSList(typeData?: LSListTypeDataEnum): void {
    if (typeData !== undefined) {
      this.lsListCache.delete(typeData);
    } else {
      this.lsListCache.clear();
    }
    this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_LS_LIST, this.mapToObject(this.lsListCache));
  }

  public clearCSList(typeData?: CSListTypeDataEnum): void {
    if (typeData !== undefined) {
      this.csListCache.delete(typeData);
    } else {
      this.csListCache.clear();
    }
    this.saveToLocalStorage(KeyLocalStorageEnum.CONFIG_CS_LIST, this.mapToObject(this.csListCache));
  }

  // ─── Private helpers ───

  private saveToLocalStorage(key: KeyLocalStorageEnum, data: any): void {
    this.cache.setItem(key, data);
  }

  private restoreFromLocalStorage(): void {
    try {
      const hrRaw = this.cache.getItem(KeyLocalStorageEnum.CONFIG_HR_LIST);
      if (hrRaw) {
        const hrData = this.cache.parseValue(hrRaw);
        if (hrData) {
          Object.keys(hrData).forEach((k) => {
            this.hrListCache.set(Number(k), hrData[k]);
          });
        }
      }
    } catch (e) { }

    try {
      const lsRaw = this.cache.getItem(KeyLocalStorageEnum.CONFIG_LS_LIST);
      if (lsRaw) {
        const lsData = this.cache.parseValue(lsRaw);
        if (lsData) {
          Object.keys(lsData).forEach((k) => {
            this.lsListCache.set(Number(k), lsData[k]);
          });
        }
      }
    } catch (e) { }

    try {
      const csRaw = this.cache.getItem(KeyLocalStorageEnum.CONFIG_CS_LIST);
      if (csRaw) {
        const csData = this.cache.parseValue(csRaw);
        if (csData) {
          Object.keys(csData).forEach((k) => {
            this.csListCache.set(Number(k), csData[k]);
          });
        }
      }
    } catch (e) { }
  }

  private mapToObject(map: Map<number, any>): any {
    const obj: any = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}
