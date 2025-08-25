import { Component, OnDestroy, OnInit } from '@angular/core';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { Subscription } from 'rxjs';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { LSWarehouseCusDTO } from 'src/app/models/dtos/e-dtos/ls-warehouse.dto';
import { WHIOMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-io-master.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WHIOMasterTypeOfMasterEnum } from '../../../../models/enums/e-type/wh-io-master-type-of-master.enum';
import { WHIOMasterStatusEnum } from '../../../../models/enums/e-status/wh-io-master-status.enum';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PSDate } from 'src/app/services/utilities/ps-date';
import { Router } from '@angular/router';
import { WHIOMasterTypeDataEnum } from '../../../../models/enums/e-type/wh-io-master-type-data.enum';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSHeaderService } from 'src/app/layouts/main-layout/services/ps-header.service';

@Component({
  selector: 'prt007-outbound-detail',
  templateUrl: './prt007-outbound-detail.component.html',
  styleUrls: ['./prt007-outbound-detail.component.scss'],
})
export class Prt007OutboundDetailComponent implements OnInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = [];
  public iomasterCache: WHIOMasterCusDTO;
  public iomaster: WHIOMasterCusDTO = new WHIOMasterCusDTO();
  public refiomaster: WHIOMasterCusDTO = new WHIOMasterCusDTO();
  public whiomasterstatusenum = WHIOMasterStatusEnum;
  private outhead: number;
  public isTab1: boolean;
  public isTab2: boolean;
  public isTab3: boolean;
  public isTab4: boolean;
  public whiomastertypeofmasterenum = WHIOMasterTypeOfMasterEnum;

  // public showConfirm = false; // mở/đóng popup                 
  // private nextStatus: WHIOMasterStatusEnum;

  constructor(
    private partapi: PSPartApiService,
    private coreapi: PSCoreApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
    private cache: PSCache,
    private psConfig: PSGetConfigService,
    private header: PSHeaderService,
    private router: Router,
  ) {
    this.outhead = psConfig.GetHead().Head;
  }

  //#region life cycle
  ngOnInit(): void {
    const temp = this.cache.getItem(KeyLocalStorageEnum.IOMASTER_OBJECT);
    this.iomasterCache = this.cache.parseValue(temp);

    if (this.iomasterCache.Code != 0) this.GetIOMaster(this.iomasterCache);

    switch (this.iomasterCache.TypeOfMaster) {
      case WHIOMasterTypeOfMasterEnum.Internal:
        this.getListHead();
        break;
      default:
        break;
    }

    if (this.iomaster?.TypeOfMaster)
      this.onTab(this.iomasterCache.TypeOfMaster);

    this.GetListWarehouse(this.outhead, true);

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.router.navigate(['/part/warehouse/outbound']);
        this.header.headChange.next(null);
      }
    });
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  onTab(cache: number) {
    if (cache == 1) {
      this.isTab1 = true;
      this.isTab2 = false;
      this.isTab3 = false;
    }
    if (cache == 2) {
      this.isTab2 = true;
      this.isTab1 = false;
      this.isTab3 = false;
    }
    if (cache == 3) {
      this.isTab3 = true;
      this.isTab1 = false;
      this.isTab2 = false;
    }
    if (cache == 4) {
      this.isTab4 = true;
      this.isTab3 = true;
      this.isTab1 = false;
      this.isTab2 = false;
    }
    this.iomaster.TypeOfMaster = cache;
  }
  //#endregion

  //#region header
  public isShowDialog: boolean = false;
  public isShowDialogDone: boolean = false;

  public addNewIOMaster() {
    this.iomaster = new WHIOMasterCusDTO();
    this.cache.setItem(KeyLocalStorageEnum.IOMASTER_OBJECT, this.iomaster);
  }

  public isShowDialogDoneFunc() {
    if (this.notEqualQuantity == 0)
      this.UpdateIOMasterStatus(WHIOMasterStatusEnum.PENDING)
    else
      this.isShowDialogDone = true;
  }

  public UpdateIOMasterStatus(status: WHIOMasterStatusEnum) {
    this.subLoader.loader(true);
    var param: UpdateStatusInterface<WHIOMasterCusDTO> = {
      ListDTO: [this.iomaster],
      Status: status,
    };

    var txt = '';
    switch (status) {
      case WHIOMasterStatusEnum.SENT:
        txt = 'gửi';
        break;
      case WHIOMasterStatusEnum.PENDING:
        txt = 'xác nhận';
        break;
      case WHIOMasterStatusEnum.RECEIVING:
        txt = 'nhận hàng';
        break;
      case WHIOMasterStatusEnum.DONE:
        txt = 'hoàn tất';
        break;
    }

    var temp = this.partapi.UpdateIOMasterStatus(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.subLoader.loader(false);
          // this.iomaster.Status = status;
          // this.iomaster.StatusName = IOStatusConfig[status].text;
          // this.iomaster.IOWHDate = new Date();
          this.GetIOMaster(this.iomaster, true);
          this.isShowDialogDone = false;
          this.notification.onSuccess('Đã ' + txt);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi ${txt} không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi ${txt} không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public DeleteIOMaster() {
    this.subLoader.loader(true);
    var param = [this.iomaster];
    var temp = this.partapi.DeleteIOMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.subLoader.loader(false);
          this.iomaster = new WHIOMasterCusDTO();
          this.isShowDialog = false;
          this.notification.onSuccess(`Đã xoá phiếu nhập`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi xoá không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi param không thành công: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region iomaster
  public isBlock1: boolean = true;
  public listHead: LSHeadCusDTO[] = [];
  public listWH: LSWarehouseCusDTO[] = [
    {
      Code: null,
      WHName: 'Không lựa chọn',
    } as LSWarehouseCusDTO,
  ];
  public listWHOut: LSWarehouseCusDTO[] = [];

  public OpenBlock1() {
    this.isBlock1 = !this.isBlock1;
  }

  public onInWHChanged(value: number): void {
    this.iomaster.InHead = value;
    this.onFieldChanged(this.iomaster, ['InHead']);
    this.iomaster.InWH = null;
    if (value == null) {
      this.listWH = [
        {
          Code: null,
          WHName: 'Không lựa chọn',
        } as LSWarehouseCusDTO,
      ];
    } else {
      this.GetListWarehouse(value);
    }
  }
  public onFieldChanged(dto: WHIOMasterCusDTO, prop: string[]) {
    const field = prop[0] as keyof WHIOMasterCusDTO;
    const value = dto[field];

    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    let propertiesToUpdate: string[] = [];
    if (dto.Code === 0) {
      if (!dto.TypeOfMaster) {
        return;
      }

      dto.OutHead = this.outhead;
      dto.TypeData = WHIOMasterTypeDataEnum.Out;

      propertiesToUpdate = ['TypeData', 'TypeOfMaster', 'OutHead', field];
    }
    else {
      if (this.iomaster.Code !== 0 && this.refiomaster[field] === value) {
        return;
      }
      propertiesToUpdate = [field];
    }

    const payload: UpdatePropertiesInterface<WHIOMasterCusDTO> = {
      DTO: dto,
      Properties: propertiesToUpdate,
    };
    this.UpdateIOMaster(payload);
  }

  public onMasterDateChange(e) {
    const newDate = new Date(e);
    this.iomaster.IOWHDate = PSDate.setHours(newDate, 0, 0, 0, 0);
  }

  private GetIOMaster(param: WHIOMasterCusDTO, reload: boolean = false) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetIOMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.iomaster = res.ObjectReturn;
          this.refiomaster = { ...res.ObjectReturn }
          this.iomaster.IOWHDate = this.iomaster.IOWHDate ? new Date(this.iomaster.IOWHDate) : this.iomaster.IOWHDate;

          // this.handleFilter([]);
          // this.GetListIODetail(this.filter);
          if (this.iomaster.InHead)
            this.GetListWarehouse(this.iomaster.InHead);

          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy danh sách thông tin điểm kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy danh sách thông tin điểm kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private GetListWarehouse(headCode: number, isOut: boolean = false) {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListWarehouse(headCode).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          let firstItemWH = new LSWarehouseCusDTO();
          firstItemWH.WHName = 'Không lựa chọn';
          firstItemWH.Code = null;

          if (isOut) {
            this.listWHOut = res.ObjectReturn;
            this.listWHOut.unshift(firstItemWH);
          } else {
            this.listWH = res.ObjectReturn;
            this.listWH.unshift(firstItemWH);
          }

          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy danh sách thông tin kho hàng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy danh sách thông tin kho hàng: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getListHead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead().subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.listHead = res.ObjectReturn.filter((f) => f.Code != this.outhead);
          let firstItem = new LSHeadCusDTO();
          firstItem.BriefName = 'Không lựa chọn';
          firstItem.Code = null;
          this.listHead.unshift(firstItem);
          // if (this.iomaster?.OutWH != null) {
          //   this.handleFilter([], true);
          //   this.GetListIODetail(this.filter);
          // }
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin đơn vị xuất: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin đơn vị xuất: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateIOMaster(param: UpdatePropertiesInterface<WHIOMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateIOMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.iomaster = res.ObjectReturn;
          this.refiomaster = { ...res.ObjectReturn };
          this.iomaster.IOWHDate = this.iomaster.IOWHDate ? new Date(this.iomaster.IOWHDate) : this.iomaster.IOWHDate;
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi cập nhật phiếu: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật phiếu: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region iodetail
  public notEqualQuantity: number = 0;

  public checkQuantity(e) {
    this.notEqualQuantity = e;
  }
  //#endregion
}


