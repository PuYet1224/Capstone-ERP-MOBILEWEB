import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { LSWarehouseCusDTO } from 'src/app/models/dtos/e-dtos/ls-warehouse.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PSCoreApiService } from 'src/app/services/core/ps-core-api.service';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb018-sal-warehouse-detail',
  templateUrl: './mtb018-sal-warehouse-detail.component.html',
  styleUrls: ['./mtb018-sal-warehouse-detail.component.scss'],
})
export class Mtb018SalWarehouseDetailComponent implements OnInit, OnDestroy {
  //#region life cycle
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private coreApi: PSCoreApiService,
    private configService: GetConfigService,
  ) { }

  private arrUnsubscribe: Subscription[] = [];
  public detailvehiclecache: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public detailvehicle: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public typedetail = SALOrderDetailTypeDataEnum;
  public enumstatus = SALOrderDetailStatusEnum;
  public currentheader: LSHeadCusDTO = this.configService.GetHead();
  public FunctionPermissionDTO = FunctionPermissionDTO;

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    this.detailvehiclecache = this.cache.parseValue(temp);

    this.GetSALWarehouse();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region data
  public listinwarehouse: LSWarehouseCusDTO[] = [];
  public listouthead: LSHeadCusDTO[] = [];
  public listoutwarehouse: LSWarehouseCusDTO[] = [];
  public outwh: LSWarehouseCusDTO = new LSWarehouseCusDTO();
  public isCompleted: boolean = false;
  //#endregion

  //#region api
  private GetSALWarehouse() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetSALWarehouse(this.detailvehiclecache).subscribe((res) => {
      if (res.StatusCode === 0 && res.ObjectReturn) {
        this.detailvehicle = res.ObjectReturn as SALOrderDetailCusDTO;
        this.detailvehicle.TransferFrameSeri = this.detailvehicle.TransferFrameSeri || (this.detailvehicle as any).FrameSeri || '';
        this.detailvehicle.TransferEngineSeri = this.detailvehicle.TransferEngineSeri || (this.detailvehicle as any).EngineSeri || '';
        if (!this.detailvehicle.Vehicle && this.detailvehiclecache && this.detailvehiclecache.Vehicle) {
          this.detailvehicle.Vehicle = this.detailvehiclecache.Vehicle;
        }
        this.updateDetailCache();
        this.outwh.Code = this.detailvehicle.WHOut || 0;
        this.isCompleted = this.detailvehicle.TypeData == SALOrderDetailTypeDataEnum.BOOK ? this.detailvehicle.Status === SALOrderDetailStatusEnum.OutboundCompleted : this.detailvehicle.Status === SALOrderDetailStatusEnum.Selected;

        if (this.detailvehicle.TypeData === this.typedetail.TRANSFER) {
          this.getlisthead();
          this.getlistwh("in");
          if (this.outwh.Code && this.outwh.Code > 0) {
            this.getlistwh("out", this.outwh.Code);
          }
        }
        if (this.detailvehicle.TypeData === this.typedetail.BUY || this.detailvehicle.TypeData === this.typedetail.BOOK) {
          if (this.currentheader && this.currentheader.Head != null) {
            this.getlistwh("out", this.currentheader.Head);
          } else {
            this.getlistwh("out");
          }
        }
        this.loadScanResult();
      } else {
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
      this.subLoader.loader(false);
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private UpdateSALWarehouse(param: SALOrderDetailCusDTO, silent: boolean = false) {
    param.TransferFrameSeri = param.TransferFrameSeri || '';
    param.TransferEngineSeri = param.TransferEngineSeri || '';

    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALWarehouse(param).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          if (res.ObjectReturn) {
            const updated = res.ObjectReturn as SALOrderDetailCusDTO;
            this.detailvehicle = { ...this.detailvehicle, ...updated };
          }
          const responseData = res.ObjectReturn as any;
          if (responseData) {
            this.detailvehicle.TransferFrameSeri = (responseData.TransferFrameSeri || responseData.FrameSeri || this.detailvehicle.TransferFrameSeri || '').trim();
            this.detailvehicle.TransferEngineSeri = (responseData.TransferEngineSeri || responseData.EngineSeri || this.detailvehicle.TransferEngineSeri || '').trim();
          } else {
            this.detailvehicle.TransferFrameSeri = (this.detailvehicle.TransferFrameSeri || '').trim();
            this.detailvehicle.TransferEngineSeri = (this.detailvehicle.TransferEngineSeri || '').trim();
          }
          this.updateDetailCache();
          if (!silent) {
            this.notification.onSuccess('Thành công');
          }
          this.subLoader.loader(false);
          return;
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private getlisthead() {
    this.subLoader.loader(true);
    const sub = this.coreApi.GetListHead(true).subscribe((res) => {
      if (res.StatusCode === 0 && res.ObjectReturn) {
        this.listouthead = res.ObjectReturn.filter(h => h.Code !== this.currentheader.Head);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private getlistwh(type: "in" | "out", head: number = null) {
    this.subLoader.loader(true);
    const sub = this.coreApi.GetListWarehouse(head != null ? head : this.currentheader.Head).subscribe((res) => {
      if (res.StatusCode === 0) {
        if (type === "in") {
          this.listinwarehouse = res.ObjectReturn || [];
        }
        else {
          this.listoutwarehouse = res.ObjectReturn || [];
        }
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.ErrorString}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region actions
  private updateDetailCache() {
    const old = this.detailvehiclecache;
    const cur = this.detailvehicle;

    cur.WHOut = cur.WHOut ?? old.WHOut;
    cur.WHIn = cur.WHIn ?? old.WHIn;

    this.detailvehiclecache = { ...cur };
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.detailvehiclecache);
  }

  private isTransfer(): boolean {
    return this.detailvehicle?.TypeData === this.typedetail.TRANSFER;
  }

  public get canSubmitSeri(): boolean {
    return (this.detailvehicle.TransferFrameSeri || '').trim().length > 0 && (this.detailvehicle.TransferEngineSeri || '').trim().length > 0;
  }

  private resetTransferSelection() {
    if (!this.isTransfer()) {
      return;
    }
    this.detailvehicle.TransferCSVehicle = null;
    this.detailvehicle.TransferFrameSeri = '';
    this.detailvehicle.TransferEngineSeri = '';
  }

  private loadScanResult() {
    const scanData = this.cache.getItem('SAL_ORDER_DETAIL_SCAN' as any);
    if (scanData) {
      const scanResult = this.cache.parseValue(scanData);
      if (scanResult.type && scanResult.value) {
        if (scanResult.type === 'chassis') {
          this.detailvehicle.TransferFrameSeri = scanResult.value || '';
          this.saveSeri('TransferFrameSeri');
        } else if (scanResult.type === 'engine') {
          this.detailvehicle.TransferEngineSeri = scanResult.value || '';
          this.saveSeri('TransferEngineSeri');
        }
        this.cache.removeItem('SAL_ORDER_DETAIL_SCAN' as any);
      }
    }
  }

  public onValueChange(field: string) {
    if ((field === 'TransferFrameSeri' || field === 'TransferEngineSeri') && (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator))) return;
    
    if (field === 'HeadOut') {
      this.detailvehicle.WHOut = null;
      this.listoutwarehouse = [];
      this.resetTransferSelection();
      this.updateDetailCache();
      this.getlistwh("out", this.outwh.Code);
    } else if (field === 'TransferFrameSeri' || field === 'TransferEngineSeri') {
      this.saveSeri(field);
    }
  }

  public onsuccess() {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.approver)) return;
    
    const frameSeri = (this.detailvehicle.TransferFrameSeri || '').trim();
    const engineSeri = (this.detailvehicle.TransferEngineSeri || '').trim();

    if (!frameSeri || !engineSeri) {
      this.notification.onWarning('Vui lòng nhập đầy đủ số khung và số máy');
      return;
    }

    this.detailvehicle.TransferFrameSeri = frameSeri;
    this.detailvehicle.TransferEngineSeri = engineSeri;

    if (this.detailvehicle.TypeData == SALOrderDetailTypeDataEnum.TRANSFER)
      this.detailvehicle.Status = SALOrderDetailStatusEnum.Selected;

    this.UpdateSALDetail(this.detailvehicle);
  }

  public onWarehouseChange(field: 'WHOut' | 'WHIn') {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    
    this.detailvehicle[field] = this.detailvehicle[field] || null;
    if (field === 'WHOut') {
      this.outwh.Code = this.detailvehicle.WHOut || 0;
      this.resetTransferSelection();
    }
    if (field === 'WHIn') {
      this.resetTransferSelection();
    }
    this.updateDetailCache();
  }

  private saveSeri(field: 'TransferFrameSeri' | 'TransferEngineSeri') {
    const value = (this.detailvehicle[field] || '').trim();
    const otherField: 'TransferFrameSeri' | 'TransferEngineSeri' = field === 'TransferFrameSeri' ? 'TransferEngineSeri' : 'TransferFrameSeri';

    this.detailvehicle[field] = value;

    if (!value) {
      this.detailvehicle[otherField] = '';
      this.updateDetailCache();
      return;
    }

    const cache = this.detailvehiclecache || {};
    const cachedValue = ((cache as any)[field] || '').trim();

    if (value === cachedValue) {
      return;
    }

    this.detailvehicle[otherField] = '';

    const payload = { ...this.detailvehicle } as SALOrderDetailCusDTO;
    this.UpdateSALWarehouse(payload, true);
  }

  private UpdateSALDetail(param: SALOrderDetailCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          if (res.ObjectReturn) {
            this.detailvehicle = res.ObjectReturn as SALOrderDetailCusDTO;
            const responseData = res.ObjectReturn as any;
            this.detailvehicle.TransferFrameSeri = (responseData.TransferFrameSeri || responseData.FrameSeri || this.detailvehicle.TransferFrameSeri || '').trim();
            this.detailvehicle.TransferEngineSeri = (responseData.TransferEngineSeri || responseData.EngineSeri || this.detailvehicle.TransferEngineSeri || '').trim();
          }
          this.isCompleted = true;
          this.updateDetailCache();
          this.notification.onSuccess('Thành công');
          this.subLoader.loader(false);
          return;
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  public onnavigate(field: string) {
    this.router.navigate([field]);
  }
  //#endregion

  //#region scan barcode
  public isopenscan: boolean = false;
  private fieldscan: "engine" | "frame" | null = null;

  public onscannbarcode(type: "engine" | "frame") {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    
    this.fieldscan = type;
    this.isopenscan = true;
  }

  public onScanResult(value: string) {
    const seri = value || '';
    if (!seri) {
      this.notification.onWarning('Không đọc được mã hợp lệ');
      return;
    }

    this.isopenscan = false;

    if (!this.fieldscan) {
      this.notification.onWarning('Không xác định được loại mã quét');
      return;
    }

    const changedField = this.fieldscan === 'frame' ? 'TransferFrameSeri' : 'TransferEngineSeri';
    this.detailvehicle[changedField] = seri;
    this.fieldscan = null;

    this.onValueChange(changedField);
  }

  public onclosescanbarcode() {
    this.isopenscan = false;
  }
  //#endregion
  //#endregion
}
