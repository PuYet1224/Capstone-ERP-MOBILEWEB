import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { ConfigDTO } from '../../../models/dtos/config.dto';
import { KeyLocalStorageEnum } from '../../../models/enums/key-local-storage.enum';
import { GetConfigService } from '../../../services/core/ps-get-config.service';
import { PsArray } from '../../../services/utilities/ps-array';
import { PsCache } from '../../../services/utilities/ps-cache';
import { PSObject } from '../../../services/utilities/ps-object';
import { PsString } from '../../../services/utilities/ps-string';
import { ConfigCacheService } from '../../../services/core/config-cache.service';

@Injectable({
    providedIn: 'root'
})

export class SystemService {
    constructor(
        private cache: PsCache,
        private router: Router,
        private config: GetConfigService,
        private configCache: ConfigCacheService,
    ) { }

    public isLoggedIn() {
        var that = this;
        return new Promise<boolean>((resolve) => {
            if (!PSObject.isNullOfUndefined(ConfigDTO.token) &&
                !PsString.isNullOrWhitespace(ConfigDTO.token.access_token) &&
                !PSObject.isNullOfUndefined(ConfigDTO.head) &&
                !PSObject.isNullOfUndefined(ConfigDTO.head.Head))
                resolve(true);
            else {
                var cacheToken = that.cache.getItem(KeyLocalStorageEnum.BEARER_TOKEN);
                var headToken = that.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);

                if (PSObject.isNullOfUndefined(cacheToken) || PSObject.isNullOfUndefined(headToken))
                    resolve(false);
                else {
                    var checktoken = false;
                    var token = that.cache.parseValue(cacheToken);
                    var time = null;
                    if (token) {
                        try {
                            time = new Date(token.time_expired);
                            if (isNaN(time.valueOf())) {
                                var s = typeof token.time_expired === 'string' ? token.time_expired.replace(/\s*\(.*\)$/, '') : token.time_expired;
                                time = new Date(s);
                            }
                        } catch (e) {
                            time = null;
                        }
                    }
                    try {
                        console.log('token', token);
                        console.log('raw time_expired', token ? token.time_expired : null);
                        console.log('parsed time', time);
                    } catch (e) {}
                    if (!PSObject.isNullOfUndefined(token) && !PsString.isNullOrWhitespace(token.access_token) && time && time > new Date()) {
                        ConfigDTO.token = token;
                        checktoken = true;
                    } else if (!PSObject.isNullOfUndefined(token) && !PsString.isNullOrWhitespace(token.access_token) && token.expires_in) {
                        // fallback: compute expiry from cache wrapper date when explicit time_expired is unreliable
                        try {
                            var wrapper = JSON.parse(cacheToken as string);
                            var cachedDate = new Date(wrapper.date);
                            var fallbackExpire = new Date(cachedDate.getTime() + (token.expires_in * 1000));
                            console.log('fallbackExpire', fallbackExpire);
                            if (fallbackExpire > new Date()) {
                                ConfigDTO.token = token;
                                checktoken = true;
                            }
                        } catch (e) {}
                    }

                    var checkhead = false;
                    var head = that.cache.parseValue(headToken);
                    if (!PSObject.isNullOfUndefined(head) && !PSObject.isNullOfUndefined(head.Head)) {
                        ConfigDTO.head = head;
                        checkhead = true;
                    }
                    resolve(checktoken && checkhead);
                }
            }
        });
    }

    public logout(): void {
        let that = this;
        var outUrl = that.router.url;
        that.cache.setItem(KeyLocalStorageEnum.OUT_URL, outUrl);
        that.cache.removeItem(KeyLocalStorageEnum.BEARER_TOKEN);
        ConfigDTO.token = null;
        this.configCache.clearAll();
        this.router.navigate(['/login']);
    }

    public setHeader(req: HttpRequest<any>) {
        const token: any = this.config.GetToken();
        if (!PSObject.isNullOfUndefined(token) && !PsString.isNullOrWhitespace(token.access_token)) {
            let headers: any = {
                Authorization: `Bearer ${token.access_token}`
            };
            if (token.is_mock) {
                headers['X-Test-User'] = token.username;
            }
            req = req.clone({
                setHeaders: headers
            });
        }

        const head = this.config.GetHead();
        if (head?.Head) {
            req = req.clone({
                setHeaders: {
                    Company: head.Head.toString()
                }
            });
        }

        const dataper = FunctionPermissionDTO;
        if (PsArray.any(dataper?.datapermission)) {
            req = req.clone({
                setHeaders: {
                    DataPermission: JSON.stringify(dataper.datapermission)
                }
            });
        }

        return req;
    }
}