import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { HRListTypeDataEnum } from 'src/app/models/enums/e-type/hr-list-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { Mtb009SalConsultantComponent } from '../mtb009-sal-consultant/mtb009-sal-consultant.component';

@Component({
  selector: 'mtb010-sal-consultant-detail',
  templateUrl: './mtb010-sal-consultant-detail.component.html',
  styleUrls: ['./mtb010-sal-consultant-detail.component.scss'],
})
export class Mtb010SalConsultantDetailComponent implements OnInit {
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private configCache: ConfigCacheService,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    let retailMaster = this.cache.parseValue(temp);
    this.retailDetailDTO = { ...retailMaster };
    this.retailDetailDTOcopy = { ...retailMaster };
    this.masterStatus = retailMaster.Status ?? SALOrderMasterStatusRetailEnum.NEW;
    if (retailMaster && retailMaster.Code) {
      this.GetSALMaster(retailMaster);
    }
    this.getlisthrlist();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  public retailDetailDTO: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public retailDetailDTOcopy: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  private arrUnsubscribe: Subscription[] = [];
  public showCancelConfirm: boolean = false;
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
  private isShowNoti: boolean = false;
  public listgender: ListDTO[] = [];
  public fieldName: string;
  public masterStatus: number = SALOrderMasterStatusRetailEnum.NEW;
  public firstLoad: boolean = true;

  onNavigate(field: string) {
    this.fieldName = field;
    if (field == 'back') {
      this.router.navigate(['/mtbike/consultant/']);
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/consultant']);
    } else if (field == 'continue') {
      if (!this.retailDetailDTO.CustomerName || this.retailDetailDTO.CustomerName.trim() === '') {
        this.notification.onWarning('Tên khách hàng không được để trống');
        return;
      }
      if (!this.retailDetailDTO.Code && (!this.retailDetailDTO.CustomerPhone || this.retailDetailDTO.CustomerPhone.trim() === '')) {
        this.notification.onWarning('Số điện thoại khách hàng không được để trống');
        return;
      }

      if (this.retailDetailDTO.Code) {
        // Nếu đã có Code, chuyển sang bước chọn xe
        this.router.navigate([this.retailDetailDTO.Status == SALOrderMasterStatusRetailEnum.COMPLETE ? '/mtbike/consultant/cart' : '/mtbike/consultant/vehicle']);
      } else {
        // Trường hợp chưa có Code (tạo mới nhưng chưa trigger blur để lưu)
        this.fieldName = 'continue';
        this.onValueChange('CustomerName');
      }
    }
  }

  onCancel() {
    if (this.retailDetailDTO.Code > 0) {
      this.showCancelConfirm = true;
    }
  }

  onConfirmCancelTransaction() {
    this.showCancelConfirm = false;
    if (this.retailDetailDTO.Code > 0) {
      const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
        ListDTO: [this.retailDetailDTO],
        Status: SALOrderMasterStatusRetailEnum.CANCEL
      };

      this.subLoader.loader(true);
      const sub = this.mtbikeapi.UpdateSALMasterStatus(param).subscribe(res => {
        this.subLoader.loader(false);
        if (res.StatusCode == 0) {
          this.notification.onSuccess('Hủy giao dịch thành công');
          this.router.navigate(['/mtbike/consultant']);
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi khi hủy giao dịch');
        }
      }, err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      });
      this.arrUnsubscribe.push(sub);
    }
  }

  onValueChange(field: string) {
    if (this.retailDetailDTO[field] === this.retailDetailDTOcopy[field]) { return; }

    this.retailDetailDTOcopy = { ...this.retailDetailDTO };
    
    let props = [field];
    if (field === 'CustomerName' || field === 'CustomerGender') {
        if (this.retailDetailDTOcopy.CustomerPhone) props.push('CustomerPhone');
        if (field === 'CustomerGender' && this.retailDetailDTOcopy.CustomerName) props.push('CustomerName');
    }

    // Fix DB timezone: Send local time for new orders
    if (!this.retailDetailDTOcopy.Code) {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, -1);
      (this.retailDetailDTOcopy as any).SaleDate = localISOTime;
      if (!props.includes('SaleDate')) props.push('SaleDate');
    }

    let param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
      DTO: this.retailDetailDTOcopy,
      Properties: props
    };
    this.UpdateSALMaster(param);
  }


  onComplete(): void {
    if (!this.retailDetailDTO.Code) {
      this.notification.onWarning('Không có phiếu để hoàn tất');
      return;
    }
    const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
      ListDTO: [{ Code: this.retailDetailDTO.Code } as SALOrderMasterCusDTO],
      Status: SALOrderMasterStatusRetailEnum.COMPLETE,
    };
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALMasterStatus(param).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Thành công');
          this.retailDetailDTO = { ...this.retailDetailDTO, Status: SALOrderMasterStatusRetailEnum.COMPLETE, StatusName: 'Hoàn tất' } as any;
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailDetailDTO);
        } else {
          this.notification.onError(res.ErrorString || 'Thất bại');
        }
      },
      err => {
        this.subLoader.loader(false);
        this.notification.onError(err && err.message ? err.message : 'Thất bại');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private static detailCache = new Map<number, SALOrderMasterCusDTO>();
  private static genderCache: ListDTO[] = [];

  private GetSALMaster(param: SALOrderMasterCusDTO) {
    if (param.Code && Mtb010SalConsultantDetailComponent.detailCache.has(param.Code)) {
        this.retailDetailDTO = { ...Mtb010SalConsultantDetailComponent.detailCache.get(param.Code)! };
        this.retailDetailDTOcopy.ID = this.retailDetailDTO.ID;
        this.retailDetailDTOcopy.Code = this.retailDetailDTO.Code;
        this.masterStatus = this.retailDetailDTO.Status;
        return;
    }

    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetSALMaster(param).subscribe(res => {
      if (res.StatusCode === 0) {
        const prevName = this.retailDetailDTO.CustomerName;
        const prevPhone = this.retailDetailDTO.CustomerPhone;

        this.retailDetailDTO = res.ObjectReturn;

        if (!this.retailDetailDTO.CustomerName && prevName) this.retailDetailDTO.CustomerName = prevName;
        if (!this.retailDetailDTO.CustomerPhone && prevPhone) this.retailDetailDTO.CustomerPhone = prevPhone;

        this.retailDetailDTOcopy.ID = this.retailDetailDTO.ID;
        this.retailDetailDTOcopy.Code = this.retailDetailDTO.Code;
        this.masterStatus = this.retailDetailDTO.Status;
        
        this.fixCustomerGender();

        Mtb010SalConsultantDetailComponent.detailCache.set(this.retailDetailDTO.Code, { ...this.retailDetailDTO });

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi thông tin khách hàng: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi thông tin khách hàng: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlisthrlist() {
    if (Mtb010SalConsultantDetailComponent.genderCache && Mtb010SalConsultantDetailComponent.genderCache.length > 0) {
        this.listgender = Mtb010SalConsultantDetailComponent.genderCache;
        return;
    }

    this.subLoader.loader(true);
    var temp = this.configCache.GetListHRList(HRListTypeDataEnum.GENDER).subscribe((data) => {
      this.listgender = data;
      Mtb010SalConsultantDetailComponent.genderCache = data;
      this.fixCustomerGender();
      this.subLoader.loader(false);
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách giới tính: ${err.message || err}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALMaster(param?: UpdatePropertiesInterface<SALOrderMasterCusDTO>) {
    this.subLoader.loader(true);

    var temp = this.mtbikeapi.UpdateSALMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          const prevName = this.retailDetailDTOcopy.CustomerName;
          const prevPhone = this.retailDetailDTOcopy.CustomerPhone;

          this.retailDetailDTO = res.ObjectReturn;

          if (!this.retailDetailDTO.CustomerName && prevName) {
            this.retailDetailDTO.CustomerName = prevName;
            
            // If we only sent CustomerPhone and the name came back empty, 
            // it means BE created a new loyal customer with a blank name.
            // We should immediately save the prevName to the DB!
            const isPhoneUpdateOnly = param?.Properties.includes('CustomerPhone') && !param?.Properties.includes('CustomerName');
            if (isPhoneUpdateOnly) {
               let fixParam: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
                 DTO: this.retailDetailDTOcopy,
                 Properties: ['CustomerName', 'CustomerPhone']
               };
               this.UpdateSALMaster(fixParam);
            }
          }
          if (!this.retailDetailDTO.CustomerPhone && prevPhone) this.retailDetailDTO.CustomerPhone = prevPhone;

          this.retailDetailDTOcopy = { ...this.retailDetailDTO };
          this.masterStatus = this.retailDetailDTO.Status;
          
          this.fixCustomerGender();

          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailDetailDTO);
          
          Mtb009SalConsultantComponent.clearCache();

          if (this.retailDetailDTO.Code) {
              Mtb010SalConsultantDetailComponent.detailCache.set(this.retailDetailDTO.Code, { ...this.retailDetailDTO });
          }

          this.notification.onSuccess(`Thành công`);
          this.subLoader.loader(false);
          if (this.firstLoad && this.fieldName == 'continue') {
            if (!this.retailDetailDTOcopy.CustomerName) {
        this.notification.onWarning('Tên khách hàng không được để trống');
              return;
            }
            this.firstLoad = false;
            this.router.navigate(['/mtbike/consultant/vehicle']);
          }
        } else {
          this.notification.onError(`Lỗi cập nhật phiếu: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật phiếu: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALStatus(param: UpdateStatusInterface<SALOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateSALStatus(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.retailDetailDTOcopy.Status = SALOrderMasterStatusRetailEnum.PENDING;
          this.retailDetailDTOcopy.Code = this.retailDetailDTO.Code;
          this.retailDetailDTOcopy.CustomerName = this.retailDetailDTO.CustomerName;
          this.masterStatus = this.retailDetailDTOcopy.Status;
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailDetailDTOcopy);
          this.router.navigate(['/mtbike/consultant/vehicle']);
          this.subLoader.loader(false);
          Mtb009SalConsultantComponent.clearCache();
        } else {
          this.notification.onError(`Lỗi cập nhật phiếu: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật phiếu: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private fixCustomerGender() {
      // Fix BE DTO mismatch: BE returns Code but FE dropdown expects OrderBy
      if (this.retailDetailDTO.CustomerGender && this.listgender && this.listgender.length > 0) {
          const matchedGender = this.listgender.find(g => g.Code === this.retailDetailDTO.CustomerGender);
          if (matchedGender) {
              this.retailDetailDTO.CustomerGender = matchedGender.OrderBy;
              this.retailDetailDTOcopy.CustomerGender = matchedGender.OrderBy;
          }
      }
  }
}
