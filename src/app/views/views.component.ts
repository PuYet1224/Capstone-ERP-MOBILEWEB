import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CoreApiStaticService } from '../services/core/ps-core-api-static.service';
import { GetConfigService } from '../services/core/ps-get-config.service';
import { PsKendoNotificationService } from '../services/core/ps-kendo-notification.service';
import { MtbikeApiStaticService } from './mtbike/services/mtbike-api-static.service';
import { SystemApiService } from './system/services/system-api.service';

@Component({
  selector: 'view',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss'],
})

export class ViewsComponent implements OnInit, OnDestroy {
  constructor(
    private route: Router,
    private api: SystemApiService,
    private notification: PsKendoNotificationService,
    private getconfig: GetConfigService
  ) { }
  public loaded: boolean = false;
  private currentDll = '';
  private isLoadingApi = false;
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    // Listen to router events to reload API if module changed
    const routerSub = this.route.events.pipe(
      filter(event => event instanceof NavigationEnd || event instanceof NavigationStart)
    ).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.checkAndPreload(event.url);
      } else {
        this.initApiLoading();
      }
    });
    this.arrUnsubscribe.push(routerSub);

    // Initial load call
    this.initApiLoading();

    this.initConfig();
  }

  private checkAndPreload(url: string): void {
    var listurl = url.split('/');
    if (!listurl.includes('menu') && !listurl.includes('store') && !listurl.includes('login')) {
      var funcdll = listurl[2];
      if (!MtbikeApiStaticService.getNamespace(funcdll) && listurl.length > 3) {
        for (let i = 3; i < listurl.length; i++) {
          if (MtbikeApiStaticService.getNamespace(listurl[i])) {
            funcdll = listurl[i];
            break;
          }
        }
      }

      // If switching to a module (or different module), hide outlet immediately
      if (funcdll && funcdll !== this.currentDll) {
        this.loaded = false;
      }
    }
  }

  private initApiLoading(): void {
    var url = this.route.url;
    var listurl = url.split('/');
    if (!listurl.includes('menu') && !listurl.includes('store') && !listurl.includes('login')) {
      var funcdll = listurl[2];
      if (!MtbikeApiStaticService.getNamespace(funcdll) && listurl.length > 3) {
        for (let i = 3; i < listurl.length; i++) {
          if (MtbikeApiStaticService.getNamespace(listurl[i])) {
            funcdll = listurl[i];
            break;
          }
        }
      }

      // Only reload if DLL package actually changed
      if (funcdll && funcdll !== this.currentDll) {
        this.currentDll = funcdll;
        this.isLoadingApi = true;
        this.api.GetPermissionDLL(funcdll).subscribe(() => {
          this.getapi(funcdll);
        });
      } else if (funcdll === this.currentDll && !this.isLoadingApi) {
        // Module hasn't changed and not loading, ensure it's loaded
        this.loaded = true;
      }
    }
    else {
      this.loaded = true;
      this.currentDll = '';
      this.isLoadingApi = false;
    }
  }

  private initConfig(): void {
    var url = this.route.url;
    var listurl = url.split('/');
    var checkuser = this.getconfig.GetUser();
    if (!listurl.includes('login') && (checkuser == undefined || checkuser.Code == null)) {
      const sub = this.api.GetEmployeeAccount().subscribe({
        complete: () => {
          sub.unsubscribe();
        }
      });
      const subConfig = this.api.GetConfig().subscribe({
        complete: () => {
          subConfig.unsubscribe();
        }
      });
    }

    // Luôn kiểm tra version config từ DB mỗi khi load trang
    // Nếu DB thay đổi → tự động xóa cache cũ và cập nhật lại
    if (!listurl.includes('login')) {
      const subVersion = this.api.CheckAndRefreshConfig().subscribe({
        complete: () => {
          subVersion.unsubscribe();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private getapi(funcdll: string) {
    this.loaded = false;
    var temp = this.api.GetAPIByFunctionPackage(JSON.stringify(funcdll)).subscribe((res) => {
      this.isLoadingApi = false;
      if (res.StatusCode == 0) {
        CoreApiStaticService.assignApi(res.ObjectReturn);
        MtbikeApiStaticService.assignApi(res.ObjectReturn);
        this.loaded = true;
      } else {
        this.loaded = true;
        this.notification.onError(`Lỗi lấy danh sách API: ${res.ErrorString}`);
      }
    }, (err) => {
      this.isLoadingApi = false;
      this.loaded = true;
      this.notification.onError(`Lỗi lấy danh sách API: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
}
