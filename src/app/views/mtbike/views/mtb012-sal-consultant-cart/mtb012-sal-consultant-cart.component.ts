import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { LSVehicleColorCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle-color.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb012-sal-consultant-cart',
  templateUrl: './mtb012-sal-consultant-cart.component.html',
  styleUrls: ['./mtb012-sal-consultant-cart.component.scss'],
})
export class Mtb012SalConsultantCartComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private api: MtbikeApiService,
    private loader: SystemLoaderService,
  ) { }



  //#region lifecycle
  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    this.retailMaster = this.cache.parseValue(temp);
    this.typeactive = this.retailMaster.Status != SALOrderMasterStatusRetailEnum.COMPLETE ? 'buy' : 'transfer';

    this.GetListSALSelectedVehicle(this.retailMaster);
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
    console.log();
  }
  //#endregion

  //#region  header
  public retailMaster: SALOrderMasterCusDTO;
  private arrUnsubscribe: Subscription[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public listtab: { label: string; value: string }[] = [
    { label: 'Đã chọn', value: 'buy' },
    { label: 'Điều chuyển', value: 'transfer' },
  ]
  public listtab2: { label: string; value: string, link: string }[] = [
    { label: 'Dịch vụ', value: 'service', link: '/mtbike/consultant/services' },
    { label: 'Phụ kiện', value: 'part', link: '/mtbike/consultant/parts' },
    { label: 'Khuyến mãi', value: 'discount', link: '/mtbike/consultant/promotion' },
  ]
  public typeactive: string = 'buy';
  public filter: State = { sort: [{ field: 'Status', dir: 'asc' }], filter: { logic: 'and', filters: [] } };
  public ontransfering: boolean = false;
  public enumstt = SALOrderDetailStatusEnum;
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;

  private enableAutoSlide() {
    const wrapperWidth = this.wrapper.nativeElement.clientWidth;
    const contentWidth = this.content.nativeElement.scrollWidth;

    const content = this.content.nativeElement;
    content.classList.remove('running');

    if (contentWidth > wrapperWidth) {
      content.classList.add('running');
    }
  }

  private handlefilter() {
    this.filter.filter.filters = [];

    switch (this.typeactive) {
      case 'buy':
        break;

      case 'transfer':
        break;

      default:
        break;
    }
  }
  //#endregion


  //#region change tab
  onChangeType(value: string) {
    this.typeactive = value;
    if (this.typeactive == 'buy') {
      this.GetListSALSelectedVehicle(this.retailMaster);
    } else {
      this.GetListSALSelectedWH(this.retailMaster);
    }
  }
  //#endregion

  //#region BODY
  public listVehicle: LSVehicleColorCusDTO[] = [];
  public listVehicle2: LSHeadCusDTO[] = [];
  collapsedMap = new Map<number, boolean>();
  public cofirmDelete: boolean = false;
  public cofirmUnlock: boolean = false;
  public deleteItem: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public unlockItem: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public oldOrderQuantity: number;

  // Vuốt trái → hiện nút Xóa
  onSwipeLeft(item: any, i: number) {
    this.listVehicle.forEach(v => {
      if (v !== item) {
        v['swiped'] = false;
      }
    });
    item.swiped = true;
  }

  // Vuốt phải → ẩn nút Xóa
  onSwipeRight(item: any) {
    const target = this.listVehicle.find(v => v.Code === item.Code && v.OrderTypeData === item.OrderTypeData);
    if (target) (target as any)['swiped'] = false;
  }

  // Hiện/ẩn nút xóa
  public onshowAction(item: any) {
    const target = this.listVehicle.find(v => v.Code === item.Code && v.OrderTypeData === item.OrderTypeData);
    if (!target) return;

    if ((target as any).swiped) {
      (target as any).swiped = false;
    } else {
      this.listVehicle.forEach((d) => (d as any).swiped = false);
      (target as any).swiped = true;
    }
  }

  // Xóa item
  onDelete(item: any) {
    if (this.FunctionPermissionDTO.viewer && !this.FunctionPermissionDTO.creator && !this.FunctionPermissionDTO.approver && !this.FunctionPermissionDTO.master) { return; }
    if (item.IsOrderLock) {
      this.notification.onWarning('Không thể xóa xe đã chốt');
      item.swiped = false;
      return;
    }
    this.deleteItem = item;
    // item.TypeData = SALOrderDetailTypeDataEnum.BUY;
    // this.DeleteSALDetail(item);
    this.cofirmDelete = true;
  }

  public onCancel(item: any) {
    item.swiped = false;
  }

  onConfirmDelete(item: LSVehicleColorCusDTO, type: string) {
    const param: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
    param.Master = this.retailMaster.Code;
    param.Code = item.Code;
    param.OrderTypeData = item.OrderTypeData;
    if (type == 'delete-all') {
      param.OrderQuantity = item.OrderQuantity;
    } else {
      param.OrderQuantity = 1;
    }
    this.DeleteSALSelectedVehicles(param);
  }

  onSetItem(item: LSVehicleColorCusDTO, field: string) {
    this.cache.setItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR, item);
    this.router.navigate(['/mtbike/consultant/' + field]);
  }

  toggleCard(index: number) {
    this.collapsedMap.set(index, !this.collapsedMap.get(index));
  }

  isCollapsed(index: number): boolean {
    return this.collapsedMap.get(index) ?? false;
  }

  public onClickLock(item: LSVehicleColorCusDTO) {
    const param: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
    param.Master = this.retailMaster.Code;
    param.Code = item.Code;
    param.IsOrderLock = true;
    param.OrderTypeData = item.OrderTypeData;
    this.UpdateSALSelectedVehicleLock(param);
  }

  public onClickUnlock(item: LSVehicleColorCusDTO) {
    this.cofirmUnlock = true;
    this.unlockItem = item;
  }

  public onConfirmUnlock(item: LSVehicleColorCusDTO) {
    this.cofirmUnlock = false;

    const param: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
    param.Master = this.retailMaster.Code;
    param.Code = item.Code;
    param.IsOrderLock = false;
    param.OrderTypeData = item.OrderTypeData;
    this.UpdateSALSelectedVehicleLock(param);

  }

  public onFocusVehicle(item: LSVehicleColorCusDTO) {
    this.oldOrderQuantity = item.OrderQuantity;
  }

  public onAddVehicle(item: LSVehicleColorCusDTO) {
    if (item.IsOrderLock) return;
    const currentHeadStock = item.ListStock[0].Quantity || 0;
    const otherHeadStock = item.ListStock[1].Quantity || 0;

    let targetType = SALOrderDetailTypeDataEnum.BUY;
    let message = '';

    if (currentHeadStock <= 0) {
      if (otherHeadStock > 0) {
        targetType = SALOrderDetailTypeDataEnum.TRANSFER;
        message = "Head hiện tại đã hết xe, bạn có muốn điều xe?";
      } else {
        targetType = SALOrderDetailTypeDataEnum.BOOK;
        message = "Các head khác đã hết xe, bạn có muốn đặt xe?";
      }
    }

    const isExistTargetType = this.listVehicle.some(x =>
      x.Code === item.Code && x.OrderTypeData === targetType
    );

    const param = this.createVehicleParam(item, 1, targetType);

    if (targetType !== 1 && !isExistTargetType) {
      this.stockConfirmMessage = message;
      this.pendingStockParam = param;
      this.showStockConfirm = true;
    } else {
      this.AddSALSelectedVehicles(param);
    }
  }

  public showStockConfirm: boolean = false;
  public stockConfirmMessage: string = '';
  public pendingStockParam: LSVehicleColorCusDTO | null = null;

  public onAddMultiVehicle(item: LSVehicleColorCusDTO) {
    if (item.IsOrderLock) return;
    if (this.oldOrderQuantity === item.OrderQuantity) return;

    const diff = item.OrderQuantity - this.oldOrderQuantity;

    if (diff < 0) {
      const param = this.createVehicleParam(item, Math.abs(diff), item.OrderTypeData);
      this.DeleteSALSelectedVehicles(param);
      return;
    }

    const currentHeadStock = item.ListStock[0].Quantity || 0;
    const otherHeadStock = item.ListStock[1].Quantity || 0;

    let targetType = SALOrderDetailTypeDataEnum.BUY;
    let message = '';

    if (currentHeadStock <= 0) {
      if (otherHeadStock > 0) {
        targetType = SALOrderDetailTypeDataEnum.TRANSFER;
        message = "Head hiện tại đã hết xe, bạn có muốn điều xe?";
      } else {
        targetType = SALOrderDetailTypeDataEnum.BOOK;
        message = "Các head khác đã hết xe, bạn có muốn đặt xe?";
      }
    }

    const isExistTargetType = this.listVehicle.some(x =>
      x.Code === item.Code && x.OrderTypeData === targetType
    );

    const param = this.createVehicleParam(item, diff, targetType);

    if (targetType !== SALOrderDetailTypeDataEnum.BUY && !isExistTargetType) {
      this.stockConfirmMessage = message;
      this.pendingStockParam = param;
      this.showStockConfirm = true;
    } else {
      this.AddSALSelectedVehicles(param);
    }
  }

  private createVehicleParam(item: any, qty: number, typeData: number): LSVehicleColorCusDTO {
    const param = new LSVehicleColorCusDTO();
    param.Master = this.retailMaster.Code;
    param.Code = item.Code;
    param.OrderQuantity = qty;
    param.OrderTypeData = typeData;
    return param;
  }

  public onConfirmStock() {
    if (this.pendingStockParam) {
      this.AddSALSelectedVehicles(this.pendingStockParam);
      this.showStockConfirm = false;
      this.pendingStockParam = null;
    }
  }

  public onCancelStock() {
    this.showStockConfirm = false;
    this.pendingStockParam = null;
  }

  onchecked(item: any, v: any) {
    const param = new SALOrderDetailCusDTO();
    param.Master = this.retailMaster.Code;
    param.HeadTransfer = item.Code;
    param.TypeData = SALOrderDetailTypeDataEnum.TRANSFER;
    param.VehicleColor = v.VehicleColorCode;
    param.Quantity = v.Quantity;
    param.IsChecked = v.IsChecked;
    this.UpdateSALDetail(param);

  }

  public hasCheckedItems(item: any): boolean {
    return item.ListGroupOrderDetail && item.ListGroupOrderDetail.some((v: any) => v.IsChecked);
  }


  //#endregion

  private GetListSALSelectedVehicle(param: SALOrderMasterCusDTO) {
    this.loader.loader(true);

    const temp = this.api.GetListSALSelectedVehicle(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.listVehicle = res.ObjectReturn.map((item: any) => ({
          ...item,
          swiped: false
        }));
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private GetListSALSelectedWH(param: SALOrderMasterCusDTO) {
    this.loader.loader(true);

    const temp = this.api.GetListSALSelectedWH(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.listVehicle2 = res.ObjectReturn;
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private AddSALSelectedVehicles(param: LSVehicleColorCusDTO) {
    this.loader.loader(true);

    const temp = this.api.AddSALSelectedVehicles(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        if (res.ObjectReturn && res.ObjectReturn.Message) {
          this.notification.onSuccess(res.ObjectReturn.Message);
        }
        this.GetListSALSelectedVehicle(this.retailMaster);
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi thêm xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi thêm xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private DeleteSALSelectedVehicles(param: LSVehicleColorCusDTO) {
    this.loader.loader(true);

    const temp = this.api.DeleteSALSelectedVehicles(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        if (res.ObjectReturn && res.ObjectReturn.Message) {
          this.notification.onSuccess(res.ObjectReturn.Message);
        }
        this.GetListSALSelectedVehicle(this.retailMaster);
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi xóa xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi xóa xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALSelectedVehicleLock(param: LSVehicleColorCusDTO) {
    this.loader.loader(true);

    const temp = this.api.UpdateSALSelectedVehicleLock(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.GetListSALSelectedVehicle(this.retailMaster);
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi xóa xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi xóa xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALDetail(param: SALOrderDetailCusDTO) {
    this.loader.loader(true);

    const temp = this.api.UpdateSALDetail(param).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.GetListSALSelectedWH(this.retailMaster);
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi xóa xe : ${res.ErrorString}`);
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi xóa xe : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  //#endregion

  //#region footer
  public onNavigate(field: string) {
    this.router.navigate([field]);
  }

  public onCancelTransaction() {
    if (this.retailMaster && this.retailMaster.Code > 0) {
      if (!confirm('Bạn có chắc chắn muốn hủy giao dịch này không?')) {
        return;
      }

      const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
        ListDTO: [this.retailMaster],
        Status: 6 // CANCEL
      };

      this.subLoader.loader(true);
      const sub = this.api.UpdateSALStatus(param).subscribe(res => {
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

  public onNavigateToTotalVehicle(item: LSVehicleColorCusDTO | any): void {
    if (!item) return;
    const list = this.typeactive === 'buy' ? this.listVehicle : this.listVehicle2;
    const listCodes = (list || []).flatMap((x: any) => x.ListOrderDetailCode || []).filter((c: any) => c != null);
    if (listCodes.length > 0) {
      this.cache.setItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR, { ListOrderDetailCode: listCodes });
    }
    const orderDetailCode = (item as any).ListOrderDetailCode != null && (item as any).ListOrderDetailCode[0] != null
      ? (item as any).ListOrderDetailCode[0]
      : (item as any).Code;
    if (orderDetailCode == null) return;
    const orderDetailForPayment = { ...(item as any), Code: orderDetailCode };
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, orderDetailForPayment);
    this.router.navigate(['/mtbike/consultant/total-vehicle']);
  }

  private isapplystt: boolean = true;

  public onupdatestatusmaster() {
    if (this.isapplystt)
      this.updatesalstatus();
  }

  public updatesalstatus() {
    var param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
      ListDTO: [this.retailMaster],
      Status: SALOrderMasterStatusRetailEnum.COMPLETE,
    };

    this.subLoader.loader(true);
    var temp = this.api.UpdateSALStatus(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.subLoader.loader(false);
      } else
        this.notification.onError(`Lỗi cập nhật phiếu: ${res.ErrorString}`);
      this.subLoader.loader(false);
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật phiếu: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}