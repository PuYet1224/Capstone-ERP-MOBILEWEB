import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { LSTypeOfPartSpecsDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { LSTypeOfPartCusDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part.dto';
import { SALOrderDetailPartItemCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-part-item.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PSCoreApiService } from 'src/app/services/core/ps-core-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsArray } from 'src/app/services/utilities/ps-array';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb022-sal-collection-part',
  templateUrl: './mtb022-sal-collection-part.component.html',
  styleUrls: ['./mtb022-sal-collection-part.component.scss'],
})

export class Mtb022SalCollectionPartComponent implements OnInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = [];
  public retailMaster: SALOrderMasterCusDTO;

  constructor(
    private router: Router,
    private mtbikeapi: MtbikeApiService,
    private coreApi: PSCoreApiService,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private cache: PsCache,
  ) { }

  //#region  life cycle
  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    let retailMaster = this.cache.parseValue(temp);
    this.retailMaster = retailMaster;

    const cachedDetailRaw = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    if (cachedDetailRaw) {
      const detail = this.cache.parseValue(cachedDetailRaw);
      if (detail && detail.Code) {
        this.orderDetail = detail;
        this.loadVehicleInfoAndServices();
        return;
      }
    }

    if (retailMaster) {
      if (retailMaster.ListDetail && retailMaster.ListDetail.length > 0) {
        this.orderDetail = retailMaster.ListDetail[0];
        this.loadVehicleInfoAndServices();
        return;
      }
      if (retailMaster.ListBuyVehicle && retailMaster.ListBuyVehicle.length > 0) {
        this.orderDetail = retailMaster.ListBuyVehicle[0];
        this.loadVehicleInfoAndServices();
        return;
      }
    }
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  //#endregion

  //#endregion

  //#region  thông tin xe
  public orderDetail: SALOrderDetailCusDTO;

  private loadVehicleInfoAndServices() {
    if (!this.orderDetail || !this.orderDetail.Code) return;
    this.GetListSalOrderDetailPartItem();
  }
  //#endregion

  //#region phụ kiện
  public partsList: SALOrderDetailPartItemCusDTO[] = [];
  private isSaving: boolean = false;
  public enummasterstt = SALOrderMasterStatusRetailEnum;
  public enumdetailstt = SALOrderDetailStatusEnum;
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public onAddNewPart() {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    this.isEditMode = false;
    this.resetForm();

    const loadData = () => {
      this.GetListSALPartCategory(() => {
        this.preloadTypeOfPartForNew(() => {
          if (this.partcategory && this.partcategory.Code) {
            this.GetListSALTypeOfPart(() => {
              this.showPopup = true;
            });
          } else {
            this.showPopup = true;
          }
        });
      });
    };

    this.GetListLSList(loadData, true);
  }

  public onEditPart(part: SALOrderDetailPartItemCusDTO) {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    if (!part || !part.Code || !part.TypeOfPart) return;

    this.isEditMode = true;
    this.isSaving = false;
    this.currentPartItem = { ...part };
    this.quantity = part.Quantity || 1;
    this.unitPrice = part.UnitPrice || 0;
    this.typeofpart = new LSTypeOfPartCusDTO();
    this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
    this.unit = new ListDTO();

    const loadEdit = () => {
      const afterCategory = () => {
        const matched = this.listPartCategory.find(c => c.Code === (part as any).TypeOfPartCategory) || this.listPartCategory[0];
        if (matched) this.partcategory = { ...matched };

        this.GetListSALTypeOfPart(() => {
          this.loadEditData(part);
          this.showPopup = true;
        });
      };

      this.GetListSALPartCategory(afterCategory);
    };

    this.GetListLSList(loadEdit, true);
  }

  private bindUnit(part: SALOrderDetailPartItemCusDTO) {
    if (!part) return;
    if (!PsArray.any(this.listUnit)) return;
    const byCode = this.listUnit.find(u => u.Code === (part.BaseUnit as any));
    if (byCode) {
      this.unit = { ...byCode };
      return;
    }
    if (part.BaseUnitName) {
      const byName = this.listUnit.find(u => (u.ListName || '').toLowerCase() === part.BaseUnitName.toLowerCase());
      if (byName) {
        this.unit = { ...byName };
        return;
      }
    }
    this.unit = new ListDTO();
    (this.unit as any).Code = (part.BaseUnit as any) || null;
    this.unit.ListName = part.BaseUnitName || '';
  }
  //#endregion

  //#region popup thêm
  public showPopup: boolean = false;
  public isEditMode: boolean = false;
  public listPartCategory: LSPartCategoryCusDTO[] = [];
  public partcategory: LSPartCategoryCusDTO = new LSPartCategoryCusDTO();
  public listTypeOfPart: LSTypeOfPartCusDTO[] = [];
  public typeofpart: LSTypeOfPartCusDTO = new LSTypeOfPartCusDTO();
  public listTypeOfPartSpecs: LSTypeOfPartSpecsDTO[] = [];
  public typeofpartspecs: LSTypeOfPartSpecsDTO = new LSTypeOfPartSpecsDTO();
  public listUnit: ListDTO[] = [];
  public unit: ListDTO = new ListDTO();
  public quantity: number | null = null;
  public unitPrice: number | null = null;
  public currentPartItem: SALOrderDetailPartItemCusDTO = new SALOrderDetailPartItemCusDTO();
  private typeOfPartCache: Record<number, LSTypeOfPartCusDTO[]> = {};
  private typeOfPartSpecsCache: Record<number, LSTypeOfPartSpecsDTO[]> = {};
  private shouldCloseAfterSave: boolean = false;

  private ongetcategory() {
    if (!PsArray.any(this.listPartCategory))
      this.GetListSALPartCategory(() => { });
  }

  /**
   * Khi mở popup thêm mới, nếu đã có danh mục thì chọn mặc định và gọi API loại phụ tùng
   */
  private preloadTypeOfPartForNew(callback?: () => void) {
    if (!PsArray.any(this.listPartCategory)) {
      if (callback) callback();
      return;
    }
    if (!this.partcategory || !this.partcategory.Code) {
      this.partcategory = { ...this.listPartCategory[0] };
    }
    if (callback) callback();
  }

  public onPartCategoryChange() {
    if (!this.partcategory || !this.partcategory.Code || this.partcategory.Code === 0) {
      this.typeofpart = new LSTypeOfPartCusDTO();
      this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
      this.listTypeOfPart = [];
      this.listTypeOfPartSpecs = [];
      return;
    }
    this.typeofpart = new LSTypeOfPartCusDTO();
    this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
    this.GetListSALTypeOfPart(() => { });
  }

  //#endregion

  onNavigate(field: string) {
    if (field == 'back') {
      this.router.navigate(['/mtbike/collection/services']);
    } else if (field == 'to-list') {
      this.router.navigate(['/mtbike/collection']);
    } else if (field == 'continue') {
      this.router.navigate(['/mtbike/collection/coupon']);
    } else if (field == 'to-selection') {
      this.router.navigate(['/mtbike/collection/vehicle']);
    }
  }

  onClosePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  onDeletePart() {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    if (!this.currentPartItem || !this.currentPartItem.Code) return;
    this.DeleteSALPartItem();
  }

  onSavePart() {
    if (this.FunctionPermissionDTO.viewer || (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator)) return;
    if (!this.orderDetail || !this.orderDetail.Code || !this.typeofpart || !this.typeofpart.Code) {
      if (!this.typeofpart || !this.typeofpart.Code) {
        this.notification.onError('Vui lòng chọn loại phụ tùng');
      }
      return;
    }

    if (this.isEditMode && !this.hasFormChanges()) {
      this.onClosePopup();
      return;
    }

    if (this.isSaving) {
      this.shouldCloseAfterSave = true;
      return;
    }
    this.savePartItem(true);
  }

  formatPrice(price: number): string {
    if (price == null || price === undefined) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private savePartItem(closePopup: boolean = false) {
    if (!this.orderDetail || !this.orderDetail.Code || !this.typeofpart || !this.typeofpart.Code) return;
    if (this.isSaving) return;
    this.UpdateSALPartItem(closePopup);
  }

  private hasFormChanges(): boolean {
    if (!this.currentPartItem) return true;

    const currentTypeOfPart = this.typeofpart.Code || 0;
    const currentTypeOfPartSpecs = this.typeofpartspecs?.Code || 0;
    const currentBaseUnit = (this.unit as any).Code || 0;
    const currentBaseUnitName = this.unit.ListName || '';
    const currentQuantity = Number(this.quantity || 0);
    const currentUnitPrice = Number(this.unitPrice || 0);

    const originalTypeOfPart = Number(this.currentPartItem.TypeOfPart || 0);
    const originalTypeOfPartSpecs = Number(this.currentPartItem.TypeOfPartSpecs || 0);
    const originalBaseUnit = Number((this.currentPartItem as any).BaseUnit || 0);
    const originalBaseUnitName = (this.currentPartItem as any).BaseUnitName || '';
    const originalQuantity = Number((this.currentPartItem as any).Quantity || 0);
    const originalUnitPrice = Number((this.currentPartItem as any).UnitPrice || 0);

    if (currentTypeOfPart !== originalTypeOfPart) return true;
    if (currentTypeOfPartSpecs !== originalTypeOfPartSpecs) return true;
    if (currentBaseUnit !== originalBaseUnit) return true;
    if ((currentBaseUnitName || '') !== (originalBaseUnitName || '')) return true;
    if (currentQuantity !== originalQuantity) return true;
    if (currentUnitPrice !== originalUnitPrice) return true;

    return false;
  }

  formatCurrency(value: number | null): string {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private resetForm() {
    this.isEditMode = false;
    this.isSaving = false;
    this.partcategory = new LSPartCategoryCusDTO();
    (this.partcategory as any).Code = null;
    this.typeofpart = new LSTypeOfPartCusDTO();
    (this.typeofpart as any).Code = null;
    this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
    (this.typeofpartspecs as any).Code = null;
    this.unit = new ListDTO();
    (this.unit as any).Code = null;
    this.unit.ListName = '';
    this.quantity = null;
    this.unitPrice = null;
    this.currentPartItem = new SALOrderDetailPartItemCusDTO();
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
  }

  onUnitChange(code: number) {
    const selected = this.listUnit.find(u => u.Code == code);
    if (selected) {
      this.unit = new ListDTO();
      (this.unit as any).Code = (selected as any).Code;
      this.unit.ListName = selected.ListName || '';
    } else {
      this.unit = new ListDTO();
      (this.unit as any).Code = code || null;
      this.unit.ListName = '';
    }
  }

  onTypeOfPartChange(code: number) {
    const selectedType = this.listTypeOfPart.find(x => x.Code == code);
    if (selectedType) {
      this.typeofpart = selectedType;
      this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
      this.listTypeOfPartSpecs = [];
      this.GetListTypeOfPartSpecs(selectedType);
    }
  }

  onTypeOfPartSpecsChange(code: number) {
    this.typeofpartspecs.Code = code;
  }

  //#region CALL API
  private GetListSalOrderDetailPartItem() {
    this.subLoader.loader(true);
    // const sub = this.mtbikeapi.GetListSalOrderDetailPartItem(this.orderDetail).subscribe(
    //   (res) => {
    //     if (res.StatusCode === 0) {
    //       this.partsList = res.ObjectReturn;
    //       this.subLoader.loader(false);
    //     } else {
    //       this.subLoader.loader(false);
    //       this.notification.onError(`Lỗi lấy danh sách phụ kiện: ${res.ErrorString}`);
    //     }
    //   },
    //   (err) => {
    //     this.subLoader.loader(false);
    //     this.notification.onError(`Lỗi lấy danh sách phụ kiện: ${err.message}`);
    //   }
    // );
    // this.arrUnsubscribe.push(sub);
  }

  private GetListSALPartCategory(callback: () => void) {
    if (PsArray.any(this.listPartCategory)) {
      if (callback) callback();
      return;
    }
    this.subLoader.loader(true);
    // const sub = this.mtbikeapi.GetListSALPartCategory(this.orderDetail).subscribe(
    //   res => {
    //     this.listPartCategory = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
    //     this.subLoader.loader(false);
    //     if (callback) callback();
    //   },
    //   () => {
    //     this.subLoader.loader(false);
    //     if (callback) callback();
    //   }
    // );
    // this.arrUnsubscribe.push(sub);
  }

  private GetListSALTypeOfPart(callback: () => void) {
    if (!this.orderDetail || !this.orderDetail.Code || !this.partcategory || !this.partcategory.Code) {
      return;
    }

    const cacheKey = this.partcategory.Code;
    const cachedTypes = this.typeOfPartCache[cacheKey];
    if (cachedTypes && cachedTypes.length > 0) {
      this.listTypeOfPart = cachedTypes.map(item => ({ ...item }));
      this.listTypeOfPartSpecs = [];
      if (callback) callback();
      return;
    }

    this.subLoader.loader(true);
    const typeState = { OrderDetail: this.orderDetail, Category: this.partcategory };
    // const sub = this.mtbikeapi.GetListSALTypeOfPart(typeState).subscribe(res => {
    //   this.listTypeOfPart = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
    //   this.typeOfPartCache[cacheKey] = this.listTypeOfPart.map(item => ({ ...item }));
    //   this.listTypeOfPartSpecs = [];
    //   this.subLoader.loader(false);
    //   if (callback) callback();
    // }, () => {
    //   this.subLoader.loader(false);
    //   if (callback) callback();
    // });
    // this.arrUnsubscribe.push(sub);
  }

  private GetListTypeOfPartSpecs(param: LSTypeOfPartCusDTO) {
    if (!this.orderDetail || !this.orderDetail.Code || !param || !param.Code) {
      return;
    }

    const cacheKey = param.Code;
    const cachedSpecs = this.typeOfPartSpecsCache[cacheKey];
    if (cachedSpecs && cachedSpecs.length > 0) {
      this.listTypeOfPartSpecs = cachedSpecs.map(item => ({ ...item }));
      return;
    }

    this.subLoader.loader(true);
    const typeState = { OrderDetail: this.orderDetail, TypeOfPart: param };
    // const sub = this.mtbikeapi.GetListSALTypeOfPartSpecs(typeState).subscribe(res => {
    //   this.listTypeOfPartSpecs = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
    //   this.typeOfPartSpecsCache[cacheKey] = this.listTypeOfPartSpecs.map(item => ({ ...item }));
    //   this.subLoader.loader(false);
    // }, () => this.subLoader.loader(false));
    // this.arrUnsubscribe.push(sub);
  }

  private GetListLSList(callback: () => void, forceReload: boolean = false) {
    if (!forceReload && PsArray.any(this.listUnit)) {
      if (callback) callback();
      return;
    }
    this.subLoader.loader(true);
    const sub = this.coreApi.GetListLSList(LSListTypeDataEnum.Unit).subscribe(res => {
      this.listUnit = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
      this.subLoader.loader(false);
      if (callback) callback();
    }, () => {
      this.subLoader.loader(false);
      if (callback) callback();
    });
    this.arrUnsubscribe.push(sub);
  }

  private loadEditData(part: SALOrderDetailPartItemCusDTO) {
    if (!part || !part.TypeOfPart || !this.orderDetail || !this.orderDetail.Code || !PsArray.any(this.listPartCategory)) {
      this.subLoader.loader(false);
      return;
    }

    this.subLoader.loader(true);
    this.findTypeOfPartInCategories(part, 0);
  }

  private findTypeOfPartInCategories(part: SALOrderDetailPartItemCusDTO, categoryIndex: number) {
    if (categoryIndex >= this.listPartCategory.length) {
      this.subLoader.loader(false);
      return;
    }

    const currentCategory = this.listPartCategory[categoryIndex];
    const typeState = { OrderDetail: this.orderDetail, Category: currentCategory };

    const cachedTypes = this.typeOfPartCache[currentCategory.Code || 0];
    const handleTypes = (typesOfPart: LSTypeOfPartCusDTO[]) => {
      const selectedType = typesOfPart.find(t => t.Code === part.TypeOfPart);

      if (selectedType) {
        this.partcategory = { ...currentCategory };
        this.listTypeOfPart = typesOfPart;
        this.typeofpart = { ...selectedType };

        const bindData = () => {
          this.bindUnit(part);
          this.subLoader.loader(false);
        };

        if (part.TypeOfPartSpecs > 0) {
          const specsCache = this.typeOfPartSpecsCache[selectedType.Code || 0];
          if (specsCache && specsCache.length > 0) {
            this.listTypeOfPartSpecs = specsCache.map(item => ({ ...item }));
            this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
            this.typeofpartspecs.Code = part.TypeOfPartSpecs;
            bindData();
          } else {
            const typeStateSpecs = { OrderDetail: this.orderDetail, TypeOfPart: selectedType };
            // const subSpecs = this.mtbikeapi.GetListSALTypeOfPartSpecs(typeStateSpecs).subscribe(resSpecs => {
            //   if (resSpecs.StatusCode === 0) {
            //     this.listTypeOfPartSpecs = resSpecs.ObjectReturn || [];
            //     this.typeOfPartSpecsCache[selectedType.Code || 0] = this.listTypeOfPartSpecs.map(item => ({ ...item }));
            //     this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
            //     this.typeofpartspecs.Code = part.TypeOfPartSpecs;
            //   }
            //   bindData();
            // }, bindData);
            // this.arrUnsubscribe.push(subSpecs);
          }
        } else {
          bindData();
        }
      } else {
        this.findTypeOfPartInCategories(part, categoryIndex + 1);
      }
    };

    if (cachedTypes && cachedTypes.length > 0) {
      this.subLoader.loader(false);
      handleTypes(cachedTypes.map(item => ({ ...item })));
      return;
    }

    // const sub = this.mtbikeapi.GetListSALTypeOfPart(typeState).subscribe(res => {
    //   if (res.StatusCode !== 0) {
    //     this.findTypeOfPartInCategories(part, categoryIndex + 1);
    //     return;
    //   }

    //   const typesOfPart = res.ObjectReturn || [];
    //   this.typeOfPartCache[currentCategory.Code || 0] = typesOfPart.map(item => ({ ...item }));
    //   handleTypes(typesOfPart);
    // }, () => this.findTypeOfPartInCategories(part, categoryIndex + 1));

    // this.arrUnsubscribe.push(sub);
  }

  private UpdateSALPartItem(closePopup: boolean = false) {
    if (this.isSaving) return;

    const partItem = new SALOrderDetailPartItemCusDTO();
    partItem.Code = this.currentPartItem && this.currentPartItem.Code ? this.currentPartItem.Code : 0;
    partItem.OrderDetail = this.orderDetail.Code;
    partItem.TypeOfPart = this.typeofpart.Code;
    partItem.TypeOfPartSpecs = this.typeofpartspecs && this.typeofpartspecs.Code ? this.typeofpartspecs.Code : 0;
    partItem.BaseUnit = (this.unit as any).Code || 0;
    partItem.BaseUnitName = this.unit && this.unit.ListName ? this.unit.ListName : '';
    partItem.Quantity = Number(this.quantity ?? 0);
    partItem.UnitPrice = Number(this.unitPrice ?? 0);

    this.isSaving = true;
    this.subLoader.loader(true);
    // const sub = this.mtbikeapi.UpdateSALPartItem(partItem).subscribe(
    //   res => {
    //     this.isSaving = false;
    //     this.subLoader.loader(false);
    //     if (res.StatusCode === 0) {
    //       this.notification.onSuccess('Thành công');
    //       this.GetListSalOrderDetailPartItem();
    //       if (closePopup || this.shouldCloseAfterSave) {
    //         this.shouldCloseAfterSave = false;
    //         this.onClosePopup();
    //       } else if (res.ObjectReturn && res.ObjectReturn.Code) {
    //         this.currentPartItem.Code = res.ObjectReturn.Code;
    //         this.isEditMode = true;
    //       }
    //     } else {
    //       this.notification.onError(`Lỗi lưu phụ kiện: ${res.ErrorString}`);
    //     }
    //   },
    //   () => {
    //     this.isSaving = false;
    //     this.subLoader.loader(false);
    //     this.notification.onError('Lỗi lưu phụ kiện');
    //   }
    // );
    // this.arrUnsubscribe.push(sub);
  }

  private DeleteSALPartItem() {
    this.subLoader.loader(true);
    // const sub = this.mtbikeapi.DeleteSALPartItem(this.currentPartItem).subscribe(
    //   res => {
    //     this.subLoader.loader(false);
    //     if (res.StatusCode === 0) {
    //       this.notification.onSuccess('Thành công');
    //       this.GetListSalOrderDetailPartItem();
    //       this.onClosePopup();
    //     } else {
    //       this.notification.onError(`Lỗi xóa phụ kiện: ${res.ErrorString}`);
    //     }
    //   },
    //   () => {
    //     this.subLoader.loader(false);
    //     this.notification.onError('Lỗi xóa phụ kiện');
    //   }
    // );
    // this.arrUnsubscribe.push(sub);
  }
  //#endregion
}

