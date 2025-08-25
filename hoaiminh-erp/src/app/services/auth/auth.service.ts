import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigDTO } from '../../models/dtos/config.dto';
import { PSObject } from '../utilities/ps-object';
import { PSString } from '../utilities/ps-string';
import { PSCache } from '../utilities/ps-cache';
import { KeyLocalStorageEnum } from '../../models/enums/key-local-storage.enum';
import { HttpRequest } from '@angular/common/http';
import { PSGetConfigService } from '../core/ps-get-config.service';
import { TokenDTO } from 'src/app/models/dtos/token.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { PSArray } from '../utilities/ps-array';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(
        private cache: PSCache,
        private router: Router,
        private config: PSGetConfigService,
    ) { }

    public isLoggedIn() {
        var that = this;
        return new Promise<boolean>((resolve) => {
            if (!PSObject.isNullOfUndefined(ConfigDTO.token) &&
                !PSString.isNullOrWhitespace(ConfigDTO.token.access_token) &&
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
                    if (!PSObject.isNullOfUndefined(token) && !PSString.isNullOrWhitespace(token.access_token)) {
                        ConfigDTO.token = token;
                        checktoken = true;
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
        this.router.navigate(['/login']);
    }

    public setHeader(req: HttpRequest<any>) {
        const token = this.config.GetToken();
        if (!PSObject.isNullOfUndefined(token) && !PSString.isNullOrWhitespace(token.access_token)) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token.access_token}`
                }
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
        if (PSArray.any(dataper?.datapermission)) {
            req = req.clone({
                setHeaders: {
                    DataPermission: JSON.stringify(dataper.datapermission)
                }
            });
        }

        return req;
    }

}