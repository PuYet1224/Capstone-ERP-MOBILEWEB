import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { PSObject } from '../utilities/ps-object';
import { PSString } from '../utilities/ps-string';
import { AuthApiService } from './auth-api.service';
import { PSGetConfigService } from '../core/ps-get-config.service';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSDate } from '../utilities/ps-date';

@Injectable()
export class PS_AuthInterceptorService implements HttpInterceptor {
    private isRefresing = false;
    private refreshTokenSubject = new BehaviorSubject<any>(null);

    constructor(
        private auth: AuthService,
        private authapi: AuthApiService,
        private subLoader: PsLayoutLoaderService,
        private loader: PsLayoutLoaderService,
        private config: PSGetConfigService,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.url.includes('/token')) {
            const token = this.config.GetToken();
            var time = token ? PSDate.addHours(new Date(token.time_expired), -7) : null;
            if (time && time < new Date()) {
                // this.subLoader.loader(true);
                if (!this.isRefresing) {
                    this.isRefresing = true;
                    this.refreshTokenSubject.next(null);

                    this.authapi.refreshToken(token).subscribe((data) => {
                        this.isRefresing = false;
                        this.refreshTokenSubject.next(data);
                        // this.subLoader.loader(false);
                        return next.handle(this.auth.setHeader(req));
                    }, error => {
                        this.subLoader.loader(false);
                        this.auth.logout();
                        return throwError(error);
                    })
                }

                return this.refreshTokenSubject.pipe(
                    filter(tk => tk !== null),
                    take(1),
                    switchMap(() => next.handle(this.auth.setHeader(req)))
                );
            }
        }

        req = this.auth.setHeader(req);

        return next.handle(req).pipe(
            catchError(err => {
                this.loader.reset();
                // if (err.status !== 401) {
                let error = "";
                if (!PSObject.isNullOfUndefined(err)) {
                    if (!PSObject.isNullOfUndefined(err.error) && !PSObject.isNullOfUndefined(err.error.Message)) {
                        error = err.error.Message;
                    } else {
                        if (!PSString.isNullOrWhitespace(err.statusText))
                            error = err.statusText;
                        else {
                            error = err;
                        }
                    }
                }
                return throwError(error);
                // }
                // else {
                //     var token = this.getconfig.GetToken();
                //     if (!this.isRefresing) {
                //         this.isRefresing = true;
                //         this.refreshTokenSubject.next(null);
                //         this.authapi.refreshToken(token).subscribe((data) => {
                //             console.log('Gọi refreshtoken sau');

                //             this.isRefresing = false;
                //             this.refreshTokenSubject.next(data);
                //             return next.handle(this.auth.setHeader(req));
                //         },
                //             error => {
                //                 this.auth.logout();
                //                 return throwError(error);
                //             });
                //     }

                //     return this.refreshTokenSubject.pipe(
                //         filter(token => token !== null),
                //         take(1),
                //         switchMap((token) => next.handle(this.auth.setHeader(req)))
                //     );
                // }
            })
        )
    }
}