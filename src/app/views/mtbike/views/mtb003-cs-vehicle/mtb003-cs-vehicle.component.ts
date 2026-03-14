import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LSTypeOfVehicleCusDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto';
import { LSVehicleCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle.dto';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { LSVehicleColorCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle-color.dto';
import { Subscription } from 'rxjs';
import { CSVehicleCusDTO } from 'src/app/models/dtos/e-dtos/cs-vehicle.dto';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { CSListTypeDataEnum } from 'src/app/models/enums/e-type/cs-list-type-data.enum';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { CSLoyalCustomerCusDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { Location } from '@angular/common';
@Component({
  selector: 'mtb003-cs-vehicle',
  templateUrl: './mtb003-cs-vehicle.component.html',
  styleUrls: ['./mtb003-cs-vehicle.component.scss'],
})
export class Mtb003CSVehicleComponent implements OnInit, OnDestroy {
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
    this.workMaster = womMaster;
    if (this.workMaster.Progress == undefined) { this.workMaster.Progress = WOMStatusEnum.RECEIVING }
    this.GetWOMVehicle(womMaster);
    this.GetListCSList();
    this.GetListPartCategory();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
  }

  private arrUnsubscribe: Subscription[] = [];
  public listcategory: any[] = [];
  public listtypeofvehicle: LSTypeOfVehicleCusDTO[] = [];
  public listvehicle: LSVehicleCusDTO[] = [];
  public listcolor: LSVehicleColorCusDTO[] = [];
  public vehicleInfo: CSVehicleCusDTO = new CSVehicleCusDTO();
  public oldVehicleInfo: CSVehicleCusDTO = new CSVehicleCusDTO();
  public fuelTypes: any[] = [];
  public showpopup: boolean = false;
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO()
  public WOMStatusEnum = WOMStatusEnum;
  public isOpenePopup: boolean = false;
  public loyalCustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public listloyalCustomer: CSLoyalCustomerCusDTO[] = [];


  public get isContinue(): boolean {
    return !(
      this.vehicleInfo.PlateNo &&
      this.vehicleInfo.Category &&
      this.vehicleInfo.TypeOfVehicle &&
      this.vehicleInfo.Vehicle &&
      this.vehicleInfo.VehicleColor &&
      this.vehicleInfo.CurrentKm &&
      this.vehicleInfo.FuelType &&
      this.vehicleInfo.BatteryNo &&
      this.vehicleInfo.SOH
    );
  }

  public onScan() {
    this.router.navigate(['/mtbike/repair/scan']);
  }

  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    } else if (field == 'continue') {
      if (this.vehicleInfo.Progress == WOMStatusEnum.WAITING_DELIVERY || this.vehicleInfo.Progress == WOMStatusEnum.DONE) {
        this.workMaster.Progress = this.vehicleInfo.Progress;
        this.workMaster.WorkOrderNo = this.vehicleInfo.WorkOrderNo;
        this.workMaster.VehiclePlateNo = this.vehicleInfo.PlateNo;
        this.workMaster.Code = this.vehicleInfo.WorkOrderMaster;
        this.workMaster.ImageBase64 = null;
        this.workMaster.LoyalCustomer = this.loyalCustomer.Code
        this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, this.workMaster);
        this.router.navigate(['/mtbike/repair/work-order']);
      } else {
        this.isOpenePopup = true;
        const param = new CSWorkOrderMasterCusDTO();
        param.VehiclePlateNo = this.vehicleInfo.PlateNo
        this.GetListWOMCustomer(param);
      }
    }
  }

  public onFocus(e: CSVehicleCusDTO) {
    this.oldVehicleInfo = { ...e };
  }

  public onCancle() {
    this.isOpenePopup = false
  }

  public onAdd() {
    if (this.vehicleInfo.Progress == WOMStatusEnum.RECEIVING) {
      const properties = ['Progress', 'WorkOrderNo'];
      const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
        DTO: { ...this.workMaster, VehiclePlateNo: null, WorkOrderNo: this.vehicleInfo.WorkOrderNo, Progress: WOMStatusEnum.REPAIRING, ImageBase64: null },
        Properties: properties,
      };
      this.UpdateWOMConsultant(param);
    } else {
      this.workMaster.Progress = this.vehicleInfo.Progress;
      this.workMaster.Code = this.vehicleInfo.WorkOrderMaster;
      this.workMaster.WorkOrderNo = this.vehicleInfo.WorkOrderNo;
      this.workMaster.ImageBase64 = null;
      this.workMaster.VehiclePlateNo = null;
      this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, this.workMaster);
      this.router.navigate(['/mtbike/repair/work-order']);
    }
  }

  public onSelectOwner(e: CSLoyalCustomerCusDTO) {
    this.loyalCustomer = e
    const properties = ['Progress', 'WorkOrderNo', 'LoyalCustomer'];
    const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
      DTO: { ...this.workMaster, Code: this.vehicleInfo.WorkOrderMaster, WorkOrderNo: this.vehicleInfo.WorkOrderNo, Progress: WOMStatusEnum.REPAIRING, ImageBase64: null, LoyalCustomer: e.Code },
      Properties: properties,
    };
    this.UpdateWOMConsultant(param);
  }

  public onValueChange(e: CSVehicleCusDTO, field: string) {
    if (e[field] === this.oldVehicleInfo[field]) {
      return;
    }
    if (e[field] instanceof Date) {
      const d = e[field] as Date;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      e[field] = local;
    }
    if (field === 'PlateNo') {
      const params = new CSWorkOrderMasterCusDTO();
      params.VehiclePlateNo = e.PlateNo;
      this.GetWOMVehicle(params);
      return;
    }
    if (field === 'Category') {
      this.listtypeofvehicle = []
      this.listvehicle = [];
      this.listcolor = [];
      this.oldVehicleInfo.TypeOfVehicle
      this.vehicleInfo.Vehicle = null;
      this.vehicleInfo.VehicleColor = null;
      const params = new LSPartCategoryCusDTO()
      params.Code = e.Category;
      this.GetListTypeOfVehicleCategory(params)
    }
    else if (field === 'TypeOfVehicle') {
      this.listvehicle = [];
      this.listcolor = [];
      this.vehicleInfo.Vehicle = null;
      this.vehicleInfo.VehicleColor = null;
      const params = new LSTypeOfVehicleCusDTO();
      params.Code = e.TypeOfVehicle;
      this.getlistvehicle(params);
    } else if (field === 'Vehicle') {
      this.listcolor = [];
      this.vehicleInfo.VehicleColor = null;
      const params = new LSVehicleCusDTO();
      params.Code = e.Vehicle;
      this.getlistvehiclecolor(params);
    }
    else if (field === 'Category') {
      this.vehicleInfo.TypeOfVehicle = null;
      this.vehicleInfo.Vehicle = null;
      this.vehicleInfo.VehicleColor = null;
    }
    this.vehicleInfo = e;

    let properties = []
    if (field == 'FrameSeri' || field == 'EngineSeri' || field == 'InsuranceNumber' || field == 'WarrantyDate' || field == 'WarrantyKm' || field == 'CurrentKm' || field == 'FuelType' || field == 'BatteryNo' || field == 'SOH' || field == 'LastTrading') {
      properties = ['PlateNo', field]
      const param: UpdatePropertiesInterface<CSVehicleCusDTO> = {
        DTO: e,
        Properties: properties,
      };
      delete param.DTO.Code
      this.UpdateWOMVehicle(param);
    } else if (this.vehicleInfo.PlateNo && this.vehicleInfo.TypeOfVehicle && this.vehicleInfo.Vehicle && this.vehicleInfo.VehicleColor) {
      properties = ['PlateNo', 'VehicleColor']
      const param: UpdatePropertiesInterface<CSVehicleCusDTO> = {
        DTO: e,
        Properties: properties,
      };
      delete param.DTO.Code
      this.UpdateWOMVehicle(param);
    }
  }

  //#region CALL API
  private GetWOMVehicle(params: CSWorkOrderMasterCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetWOMVehicle(params).subscribe(res => {
      if (res.StatusCode === 0) {
        if (res.ObjectReturn.IsNewCSVehicle == true) {
          this.showpopup = true;
        }
        if (res.ObjectReturn.Category) {
          const categoryParams = new LSPartCategoryCusDTO();
          categoryParams.Code = res.ObjectReturn.Category;
          this.GetListTypeOfVehicleCategory(categoryParams);
        }
        if (res.ObjectReturn.TypeOfVehicle) {
          const typeParams = new LSTypeOfVehicleCusDTO();
          typeParams.Code = res.ObjectReturn.TypeOfVehicle;
          this.getlistvehicle(typeParams);
        }
        if (res.ObjectReturn.Vehicle) {
          const vehicleParams = new LSVehicleCusDTO();
          vehicleParams.Code = res.ObjectReturn.Vehicle;
          this.getlistvehiclecolor(vehicleParams);
        }
        this.vehicleInfo = res.ObjectReturn;
        if (this.workMaster.Code == 0) {
          const properties = ['PlateNo', 'VehicleColor'];
          const param: UpdatePropertiesInterface<CSVehicleCusDTO> = {
            DTO: this.vehicleInfo,
            Properties: properties,
          };
          if (!this.vehicleInfo.VehicleColor) {
            this.subLoader.loader(false);
            return;
          }
          this.UpdateWOMVehicle(param);
        }
        if (this.vehicleInfo.LastTrading) {
          this.vehicleInfo.LastTrading = new Date(this.vehicleInfo.LastTrading);
        } else {
          this.vehicleInfo.LastTrading = null;
        }
        if (this.vehicleInfo.WarrantyDate) {
          this.vehicleInfo.WarrantyDate = new Date(this.vehicleInfo.WarrantyDate);
        } else {
          this.vehicleInfo.WarrantyDate = null;
        }
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListTypeOfVehicleCategory(param: LSPartCategoryCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListTypeOfVehicleCategory(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listtypeofvehicle = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy dòng xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy dòng xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistvehicle(params: LSTypeOfVehicleCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListVehicle(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listvehicle = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy loại xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy loại xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistvehiclecolor(params: LSVehicleCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListVehicleColor(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listcolor = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy màu xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy màu xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListPartCategory() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListPartCategory({}).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listcategory = res.ObjectReturn.Data;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách nhóm xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách nhóm xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListCSList() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListCSList(CSListTypeDataEnum.FUEL).subscribe(res => {
      if (res.StatusCode === 0) {
        this.fuelTypes = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách mức nhiên liệu: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách mức nhiên liệu: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListWOMCustomer(params: CSWorkOrderMasterCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListWOMCustomer(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listloyalCustomer = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin chủ xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin chủ xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateWOMVehicle(param: UpdatePropertiesInterface<CSVehicleCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateWOMVehicle(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.vehicleInfo = res.ObjectReturn;
          if (this.vehicleInfo.LastTrading) {
            this.vehicleInfo.LastTrading = new Date(this.vehicleInfo.LastTrading);
          } else {
            this.vehicleInfo.LastTrading = null;
          }
          if (this.vehicleInfo.WarrantyDate) {
            this.vehicleInfo.WarrantyDate = new Date(this.vehicleInfo.WarrantyDate);
          } else {
            this.vehicleInfo.WarrantyDate = null;
          }
          this.notification.onSuccess(`Thành công`);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi cập nhật thông tin xe: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin xe: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateWOMConsultant(param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateWOMConsultant(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.router.navigate(['/mtbike/repair/work-order']);
          this.workMaster.Progress = res.ObjectReturn.Progress;
          this.workMaster.WorkOrderNo = this.vehicleInfo.WorkOrderNo;
          this.workMaster.Code = this.vehicleInfo.WorkOrderMaster;
          this.workMaster.ImageBase64 = null;
          this.workMaster.LoyalCustomer = this.loyalCustomer.Code
          this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, this.workMaster);
          this.notification.onSuccess(`Thành công`);
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
