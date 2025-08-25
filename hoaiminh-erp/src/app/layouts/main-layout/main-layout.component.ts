import { Component, OnInit } from "@angular/core";
import { SYSModuleCusDTO } from "src/app/models/dtos/e-dtos/sys-module.dto";
import { DrawerItemCusInterface } from "./models/dtos/drawer-item-cus.interface";
import { Router } from "@angular/router";
import { LayoutApiService } from "src/app/services/layout/layout-api.service";
import { PSArray } from "src/app/services/utilities/ps-array";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PSPartApiStaticService } from "src/app/views/part/services/ps-part-api-static.service";
import { PsSystemApiStaticService } from "src/app/views/system/services/ps-system-api-static.service";
import { PSMtbikeApiStaticService } from "src/app/views/mtbike/services/ps-mtbike-api-static.service";
import { PSCoreApiStaticService } from "src/app/services/ps-core-api-static.service";
import { PSString } from "src/app/services/utilities/ps-string";
import { PSObject } from "src/app/services/utilities/ps-object";
import { PsLayoutLoaderService } from "./services/ps-layout-loader.service";
import { PSDashboardApiStaticService } from "src/app/views/dashboard/services/ps-dashboard-api-static.service";
import { PsReportApiStaticService } from "src/app/views/report/services/ps-report-api-static.service";
@Component({
  selector: 'ps-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})

export class MainLayoutComponent implements OnInit {
  public isLoaded: boolean = false;
  public datadrawer: DrawerItemCusInterface[] = [];
  public datamodule: SYSModuleCusDTO[] = [];

  private staticApi: Record<string, any>[] = [
    { 'dashboard': PSDashboardApiStaticService },
    { 'part': PSPartApiStaticService },
    { 'system': PsSystemApiStaticService },
    { 'mtbike': PSMtbikeApiStaticService },
    { 'report': PsReportApiStaticService },
  ]

  constructor(
    private route: Router,
    private admimapi: LayoutApiService,
    private layoutapi: LayoutApiService,
    private notification: PSKendoNotificationService,
    private cache: PSCache,
    private load: PsLayoutLoaderService
  ) { }

  //#region  life cycle
  ngOnInit(): void {
    this.getmodule();
  }
  //#endregion

  //#region function
  public onSelectModule(e: SYSModuleCusDTO) {
    //lưu lại cache module
    this.cache.setItem(KeyLocalStorageEnum.MODULE_ACTIVE, e);
    this.load.reset();
    this.getapibymoduleid(e);
  }

  private handledata(e) {
    //lấy url cũ khi out
    var outurlcache = this.cache.getItem(KeyLocalStorageEnum.OUT_URL)
    var outurl = PSObject.isNullOfUndefined(outurlcache) ? "" : this.cache.parseValue(outurlcache);
    var gotourl = PSString.isNullOrWhitespace(outurl) || outurl.split('/')[1] != e.ModuleID ? e.ModuleID : outurl;

    this.isLoaded = false;
    this.route.navigate([gotourl]).then(() => {
      var urlActive = this.route.url;
      this.cache.setItem(KeyLocalStorageEnum.OUT_URL, urlActive);

      var linkarr = urlActive.split('/');
      var fumcdll = linkarr[linkarr.length - 1];
      this.admimapi.GetPermissionDLL(fumcdll).subscribe(() => {
        this.datadrawer = [];
        if (!PSArray.isNullOrEmpty(e.ListFunction)) {
          e.ListFunction.forEach(f => {
            var dto: DrawerItemCusInterface = {
              id: f.Code,
              parentId: undefined,
              text: f.FunctionName,
              icon: f.Icon,
              type: f.DLLPackage != 'm_lookup' ? 'module' : 'm_lookup',
              selected: urlActive.includes(f.DLLPackage),
              url: '/' + e.ModuleID + '/' + f.DLLPackage,
            }
            this.datadrawer.push(dto);
          });
        }

        if (!PSArray.isNullOrEmpty(e.ListGroup)) {
          e.ListGroup.forEach(f => {
            var dto: DrawerItemCusInterface = {
              id: f.Code,
              parentId: undefined,
              text: f.ModuleName,
              icon: f.Icon,
              type: 'module',
              opend: urlActive.includes('/' + e.ModuleID + '/' + f.ModuleID),
            }
            this.datadrawer.push(dto);

            if (!PSArray.isNullOrEmpty(f.ListFunction)) {
              f.ListFunction.forEach(ff => {
                var dto1: DrawerItemCusInterface = {
                  id: ff.Code,
                  parentId: f.Code,
                  text: ff.FunctionName,
                  icon: ff.Icon,
                  selected: urlActive.includes(ff.DLLPackage),
                  url: '/' + e.ModuleID + '/' + f.ModuleID + '/' + ff.DLLPackage,
                }
                this.datadrawer.push(dto1);
              });
            }
          });
        }
        this.isLoaded = true
      });
    });
  }
  //#endregion

  //#region api
  private getmodule() {
    this.layoutapi.GetModule().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.datamodule = res.ObjectReturn;
      } else {
        this.notification.onError(`Lỗi lấy danh sách module: ${res.ErrorString}`);
      }
    }, (err) => {
      this.notification.onError(`Lỗi lấy danh sách module: ${err.message}`);
    });
  }

  private getapibymoduleid(e: SYSModuleCusDTO) {
    var modulecache = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.MODULE_ACTIVE));
    const index = this.staticApi.find(m => Object.keys(m)[0] === modulecache.ModuleID)[modulecache.ModuleID];
    if (index.loaded || false)
      this.handledata(e);

    this.layoutapi.GetAPIByModuleID(modulecache.Code).subscribe((res) => {
      if (res.StatusCode == 0) {
        PSCoreApiStaticService.assignApi(res.ObjectReturn);
        PSDashboardApiStaticService.assignApi(res.ObjectReturn);
        PSPartApiStaticService.assignApi(res.ObjectReturn);
        PsSystemApiStaticService.assignApi(res.ObjectReturn);
        PSMtbikeApiStaticService.assignApi(res.ObjectReturn);
        PsReportApiStaticService.assignApi(res.ObjectReturn);
        this.isLoaded = false;
        index.load();
        this.handledata(e);
      } else {
        this.notification.onError(`Lỗi lấy danh sách API: ${res.ErrorString}`);
      }
    }, (err) => {
      this.notification.onError(`Lỗi lấy danh sách API: ${err.message}`);
    });
  }
  //#endregion
}