import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { SystemApiStaticService } from './layout-api-static.service';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { APIService } from '../core/api.service';
import { PsCache } from '../utilities/ps-cache';

@Injectable({
  providedIn: 'root'
})

export class LayoutApiService {
  constructor(public api: APIService, private cache: PsCache) { }

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

  public GetAPIByModuleID(moduleid: number) {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(SystemApiStaticService.GetAPIByModuleID, moduleid).subscribe((res: ResponseDTO) => {
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
}