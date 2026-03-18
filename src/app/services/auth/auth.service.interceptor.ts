import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError, timer } from 'rxjs';
import { PSObject } from '../utilities/ps-object';
import { PsString } from '../utilities/ps-string';
import { AuthApiService } from './auth-api.service';
import { GetConfigService } from '../core/ps-get-config.service';
import { PSDate } from '../utilities/ps-date';
import { SystemService } from 'src/app/views/system/services/system.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';

@Injectable()
export class PS_AuthInterceptorService implements HttpInterceptor {
    private isRefresing = false;
    private refreshTokenSubject = new BehaviorSubject<any>(null);
    // Theo dõi các URL đã retry để không retry lặp vô hạn
    private retriedUrls = new Set<string>();

    constructor(
        private auth: SystemService,
        private authapi: AuthApiService,
        private config: GetConfigService,
        private subLoader: SystemLoaderService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.url.includes('/token')) {
            const token = this.config.GetToken();
            var time = token ? PSDate.addHours(new Date(token.time_expired), -7) : null;
            if (time && time < new Date()) {
                if (!this.isRefresing) {
                    this.isRefresing = true;
                    this.refreshTokenSubject.next(null);

                    this.authapi.refreshToken(token).subscribe((data) => {
                        this.isRefresing = false;
                        this.refreshTokenSubject.next(data);
                        this.subLoader.loader(false);
                        return next.handle(this.auth.setHeader(req));
                    }, error => {
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

            req = this.auth.setHeader(req);
        }

        return next.handle(req).pipe(
            catchError(err => {
                // Auto-retry 1 lần sau 2 giây nếu bị 401 (do hosting cold start)
                if (err instanceof HttpErrorResponse && err.status === 401
                    && !req.url.includes('/token') && !this.retriedUrls.has(req.url)) {
                    this.retriedUrls.add(req.url);
                    // Xóa URL khỏi set sau 10 giây để cho phép retry lại trong tương lai
                    setTimeout(() => this.retriedUrls.delete(req.url), 10000);
                    return timer(2000).pipe(
                        switchMap(() => next.handle(this.auth.setHeader(req)))
                    );
                }

                let error = "";
                if (!PSObject.isNullOfUndefined(err)) {
                    if (!PSObject.isNullOfUndefined(err.error) && !PSObject.isNullOfUndefined(err.error.Message)) {
                        error = err.error.Message;
                    } else {
                        if (!PsString.isNullOrWhitespace(err.statusText))
                            error = err.statusText;
                        else {
                            error = err;
                        }
                    }
                }
                return throwError(error);
            })
        )
    }
}