import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { LSTypeOfPartSpecsDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { LSTypeOfPartCusDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part.dto';
import { LSVehicleColorCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle-color.dto';
import { SALOrderDetailPartItemCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-part-item.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { PSCoreApiService } from 'src/app/services/core/ps-core-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsArray } from 'src/app/services/utilities/ps-array';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsString } from 'src/app/services/utilities/ps-string';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb016-sal-consultant-part-detail',
  templateUrl: './mtb016-sal-consultant-part-detail.component.html',
  styleUrls: ['./mtb016-sal-consultant-part-detail.component.scss'],
  animations: [
    trigger('slideSwitch', [
      transition('* => left', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition('* => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition('left => *', []),
      transition('right => *', []),
    ]),
  ],
})
export class Mtb016SalConsultantPartDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  //#region chung
  private arrUnsubscribe: Subscription[] = [];
  public retailMaster: SALOrderMasterCusDTO;
  public get detail(): SALOrderDetailCusDTO {
    return this.orderDetail;
  }
  public typedata = 'vehiclecolor';
  @ViewChild('popupBody', { static: false }) popupBodyRef: ElementRef<HTMLDivElement>;

  private readonly viewportNoZoom = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  private readonly viewportDefault = 'width=device-width, initial-scale=1';

  constructor(
    private router: Router,
    private location: Location,
    private meta: Meta,
    private mtbikeapi: MtbikeApiService,
    private coreApi: PSCoreApiService,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private cache: PsCache,
    private configCache: ConfigCacheService
  ) { }

  public onnavigate(field: string): void {
    if (field === 'back') { this.location.back(); return; }
    if (field === 'cart') { this.router.navigate(['/mtbike/consultant/cart']); return; }
    const routes: Record<string, string> = { '': '/mtbike/consultant', '/parts': '/mtbike/consultant/parts' };
    this.router.navigate([routes[field] ?? '/mtbike/consultant']);
  }

  public formatprice(price: number): string {
    return PsString.formatPrice(price);
  }
  //#endregion

  //#region lifecycle
  ngOnInit(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    this.retailMaster = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER)) ?? null;
    this.GetListLSList();
    const vcolor = this.cache.getItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR);
    const vehiclecolor = vcolor ? this.cache.parseValue(vcolor) : null;
    const orderDetailTemp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL);
    if (orderDetailTemp) {
      this.orderDetail = this.cache.parseValue(orderDetailTemp);
      this.setdetailimg(this.orderDetail);
      this.setStatusContext(this.orderDetail);
    }
    if (vehiclecolor && vehiclecolor.ListOrderDetailCode && vehiclecolor.ListOrderDetailCode.length > 0) {
      this.listOrderDetailCode = vehiclecolor.ListOrderDetailCode;
      if (this.retailMaster && this.retailMaster.Code) {
        this.getlistpart();
      }
    } else {
      this.cache.removeItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR);
      if (this.orderDetail && this.orderDetail.Code && this.retailMaster && this.retailMaster.Code) {
        this.getdetail();
      }
    }
  }

  private getdetail(): void {
    const code = this.orderDetail != null ? this.orderDetail.Code : null;
    if (code == null) {
      this.partsList = (this.orderDetail as any) && (this.orderDetail as any).ListPart ? (this.orderDetail as any).ListPart : [];
      return;
    }
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetConsutantOrderDetail({ Code: code } as SALOrderDetailCusDTO).subscribe(
      (res) => {
        if (res == null || res.StatusCode !== 0 || !res.ObjectReturn) {
          this.subLoader.loader(false);
          this.listSalVehicleParts = [];
          this.listOrderDetailCode = [];
          this.partsList = [];
          return;
        }
        const detail = res.ObjectReturn as SALOrderDetailCusDTO;
        this.setdetailimg(detail);
        this.orderDetail = detail;
        this.setStatusContext(detail);
        const sub2 = this.mtbikeapi.GetListSALVehicleParts(detail).subscribe(
          (res2) => {
            this.subLoader.loader(false);
            if (res2 != null && res2.StatusCode === 0 && res2.ObjectReturn != null) {
              const raw = res2.ObjectReturn;
const data = Array.isArray(raw) ? raw : ((raw as any) && (raw as any).Data) ? (raw as any).Data : [];
          const list: SALOrderDetailCusDTO[] = Array.isArray(data) ? data : [];
              const one = list.find(d => d.Code === code) || detail;
              this.listSalVehicleParts = [one];
              this.listOrderDetailCode = [one.Code];
              this.currentVehicleIndex = 0;
              this.setcurrent(0);
            } else {
              this.listSalVehicleParts = [detail];
              this.listOrderDetailCode = [detail.Code];
              this.currentVehicleIndex = 0;
              this.setcurrent(0);
            }
          },
          () => {
            this.subLoader.loader(false);
            this.listSalVehicleParts = [detail];
            this.listOrderDetailCode = [detail.Code];
            this.currentVehicleIndex = 0;
            this.setcurrent(0);
          }
        );
        this.arrUnsubscribe.push(sub2);
      },
      () => {
        this.subLoader.loader(false);
        this.listSalVehicleParts = [];
        this.listOrderDetailCode = [];
        this.partsList = [];
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportDefault });
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }
  //#endregion

  //#region header
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;

  private enableAutoSlide() {
    if (!this.wrapper.nativeElement || !this.content.nativeElement) return;
    const wrapperWidth = this.wrapper.nativeElement.clientWidth;
    const contentWidth = this.content.nativeElement.scrollWidth;
    const content = this.content.nativeElement;
    content.classList.remove('running');
    if (contentWidth > wrapperWidth) content.classList.add('running');
  }
  //#endregion

  //#region thông tin xe
  public listSalVehicleParts: SALOrderDetailCusDTO[] = [];
  public currentVehicleIndex: number = 0;
  public orderDetail: SALOrderDetailCusDTO;
  public statusContext: { Status: number; StatusName: string } | null = null;
  public vehiclecolor: LSVehicleColorCusDTO | null = null;
  public listOrderDetailCode: number[] = [];
  public slideDirection: 'left' | 'right' | '' = '';

  onSlideSwitchDone(): void {
    setTimeout(() => { this.slideDirection = ''; }, 0);
  }

  get tottalindex(): number {
    if (this.listOrderDetailCode.length > 0) return this.listOrderDetailCode.length;
    return this.listSalVehicleParts.length;
  }

  getDiscountLabel(detail: SALOrderDetailCusDTO): string {
    if (!detail) return '0 CTKM';
    const pct = (detail as any).DiscountPercent;
    const percent = pct != null ? Number(pct) : 0;
    return percent === 0 ? '0 CTKM' : 'giảm giá ' + percent.toFixed(2) + '%';
  }

  private setStatusContext(detail: SALOrderDetailCusDTO | null): void {
    if (!detail) {
      this.statusContext = null;
      return;
    }
    const type = detail.TypeData != null ? detail.TypeData : SALOrderDetailTypeDataEnum.BUY;
    const normalized = type === SALOrderDetailTypeDataEnum.CARE ? SALOrderDetailTypeDataEnum.BUY : type;
    const name = normalized === SALOrderDetailTypeDataEnum.TRANSFER ? 'Điều xe' : normalized === SALOrderDetailTypeDataEnum.BOOK ? 'Đặt xe' : 'Có sẵn';
    this.statusContext = { Status: normalized, StatusName: name };
  }

  canGoPrev(): boolean {
    return this.listSalVehicleParts.length > 0 && this.currentVehicleIndex > 0;
  }

  canGoNext(): boolean {
    return this.listSalVehicleParts.length > 0 && this.currentVehicleIndex < this.listSalVehicleParts.length - 1;
  }

  goPrev(): void {
    if (!this.canGoPrev()) return;
    this.currentVehicleIndex--;
    this.setcurrent(this.currentVehicleIndex);
  }

  goNext(): void {
    if (!this.canGoNext()) return;
    this.currentVehicleIndex++;
    this.setcurrent(this.currentVehicleIndex);
  }

  ontoleftclick(): void {
    if (this.slideDirection !== '') return;
    if (!this.canGoPrev()) return;
    this.slideDirection = 'left';
    this.currentVehicleIndex--;
    this.setcurrent(this.currentVehicleIndex);
  }

  ontorightclick(): void {
    if (this.slideDirection !== '') return;
    if (!this.canGoNext()) return;
    this.slideDirection = 'right';
    this.currentVehicleIndex++;
    this.setcurrent(this.currentVehicleIndex);
  }

  private setdetailimg(d: SALOrderDetailCusDTO | null): void {
    if (!d) return;
    const o = d as any;
    if (!o.VehicleImage && o.ImageSetting1) o.VehicleImage = o.ImageSetting1;
  }

  getConsutantOrderDetail(code: number): void {
    const dto = new SALOrderDetailCusDTO();
    dto.Code = code;
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetConsutantOrderDetail(dto).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0 && res.ObjectReturn) {
          this.orderDetail = res.ObjectReturn;
          this.setdetailimg(this.orderDetail);
          this.setStatusContext(this.orderDetail);
          this.partsList = (this.orderDetail as any).ListPart && Array.isArray((this.orderDetail as any).ListPart)
            ? (this.orderDetail as any).ListPart
            : [];
          this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi lấy thông tin xe');
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(err && err.message ? err.message : 'Lỗi lấy thông tin xe');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private setcurrent(index: number): void {
    if (index < 0 || index >= this.listSalVehicleParts.length) return;
    const item = this.listSalVehicleParts[index];
    this.orderDetail = { ...item } as SALOrderDetailCusDTO;
    this.setdetailimg(this.orderDetail);
    this.setStatusContext(this.orderDetail);
    this.partsList = (item as any) && (item as any).ListPart ? (item as any).ListPart : [];
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, this.orderDetail);
  }

  private getlistpart(): void {
    if (!this.retailMaster || !this.retailMaster.Code) return;
    const param = new SALOrderDetailCusDTO();
    param.Master = this.retailMaster.Code;
    const filterByCodes = this.listOrderDetailCode.length > 0 ? this.listOrderDetailCode : null;
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALVehicleParts(param).subscribe(
      res => {
        this.subLoader.loader(false);
        const raw = res.ObjectReturn;
        const data = Array.isArray(raw) ? raw : ((raw as any) && (raw as any).Data) ? (raw as any).Data : [];
        let list: SALOrderDetailCusDTO[] = Array.isArray(data) ? data : [];
        if (filterByCodes && filterByCodes.length > 0) {
          const set = new Set(filterByCodes);
          list = list.filter(d => d.Code != null && set.has(d.Code));
        }
        this.listSalVehicleParts = list;
        this.listOrderDetailCode = list.map(d => d.Code).filter(c => c != null);
        if (this.listOrderDetailCode.length > 0 && !filterByCodes)
          this.cache.setItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR, { ListOrderDetailCode: this.listOrderDetailCode });
        const selectedCode = this.orderDetail != null ? this.orderDetail.Code : null;
        const idx = selectedCode != null ? list.findIndex(d => d.Code === selectedCode) : -1;
        this.currentVehicleIndex = idx >= 0 ? idx : 0;
        list.length > 0 ? this.setcurrent(this.currentVehicleIndex) : (this.partsList = []);
      },
      () => {
        this.subLoader.loader(false);
        this.listSalVehicleParts = [];
        this.partsList = [];
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region phụ kiện
  public partsList: SALOrderDetailPartItemCusDTO[] = [];
  trackByPartCode(_i: number, part: SALOrderDetailPartItemCusDTO): number {
    return part && part.Code != null ? part.Code : _i;
  }
  private isSaving = false;
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public onAddNewPart() {
    if ((!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator) || this.retailMaster?.Status != 1) return;
    this.isEditMode = false;
    this.resetForm();

    const loadData = () => {
      this.ongetcategory();
      this.showPopup = true;
      this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    };

    this.GetListLSList(loadData, true);
  }

  public onEditPart(part: SALOrderDetailPartItemCusDTO) {
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
    this.showPopup = true;
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });

    const loadEdit = () => {
      if (!PsArray.any(this.listPartCategory)) {
        this.GetListSALPartCategory(() => this.loadEditData(part));
      } else {
        this.loadEditData(part);
      }
    };

    if (!PsArray.any(this.listUnit)) {
      this.GetListLSList(loadEdit);
    } else {
      loadEdit();
    }
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
      this.GetListSALPartCategory();
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
    this.GetListSALTypeOfPart();
  }

  //#endregion


  onClosePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  onDeletePart() {
    if (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator) return;
    if (!this.currentPartItem || !this.currentPartItem.Code) return;
    this.DeleteSALPartItem();
  }

  onSavePart() {
    if (!this.FunctionPermissionDTO.master && !this.FunctionPermissionDTO.creator) return;
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
    return price == null || price === undefined ? '0' : price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private savePartItem(closePopup: boolean = false) {
    if (!this.orderDetail || !this.orderDetail.Code || !this.typeofpart || !this.typeofpart.Code) return;
    if (this.isSaving) return;
    this.UpdateSALPartItem(closePopup);
  }

  private hasFormChanges(): boolean {
    if (!this.currentPartItem) return true;

    const currentTypeOfPart = this.typeofpart.Code || 0;
    const currentTypeOfPartSpecs = this.typeofpartspecs.Code || 0;
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
    return !value || value === 0 ? '' : new Intl.NumberFormat('vi-VN').format(value);
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
  //#endregion

  //#region API
  private refreshVehicleListAndCurrent() {
    if (!this.retailMaster || !this.retailMaster.Code) return;
    const filterByCodes = this.listOrderDetailCode.length > 0 ? this.listOrderDetailCode : null;
    const param = new SALOrderDetailCusDTO();
    param.Master = this.retailMaster.Code;
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALVehicleParts(param).subscribe(
      res => {
        this.subLoader.loader(false);
        const raw = res.ObjectReturn;
        const data = Array.isArray(raw) ? raw : (raw && (raw as any).Data) ? (raw as any).Data : [];
        let list: SALOrderDetailCusDTO[] = Array.isArray(data) ? data : [];
        if (filterByCodes && filterByCodes.length > 0) {
          const set = new Set(filterByCodes);
          list = list.filter(d => d.Code != null && set.has(d.Code));
        }
        this.listSalVehicleParts = list;
        if (list.length > 0 && this.currentVehicleIndex >= 0 && this.currentVehicleIndex < list.length) {
          this.setcurrent(this.currentVehicleIndex);
        }
      },
      () => this.subLoader.loader(false)
    );
    this.arrUnsubscribe.push(sub);
  }

  private GetListSALPartCategory(callback?: () => void) {
    if (!this.orderDetail) {
      if (callback) callback();
      return;
    }
    if (PsArray.any(this.listPartCategory)) {
      if (callback) callback();
      return;
    }
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALPartCategory(this.orderDetail).subscribe(
      res => {
        this.listPartCategory = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
        this.subLoader.loader(false);
        if (callback) callback();
      },
      () => {
        this.subLoader.loader(false);
        if (callback) callback();
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private GetListSALTypeOfPart() {
    if (!this.orderDetail || !this.orderDetail.Code || !this.partcategory || !this.partcategory.Code) {
      return;
    }

    const cacheKey = this.partcategory.Code;
    const cachedTypes = this.typeOfPartCache[cacheKey];
    if (cachedTypes && cachedTypes.length > 0) {
      this.listTypeOfPart = cachedTypes.map(item => ({ ...item }));
      this.listTypeOfPartSpecs = [];
      return;
    }

    this.subLoader.loader(true);
    const typeState = { OrderDetail: this.orderDetail, Category: this.partcategory };
    const sub = this.mtbikeapi.GetListSALTypeOfPart(typeState).subscribe(res => {
      this.listTypeOfPart = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
      this.typeOfPartCache[cacheKey] = (this.listTypeOfPart || []).map(item => ({ ...item }));
      this.listTypeOfPartSpecs = [];
      this.subLoader.loader(false);
    }, () => this.subLoader.loader(false));
    this.arrUnsubscribe.push(sub);
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
    const sub = this.mtbikeapi.GetListSALTypeOfPartSpecs(typeState).subscribe(res => {
      this.listTypeOfPartSpecs = res.StatusCode === 0 ? (res.ObjectReturn || []) : [];
      this.typeOfPartSpecsCache[cacheKey] = (this.listTypeOfPartSpecs || []).map(item => ({ ...item }));
      this.subLoader.loader(false);
    }, () => this.subLoader.loader(false));
    this.arrUnsubscribe.push(sub);
  }

  private GetListLSList(callback?: () => void, forceReload: boolean = false) {
    if (!forceReload && PsArray.any(this.listUnit)) {
      if (callback) callback();
      return;
    }
    this.subLoader.loader(true);
    const sub = this.configCache.GetListLSList(LSListTypeDataEnum.Unit, forceReload).subscribe(res => {
      this.listUnit = res ? res : [];
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
            const subSpecs = this.mtbikeapi.GetListSALTypeOfPartSpecs(typeStateSpecs).subscribe(resSpecs => {
              if (resSpecs.StatusCode === 0) {
                this.listTypeOfPartSpecs = resSpecs.ObjectReturn || [];
                this.typeOfPartSpecsCache[selectedType.Code || 0] = (this.listTypeOfPartSpecs || []).map(item => ({ ...item }));
                this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
                this.typeofpartspecs.Code = part.TypeOfPartSpecs;
              }
              bindData();
            }, bindData);
            this.arrUnsubscribe.push(subSpecs);
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

    const sub = this.mtbikeapi.GetListSALTypeOfPart(typeState).subscribe(res => {
      if (res.StatusCode !== 0) {
        this.findTypeOfPartInCategories(part, categoryIndex + 1);
        return;
      }
      const typesOfPart = res.ObjectReturn || [];
      this.typeOfPartCache[currentCategory.Code || 0] = (typesOfPart || []).map(item => ({ ...item }));
      handleTypes(typesOfPart);
    }, () => this.findTypeOfPartInCategories(part, categoryIndex + 1));
    this.arrUnsubscribe.push(sub);
  }

  private UpdateSALPartItem(closePopup: boolean = false) {
    if (this.isSaving) return;

    const partItem = new SALOrderDetailPartItemCusDTO();
    partItem.Code = this.currentPartItem && this.currentPartItem.Code ? this.currentPartItem.Code : 0;
    partItem.OrderDetail = this.orderDetail.Code;
    partItem.TypeOfPart = this.typeofpart.Code;
    partItem.IsChecked = true;
    partItem.TypeOfPartSpecs = this.typeofpartspecs && this.typeofpartspecs.Code ? this.typeofpartspecs.Code : 0;
    partItem.BaseUnit = (this.unit as any).Code || 0;
    partItem.BaseUnitName = this.unit && this.unit.ListName ? this.unit.ListName : '';
    partItem.Quantity = Number(this.quantity ?? 0);
    partItem.UnitPrice = Number(this.unitPrice ?? 0);

    this.isSaving = true;
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALPartItem(partItem).subscribe(
      res => {
        this.isSaving = false;
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Thành công');
          this.refreshVehicleListAndCurrent();
          if (closePopup || this.shouldCloseAfterSave) {
            this.shouldCloseAfterSave = false;
            this.onClosePopup();
          } else if (res.ObjectReturn && res.ObjectReturn.Code) {
            this.currentPartItem.Code = res.ObjectReturn.Code;
            this.isEditMode = true;
          }
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi lưu phụ kiện');
        }
      },
      () => {
        this.isSaving = false;
        this.subLoader.loader(false);
        this.notification.onError('Lỗi lưu phụ kiện');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private DeleteSALPartItem() {
    const partItem = new SALOrderDetailPartItemCusDTO();
    partItem.OrderDetail = this.orderDetail.Code;
    partItem.TypeOfPart = this.typeofpart.Code;
    partItem.IsChecked = false;

    this.subLoader.loader(true);
    const sub = this.mtbikeapi.UpdateSALPartItem(partItem).subscribe(
      res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Thành công');
          this.refreshVehicleListAndCurrent();
          this.onClosePopup();
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi xóa phụ kiện');
        }
      },
      () => {
        this.subLoader.loader(false);
        this.notification.onError('Lỗi xóa phụ kiện');
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}

