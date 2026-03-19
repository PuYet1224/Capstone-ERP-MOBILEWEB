import { Component, OnDestroy, OnInit } from '@angular/core';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { PsString } from 'src/app/services/utilities/ps-string';
import { Subscription } from 'rxjs';
import { SystemApiService } from '../../services/system-api.service';
import { SystemLoaderService } from '../../services/system-loader.service';
import { PsArray } from 'src/app/services/utilities/ps-array';
import { SystemService } from '../../services/system.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemHeaderService } from '../../services/system-header.service';
@Component({
  selector: 'sys002-store',
  templateUrl: './sys002-store.component.html',
  styleUrls: ['./sys002-store.component.scss']
})

export class Sys002StoreComponent implements OnInit, OnDestroy {
  constructor(
    protected router: Router,
    private api: SystemApiService,
    private cache: PsCache,
    private route: ActivatedRoute,
    private loader: SystemLoaderService,
    private systemservices: SystemService,
    private notification: PsKendoNotificationService,
    private header: SystemHeaderService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    this.loader.reset();
    this.getListHead();

    var cacheuurl = this.cache.getItem(KeyLocalStorageEnum.OUT_URL);
    var urldata = this.cache.parseValue(cacheuurl);
    this.returnUrl = PsString.isNullOrWhitespace(urldata) ? this.route.url : urldata;
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region  list
  public returnUrl: string = "/";
  public listHead: LSHeadCusDTO[] = [];

  public selectHead(obj: LSHeadCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.HEAD_OBJECT, obj);
    ConfigDTO.head = obj;
    this.header.headChange.next(obj);
    this.router.navigate(["menu"]);
  }

  public getListHead() {
    this.loader.loader(true);
    let temp = this.api.GetHead().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listHead = res.ObjectReturn;
        if (!PsArray.any(this.listHead))
          this.systemservices.logout();
        else if (PsArray.count(this.listHead) == 1)
          ConfigDTO.head = this.listHead[0];
        this.cache.setItem(KeyLocalStorageEnum.HEAD_LIST, this.listHead);
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách head: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách head: ${err.message}`);
    })

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
