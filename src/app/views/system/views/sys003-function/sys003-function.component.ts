import { Component, OnInit } from '@angular/core';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemApiService } from '../../services/system-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SYSModuleCusDTO } from 'src/app/models/dtos/e-dtos/sys-module.dto';
import { SystemLoaderService } from '../../services/system-loader.service';
import { Subscription } from 'rxjs';
import { SYSFunctionCusDTO } from 'src/app/models/dtos/e-dtos/sys-function.dto';
import { Router } from '@angular/router';
import { CoreApiStaticService } from 'src/app/services/core/ps-core-api-static.service';
import { MtbikeApiStaticService } from 'src/app/views/mtbike/services/mtbike-api-static.service';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';

@Component({
  selector: 'sys003-function',
  templateUrl: './sys003-function.component.html',
  styleUrls: ['./sys003-function.component.scss']
})

export class Sys003FunctionComponent implements OnInit {
  constructor(
    private cache: PsCache,
    private api: SystemApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private router: Router
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    this.loader.reset();
    //Lấy head được chọn trên cache
    var temp = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
    var cacheHead = this.cache.parseValue(temp);
    this.headActive = cacheHead;

    //lấy danh sách module, function
    this.getmodule();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region header
  public headActive: LSHeadCusDTO = { Head: 0, HeadName: "" } as LSHeadCusDTO;

  public onselectstore() {
    this.router.navigate(["store"])
  }
  //#endregion

  //#region body
  public datamodule: SYSModuleCusDTO[] = [];

  public onclickfunction(func: SYSFunctionCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, func.DLLPackage);
    ConfigDTO.dllpackage = func.DLLPackage;
    
    const ns = MtbikeApiStaticService.getNamespace(func.DLLPackage);
    if (!ns) {
      console.error(`Namespace not found for DLLPackage: ${func.DLLPackage}. Please check MtbikeApiStaticService.namespaceMap`);
      this.getapi(func.DLLPackage, func.FunctionURL);
      return;
    }

    const isloaded = ns.loader;
    this.api.GetPermissionDLL(func.DLLPackage).subscribe(() => {
      if (isloaded)
        this.router.navigateByUrl(func.FunctionURL);
      else
        this.getapi(func.DLLPackage, func.FunctionURL);
    });
  }

  private getapi(funcdll: string, funcurl: string) {
    this.loader.loader(true);
    var temp = this.api.GetAPIByFunctionPackage(JSON.stringify(funcdll)).subscribe((res) => {
      if (res.StatusCode == 0) {
        CoreApiStaticService.assignApi(res.ObjectReturn);
        MtbikeApiStaticService.assignApi(res.ObjectReturn);
        this.loader.loader(false);
        this.router.navigateByUrl(funcurl);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách API: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách API: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private getmodule() {
    this.loader.loader(true);
    var temp = this.api.GetModule().subscribe((res) => {
      if (res.StatusCode == 0) {
        if (res.ObjectReturn) {
          res.ObjectReturn.forEach(f => {
            var temp = new SYSModuleCusDTO();
            temp = { ...f };
            temp.ModuleName = f.ModuleName || f.Vietnamese;
            // Logger for debugging casing if needed
            if (!temp.ModuleName) temp.ModuleName = temp['moduleName']; 
            if (!temp.ModuleName) temp.ModuleName = 'Module';

            if (temp.ListFunction) {
              temp.ListFunction.forEach(fe => {
                fe.FunctionURL = '/' + temp.ModuleID + '/' + fe.DLLPackage;
              })
            }

            if (temp.ListGroup) {
              temp.ListGroup.forEach(fe => {
                if (!temp.ListFunction)
                  temp.ListFunction = [];
                fe.ListFunction.forEach(fec => {
                  fec.FunctionURL = '/' + temp.ModuleID + '/' + fe.ModuleID + '/' + fec.DLLPackage;
                  if (!temp.ListFunction.find(x => x.Code === fec.Code)) {
                    temp.ListFunction.push(fec);
                  }
                })
              })
            }
            this.datamodule.push(temp);
          });
        }
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách module: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách module: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
