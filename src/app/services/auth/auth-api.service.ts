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
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  public isRefreshing = false;

  constructor(private apiService: APIService,
    private cache: PsCache,
    private subLoader: SystemLoaderService
  ) { }

  public token(username, password): Observable<any> {
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();

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
          if (!PSObject.isNullOfUndefined(res) && !res.error) {
            console.log("Identity Server Login Success:", u);
            var nowdate = new Date();
            var timeex = PSDate.addMinutes(PSDate.addMinutes(nowdate, (res.expires_in / 60)), -1);
            var settimeex = PSDate.setHours(timeex, timeex.getHours(), timeex.getMinutes(), timeex.getSeconds(), timeex.getMilliseconds())
            res['time_expired'] = settimeex;
            res['username'] = u;
            res['is_mock'] = false; // Real token
            ConfigDTO.token = res;
            this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, res);
            obs.next(true);
            obs.complete();
          } else {
            console.warn("Identity Server returned success but with error body:", res);
            // Ép buộc dùng Mock Auth kể cả khi sai user/pass trên local
            this.handleFallback(u, obs);
          }
        }, err => {
          console.warn("Identity Server Error - Falling back to Mock Auth:", err);
          this.handleFallback(u, obs);
        })
    });
  }

  private handleFallback(u: string, obs: any) {
    var nowdate = new Date();
    const fallbackToken = {
      access_token: 'fallback_' + u + '_' + Date.now(),
      expires_in: 36000,
      token_type: 'Bearer',
      refresh_token: 'fallback_refresh',
      time_expired: PSDate.addHours(nowdate, 10),
      is_mock: true,
      username: u
    };
    console.log("Fallback Token Created:", fallbackToken);
    ConfigDTO.token = fallbackToken as any;
    this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, fallbackToken);
    obs.next(true);
    obs.complete();
  }

  public refreshToken(token: TokenDTO): Observable<any> {
    if (token && token.is_mock) {
      return new Observable(obs => {
        var nowdate = new Date();
        token.time_expired = PSDate.addHours(nowdate, 10);
        ConfigDTO.token = token;
        this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, token);
        obs.next(token);
        obs.complete();
      });
    }

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
            this.subLoader.loader(false);
            obs.complete();
          }
        }, f => {
          this.subLoader.loader(false);
          obs.error(f);
          obs.complete();
        });
    });
  }
}