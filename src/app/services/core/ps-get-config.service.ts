import { Injectable } from "@angular/core";
import { ConfigDTO } from "src/app/models/dtos/config.dto";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { TokenDTO } from "src/app/models/dtos/token.dto";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PsCache } from "../utilities/ps-cache";
import { PSObject } from "../utilities/ps-object";
import { PsString } from "../utilities/ps-string";

@Injectable({
  providedIn: 'root'
})

export class GetConfigService {
  constructor(
    private cache: PsCache
  ) { }

  public GetHead(): LSHeadCusDTO {
    if (PSObject.isNullOfUndefined(ConfigDTO.head) || PSObject.isNullOfUndefined(ConfigDTO.head.Head)) {
      var cachehead = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
      if (!PSObject.isNullOfUndefined(cachehead))
        ConfigDTO.head = this.cache.parseValue(cachehead);
    }
    return ConfigDTO.head;
  }



  public GetToken(): TokenDTO {
    if (PSObject.isNullOfUndefined(ConfigDTO.token) || PsString.isNullOrWhitespace(ConfigDTO.token.access_token)) {
      var cachetoken = this.cache.getItem(KeyLocalStorageEnum.BEARER_TOKEN);
      if (!PSObject.isNullOfUndefined(cachetoken))
        ConfigDTO.token = this.cache.parseValue(cachetoken);
    }
    return ConfigDTO.token;
  }

  public GetUser() {
    if (PSObject.isNullOfUndefined(ConfigDTO.userinfo) || PSObject.isNullOfUndefined(ConfigDTO.userinfo.Code)) {
      var cacheuser = this.cache.getItem(KeyLocalStorageEnum.USER_INFOR);
      if (!PSObject.isNullOfUndefined(cacheuser))
        ConfigDTO.userinfo = this.cache.parseValue(cacheuser);
    }
    return ConfigDTO.userinfo;
  }

  public GetDLL() {
    if (PsString.isNullOrWhitespace(ConfigDTO.dllpackage)) {
      var item = this.cache.getItem(KeyLocalStorageEnum.DLLPACKAGE);
      if (!PSObject.isNullOfUndefined(item))
        ConfigDTO.dllpackage = this.cache.parseValue(item);
    }
    return ConfigDTO.dllpackage;
  }

  public GetSystemConfig() {
    return this.cache.getItem(KeyLocalStorageEnum.SYSTEM_CONFIG);
  }
}