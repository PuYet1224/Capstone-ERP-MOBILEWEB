import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CSLoyalCustomerCusDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { CSWorkOrderTaskCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-task.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { Subscription } from 'rxjs';
import { WOMServiceEnum } from 'src/app/models/enums/e-type/wom-service.enum';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { Location } from '@angular/common';
@Component({
  selector: 'mtb008-cs-wo-sign',
  templateUrl: './mtb008-cs-wo-sign.component.html',
  styleUrls: ['./mtb008-cs-wo-sign.component.scss'],
})
export class Mtb008CSWOSignComponent implements OnInit {

  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private router: Router,
    private cache: PsCache,
  ) { }

  showSignaturePopup = false;
  signatureData = '';
  private arrUnsubscribe: Subscription[] = [];
  public womMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  typeOfService: number;
  public WOMServiceEnum = WOMServiceEnum;
  public womMasterCus: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public womMasterVeh: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public listOrderPart: CSWorkOrderTaskCusDTO[] = [];
  public workOrderMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public WOMStatusEnum = WOMStatusEnum
  totalParts = 0;
  totalLabor = 0;
  grandTotal = 0;
  private location: Location;


  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.workMaster = this.cache.parseValue(temp);
    this.GetWOMConsultant(this.workMaster, true);
  }

  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    }
  }

  public onComplete() {
    if (this.workMaster.Progress == WOMStatusEnum.WAITING_DELIVERY) {
      const properties = ['Progress', 'WorkOrderNo'];
      const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
        DTO: { ...this.workMaster, Progress: WOMStatusEnum.DONE },
        Properties: properties,
      };
      this.UpdateWOMConsultant(param);
      this.workMaster.Progress = WOMStatusEnum.DONE;
      this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, this.workMaster);
      this.router.navigate(['/mtbike/repair']);
    } else {
      this.router.navigate(['/mtbike/repair']);
    }
  }

  public get isComplete(): boolean {
    return !(
      this.signatureData
    );
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

  openSignaturePopup() {
    this.showSignaturePopup = true;
  }

  closeSignaturePopup() {
    this.showSignaturePopup = false;
  }

  onSignatureSave(base64: string) {
    this.signatureData = base64;
    const properties = ['Signature', 'WorkOrderNo'];
    const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
      DTO: {
        ...this.workMaster,
        WorkOrderNo: this.womMaster.WorkOrderNo,
        Signature: this.signatureData
      },
      Properties: properties,
    };
    this.UpdateWOMConsultant(param);
    alert("Chữ ký đã được lưu thành công!");
    this.closeSignaturePopup();
  }

  //#region CALL API
  private GetWOMConsultant(params: CSWorkOrderMasterCusDTO, isAll: boolean) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetWOMConsultant(params, isAll).subscribe(res => {
      if (res.StatusCode === 0) {
        this.womMaster = res.ObjectReturn;
        this.womMasterCus = res.ObjectReturn.LoyalCustomerData;
        this.womMasterVeh = res.ObjectReturn.CSVehicleData;
        this.listOrderPart = res.ObjectReturn.ListOrderPart;

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
          this.womMaster = res.ObjectReturn;
          this.womMasterCus = res.ObjectReturn.LoyalCustomerData;
          this.womMasterVeh = res.ObjectReturn.CSVehicleData;
          this.listOrderPart = res.ObjectReturn.ListOrderPart;

          this.notification.onSuccess(`Thành công`);
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
