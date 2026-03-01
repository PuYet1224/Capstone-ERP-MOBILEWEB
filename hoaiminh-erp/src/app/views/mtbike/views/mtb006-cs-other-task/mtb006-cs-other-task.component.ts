import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { Subscription } from 'rxjs';
import { CSWorkOrderTaskCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-task.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { Location } from '@angular/common';
@Component({
  selector: 'mtb006-cs-other-task',
  templateUrl: './mtb006-cs-other-task.component.html',
  styleUrls: ['./mtb006-cs-other-task.component.scss'],
})
export class Mtb006CsOtherTaskComponent implements OnInit {

  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private router: Router,
    private cache: PsCache,
    private location: Location,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    let womMaster = this.cache.parseValue(temp);
    this.workMaster = womMaster
    this.GetListWOTask(womMaster, false);
  }

  private arrUnsubscribe: Subscription[] = [];
  public isOpenedFilter: boolean = false;
  public mainTasks: CSWorkOrderTaskCusDTO[] = [];
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public WOMStatusEnum = WOMStatusEnum

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;

  }

  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    } else if (field == 'continue') {

      this.router.navigate(['/mtbike/repair/wo-cast']);
    }
  }

  onSwitch(e: CSWorkOrderTaskCusDTO) {
    this.UpdateWOTask(e);
  }

  private GetListWOTask(params: CSWorkOrderMasterCusDTO, isNewTask: boolean = false) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListWOTask(params, isNewTask).subscribe(res => {
      if (res.StatusCode === 0) {
        this.mainTasks = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách công việc: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách công việc: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateWOTask(param: CSWorkOrderTaskCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateWOTask(param).subscribe(res => {
      if (res.StatusCode === 0) {
        var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
        let womMaster = this.cache.parseValue(temp);
        this.GetListWOTask(womMaster, false);
        this.subLoader.loader(false);
        this.notification.onSuccess("Thành công");
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi thêm mới công việc: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi thêm mới công việc: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
}
