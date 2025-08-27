import { Injectable } from "@angular/core";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { PSObject } from "../utilities/ps-object";
import { ConfigDTO } from "src/app/models/dtos/config.dto";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { TokenDTO } from "src/app/models/dtos/token.dto";
import { PSString } from "../utilities/ps-string";
import { AuthApiService } from "../auth/auth-api.service";
import { map, Observable, of } from "rxjs";
import { PsCache } from "../utilities/ps-cache";

@Injectable({
  providedIn: 'root'
})

export class PSGetConfigService {
  constructor(
    private cache: PsCache,
    private apiauth: AuthApiService,
  ) { }

  public GetHead(): LSHeadCusDTO {
    if (PSObject.isNullOfUndefined(ConfigDTO.head) || PSObject.isNullOfUndefined(ConfigDTO.head.Head)) {
      var cachehead = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
      if (!PSObject.isNullOfUndefined(cachehead))
        ConfigDTO.head = this.cache.parseValue(cachehead);
    }
    return ConfigDTO.head;
  }

  // public GetTokenHeader(): Observable<TokenDTO> {
  //   if (PSObject.isNullOfUndefined(ConfigDTO.token) || PSString.isNullOrWhitespace(ConfigDTO.token.access_token)) {
  //     var cachetoken = this.cache.getItem(KeyLocalStorageEnum.BEARER_TOKEN);
  //     if (!PSObject.isNullOfUndefined(cachetoken))
  //       ConfigDTO.token = this.cache.parseValue(cachetoken);
  //   }

  //   if (new Date(ConfigDTO.token.time_expired) < new Date()) {
  //     return this.apiauth.refreshToken(ConfigDTO.token).pipe(
  //       map(res => {
  //         return ConfigDTO.token;
  //       })
  //     );
  //   }
  //   else
  //     return of(ConfigDTO.token);
  // }

  public GetToken(): TokenDTO {
    if (PSObject.isNullOfUndefined(ConfigDTO.token) || PSString.isNullOrWhitespace(ConfigDTO.token.access_token)) {
      var cachetoken = this.cache.getItem(KeyLocalStorageEnum.BEARER_TOKEN);
      if (!PSObject.isNullOfUndefined(cachetoken))
        ConfigDTO.token = this.cache.parseValue(cachetoken);
    }
    return ConfigDTO.token;
  }

  public GetUser() {
    if (PSObject.isNullOfUndefined(ConfigDTO.userinfo) || PSObject.isNullOfUndefined(ConfigDTO.userinfo.staffID)) {
      var cacheuser = this.cache.getItem(KeyLocalStorageEnum.USER_INFOR);
      if (!PSObject.isNullOfUndefined(cacheuser))
        ConfigDTO.userinfo = this.cache.parseValue(cacheuser);
    }
    return ConfigDTO.userinfo;
  }

  public GetDLL() {
    if (PSString.isNullOrWhitespace(ConfigDTO.dllpackage)) {
      var item = this.cache.getItem(KeyLocalStorageEnum.DLLPACKAGE);
      if (!PSObject.isNullOfUndefined(item))
        ConfigDTO.dllpackage = this.cache.parseValue(item);
    }
    return ConfigDTO.dllpackage;
  }
}