import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderInvoiceDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice-detail.dto';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
import { SALOrderInvoiceDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-invoice-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb031-sal-payment-selection',
  templateUrl: './mtb031-sal-payment-selection.component.html',
  styleUrls: ['./mtb031-sal-payment-selection.component.scss'],
})

export class Mtb031SalPaymentSelectionComponent implements OnInit {
  constructor(
    private api: MtbikeApiService,
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private coreapi: PSCoreApiService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public receiptitem: any = { OrderMaster: 0, OrderInvoice: 0, Status: 1 };
  public master: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  ngOnInit(): void {
    var cache = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT);
    const receiptitem = this.cache.parseValue(cache);

    var cacheMaster = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.master = this.cache.parseValue(cacheMaster);

    this.receiptitem.OrderInvoice = receiptitem.Code;
    this.receiptitem.OrderMaster = this.master.Code;
    this.receiptitem.Status = receiptitem.Status;
    this.GetListSALOrderItem(this.receiptitem);
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region group switch
  public listgroup: { name: string, value: string }[] = [
    { name: 'Nhóm theo', value: null }, { name: '|', value: null },
    { name: 'Xe thanh toán', value: 'vehicle' }, { name: '|', value: null },
    { name: 'Phân loại', value: 'type' },
  ];
  public onswitchgroup(type: string) {
    if (type == null) {
      return;
    }


    this.groupactive = type;
    if (this.groupactive == 'type') {
      this.GetListSALTypeItem(this.receiptitem)
    } else {
      this.GetListSALOrderItem(this.receiptitem)
    }
  }
  //#endregion

  //#region main
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public SALOrderInvoiceStatusEnum = SALOrderInvoiceStatusEnum;
  public SALOrderInvoiceDetailTypeDataEnum = SALOrderInvoiceDetailTypeDataEnum;

  public invoiceTypeItem: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public invoiceOrderItem: SALOrderDetailCusDTO[] = [];
  public groupactive: string = 'vehicle';
  public invoiceDetailList: SALOrderInvoiceDetailCusDTO[] = [];
  public invoiceDetailListcopy: SALOrderInvoiceDetailCusDTO[] = [];
  public checkAll: boolean = false;
  public checkGroupVehicle: boolean = false;
  public checkGroupService: boolean = false;
  public checkGroupPart: boolean = false;
  isInvoiceChanged(): boolean {
    return JSON.stringify(this.invoiceDetailList) !== JSON.stringify(this.invoiceDetailListcopy);
  }

  hasAnyChecked(): boolean {
    return this.invoiceDetailList.some(
      x => x.IsChecked && !x.IsExisted
    );
  }


  private isFirstLoad: boolean = true;


  // public onnavigate(field: string = '') {
  //   if (this.FunctionPermissionDTO.approver) {
  //     this.router.navigate([field]);
  //     return;
  //   }

  //   if (this.receiptitem.Status != SALOrderInvoiceStatusEnum.New) {
  //     this.router.navigate([field]);
  //     return;
  //   }

  //   if (field == '/mtbike/payment/total') {
  //     if (this.isInvoiceChanged()) {
  //       const payload = this.getUniqueInvoiceDetails();
  //       this.UpdateSALInvoice(payload);
  //     } else {
  //       this.router.navigate([field]);
  //     }
  //     return;
  //   }
  //   this.router.navigate([field]);
  // }

  private recalculateGroups() {
    const list = this.invoiceDetailList.filter(x => !x.IsExisted);

    const checkGroup = (type: SALOrderInvoiceDetailTypeDataEnum) =>
      list.filter(x => x.TypeData === type).every(x => x.IsChecked);

    this.checkGroupVehicle = checkGroup(SALOrderInvoiceDetailTypeDataEnum.Vehicle);
    this.checkGroupService = checkGroup(SALOrderInvoiceDetailTypeDataEnum.Service);
    this.checkGroupPart = checkGroup(SALOrderInvoiceDetailTypeDataEnum.PartItem);

    this.checkAll =
      this.checkGroupVehicle &&
      this.checkGroupService &&
      this.checkGroupPart;
  }


  private normalizeAndCheck(res: any, type: string) {

    if (type === 'type') {
      if (!res.ObjectReturn) return;
      const invoiceType = res.ObjectReturn;
      this.invoiceTypeItem = invoiceType;
      invoiceType.ListVehicle.forEach(v => {
        const exist = this.invoiceDetailList.find(x => x.OrderDetail === v.Code);
        if (exist) v.IsChecked = exist.IsChecked;
      });

      invoiceType.ListService.forEach(s => {
        const exist = this.invoiceDetailList.find(x => x.OrderDetailService === s.Code);
        if (exist) s.IsChecked = exist.IsChecked;
      });

      invoiceType.ListPart.forEach(p => {
        const exist = this.invoiceDetailList.find(x => x.OrderDetailPartItem === p.Code);
        if (exist) p.IsChecked = exist.IsChecked;
      });
      this.buildInvoiceDetailList(invoiceType);
      this.checkGroupVehicle = invoiceType.ListVehicle.every(v => v.IsChecked);
      this.checkGroupService = invoiceType.ListService.every(s => s.IsChecked);
      this.checkGroupPart = invoiceType.ListPart.every(p => p.IsChecked);
    }

    else if (type === 'vehicle') {
      const data = res.ObjectReturn ?? [];
      this.invoiceOrderItem = data;
      data.forEach(v => {
        const existV = this.invoiceDetailList.find(x => x.OrderDetail === v.Code);
        if (existV) v.IsChecked = existV.IsChecked;
        v.ListService.forEach(s => {
          const exist = this.invoiceDetailList.find(x => x.OrderDetailService === s.Code);
          if (exist) s.IsChecked = exist.IsChecked;
        });
        v.ListPart.forEach(p => {
          const exist = this.invoiceDetailList.find(x => x.OrderDetailPartItem === p.Code);
          if (exist) p.IsChecked = exist.IsChecked;
        });
      });
      this.buildInvoiceDetailList({
        ListVehicle: data,
        ListService: [],
        ListPart: []
      });
      this.checkGroupVehicle =
        data
          .filter(v => !v.IsExisted)
          .every(v => v.IsChecked);

      this.checkGroupService =
        data
          .flatMap(v => v.ListService || [])
          .filter(s => !s.IsExisted)
          .every(s => s.IsChecked);

      this.checkGroupPart =
        data
          .flatMap(v => v.ListPart || [])
          .filter(p => !p.IsExisted)
          .every(p => p.IsChecked);

    }

    this.checkAll =
      this.checkGroupVehicle &&
      this.checkGroupService &&
      this.checkGroupPart;
  }

  private buildInvoiceDetailList(invoice: any) {
    if (!invoice) return;

    const map = new Map<string, SALOrderInvoiceDetailCusDTO>();
    const buildKey = (type: SALOrderInvoiceDetailTypeDataEnum, code: any, orderDetail?: any) => {
      if (!code) return '';
      if (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle) return `v-${code}`;
      if (type === SALOrderInvoiceDetailTypeDataEnum.Service) return `s-${orderDetail || 'na'}-${code}`;
      return `p-${orderDetail || 'na'}-${code}`;
    };

    this.invoiceDetailList.forEach(d => {
      const code = d.TypeData === SALOrderInvoiceDetailTypeDataEnum.Vehicle ? d.OrderDetail :
        d.TypeData === SALOrderInvoiceDetailTypeDataEnum.Service ? d.OrderDetailService :
          d.OrderDetailPartItem;
      const key = buildKey(d.TypeData, code, d.OrderDetail);
      if (key) map.set(key, d);
    });

    const mergeItem = (type: SALOrderInvoiceDetailTypeDataEnum, apiItem: any) => {
      const vehicleCode = apiItem.OrderDetail
        ?? (invoice.ListVehicle && invoice.ListVehicle.length > 0 ? invoice.ListVehicle[0].Code : null);
      const key = buildKey(type, apiItem.Code, vehicleCode);
      if (!key) return;

      let exist = map.get(key);
      if (!exist) {
        exist = new SALOrderInvoiceDetailCusDTO();
        exist.TypeData = type;
        exist.InvoiceMaster = this.receiptitem.OrderInvoice;
        exist.IsExisted = apiItem.IsExisted ?? false;
        if (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle) {
          exist.OrderDetail = apiItem.Code;
        }
        if (type === SALOrderInvoiceDetailTypeDataEnum.Service) {
          exist.OrderDetailService = apiItem.Code;
          if (!exist.OrderDetail && vehicleCode) exist.OrderDetail = vehicleCode;
        }
        if (type === SALOrderInvoiceDetailTypeDataEnum.PartItem) {
          exist.OrderDetailPartItem = apiItem.Code;
          if (!exist.OrderDetail && vehicleCode) exist.OrderDetail = vehicleCode;
        }
        exist.IsChecked = !!apiItem.IsChecked;
        map.set(key, exist);
        return;
      }
      if (exist.IsChecked === undefined || exist.IsChecked === null) {
        exist.IsChecked = !!apiItem.IsChecked;
      }
    };

    if (this.groupactive == 'type') {

      (invoice.ListVehicle || []).forEach(v => mergeItem(SALOrderInvoiceDetailTypeDataEnum.Vehicle, v));
      (invoice.ListService || []).forEach(s => mergeItem(SALOrderInvoiceDetailTypeDataEnum.Service, s));
      (invoice.ListPart || []).forEach(p => mergeItem(SALOrderInvoiceDetailTypeDataEnum.PartItem, p));
    } else {
      (invoice.ListVehicle || []).forEach(v => {
        mergeItem(SALOrderInvoiceDetailTypeDataEnum.Vehicle, v);
        (v.ListService || []).forEach(s =>
          mergeItem(SALOrderInvoiceDetailTypeDataEnum.Service, s)
        );
        (v.ListPart || []).forEach(p =>
          mergeItem(SALOrderInvoiceDetailTypeDataEnum.PartItem, p)
        );
      });

    }

    this.invoiceDetailList = Array.from(map.values());


    if (this.isFirstLoad) {
      this.invoiceDetailListcopy = JSON.parse(JSON.stringify(this.invoiceDetailList));
      this.isFirstLoad = false;
    }

  }

  /**
   * Loại bỏ trùng theo loại + code để payload gửi BE không bị nhân đôi
   */
  // private getUniqueInvoiceDetails(): SALOrderInvoiceDetailCusDTO[] {
  //   const map = new Map<string, SALOrderInvoiceDetailCusDTO>();
  //   const buildKey = (type: SALOrderInvoiceDetailTypeDataEnum, code: any, orderDetail?: any) => {
  //     if (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle) return `v-${code}`;
  //     if (type === SALOrderInvoiceDetailTypeDataEnum.Service) return `s-${orderDetail || 'na'}-${code}`;
  //     return `p-${orderDetail || 'na'}-${code}`;
  //   };

  //   this.invoiceDetailList.forEach(d => {
  //     const code = d.TypeData === SALOrderInvoiceDetailTypeDataEnum.Vehicle ? d.OrderDetail :
  //       d.TypeData === SALOrderInvoiceDetailTypeDataEnum.Service ? d.OrderDetailService :
  //         d.OrderDetailPartItem;
  //     const key = buildKey(d.TypeData, code, d.OrderDetail);
  //     if (!key) return;
  //     // đảm bảo dịch vụ/phụ tùng kèm mã order detail để BE không nhân bản
  //     if (d.TypeData !== SALOrderInvoiceDetailTypeDataEnum.Vehicle && !d.OrderDetail && this.invoiceTypeItem.ListVehicle.length) {
  //       d.OrderDetail = this.invoiceTypeItem.ListVehicle[0].Code;
  //     }

  //     if (!map.has(key)) {
  //       map.set(key, d);
  //     } else {
  //       // nếu trùng, ưu tiên trạng thái mới nhất
  //       const exist = map.get(key);
  //       if (exist) {
  //         exist.IsChecked = d.IsChecked;
  //         exist.IsExisted = exist.IsExisted || d.IsExisted;
  //       }
  //     }
  //   });

  //   return Array.from(map.values());
  // }

  // toggleAll() {
  //   if (this.receiptitem.Status != SALOrderInvoiceStatusEnum.New || this.FunctionPermissionDTO.approver) {
  //     return;
  //   }

  //   this.checkAll = !this.checkAll;
  //   this.onToggleAll(this.checkAll);
  // }

  // onToggleAll(checked: boolean) {
  //   if (this.groupactive === 'type') {
  //     this.onToggleGroup_Type('vehicle', checked);
  //     this.onToggleGroup_Type('service', checked);
  //     this.onToggleGroup_Type('part', checked);
  //   }
  //   else {
  //     this.invoiceOrderItem.forEach(item => {
  //       // CHA không existed → toggle cả group
  //       if (!item.IsExisted) {
  //         this.onToggleGroup_Vehicle(item, checked);
  //         return;
  //       }

  //       // CHA existed → chỉ toggle CON
  //       (item.ListService || [])
  //         .filter(s => !s.IsExisted)
  //         .forEach(s =>
  //           this.onToggleItem_Vehicle(
  //             s,
  //             SALOrderInvoiceDetailTypeDataEnum.Service,
  //             checked,
  //             item
  //           )
  //         );

  //       (item.ListPart || [])
  //         .filter(p => !p.IsExisted)
  //         .forEach(p =>
  //           this.onToggleItem_Vehicle(
  //             p,
  //             SALOrderInvoiceDetailTypeDataEnum.PartItem,
  //             checked,
  //             item
  //           )
  //         );
  //     });

  //   }

  //   this.checkGroupVehicle = this.invoiceDetailList
  //     .filter(x => x.TypeData === SALOrderInvoiceDetailTypeDataEnum.Vehicle)
  //     .every(x => x.IsChecked);

  //   this.checkGroupService = this.invoiceDetailList
  //     .filter(x => x.TypeData === SALOrderInvoiceDetailTypeDataEnum.Service)
  //     .every(x => x.IsChecked);

  //   this.checkGroupPart = this.invoiceDetailList
  //     .filter(x => x.TypeData === SALOrderInvoiceDetailTypeDataEnum.PartItem)
  //     .every(x => x.IsChecked);


  //   this.checkAll =
  //     this.checkGroupVehicle &&
  //     this.checkGroupService &&
  //     this.checkGroupPart;
  //   this.recalculateGroups();
  // }

  //#region view TYPE
  // toggleGroup(type: 'vehicle' | 'service' | 'part') {
  //   if (this.FunctionPermissionDTO.approver ||
  //     this.receiptitem.Status != SALOrderInvoiceStatusEnum.New) return;

  //   if (type === 'vehicle') {
  //     this.checkGroupVehicle = !this.checkGroupVehicle;
  //     this.onToggleGroup_Type('vehicle', this.checkGroupVehicle);
  //   }

  //   if (type === 'service') {
  //     this.checkGroupService = !this.checkGroupService;
  //     this.onToggleGroup_Type('service', this.checkGroupService);
  //   }

  //   if (type === 'part') {
  //     this.checkGroupPart = !this.checkGroupPart;
  //     this.onToggleGroup_Type('part', this.checkGroupPart);
  //   }
  // }

  // toggleItem(item: any, type: 'vehicle' | 'service' | 'part') {
  //   if (this.FunctionPermissionDTO.approver ||
  //     this.receiptitem.Status != SALOrderInvoiceStatusEnum.New || item.IsExisted) return;

  //   item.IsChecked = !item.IsChecked;

  //   const enumType =
  //     type === 'vehicle'
  //       ? SALOrderInvoiceDetailTypeDataEnum.Vehicle
  //       : type === 'service'
  //         ? SALOrderInvoiceDetailTypeDataEnum.Service
  //         : SALOrderInvoiceDetailTypeDataEnum.PartItem;

  //   this.onToggleItem_Type(item, enumType, item.IsChecked);
  // }


  // onToggleGroup_Type(type: 'vehicle' | 'service' | 'part', checked: boolean) {
  //   if (type === 'vehicle') {
  //     this.invoiceTypeItem.ListVehicle
  //       .filter(v => !v.IsExisted)
  //       .forEach(v =>
  //         this.onToggleItem_Type(v, SALOrderInvoiceDetailTypeDataEnum.Vehicle, checked)
  //       );
  //   }

  //   if (type === 'service') {
  //     this.invoiceTypeItem.ListService
  //       .filter(s => !s.IsExisted)
  //       .forEach(s =>
  //         this.onToggleItem_Type(s, SALOrderInvoiceDetailTypeDataEnum.Service, checked)
  //       );
  //   }

  //   if (type === 'part') {
  //     this.invoiceTypeItem.ListPart
  //       .filter(p => !p.IsExisted)
  //       .forEach(p =>
  //         this.onToggleItem_Type(p, SALOrderInvoiceDetailTypeDataEnum.PartItem, checked)
  //       );
  //   }

  //   this.recalculateGroups();
  // }


  // onToggleItem_Type(item: any, type: SALOrderInvoiceDetailTypeDataEnum, checked: boolean) {
  //   if (item.IsExisted === true) {
  //     return;
  //   }

  //   item.IsChecked = checked;

  //   let detail = this.invoiceDetailList.find(x =>
  //     (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle && x.OrderDetail === item.Code) ||
  //     (type === SALOrderInvoiceDetailTypeDataEnum.Service && x.OrderDetailService === item.Code) ||
  //     (type === SALOrderInvoiceDetailTypeDataEnum.PartItem && x.OrderDetailPartItem === item.Code)
  //   );

  //   if (!detail) {
  //     detail = new SALOrderInvoiceDetailCusDTO();
  //     detail.TypeData = type;

  //     const vehicleCode =
  //       item?.OrderDetail
  //       ?? (this.invoiceTypeItem.ListVehicle && this.invoiceTypeItem.ListVehicle.length > 0
  //         ? this.invoiceTypeItem.ListVehicle[0].Code
  //         : null);

  //     if (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle) {
  //       detail.OrderDetail = item.Code;
  //     }

  //     if (type === SALOrderInvoiceDetailTypeDataEnum.Service) {
  //       detail.OrderDetailService = item.Code;
  //       if (!detail.OrderDetail && vehicleCode) detail.OrderDetail = vehicleCode;
  //     }

  //     if (type === SALOrderInvoiceDetailTypeDataEnum.PartItem) {
  //       detail.OrderDetailPartItem = item.Code;
  //       if (!detail.OrderDetail && vehicleCode) detail.OrderDetail = vehicleCode;
  //     }

  //   }

  //   detail.IsChecked = checked;
  //   detail.InvoiceMaster = this.receiptitem.OrderInvoice;

  //   this.recalculateGroups();
  // }
  //#endregion

  //#region view VEHICLE
  toggleVehicleFromLabel(item: any) {
    if (this.receiptitem.Status != SALOrderInvoiceStatusEnum.New || this.FunctionPermissionDTO.approver || item.IsExisted) return;

    const newValue = !item.IsChecked;
    item.IsChecked = newValue;
    this.onToggleGroup_Vehicle(item, newValue);
  }

  toggleChildFromLabel(child: any, type: 'service' | 'part', parent: any) {
    if (this.receiptitem.Status != SALOrderInvoiceStatusEnum.New || this.FunctionPermissionDTO.approver || child.IsExisted) return;

    const newValue = !child.IsChecked;
    child.IsChecked = newValue;

    this.onToggleItem_Vehicle(
      child,
      type === 'service' ? SALOrderInvoiceDetailTypeDataEnum.Service : SALOrderInvoiceDetailTypeDataEnum.PartItem,
      newValue,
      parent
    );
  }

  onToggleGroup_Vehicle(item: any, checked: boolean) {


    if (!checked) {
      const hasActiveCheckedChild =
        item.ListService.some(s => !s.IsExisted && s.IsChecked) ||
        item.ListPart.some(p => !p.IsExisted && p.IsChecked);

      if (!hasActiveCheckedChild) {
        // cho uncheck
      }
    }


    item.IsChecked = checked;
    const services = item.ListService.filter(s => !s.IsExisted);
    const parts = item.ListPart.filter(p => !p.IsExisted);

    services.forEach(s =>
      this.onToggleItem_Vehicle(s, SALOrderInvoiceDetailTypeDataEnum.Service, checked, item)
    );

    parts.forEach(p =>
      this.onToggleItem_Vehicle(p, SALOrderInvoiceDetailTypeDataEnum.PartItem, checked, item)
    );

    this.onToggleItem_Vehicle(item, SALOrderInvoiceDetailTypeDataEnum.Vehicle, checked);

    // this.checkGroupVehicle =
    //   this.invoiceOrderItem
    //     .filter(v => !v.IsExisted)
    //     .every(v => v.IsChecked);

    // this.checkGroupService =
    //   this.invoiceOrderItem
    //     .flatMap(v => v.ListService ?? [])
    //     .filter(s => !s.IsExisted)
    //     .every(s => s.IsChecked);

    // this.checkGroupPart =
    //   this.invoiceOrderItem
    //     .flatMap(v => v.ListPart ?? [])
    //     .filter(p => !p.IsExisted)
    //     .every(p => p.IsChecked);

    this.checkAll =
      this.checkGroupVehicle &&
      this.checkGroupService &&
      this.checkGroupPart;

  }


  onToggleItem_Vehicle(item: any, type: SALOrderInvoiceDetailTypeDataEnum, checked: boolean, parent: any = null) {
    if (item.IsExisted === true) {
      return;
    }
    item.IsChecked = checked;

    let detail = this.invoiceDetailList.find(x =>
      (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle && x.OrderDetail === item.Code) ||
      (type === SALOrderInvoiceDetailTypeDataEnum.Service && x.OrderDetailService === item.Code) ||
      (type === SALOrderInvoiceDetailTypeDataEnum.PartItem && x.OrderDetailPartItem === item.Code)
    );

    if (!detail) {
      detail = new SALOrderInvoiceDetailCusDTO();
      detail.TypeData = type;
      detail.InvoiceMaster = this.receiptitem.OrderInvoice;
      detail.IsExisted = item.IsExisted ?? false;

      const vehicleCode = (parent && parent.Code) || item.OrderDetail ||
        (this.invoiceOrderItem && this.invoiceOrderItem.length > 0 ? this.invoiceOrderItem[0].Code : null);

      if (type === SALOrderInvoiceDetailTypeDataEnum.Vehicle) {
        detail.OrderDetail = item.Code;
      } else if (type === SALOrderInvoiceDetailTypeDataEnum.Service) {
        detail.OrderDetailService = item.Code;
        if (!detail.OrderDetail && vehicleCode) detail.OrderDetail = vehicleCode;
      } else if (type === SALOrderInvoiceDetailTypeDataEnum.PartItem) {
        detail.OrderDetailPartItem = item.Code;
        if (!detail.OrderDetail && vehicleCode) detail.OrderDetail = vehicleCode;
      }
    }

    detail.IsChecked = checked;

    if (parent) {
      const parentDetail = this.invoiceDetailList.find(x => x.OrderDetail === parent.Code);
      if (parentDetail) parentDetail.IsChecked = parent.IsChecked;
    }

    // this.checkGroupVehicle =
    //   this.invoiceOrderItem
    //     .filter(v => !v.IsExisted)
    //     .every(v => v.IsChecked);

    // this.checkGroupService =
    //   this.invoiceOrderItem
    //     .flatMap(v => v.ListService ?? [])
    //     .filter(s => !s.IsExisted)
    //     .every(s => s.IsChecked);

    // this.checkGroupPart =
    //   this.invoiceOrderItem
    //     .flatMap(v => v.ListPart ?? [])
    //     .filter(p => !p.IsExisted)
    //     .every(p => p.IsChecked);

    this.checkAll =
      this.checkGroupVehicle &&
      this.checkGroupService &&
      this.checkGroupPart;

  }

  //#endregion

  //#region CALL API
  private GetListSALTypeItem(param: SALOrderInvoiceCusDTO) {
    this.loader.loader(true);
    const temp = this.api.GetListSALTypeItem(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.normalizeAndCheck(res, 'type');
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin xe phân loại: ${res.ErrorString}`);
      }
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin xe phân loại: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private GetListSALOrderItem(param: SALOrderInvoiceCusDTO) {
    this.loader.loader(true);
    const temp = this.api.GetListSALOrderItem(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.normalizeAndCheck(res, 'vehicle');
        this.loader.loader(false);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin thanh toán: ${res.ErrorString}`);
      }
    }, err => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin thanh toán: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private UpdateSALInvoice(param: SALOrderInvoiceDetailCusDTO[]) {
    this.loader.loader(true);
    const temp = this.api.UpdateSALInvoice(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, res.ObjectReturn);
        if (!res.ObjectReturn) {
          this.loader.loader(false);
          return;
        }
        this.receiptitem.OrderInvoice = res.ObjectReturn.Code;
        this.receiptitem.OrderMaster = res.ObjectReturn.OrderMaster;

        this.notification.onSuccess('Thành công');
        this.loader.loader(false);
        this.router.navigate(['/mtbike/payment/total']);
      } else {
        this.loader.loader(false);
        this.notification.onError(`Lỗi thêm xe/dịch vụ/phụ tùng: ${res.ErrorString}`);
      }
    }, err => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi thêm xe/dịch vụ/phụ tùng: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
  //#endregion
}