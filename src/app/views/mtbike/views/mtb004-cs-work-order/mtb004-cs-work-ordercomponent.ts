import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CSLoyalCustomerCusDTO } from 'src/app/models/dtos/e-dtos/cs-loyal-customer.dto';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { Subscription } from 'rxjs';
import { LSProvinceDTO } from 'src/app/models/dtos/e-dtos/ls-province.dto';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { LSDistrictDTO } from 'src/app/models/dtos/e-dtos/ls-district.dto';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { Location } from '@angular/common';
@Component({
  selector: 'mtb004-cs-work-order',
  templateUrl: './mtb004-cs-work-order.component.html',
  styleUrls: ['./mtb004-cs-work-order.component.scss'],
})
export class Mtb004CsWorkOrderComponent implements OnInit {
  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private coreapi: PSCoreApiService,
    private router: Router,
    private cache: PsCache,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    let womMaster = this.cache.parseValue(temp);
    this.workMaster = womMaster
    var temp = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
    this.headName = this.cache.parseValue(temp);
    this.headName = this.headName.HeadName;
    // if (womMaster.Code != 0) {
    this.GetListWOMCustomer(womMaster);
    this.GetWOMConsultant(womMaster, false);
    // }
    this.GetListServiceMaster();
    this.getlistprovince();
  }

  private arrUnsubscribe: Subscription[] = [];
  public headName: any;
  public loyalCustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public oldloyalCustomer: CSLoyalCustomerCusDTO = new CSLoyalCustomerCusDTO();
  public workOrderMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public oldworkOrderMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public provincelist: LSProvinceDTO[] = [];
  public districtlist: LSDistrictDTO[] = [];
  public serviceTypes: any[] = [];
  public workMaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public WOMStatusEnum = WOMStatusEnum;
  public minDate: Date = new Date();

  public get isContinue(): boolean {
    return !(
      this.loyalCustomer.Cellphone1 &&
      this.loyalCustomer.FullName &&
      this.workOrderMaster?.EstimateReturnTime &&
      this.workOrderMaster?.ServiceMaster
    );
  }

  public onBackToList() {
    this.router.navigate(['/mtbike/repair']);
  }
  public onNavigate(field: string) {
    if (field == 'back') {
      this.location.back();
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/repair']);
    } else if (field == 'continue') {
      this.router.navigate(['/mtbike/repair/task']);
      this.cache.setItem(KeyLocalStorageEnum.WOM_SERVICE, this.workOrderMaster.ServiceMaster);
    }
  }

  public onProvinceChange(e: number, field: string) {
    if (field === 'Province') {
      this.districtlist = [];
      this.loyalCustomer.District = null;
      this.getlistdistrict(e);
    }

    if (field === 'province') {
      this.loyalCustomer.Province = e;
    } else if (field === 'District') {
      this.loyalCustomer.District = e;
    }
    const properties = [field, 'Cellphone1', 'FullName'];
    const WorkOrderMaster = this.workMaster.Code
    const param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
      DTO: { ...this.loyalCustomer, WorkOrderMaster: WorkOrderMaster },
      Properties: properties,
    };
    delete param.DTO.Code
    this.UpdateWOMCustomer(param);
  }

  public onFocus(e: CSLoyalCustomerCusDTO) {
    this.oldloyalCustomer = { ...e };
  }

  public onValueChange(e: CSLoyalCustomerCusDTO, field: string) {
    if (e[field] === this.oldloyalCustomer[field]) {
      return;
    }

    const properties = (field == 'Cellphone1' || field == 'FullName') ? ['Cellphone1', 'FullName'] : [field, 'Cellphone1', 'FullName'];
    const WorkOrderMaster = this.workMaster.Code
    const param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO> = {
      DTO: {
        ...e,
        WorkOrderMaster: WorkOrderMaster,
      },
      Properties: properties,
    };
    delete param.DTO.Code
    this.UpdateWOMCustomer(param);
  }

  public onFocusWOM(e: CSWorkOrderMasterCusDTO) {
    this.oldworkOrderMaster = { ...e };
  }

  public onValueChangeWOM(e: CSWorkOrderMasterCusDTO, field: string) {
    const newValue = e[field];

    if (newValue === this.oldworkOrderMaster[field]) {
      return;
    }

    if (newValue instanceof Date) {
      // Convert về local time (bỏ offset)
      const local = new Date(newValue.getTime() - newValue.getTimezoneOffset() * 60000);
      e[field] = local;
    }

    if (field === 'ServiceMaster') {
      this.cache.setItem(KeyLocalStorageEnum.WOM_SERVICE, e.ServiceMaster);
    }

    const properties = [field, 'WorkOrderNo'];
    const param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO> = {
      DTO: e,
      Properties: properties,
    };
    this.UpdateWOMConsultant(param);
  }

  //#region CALL API
  private GetListWOMCustomer(params: CSWorkOrderMasterCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListWOMCustomer(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.loyalCustomer = res.ObjectReturn[0];
        this.subLoader.loader(false);
        this.cdr.detectChanges();
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

  private GetWOMConsultant(params: CSWorkOrderMasterCusDTO, isAllData: boolean = false) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetWOMConsultant(params, isAllData).subscribe(res => {
      if (res.StatusCode === 0) {
        this.workOrderMaster = res.ObjectReturn;
        if (this.workOrderMaster.EstimateReturnTime) {
          this.workOrderMaster.EstimateReturnTime = new Date(this.workOrderMaster.EstimateReturnTime);
        }
        if (this.workOrderMaster.ReceivingTime) {
          this.workOrderMaster.ReceivingTime = new Date(this.workOrderMaster.ReceivingTime);
        }

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

  private GetListServiceMaster() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListServiceMaster().subscribe(res => {
      if (res.StatusCode === 0) {
        this.serviceTypes = res.ObjectReturn;

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách dịch vụ: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistprovince() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListProvince().subscribe((res) => {
      if (res.StatusCode == 0) {
        if (this.loyalCustomer?.Province) {
          this.getlistdistrict(this.loyalCustomer.Province);
        }
        this.provincelist = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getlistdistrict(number: number) {
    this.subLoader.loader(true);
    var province: LSProvinceDTO = new LSProvinceDTO();
    province.Code = number;
    var temp = this.coreapi.GetListDistrict(province).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.districtlist = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateWOMCustomer(param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateWOMCustomer(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.loyalCustomer = res.ObjectReturn;
          this.notification.onSuccess(`Thành công`);
        } else {
          this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin khách hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateWOMConsultant(param: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateWOMConsultant(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.workOrderMaster = res.ObjectReturn;
          if (this.workOrderMaster.EstimateReturnTime) {
            this.workOrderMaster.EstimateReturnTime = new Date(this.workOrderMaster.EstimateReturnTime);
          }
          if (this.workOrderMaster.ReceivingTime) {
            this.workOrderMaster.ReceivingTime = new Date(this.workOrderMaster.ReceivingTime);
          }
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
