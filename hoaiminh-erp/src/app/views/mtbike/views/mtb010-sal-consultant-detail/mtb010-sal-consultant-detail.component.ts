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
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';


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
    private coreapi: PSCoreApiService,
  ) { }

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    let retailMaster = this.cache.parseValue(temp);
    this.retailDetailDTOcopy = retailMaster;
    if (retailMaster.Code) {
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
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
  private isShowNoti: boolean = false;
  public listgender: ListDTO[] = [];
  public fieldName: string;
  public firstLoad: boolean = true;

  onNavigate(field: string) {
    this.fieldName = field;
    if (field == 'back') {
      this.router.navigate(['/mtbike/consultant/']);
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/consultant']);
    } else if (field === 'continue') {
      if (this.retailDetailDTOcopy.Code) {
        this.firstLoad = false;
        if (!this.retailDetailDTO.CustomerName && (this.retailDetailDTO.Code != 0 || this.retailDetailDTO.Code == 0)) {
          if (this.isShowNoti) {
            this.isShowNoti = false;
          } else {
            this.notification.onWarning('Tên khách hàng không được để trống');
          }
          return;
        }
        if (this.retailDetailDTOcopy.Status === SALOrderMasterStatusRetailEnum.NEW) {
          // this.UpdateSALStatus(param);
        } else {
          this.router.navigate([this.retailDetailDTO.Status == SALOrderMasterStatusRetailEnum.COMPLETE ? '/mtbike/consultant/cart' : '/mtbike/consultant/vehicle']);
        }
        this.router.navigate(['/mtbike/consultant/vehicle']);
      }
    }
  }

  onValueChange(field: string) {
    if (this.retailDetailDTO[field] === this.retailDetailDTOcopy[field]) { return; }

    // const phoneRegex = /^0\d{9}$/;
    // if (!phoneRegex.test(phone)) {
    //   this.notification.onWarning('Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng 0)');
    //   return;
    // }

    this.retailDetailDTOcopy = { ...this.retailDetailDTO };
    let param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
      DTO: this.retailDetailDTOcopy,
      Properties: [field]
    };
    this.UpdateSALMaster(param);
  }


  private GetSALMaster(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetSALMaster(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.retailDetailDTO = res.ObjectReturn;
        this.retailDetailDTOcopy.ID = this.retailDetailDTO.ID;
        this.retailDetailDTOcopy.Code = this.retailDetailDTO.Code;
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
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHRList(HRListTypeDataEnum.GENDER).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listgender = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách giới tính: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách giới tính: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALMaster(param?: UpdatePropertiesInterface<SALOrderMasterCusDTO>) {
    this.subLoader.loader(true);

    var temp = this.mtbikeapi.UpdateSALMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.retailDetailDTO = res.ObjectReturn;
          this.retailDetailDTOcopy = { ...this.retailDetailDTO };
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailDetailDTO);
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
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, this.retailDetailDTOcopy);
          this.router.navigate(['/mtbike/consultant/vehicle']);
          this.subLoader.loader(false);
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
}
