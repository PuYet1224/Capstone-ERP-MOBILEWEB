import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { CSWorkOrderTaskCusDTO, StatusCheckedItem } from 'src/app/models/dtos/e-dtos/cs-work-order-task.dto';
import { Subscription } from 'rxjs';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { CompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { LSTypeOfPartCusDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part.dto';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { LSTypeOfPartSpecsDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { WOMServiceEnum } from 'src/app/models/enums/e-type/wom-service.enum';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'mtb005-cs-task',
  templateUrl: './mtb005-cs-task.component.html',
  styleUrls: ['./mtb005-cs-task.component.scss'],
})
export class Mtb005CSTaskComponent implements OnInit {
  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private router: Router,
    private cache: PsCache,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_SERVICE);
    this.typeOfService = this.cache.parseValue(temp);

    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    let womMaster = this.cache.parseValue(temp);
    this.workMaster = womMaster
    if (this.typeOfService !== WOMServiceEnum.FIX && womMaster.Code != 0) {
      this.GetListWOTask(womMaster, false);
      this.GetListWOTask(womMaster, true);
    } else if (this.typeOfService == WOMServiceEnum.FIX && womMaster.Code != 0) {
      this.GetListWOTask(womMaster, true);
    }
    this.GetListTaskBank();

  }

  private arrUnsubscribe: Subscription[] = [];
  public showpopup: boolean = false;
  public taskRequest: CSWorkOrderTaskCusDTO = new CSWorkOrderTaskCusDTO();
  public WOMServiceEnum = WOMServiceEnum;
  public typeOfService: number;
  public isOpenedFilter: boolean = false;
  private pressTimer: any;
  public listCategory: LSPartCategoryCusDTO[] = []
  public listTypeOfPart: LSTypeOfPartCusDTO[] = []
  public listTypeOfPartSpecs: LSTypeOfPartSpecsDTO[] = [];
  public listTaskBank: any[] = [];
  public mainTasks: CSWorkOrderTaskCusDTO[] = [];
  public additionalTasks: CSWorkOrderTaskCusDTO[] = [];
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO()
  public WOMStatusEnum = WOMStatusEnum;
  private location: Location;

  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    } else if (field == 'continue') {

      if (this.typeOfService !== WOMServiceEnum.FIX) {
        this.router.navigate(['/mtbike/repair/wo-cast']);
      } else if (this.typeOfService === WOMServiceEnum.FIX) {
        this.router.navigate(['/mtbike/repair/other-task']);
      }
    }
  }

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;
    this.GetListPartCategory();
  }

  public onAddTask() {
    this.UpdateWOTask(this.taskRequest)
    this.openFilterPopup(false);
    this.taskRequest = new CSWorkOrderTaskCusDTO();
  }

  startPress(item: any) {
    this.pressTimer = setTimeout(() => {
      this.openPopup(item);
    }, 1000);
  }

  endPress() {
    clearTimeout(this.pressTimer);
  }

  openPopup(item: any) {
    if (this.workMaster.Progress == WOMStatusEnum.DONE) { return; }
    this.taskRequest = item;
    this.showpopup = true;
  }

  DeleteItem() {
    const clone = { ...this.taskRequest, TypeOfTask: null };

    this.DeleteWOTask(clone);

    this.showpopup = false;
    this.taskRequest = new CSWorkOrderTaskCusDTO();
  }


  onCategoryChange() {
    this.GetListTypeOfPart();
    this.taskRequest.TypeOfPart = null;
    this.taskRequest.TypeOfPartSpecs = null;
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
  }

  onTypeOfPartChange(number: number) {
    const event = this.listTypeOfPart.find(x => x.Code == number);
    this.GetListTypeOfPartSpecs(event);
    this.listTypeOfPartSpecs = [];
    this.taskRequest.TypeOfPartSpecs = null;
  }

  onTypeOfPartSpecsChange(number: number) {
    this.taskRequest.TypeOfPartSpecs = number
  }

  public getTaskMethods(task: CSWorkOrderTaskCusDTO): string {
    return task.ListMethod
      ? task.ListMethod
        .filter(t => t.Checked)
        .map(t => t.Name)
        .join(' & ')
      : '';
  }



  //#region CALL API
  private GetListWOTask(params: CSWorkOrderMasterCusDTO, isNewTask: boolean = false) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListWOTask(params, isNewTask).subscribe(res => {
      if (res.StatusCode === 0) {
        if (isNewTask) {
          this.additionalTasks = res.ObjectReturn.map(task => {
            if (typeof task.TypeOfTask === 'string') {
              try {
                task.TypeOfTask = JSON.parse(task.TypeOfTask);
              } catch (e) {
                task.TypeOfTask = [];
              }
            }
            return task;
          });

        } else {
          this.mainTasks = res.ObjectReturn;
        }
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

  private GetListPartCategory() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListPartCategory({}).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listCategory = res.ObjectReturn.Data;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phân nhóm phụ tùng: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phân nhóm phụ tùng: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListTypeOfPart() {
    this.subLoader.loader(true);
    const typeState: State = {
      filter: { logic: 'and', filters: [{ field: 'Category', operator: 'eq', value: this.taskRequest.PartCategory }] } as CompositeFilterDescriptor,
    };
    const sub = this.mtbikeapi.GetListTypeOfPart(typeState).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listTypeOfPart = res.ObjectReturn.Data;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách loại phụ tùng: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách loại phụ tùng: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListTypeOfPartSpecs(param: LSTypeOfPartCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListTypeOfPartSpecs(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listTypeOfPartSpecs = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phân nhóm chi tiết: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phân nhóm chi tiết: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListTaskBank() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListTaskBank({}).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listTaskBank = res.ObjectReturn.Data;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phân nhóm chi tiết: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phân nhóm chi tiết: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateWOTask(param: CSWorkOrderTaskCusDTO) {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    var womMaster = this.cache.parseValue(temp);
    var taskID = this.listTaskBank.find(x => x.TaskName == param.TaskName);
    const cloneParam: any = {
      ...param,
      TaskID: taskID?.Code,
      WorkOrder: womMaster.Code,
      TypeOfTask: JSON.stringify(param.TypeOfTask)
    };
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateWOTask(cloneParam).subscribe(res => {
      if (res.StatusCode === 0) {

        if (this.typeOfService !== WOMServiceEnum.FIX && womMaster.Code != 0) {
          this.GetListWOTask(womMaster, false);
          this.GetListWOTask(womMaster, true);
        } else if (this.typeOfService == WOMServiceEnum.FIX && womMaster.Code != 0) {
          this.GetListWOTask(womMaster, true);
        }
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

  private DeleteWOTask(param: CSWorkOrderTaskCusDTO) {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    var womMaster = this.cache.parseValue(temp);
    var taskID = this.listTaskBank.find(x => x.TaskName == param.TaskName);
    const cloneParam: any = {
      ...param,
      TaskID: taskID.Code,
      WorkOrder: womMaster.Code,
    };
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.DeleteWOTask(cloneParam).subscribe(res => {
      if (res.StatusCode === 0) {

        if (this.typeOfService !== WOMServiceEnum.FIX && womMaster.Code != 0) {
          this.GetListWOTask(womMaster, false);
          this.GetListWOTask(womMaster, true);
        } else if (this.typeOfService == WOMServiceEnum.FIX && womMaster.Code != 0) {
          this.GetListWOTask(womMaster, true);
        }
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
