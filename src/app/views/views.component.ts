import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    var url = this.route.url;
    var listurl = url.split('/');
    if (!listurl.includes('menu') && !listurl.includes('store') && !listurl.includes('login')) {
      var funcdll = listurl[2];

      // Try to find a more specific DLL in nested segments
      for (let i = listurl.length - 1; i >= 2; i--) {
        if (MtbikeApiStaticService.getNamespace(listurl[i])) {
          funcdll = listurl[i];
          break;
        }
      }

      this.api.GetPermissionDLL(funcdll).subscribe(() => {
        this.getapi(funcdll);
      });
    }
    else
      this.loaded = true

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
      if (res.StatusCode == 0) {
        CoreApiStaticService.assignApi(res.ObjectReturn);
        MtbikeApiStaticService.assignApi(res.ObjectReturn);
        this.loaded = true;
      } else {
        this.loaded = true;
        this.notification.onError(`Lỗi lấy danh sách API: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loaded = true;
      this.notification.onError(`Lỗi lấy danh sách API: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
}
