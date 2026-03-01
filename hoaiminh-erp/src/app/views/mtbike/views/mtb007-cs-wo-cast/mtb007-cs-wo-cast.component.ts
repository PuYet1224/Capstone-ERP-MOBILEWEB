import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CSLoyalCustomerCusDTO, CSLoyalCustomerDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { CSVehicleCusDTO } from 'src/app/models/dtos/e-dtos/cs-vehicle.dto';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { CSWorkOrderTaskCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-task.dto';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { WOMServiceEnum } from 'src/app/models/enums/e-type/wom-service.enum';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { Location } from '@angular/common';
@Component({
  selector: 'mtb007-cs-wo-cast',
  templateUrl: './mtb007-cs-wo-cast.component.html',
  styleUrls: ['./mtb007-cs-wo-cast.component.scss'],
})
export class Mtb007CSWOCastComponent implements OnInit {

  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private router: Router,
    private cache: PsCache,
    private location: Location,
  ) { }

  private arrUnsubscribe: Subscription[] = [];
  typeOfService: number;
  public WOMServiceEnum = WOMServiceEnum;
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public womMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public womMasterCus: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public womMasterVeh: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public listTask: CSWorkOrderTaskCusDTO[] = []
  public listOrderTask: CSWorkOrderTaskCusDTO[] = [];
  public WOMStatusEnum = WOMStatusEnum

  ngOnInit() {
    var service = this.cache.getItem(KeyLocalStorageEnum.WOM_SERVICE);
    this.typeOfService = this.cache.parseValue(service);

    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.workMaster = this.cache.parseValue(temp);

    if (this.workMaster.Progress == WOMStatusEnum.REPAIRING) {
      const properties = ['Progress', 'WorkOrderNo'];
      const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
        DTO: { ...this.workMaster, Progress: WOMStatusEnum.WAITING_DELIVERY },
        Properties: properties,
      };
      this.UpdateWOMConsultant(param)
    }

    this.GetWOMConsultant(this.workMaster, true);

  }

  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    } else if (field == 'continue') {

      this.router.navigate(['/mtbike/repair/wo-sign']);
    }
  }

  public getTaskMethods(task: CSWorkOrderTaskCusDTO): string {
    if (!task.TypeOfTask) return '';

    let methods = [];
    try {
      const arr = typeof task.TypeOfTask === 'string'
        ? JSON.parse(task.TypeOfTask)
        : task.TypeOfTask;

      methods = arr.filter(t => t.checked).map(t => t.name);
    } catch {
      return '';
    }

    return methods.join(' & ');
  }


  //#region CALL API
  private GetWOMConsultant(params: CSWorkOrderMasterCusDTO, isAll: boolean) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetWOMConsultant(params, isAll).subscribe(res => {
      if (res.StatusCode === 0) {
        this.womMaster = res.ObjectReturn;
        this.womMasterCus = res.ObjectReturn.LoyalCustomerData;
        this.womMasterVeh = res.ObjectReturn.CSVehicleData;
        this.listTask = res.ObjectReturn.ListTask.map(task => {
          return {
            ...task,
            TypeOfTask: task.TypeOfTask ? JSON.parse(task.TypeOfTask) : []
          };
        });
        this.listOrderTask = res.ObjectReturn.ListOrderTask.map(task => {
          return {
            ...task,
            TypeOfTask: task.TypeOfTask ? JSON.parse(task.TypeOfTask) : []
          };
        });

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phiếu tiếp nhận: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phiếu tiếp nhận: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateWOMConsultant(param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateWOMConsultant(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.workMaster.Progress = WOMStatusEnum.WAITING_DELIVERY;
          this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, this.workMaster);
          this.notification.onSuccess(`Đổi trạng thái phiếu thành công`);
          this.subLoader.loader(false);
        } else {
          this.notification.onError(`Lỗi cập nhật phiếu tiếp nhận: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật phiếu tiếp nhận: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
}
