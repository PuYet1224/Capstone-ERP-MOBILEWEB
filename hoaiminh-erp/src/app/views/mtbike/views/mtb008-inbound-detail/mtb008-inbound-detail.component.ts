import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { PSMtbikeApiService } from "../../services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { CompositeFilterDescriptor, State } from "@progress/kendo-data-query";
import { LSWarehouseCusDTO } from "src/app/models/dtos/e-dtos/ls-warehouse.dto";
import { CSVehicleCusDTO } from "src/app/models/dtos/e-dtos/cs-vehicle.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { LSTypeOfPartnerCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-partner.dto";
import { WHIOMasterVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-master-vehicle.dto";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { WHIODetailVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-detail-vehicle.dto";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { WHIOMasterStatusEnum } from "src/app/models/enums/e-status/wh-io-master-status.enum";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { PSDate } from "src/app/services/utilities/ps-date";
import { WHIOMasterTypeOfMasterEnum } from "src/app/models/enums/e-type/wh-io-master-type-of-master.enum";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { Router } from "@angular/router";
import { RouterEnum } from "src/app/models/enums/router.enum";
@Component({
  selector: 'mtb008-inbound-detail',
  templateUrl: './mtb008-inbound-detail.component.html',
  styleUrls: ['./mtb008-inbound-detail.component.scss'],
})

export class Mtb008InboundDetailComponent implements OnInit {
  constructor(
    private cache: PSCache,
    private subLoader: PsLayoutLoaderService,
    private mtbapi: PSMtbikeApiService,
    private header: PSHeaderService,
    private psConfig: PSGetConfigService,
    private notification: PSKendoNotificationService,
    private coreapi: PSCoreApiService,
    private router: Router
  ) { }
  private arrUnsubscribe: Subscription[] = [];
  public inboundcache: WHIOMasterVehicleCusDTO;
  public inbound: WHIOMasterVehicleCusDTO = new WHIOMasterVehicleCusDTO();
  public originalinbound: WHIOMasterVehicleCusDTO;
  public inhead = this.psConfig.GetHead();

  public listData: any[] = [];
  public listWH: LSWarehouseCusDTO[] = [];
  public listoutWH: LSWarehouseCusDTO[] = [];

  public listSupplier: LSTypeOfPartnerCusDTO[] = [];
  public listDO: PURDOMasterCusDTO[] = [];
  public listHead: LSHeadCusDTO[] = [];
  public listDetail: WHIODetailVehicleCusDTO[] = [];
  public itemInboundDetail: WHIODetailVehicleCusDTO = new WHIODetailVehicleCusDTO();
  public itemInboundDetailcopy: WHIODetailVehicleCusDTO = new WHIODetailVehicleCusDTO();

  public enumstt = WHIOMasterStatusEnum;
  public onView = false
  public headactive: number;
  //Column actions
  public actionColumn: ActionColumnDTO[] = [];
  public wHIOMasterTypeOfMasterEnum = WHIOMasterTypeOfMasterEnum
  ngOnInit(): void {
    const itemcache = this.cache.getItem(KeyLocalStorageEnum.INBOUND);
    this.inboundcache = this.cache.parseValue(itemcache);
    if (this.inboundcache.Code != 0) {
      this.GetIOMasterVehicle(this.inboundcache);
      this.inbound.OutWH = this.inboundcache.OutWH;
      this.headactive = this.inboundcache.OutHead;

    } else {
      this.inbound = new WHIOMasterVehicleCusDTO();
      this.inbound.DO = 0;
      this.inbound.TypeOfMaster = this.inboundcache.TypeOfMaster;
      this.inbound.Supplier = this.inboundcache.Supplier;
      this.inbound.OutWH = this.inboundcache.OutWH;
      this.headactive = this.inboundcache.OutHead;
      this.itemInboundDetail = new WHIODetailVehicleCusDTO();
      this.listDetail = [];
    }
    if (this.inboundcache.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Internal) {
      this.GetListWarehouse(this.inbound.OutWH, 'out');
      this.GetListWarehouse(this.inhead.Head, 'in');
    } else {
      this.GetListWarehouse(this.inhead.Head, 'in');
    }

    if (this.inboundcache.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Internal) {
      this.getlisthead();
    }
    if (this.inboundcache.Code != 0 && this.inboundcache.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Supplier) {
      this.GetListDO();
    }

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.router.navigateByUrl(RouterEnum.mtb007);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }

  private groupfilter: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };

  private filter: State = {
    filter: this.groupfilter,
    sort: [{ field: 'Master', dir: 'desc' }],
  };

  //#region life cycle

  public showpopup: boolean = false;
  public onshowpopup() {
    this.showpopup = true;
  }

  public showpopupmaster: boolean = false;
  public onshowpopupmaster() {
    this.showpopupmaster = true;
  }

  public isDrawerOpen = false;

  public onCreateNew(): void {
    this.itemInboundDetail = new WHIODetailVehicleCusDTO();
    this.oldframe = '';
    this.oldengine = '';
    this.itemGetFromSeri = null;
    this.isDrawerOpen = true;
    this.onView = false;
  }

  onClearField(): void {
    this.groupfilter.filters = []
    this.inbound = new WHIOMasterVehicleCusDTO();
    this.inbound.Code = 0;
    this.totalDetail = 0;
    this.inbound.TypeOfMaster = this.inboundcache.TypeOfMaster;
    this.totalListDetailCount = 0;
    this.itemInboundDetail = new WHIODetailVehicleCusDTO();
    this.listDetail = [];
    this.oldframe = '';
    this.oldengine = '';
    this.itemGetFromSeri = null;
    const tmpWH = this.listWH;
    this.listWH = [];
    setTimeout(() => this.listWH = tmpWH, 0);

    const tmpDO = this.listDO;
    this.listDO = [];
    setTimeout(() => this.listDO = tmpDO, 0);
  }

  public onDrawerCollapse(): void {
    this.isDrawerOpen = false;
    this.onView = false;
    this.oldframe = '';
    this.oldengine = '';
    this.itemGetFromSeri = null;
  }

  onConfirmDeleteMaster(item: WHIOMasterVehicleCusDTO): void {
    this.showpopupmaster = false;
    this.DeleteIOMasterVehicle([item]);
  }

  onConfirmDeleteDetail(item: WHIODetailVehicleCusDTO): void {
    this.showpopup = false;
    this.DeleteIODetailVehicle([item]);
  }

  public onActionClick(e: ActionColumnDTO) {
    this.itemInboundDetail = e.data;
    this.itemInboundDetailcopy = { ...e.data };

    if (e.action === 'view') {
      this.isDrawerOpen = true;
      this.onView = true;
    }
    else {
      if (this.inbound.StatusID == WHIOMasterTypeOfMasterEnum.Internal) {
        this.onshowpopup();
      }
      else {
        this.notification.onError(`Không thể xoá chi tiết xe khi phiếu trạng thái không phải Tạo mới.`);
      }
    }
  }

  public FunctionPermissionDTO = FunctionPermissionDTO
  public onActionColumnFocus(e) {
    this.actionColumn = [];
    if (FunctionPermissionDTO.master || FunctionPermissionDTO.creator) {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });
      this.actionColumn.push({ separator: true });
      if (this.inbound.StatusID != 5) {

        this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
      }
    }
    else {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' })
    }
  }

  public ondatechange(props: string, e: Date) {
    if (e) {
      const newDate = new Date(e);
      this.inbound[props] = PSDate.setHours(newDate, 0, 0, 0, 0);
      this.onFieldChanged(this.inbound, [props]);
    }
  }

  public onheadchange() {
    this.GetListWarehouse(this.headactive, 'out');
    this.inbound.OutWH = null;

    this.onFieldChanged(this.inbound, ['OutWH'])

  }

  private hasCalledGetListDO = false;
  public onFieldChanged(dto: WHIOMasterVehicleCusDTO, props: string[], e = null) {

    if (props.includes('Remark') || props.includes('RefNo') || props.includes('DORemark')) {
      const oldValue = (this.originalValue ?? '').trim();
      const newValue = (dto[props[0]] ?? '').trim();

      if (oldValue === newValue) {
        return;
      }
    }


    if (dto.Code == 0) {
      if (!props.includes('EffDate')) {
        dto.EffDate = PSDate.addDays(new Date(), 0);
        props.push('TypeOfMaster', 'TypeData', 'EffDate');
      }
    }

    if (props.includes('InWH') && !this.hasCalledGetListDO) {
      this.GetListDO();
      this.hasCalledGetListDO = true;
    }

    if (props.includes('DO')) {
      dto.DO = e.Code;
      dto.Supplier = e.POSupplier;
      props.push('Supplier');
    }

    const param: UpdatePropertiesInterface<WHIOMasterVehicleCusDTO> = {
      DTO: dto,
      Properties: props
    };
    this.UpdateIOMasterVehicle(param);
  }

  public originalValue: string
  public onFocus(dto: WHIOMasterVehicleCusDTO, props: string[]) {
    if (dto[props[0]] == null) return;
    this.originalValue = dto[props[0]];
  }

  onUpdateStatus(status: number, statusname: string) {
    if (this.inbound.Supplier === 0) {
      this.notification.onWarning('Phải chọn nhà cung cấp.');
      return;
    } else if (this.inbound.InWH === 0) {
      this.notification.onWarning('Phải chọn kho hàng.');
      return;
    } else if (this.totalDetail === 0) {
      this.notification.onWarning('Phải có ít nhất một chi tiết xe.');
      return;
    } else {
      this.UpdateIOMasterVehicleStatus(status, statusname);
    }
  }

  public originalframeorengine: string
  public onFocusFrameSEngine(item: WHIODetailVehicleCusDTO, field: 'frame' | 'engine') {
    if (field == 'frame') {
      this.originalframeorengine = item.FrameSeri.trim()
    } else if (field == 'engine') {
      this.originalframeorengine = item.EngineSeri.trim()
    }
  }
  public oldframe: string = '';
  public oldengine: string = '';
  public onSeriChangeChanged(item: WHIODetailVehicleCusDTO, field: 'frame' | 'engine'): void {
    if ((this.originalframeorengine == item.FrameSeri.trim()) && field == 'frame') return;
    if ((this.originalframeorengine == item.EngineSeri.trim()) && field == 'engine') return;
    item.FrameSeri = item.FrameSeri.trim() || '';
    item.EngineSeri = item.EngineSeri.trim() || '';

    if (!item.FrameSeri && !item.EngineSeri) {
      const { Master, DOMaster } = item;
      this.itemGetFromSeri = null;
      this.itemInboundDetail = new WHIODetailVehicleCusDTO();
      this.itemInboundDetail.Master = Master;
      if (this.inbound.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Supplier)
        this.itemInboundDetail.DOMaster = DOMaster;
      this.isDrawerOpen = true;
      this.onView = false;
      return;
    }

    if (field === 'frame') {
      item.EngineSeri = '';
    } else {
      item.FrameSeri = '';
    }

    if (item.FrameSeri !== this.oldframe || item.EngineSeri !== this.oldengine) {
      this.itemGetFromSeri = null;
      item.Master = this.inbound.Code;
      if (this.inbound.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Supplier) {
        item.DOMaster = this.inbound.DO;
        this.GetIOSeri(item);
      } else {
        this.GetIOSeriInternal(item);
      }
      this.oldframe = item.FrameSeri;
      this.oldengine = item.EngineSeri;
    }
  }

  onAddSeriToList(item: WHIODetailVehicleCusDTO): void {

    if (this.inbound.TypeOfMaster == WHIOMasterTypeOfMasterEnum.Supplier)
      item.DOMaster = this.inbound.DO;

    if (!item.FrameSeri || !item.EngineSeri) {
      this.notification.onError('Chưa có số khung / số máy.');
      return;
    }

    this.UpdateIODetailVehicle(item);
  }

  //#region call API
  //test ok
  private GetListWarehouse(head, pprop: 'in' | 'out') {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListWarehouse(head).subscribe(res => {
      if (res.StatusCode == 0) {
        if (pprop == 'in') {

          this.listWH = res.ObjectReturn;

        }
        else
          this.listoutWH = res.ObjectReturn;

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  //test ok
  private GetIOMasterVehicle(param: WHIOMasterVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetIOMasterVehicle(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.inbound = res.ObjectReturn;
        this.inbound.EffDate = new Date(this.inbound.EffDate);
        if (this.inbound.EstEffDate) {
          this.inbound.EstEffDate = new Date(this.inbound.EstEffDate);
        }
        this.GetListIODetailVehicle(this.filter)
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phân loại phụ tùng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin phân loại phụ tùng: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  //test ok
  private GetListDO() {
    this.subLoader.loader(true);
    this.mtbapi.GetListDO().subscribe(res => {
      this.subLoader.loader(false);
      if (res.StatusCode === 0) {
        this.listDO = res.ObjectReturn;
        this.inbound.Supplier = this.listDO[0].POSupplier;
        this.subLoader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy thông tin mã lệnh giao hàng: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin mã lệnh giao hàng: ${err.message}`);
    });
  }


  public totalDetail: number = 0;
  public totalListDetailCount: number = 0;
  public totalTypeOfVehicle: number = 0;
  private GetListIODetailVehicle(param: State) {
    this.groupfilter.filters.push({
      field: 'Master',
      operator: 'eq',
      value: this.inbound.Code
    });
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetListIODetailVehicle(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listDetail = res.ObjectReturn.Data;
        this.totalDetail = new Set(
          this.listDetail.map(item => item.VehicleName.trim())
        ).size;
        this.totalListDetailCount = 0;
        this.listDetail.forEach(item => {
          if (item.ListDetail) {
            this.totalListDetailCount += item.ListDetail.length;
          }
        });
        this.totalTypeOfVehicle = new Set(
          this.listDetail.map(item => item.TypeOfVehicleName.trim())
        ).size;

        this.isDrawerOpen = false;
        this.itemInboundDetail = new WHIODetailVehicleCusDTO();
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy chi tiết nhập hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy chi tiết nhập hàng: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  public itemGetFromSeri: WHIODetailVehicleCusDTO;
  private GetIOSeri(param: WHIODetailVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetIOSeri(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.itemGetFromSeri = res.ObjectReturn;
        this.itemInboundDetail.FrameSeri = this.itemGetFromSeri.FrameSeri;
        this.itemInboundDetail.EngineSeri = this.itemGetFromSeri.EngineSeri;
        this.itemInboundDetail.TypeOfVehicleName = this.itemGetFromSeri.TypeOfVehicleName;
        this.itemInboundDetail.VehicleName = this.itemGetFromSeri.VehicleName;
        this.itemInboundDetail.VehicleColorName = this.itemGetFromSeri.VehicleColorName;
        this.itemInboundDetail.Version = this.itemGetFromSeri.Version;
        this.itemInboundDetail.InsuranceNumber = this.itemGetFromSeri.InsuranceNumber;
        this.itemInboundDetail.InsurancePeriod = this.itemGetFromSeri.InsurancePeriod;
        this.itemInboundDetail.InsuranceTime = this.itemGetFromSeri.InsuranceTime;
        this.itemInboundDetail.PlateNo = this.itemGetFromSeri.PlateNo;
        this.itemInboundDetail.DODetail = this.itemGetFromSeri.DODetail;
        this.itemInboundDetail.VehicleImage = this.itemGetFromSeri.VehicleImage;
        this.itemInboundDetail.DODetail = this.itemGetFromSeri.Code;

        if (this.itemInboundDetail.Code == 0)
          this.itemInboundDetailcopy = { ...this.itemInboundDetail }
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.itemInboundDetail = { ...this.itemInboundDetailcopy };
        this.notification.onError(`Lỗi lấy thông tin xe theo số khung, số máy: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.itemInboundDetail = { ...this.itemInboundDetailcopy };
      this.notification.onError(`Lỗi lấy thông tin xe theo số khung, số máy: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private GetIOSeriInternal(param: WHIODetailVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.GetIOSeriInternal(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.itemGetFromSeri = res.ObjectReturn;
        this.itemInboundDetail = { ...this.itemGetFromSeri }
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.itemInboundDetail = new WHIODetailVehicleCusDTO();
        this.oldframe = '';
        this.oldengine = '';
        this.notification.onError(`Lỗi lấy thông tin xe theo số khung, số máy: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe theo số khung, số máy: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private getlisthead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead(true).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listHead = res.ObjectReturn;
        this.listHead = this.listHead.filter(x => x.Code != this.inhead.Head)
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${err.message}`)
    });
    this.arrUnsubscribe.push(temp);
  }

  //test ok
  private UpdateIOMasterVehicle(param: UpdatePropertiesInterface<WHIOMasterVehicleCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbapi.UpdateIOMasterVehicle(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.inbound = res.ObjectReturn;
          this.inbound.DocumentID = res.ObjectReturn.DocumentID;
          if (this.inbound.EffDate && !(this.inbound.EffDate instanceof Date)) {
            this.inbound.EffDate = new Date(this.inbound.EffDate);
          }
          if (this.inbound.EstEffDate) {
            this.inbound.EstEffDate = new Date(this.inbound.EstEffDate);
          }

          this.notification.onSuccess(`Thành công`);
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

  public UpdateIOMasterVehicleStatus(status: number, statusname: string) {
    this.subLoader.loader(true);
    var dto: UpdateStatusInterface<WHIOMasterVehicleCusDTO> = {
      ListDTO: [this.inbound],
      Status: status
    }

    var temp = this.mtbapi.UpdateIOMasterVehicleStatus(dto).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.inbound.StatusID = status;
        this.inbound.StatusIDName = statusname;
        this.GetIOMasterVehicle(this.inbound)
        this.notification.onSuccess(`Thành công`);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  //test ok
  public DeleteIOMasterVehicle(dto: WHIOMasterVehicleCusDTO[]): void {
    this.subLoader.loader(true);
    const sub = this.mtbapi.DeleteIOMasterVehicle(dto).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.onClearField();
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  public DeleteIODetailVehicle(dto: WHIODetailVehicleCusDTO[]): void {
    this.subLoader.loader(true);
    const sub = this.mtbapi.DeleteIODetailVehicle(dto).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListIODetailVehicle(this.filter);
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateIODetailVehicle(dto: WHIODetailVehicleCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.mtbapi.UpdateIODetailVehicle(dto).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListIODetailVehicle(this.filter);
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

}
