import { HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { APIService } from '../core/api.service';
import { PSObject } from '../utilities/ps-object';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { TokenDTO } from 'src/app/models/dtos/token.dto';
import { AuthApiStaticService } from './auth-api-static.service';
import { PSDate } from '../utilities/ps-date';
import { PsCache } from '../utilities/ps-cache';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  public isRefreshing = false;

  constructor(private apiService: APIService,
    private cache: PsCache
  ) { }

  public token(username, password): Observable<any> {
    const data = new HttpParams({
      fromObject: {
        client_id: "admin",
        client_secret: "adminsecret",
        grant_type: "password",
        scope: "adminapi offline_access",
        username: username,
        password: password
      }
    });
    return new Observable(obs => {
      this.apiService.post(AuthApiStaticService.token, data, true)
        .subscribe((res: any) => {
          if (!PSObject.isNullOfUndefined(res)) {
            var nowdate = new Date();
            var timeex = PSDate.addMinutes(PSDate.addMinutes(nowdate, (res.expires_in / 60)), -1);
            var settimeex = PSDate.setHours(timeex, timeex.getHours(), timeex.getMinutes(), timeex.getSeconds(), timeex.getMilliseconds())
            res['time_expired'] = settimeex;
            ConfigDTO.token = res;
            this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, res);
            obs.next(true);
            obs.complete();
          }
        }, f => {
          obs.error(f);
          obs.complete();
        })
    });
  }

  public refreshToken(token: TokenDTO) {
    const data = new HttpParams({
      fromObject: {
        client_id: "admin",
        client_secret: "adminsecret",
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token
      }
    });

    return new Observable(obs => {
      this.apiService.post(AuthApiStaticService.token, data, true)
        .subscribe((res: any) => {
          if (!PSObject.isNullOfUndefined(res)) {
            var nowdate = new Date();
            var timeex = PSDate.addMinutes(PSDate.addMinutes(nowdate, (res.expires_in / 60)), -1);
            var settimeex = PSDate.setHours(timeex, timeex.getHours(), timeex.getMinutes(), timeex.getSeconds(), timeex.getMilliseconds())
            res['time_expired'] = settimeex;
            ConfigDTO.token = res;
            this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, res);
            obs.next(res);
            obs.complete();
          }
          else {
            obs.complete();
          }
        }, f => {
          obs.error(f);
          obs.complete();
        });
    });
  };

  // public getuserinfo(): Observable<any> {
  //   return new Observable(obs => {
  //     this.apiService.get(AuthApiStaticService.getuserinfo, null)
  //       .subscribe((res: any) => {
  //         if (!PSObject.isNullOfUndefined(res)) {
  //           ConfigDTO.userinfo = res;
  //           this.cache.setItem(KeyLocalStorageEnum.USER_INFOR, res);
  //           obs.next(res);
  //           obs.complete();
  //         }
  //       }, f => {
  //         obs.error(f);
  //         obs.complete();
  //       })
  //   });
  // }
}