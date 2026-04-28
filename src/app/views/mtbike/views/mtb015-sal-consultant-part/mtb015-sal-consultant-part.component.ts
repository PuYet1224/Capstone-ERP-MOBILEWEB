import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { ListDTO } from 'src/app/models/dtos/e-dtos/list.dto';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { LSTypeOfPartSpecsDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { LSTypeOfPartCusDTO } from 'src/app/models/dtos/e-dtos/ls-type-of-part.dto';
import { SALOrderDetailPartItemCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail-part-item.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { LSPartCategoryTypeDataEnum } from 'src/app/models/enums/e-type/ls-part-category-type-data.enum';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { ConfigCacheService } from 'src/app/services/core/config-cache.service';
import { PSCoreApiService } from 'src/app/services/core/ps-core-api.service';
import { CoreApiStaticService } from 'src/app/services/core/ps-core-api-static.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb015-sal-consultant-part',
  templateUrl: './mtb015-sal-consultant-part.component.html',
  styleUrls: ['./mtb015-sal-consultant-part.component.scss'],
})
export class Mtb015SalConsultantPartComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region variables
  private arrUnsubscribe: Subscription[] = [];
  private collapsedSet = new Set<number>();
  public retailMaster: SALOrderMasterCusDTO;
  public listSalVehicleParts: SALOrderDetailCusDTO[] = [];
  public statusByCode: Record<number, { Status: number; StatusName: string }> = {};
  public enumTypeData = SALOrderDetailTypeDataEnum;
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public showPopup = false;
  public isEditMode = false;
  public selectedDetailCodes = new Set<number>();
  public listPartCategory: LSPartCategoryCusDTO[] = [];
  public partcategory: LSPartCategoryCusDTO = new LSPartCategoryCusDTO();
  public listTypeOfPart: LSTypeOfPartCusDTO[] = [];
  public typeofpart: LSTypeOfPartCusDTO = new LSTypeOfPartCusDTO();
  public listTypeOfPartSpecs: LSTypeOfPartSpecsDTO[] = [];
  public typeofpartspecs: LSTypeOfPartSpecsDTO = new LSTypeOfPartSpecsDTO();
  public listUnit: ListDTO[] = [];
  public unit: ListDTO = new ListDTO();
  public quantity: number | null = 1;
  public unitPrice: number | null = null;
  public editingPartItem: SALOrderDetailPartItemCusDTO | null = null;
  public originalDetailCode: number | null = null;
  private editingOrderDetail: SALOrderDetailCusDTO | null = null;
  private isSaving = false;
  private isLoadingPopupData = false;
  private typeOfPartCache: Record<number, LSTypeOfPartCusDTO[]> = {};
  private typeOfPartSpecsCache: Record<number, LSTypeOfPartSpecsDTO[]> = {};
  private applicableVehicleCodes: number[] = [];
  private partFilterApplied = false;
  private popupSliderEl: HTMLElement | null = null;
  private popupSliderWheelHandler: ((e: WheelEvent) => void) | null = null;
  private popupSliderPendingDelta = 0;
  private popupSliderRafId = 0;
  private typeVehicleMap = new Map<number, Set<number>>();
  private categoryVehicleMap = new Map<number, number[]>();
  //#endregion

  //#region constructor
  private readonly viewportNoZoom = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  private readonly viewportDefault = 'width=device-width, initial-scale=1';

  constructor(
    private router: Router,
    private cache: PsCache,
    private meta: Meta,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private coreApi: PSCoreApiService,
    private configCache: ConfigCacheService
  ) { }
  //#endregion

  //#region lifecycle
  ngOnInit(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    this.retailMaster = this.cache.parseValue(this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER)) ?? null;
    if (this.retailMaster != null && this.retailMaster.Code != null) {
      const param = new SALOrderDetailCusDTO();
      param.Master = this.retailMaster.Code;
      this.GetListSALVehicleParts(param);
    }
  }

  ngOnDestroy(): void {
    this.meta.updateTag({ name: 'viewport', content: this.viewportDefault });
    this.subLoader.reset();
    this.arrUnsubscribe.forEach((e) => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }
  //#endregion

  //#region header
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  @ViewChild('popupSlider') popupSliderRef!: ElementRef<HTMLElement>;

  private enableAutoSlide(): void {
    if (this.wrapper == null || this.wrapper.nativeElement == null || this.content == null || this.content.nativeElement == null) return;
    const wrapperWidth = this.wrapper.nativeElement.clientWidth;
    const contentWidth = this.content.nativeElement.scrollWidth;
    const content = this.content.nativeElement;
    content.classList.remove('running');
    if (contentWidth > wrapperWidth) content.classList.add('running');
  }
  //#endregion

  //#region navigation
  onNavigateBack(): void {
    this.router.navigate(['/mtbike/consultant/cart']);
  }

  onNavigateToDetail(): void {
    this.router.navigate(['/mtbike/consultant/detail']);
  }

  onNavigateList(): void {
    this.router.navigate(['/mtbike/consultant']);
  }

  onNavigateToCart(): void {
    this.router.navigate(['/mtbike/consultant/cart']);
  }

  onVehicleClick(detail: SALOrderDetailCusDTO): void {
    if (!detail || detail.Code == null) return;
    const listCodes = (this.listSalVehicleParts || []).map(x => x.Code).filter(c => c != null);
    if (listCodes.length > 0) {
      this.cache.setItem(KeyLocalStorageEnum.LS_VEHICLE_COLOR, { ListOrderDetailCode: listCodes });
    }
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, detail);
    this.router.navigate(['/mtbike/consultant/parts-detail']);
  }
  //#endregion

  //#region body
  getDiscountLabel(detail: SALOrderDetailCusDTO): string {
    if (!detail) return '0 CTKM';
    const pct = (detail as any).DiscountPercent;
    const percent = pct != null ? Number(pct) : 0;
    return percent === 0 ? '0 CTKM' : 'giảm giá ' + percent.toFixed(2) + '%';
  }

  getStatusContext(detail: SALOrderDetailCusDTO): { Status: number; StatusName: string } {
    const type = detail != null && detail.TypeData != null ? detail.TypeData : SALOrderDetailTypeDataEnum.BUY;
    const n = type === SALOrderDetailTypeDataEnum.CARE ? SALOrderDetailTypeDataEnum.BUY : type;
    const name = n === SALOrderDetailTypeDataEnum.TRANSFER ? 'Điều xe' : n === SALOrderDetailTypeDataEnum.BOOK ? 'Đặt xe' : 'Có sẵn';
    return { Status: n, StatusName: name };
  }

  toggleSection(index: number): void {
    if (this.collapsedSet.has(index)) this.collapsedSet.delete(index);
    else this.collapsedSet.add(index);
  }

  isCollapsed(index: number): boolean {
    return this.collapsedSet.has(index);
  }

  trackByCode(_i: number, detail: SALOrderDetailCusDTO): number {
    return detail != null && detail.Code != null ? detail.Code : _i;
  }

  trackByPartIndex(index: number): number {
    return index;
  }
  //#endregion

  //#region form
  get firstOrderDetail(): SALOrderDetailCusDTO {
    return this.listSalVehicleParts && this.listSalVehicleParts[0];
  }

  isVehicleSelected(v: SALOrderDetailCusDTO): boolean {
    return v != null && v.Code != null && this.selectedDetailCodes.has(v.Code);
  }

  get listVehiclesForApply(): SALOrderDetailCusDTO[] {
    if (!this.partFilterApplied) return this.listSalVehicleParts;
    return this.listSalVehicleParts.filter((v) => v.Code != null && this.applicableVehicleCodes.includes(v.Code));
  }

  toggleVehicleSelect(v: SALOrderDetailCusDTO): void {
    if (this.retailMaster?.Status >= 4) return;
    if (!v || v.Code == null) return;
    if (this.selectedDetailCodes.has(v.Code)) {
      if (this.selectedDetailCodes.size > 1) this.selectedDetailCodes.delete(v.Code);
    } else {
      this.selectedDetailCodes.add(v.Code);
    }
  }

  onClosePopup(): void {
    this.detachPopupSliderWheel();
    this.showPopup = false;
    this.resetPopupForm();
    this.partFilterApplied = true;
    this.applicableVehicleCodes = [];
    this.selectedDetailCodes = new Set();
  }

  onPopupSliderWheel(event: WheelEvent): void {
    const el = event.currentTarget as HTMLElement;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    event.preventDefault();
    this.popupSliderPendingDelta += event.deltaY;
    if (this.popupSliderRafId === 0) {
      this.popupSliderRafId = requestAnimationFrame(() => {
        el.scrollLeft += this.popupSliderPendingDelta;
        this.popupSliderPendingDelta = 0;
        this.popupSliderRafId = 0;
      });
    }
  }

  private attachPopupSliderWheel(): void {
    this.detachPopupSliderWheel();
    const el = this.popupSliderRef?.nativeElement;
    if (!el) return;
    const handler = (e: WheelEvent) => this.onPopupSliderWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    this.popupSliderEl = el;
    this.popupSliderWheelHandler = handler;
  }

  private detachPopupSliderWheel(): void {
    if (this.popupSliderRafId) {
      cancelAnimationFrame(this.popupSliderRafId);
      this.popupSliderRafId = 0;
    }
    this.popupSliderPendingDelta = 0;
    if (this.popupSliderEl && this.popupSliderWheelHandler) {
      this.popupSliderEl.removeEventListener('wheel', this.popupSliderWheelHandler);
      this.popupSliderEl = null;
      this.popupSliderWheelHandler = null;
    }
  }

  onPartCategoryChange(): void {
    (this.typeofpart as any).Code = null;
    (this.typeofpartspecs as any).Code = null;
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
    this.partFilterApplied = true;

    if (this.partcategory && this.partcategory.Code) {
      const mapped = this.categoryVehicleMap.get(this.partcategory.Code) || [];
      this.applicableVehicleCodes = mapped.length > 0
        ? mapped
        : this.listSalVehicleParts.filter(v => v && v.Code).map(v => v.Code);
      this.selectedDetailCodes = new Set(this.applicableVehicleCodes);
      this.GetListSALTypeOfPart();
    } else {
      this.applicableVehicleCodes = [];
      this.selectedDetailCodes = new Set();
    }
  }

  onTypeOfPartChange(code: number): void {
    const sel = this.listTypeOfPart.find((x) => x.Code === code);
    if (sel) {
      this.typeofpart = sel;
      this.listTypeOfPartSpecs = [];
      (this.typeofpartspecs as any).Code = null;
      // if (this.typeofpart && this.typeofpart.Code) this.GetListSALTypeOfPartSpecs(this.typeofpart);
      // this.loadApplicableVehicles();
    }
  }

  // onTypeOfPartSpecsChange(): void {
  //   this.loadApplicableVehicles();
  // }

  onUnitChange(code: number): void {
    const sel = this.listUnit.find((u) => u.Code === code);
    this.unit = sel ? { ...sel } : new ListDTO();
    (this.unit as any).Code = code ?? null;
  }

  onEditPart(detail: SALOrderDetailCusDTO, item: SALOrderDetailPartItemCusDTO): void {
    if (!FunctionPermissionDTO.master && !FunctionPermissionDTO.creator) return;
    if (!detail || !detail.Code || !item || !item.TypeOfPart) return;
    this.resetPopupForm();
    this.isEditMode = true;
    this.editingPartItem = { ...item };
    this.originalDetailCode = detail.Code;
    this.editingOrderDetail = detail;
    this.selectedDetailCodes = new Set([detail.Code]);
    this.quantity = item.Quantity != null ? item.Quantity : 1;
    this.unitPrice = item.UnitPrice != null ? item.UnitPrice : null;
    this.showPopup = true;
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    setTimeout(() => this.attachPopupSliderWheel(), 150);

    if (!this.listUnit.length || !this.listPartCategory.length) {
      this.getpopupdata(detail, () => this.seteditdata(item));
    } else {
      this.seteditdata(item);
    }
  }

  private seteditdata(part: SALOrderDetailPartItemCusDTO): void {
    if (!part || !part.TypeOfPart || !this.editingOrderDetail || !this.editingOrderDetail.Code || !this.listPartCategory.length) {
      this.subLoader.loader(false);
      return;
    }
    this.subLoader.loader(true);
    this.findTypeOfPartInCategories(part, 0);
  }

  onAddNew(): void {
    if (!FunctionPermissionDTO.master && !FunctionPermissionDTO.creator) return;
    this.resetPopupForm();
    this.editingPartItem = null;
    this.selectedDetailCodes = new Set<number>();
    this.listSalVehicleParts.forEach((v) => {
      if (v != null && v.Code != null) this.selectedDetailCodes.add(v.Code);
    });
    const orderDetail = this.listSalVehicleParts[0];
    if (!orderDetail || !orderDetail.Code) {
      this.notification.onError('Không có xe');
      return;
    }
    this.showPopup = true;
    this.meta.updateTag({ name: 'viewport', content: this.viewportNoZoom });
    setTimeout(() => this.attachPopupSliderWheel(), 150);
    if (!this.listUnit.length || !this.listPartCategory.length) {
      if (!this.isLoadingPopupData) this.getpopupdata(orderDetail);
    }
  }

  onSavePart(): void {
    if (!FunctionPermissionDTO.master && !FunctionPermissionDTO.creator) return;
    if (this.isSaving) return;
    if (!this.partcategory.Code || !this.typeofpart.Code || !this.selectedDetailCodes.size) {
      this.notification.onError('Chọn đủ thông tin');
      return;
    }
    if (this.isEditMode && this.editingPartItem && this.editingPartItem.Code && !this.isPartFormChanged() && this.selectedDetailCodes.size === 1) {
      this.onClosePopup();
      return;
    }
    const detailCodes = [...this.selectedDetailCodes];
    const calls = detailCodes.map((detailCode) => {
      const dto = this.buildPartItemDTO(detailCode);
      if (this.isEditMode && this.editingPartItem) {
        dto.Code = (detailCode === this.originalDetailCode) ? this.editingPartItem.Code : this.getExistingPartCode(detailCode);
      } else {
        dto.Code = 0;
      }
      return this.mtbikeapi.UpdateSALPartItem(dto);
    });
    this.isSaving = true;
    this.subLoader.loader(true);
    const sub = forkJoin(calls).subscribe({
      next: (results) => {
        this.isSaving = false;
        this.subLoader.loader(false);
        if (results.every((r) => r && r.StatusCode === 0)) {
          this.notification.onSuccess('Thành công');
          this.refreshlist();
          this.onClosePopup();
        } else {
          const err = results.find((r) => r && r.StatusCode !== 0);
          this.notification.onError(err && err.ErrorString || 'Thất bại');
        }
      },
      error: (err) => { this.isSaving = false; this.subLoader.loader(false); this.notification.onError(err && err.message || 'Thất bại'); },
    });
    this.arrUnsubscribe.push(sub);
  }

  private getExistingPartCode(detailCode: number): number {
    const vehicle = this.listSalVehicleParts.find((v) => v.Code === detailCode);
    const parts = vehicle && (vehicle as any).ListPart ? (vehicle as any).ListPart : [];
    const existingPart = parts.find((p: any) => (p.TypeOfPart ?? p.typeOfPart) === this.editingPartItem.TypeOfPart);
    return existingPart && existingPart.Code ? existingPart.Code : 0;
  }

  onDeletePart(): void {
    if (!FunctionPermissionDTO.master && !FunctionPermissionDTO.creator) return;
    if (!this.isEditMode || !this.editingPartItem || !this.editingPartItem.Code) {
      this.onClosePopup();
      return;
    }
    if (this.isSaving) return;
    const detailCodes = [...this.selectedDetailCodes];
    const calls = detailCodes.map((detailCode) => {
      const dto = new SALOrderDetailPartItemCusDTO();
      dto.Code = (detailCode === this.originalDetailCode) ? this.editingPartItem.Code : this.getExistingPartCode(detailCode);
      dto.OrderDetail = detailCode;
      dto.TypeOfPart = this.editingPartItem.TypeOfPart;
      dto.IsChecked = false;
      return this.mtbikeapi.UpdateSALPartItem(dto);
    });
    this.isSaving = true;
    this.subLoader.loader(true);
    const sub = forkJoin(calls).subscribe({
      next: (results) => {
        this.isSaving = false;
        this.subLoader.loader(false);
        if (results.every((r) => r && r.StatusCode === 0)) {
          this.notification.onSuccess('Thành công');
          this.refreshlist();
          this.onClosePopup();
        } else {
          const err = results.find((r) => r && r.StatusCode !== 0);
          this.notification.onError(err && err.ErrorString || 'Thất bại');
        }
      },
      error: (err) => { this.isSaving = false; this.subLoader.loader(false); this.notification.onError(err && err.message || 'Thất bại'); },
    });
    this.arrUnsubscribe.push(sub);
  }

  private isPartFormChanged(): boolean {
    return this.editingPartItem != null && ((this.editingPartItem.Quantity !== (this.quantity ?? 0)) || (this.editingPartItem.UnitPrice !== (this.unitPrice ?? 0)));
  }

  private buildPartItemDTO(orderDetailCode: number): SALOrderDetailPartItemCusDTO {
    const dto = new SALOrderDetailPartItemCusDTO();
    dto.OrderDetail = orderDetailCode;
    dto.IsChecked = true;
    if (this.isEditMode && this.editingPartItem) {
      dto.TypeOfPart = this.editingPartItem.TypeOfPart ?? 0;
      dto.TypeOfPartSpecs = this.editingPartItem.TypeOfPartSpecs ?? 0;
      dto.BaseUnit = this.editingPartItem.BaseUnit ?? 0;
      dto.TypeOfPartName = this.editingPartItem.TypeOfPartName ?? '';
    } else {
      dto.TypeOfPart = (this.typeofpart && this.typeofpart.Code) || 0;
      dto.TypeOfPartName = (this.typeofpart && this.typeofpart.TypeOfPart) || '';
      dto.TypeOfPartSpecs = (this.typeofpartspecs && this.typeofpartspecs.Code) || 0;
      dto.BaseUnit = (this.unit && (this.unit as any).Code) || 0;
    }
    dto.Quantity = this.quantity ?? 0;
    dto.UnitPrice = this.unitPrice ?? 0;
    return dto;
  }

  private refreshlist(): void {
    if (this.retailMaster && this.retailMaster.Code) {
      const p = new SALOrderDetailCusDTO();
      p.Master = this.retailMaster.Code;
      this.GetListSALVehicleParts(p);
    }
  }

  private resetPopupForm(): void {
    this.isEditMode = false;
    this.editingPartItem = null;
    this.originalDetailCode = null;
    this.editingOrderDetail = null;
    this.isSaving = false;
    this.partcategory = Object.assign(new LSPartCategoryCusDTO(), { Code: null, Category: '' });
    this.typeofpart = new LSTypeOfPartCusDTO();
    (this.typeofpart as any).Code = null;
    this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
    (this.typeofpartspecs as any).Code = null;
    this.unit = new ListDTO();
    (this.unit as any).Code = null;
    this.unit.ListName = '';
    this.quantity = 1;
    this.unitPrice = null;
    this.listTypeOfPart = [];
    this.listTypeOfPartSpecs = [];
    this.partFilterApplied = false;
    this.applicableVehicleCodes = [];
  }
  //#endregion

  //#region api
  private getVehicleGroups(vehicles: SALOrderDetailCusDTO[]): { key: string; representative: SALOrderDetailCusDTO; codes: number[] }[] {
    const map = new Map<string, { key: string; representative: SALOrderDetailCusDTO; codes: number[] }>();
    for (const v of vehicles) {
      if (!v || !v.Code) continue;
      const key = `${v.TypeOfVehicleName}|${v.VehicleName}`;
      if (!map.has(key)) {
        map.set(key, { key, representative: v, codes: [] });
      }
      map.get(key)!.codes.push(v.Code);
    }
    return Array.from(map.values());
  }

  private loadApplicableVehicles(): void {
    if (!this.typeofpart || !this.typeofpart.Code) {
      this.partFilterApplied = true;
      if (this.partcategory && this.partcategory.Code) {
        const mapped = this.categoryVehicleMap.get(this.partcategory.Code) || [];
        this.applicableVehicleCodes = mapped.length > 0
          ? mapped
          : this.listSalVehicleParts.filter(v => v && v.Code).map(v => v.Code);
        this.selectedDetailCodes = new Set(this.applicableVehicleCodes);
      } else {
        this.applicableVehicleCodes = [];
        this.selectedDetailCodes = new Set();
      }
      return;
    }
    
    const validSet = this.typeVehicleMap.get(this.typeofpart.Code);
    if (validSet && validSet.size > 0) {
      this.applicableVehicleCodes = Array.from(validSet);
      this.partFilterApplied = true;
      const stillSelected = [...this.selectedDetailCodes].filter((c) => this.applicableVehicleCodes.includes(c));
      if (stillSelected.length > 0) {
        this.selectedDetailCodes = new Set(stillSelected);
      } else {
        this.selectedDetailCodes = new Set(this.applicableVehicleCodes);
      }
    } else {
      this.partFilterApplied = true;
      this.applicableVehicleCodes = [];
    }
  }

  private GetListSALVehicleParts(param: SALOrderDetailCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALVehicleParts(param).subscribe(
      (res) => {
        this.subLoader.loader(false);
        if (res != null && res.StatusCode === 0 && res.ObjectReturn != null) {
          const raw = res.ObjectReturn;
          const data = Array.isArray(raw) ? raw : (raw as any).Data ?? [];
          this.listSalVehicleParts = Array.isArray(data) ? data : [];
          this.statusByCode = {};
          this.listSalVehicleParts.forEach((d) => {
            this.statusByCode[d.Code] = this.getStatusContext(d);
          });
          this.getunitandcategory();
        } else {
          this.listSalVehicleParts = [];
          this.statusByCode = {};
          if (res != null && res.ErrorString) this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.listSalVehicleParts = [];
        this.statusByCode = {};
        this.notification.onError(err && err.message || 'Lỗi tải danh sách');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private getunitandcategory(): void {
    const detail = this.listSalVehicleParts[0];
    if (!detail || !detail.Code || (this.listUnit.length && this.listPartCategory.length)) return;
    this.getpopupdata(detail);
  }

  private getpopupdata(detail: SALOrderDetailCusDTO, callback?: () => void): void {
    if (this.isLoadingPopupData) return;
    this.isLoadingPopupData = true;
    this.subLoader.loader(true);
    const unit$ = CoreApiStaticService.GetListLSList
      ? this.coreApi.GetListLSList(LSListTypeDataEnum.Unit)
      : of(null);

    const categoryParam = { ...detail, TypeData: LSPartCategoryTypeDataEnum.VEHICLE } as SALOrderDetailCusDTO;
    const sub = forkJoin({ unit: unit$, partCategory: this.mtbikeapi.GetListSALPartCategory(categoryParam) }).subscribe({
      next: ({ unit: resLs, partCategory: resPart }) => {
        this.isLoadingPopupData = false;
        this.subLoader.loader(false);
        if (resLs && (resLs as any).StatusCode === 0) this.listUnit = this.toListUnit((resLs as any).ObjectReturn);
        if (resPart && resPart.StatusCode === 0) this.listPartCategory = this.toPartCategoryList(resPart.ObjectReturn);
        if (callback) callback();
      },
      error: () => {
        this.isLoadingPopupData = false;
        this.subLoader.loader(false);
        if (callback) callback();
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListSALTypeOfPart(): void {
    if (!this.partcategory || !this.partcategory.Code) return;

    const cacheKey = this.partcategory.Code || 0;
    const cachedTypes = this.typeOfPartCache[cacheKey];
    if (cachedTypes && cachedTypes.length > 0) {
      this.listTypeOfPart = this.toTypeOfPartList(cachedTypes.map((item) => ({ ...item })));
      this.listTypeOfPartSpecs = [];
      return;
    }

    this.subLoader.loader(true);
    const validVehicleCodes = this.categoryVehicleMap.get(this.partcategory.Code) || [];
    const validVehicles = validVehicleCodes.length > 0
      ? this.listSalVehicleParts.filter(v => v && v.Code && validVehicleCodes.includes(v.Code))
      : this.listSalVehicleParts.filter(v => v && v.Code);
    const groups = this.getVehicleGroups(validVehicles);

    if (groups.length === 0) {
      this.subLoader.loader(false);
      return;
    }

    const typeCalls = groups.map(g => {
      return this.mtbikeapi.GetListSALTypeOfPart({ OrderDetail: g.representative, Category: this.partcategory });
    });

    const sub = forkJoin(typeCalls).subscribe({
      next: (resArr) => {
        let allTypes: any[] = [];
        resArr.forEach((res, index) => {
          const group = groups[index];
          if (res && res.StatusCode === 0 && res.ObjectReturn) {
            const raw = res.ObjectReturn;
            const types = Array.isArray(raw) ? raw : (raw as any).Data ?? [];
            types.forEach((t: any) => {
               if (t && t.Code) {
                   if (!this.typeVehicleMap.has(t.Code)) this.typeVehicleMap.set(t.Code, new Set());
                   for (const code of group.codes) {
                       this.typeVehicleMap.get(t.Code)!.add(code);
                   }
               }
            });
            allTypes = [...allTypes, ...types];
          }
        });

        const uniqueTypes = [];
        const seenCodes = new Set();
        for (const t of allTypes) {
          if (t.Code && !seenCodes.has(t.Code)) {
            seenCodes.add(t.Code);
            uniqueTypes.push(t);
          }
        }

        this.listTypeOfPart = this.toTypeOfPartList(uniqueTypes as LSTypeOfPartCusDTO[]);
        this.typeOfPartCache[cacheKey] = (this.listTypeOfPart || []).map((item) => ({ ...item }));
        this.listTypeOfPartSpecs = [];

        this.subLoader.loader(false);
      },
      error: () => this.subLoader.loader(false)
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListSALTypeOfPartSpecs(param: LSTypeOfPartCusDTO): void {
    if (!param || !param.Code) return;

    const cacheKey = param.Code || 0;
    const cachedSpecs = this.typeOfPartSpecsCache[cacheKey];
    if (cachedSpecs && cachedSpecs.length > 0) {
      this.listTypeOfPartSpecs = cachedSpecs.map((item) => ({ ...item }));
      if (this.listTypeOfPartSpecs.length > 0) {
        this.typeofpartspecs = { ...this.listTypeOfPartSpecs[0] };
      }
      return;
    }

    this.subLoader.loader(true);
    const validVehicleCodes = Array.from(this.typeVehicleMap.get(param.Code) || []);
    const validVehicles = this.listSalVehicleParts.filter(v => v && v.Code && validVehicleCodes.includes(v.Code));
    const groups = this.getVehicleGroups(validVehicles);

    const specsCalls = groups.map(g => {
      return this.mtbikeapi.GetListSALTypeOfPartSpecs({ OrderDetail: g.representative, TypeOfPart: param });
    });

    const sub = forkJoin(specsCalls).subscribe({
      next: (resArr) => {
        let allSpecs: any[] = [];
        resArr.forEach((res) => {
          if (res && res.StatusCode === 0 && res.ObjectReturn) {
            const raw = res.ObjectReturn;
            const specs = Array.isArray(raw) ? raw : (raw as any).Data ?? [];
            allSpecs = [...allSpecs, ...specs];
          }
        });

        const uniqueSpecs = [];
        const seenCodes = new Set();
        for (const s of allSpecs) {
          if (s.Code && !seenCodes.has(s.Code)) {
            seenCodes.add(s.Code);
            uniqueSpecs.push(s);
          }
        }

        this.listTypeOfPartSpecs = uniqueSpecs;
        this.typeOfPartSpecsCache[cacheKey] = (this.listTypeOfPartSpecs || []).map((item) => ({ ...item }));

        if (this.listTypeOfPartSpecs.length > 0) {
          this.typeofpartspecs = { ...this.listTypeOfPartSpecs[0] };
        }
        this.subLoader.loader(false);
      },
      error: () => this.subLoader.loader(false)
    });
    this.arrUnsubscribe.push(sub);
  }

  private bindUnit(part: SALOrderDetailPartItemCusDTO): void {
    if (!part || !this.listUnit.length) return;
    const byCode = this.listUnit.find((u) => u.Code === (part.BaseUnit as any));
    if (byCode) {
      this.unit = { ...byCode } as ListDTO;
      return;
    }
    if (part.BaseUnitName) {
      const byName = this.listUnit.find((u) => (u.ListName || '').toLowerCase() === (part.BaseUnitName || '').toLowerCase());
      if (byName) {
        this.unit = { ...byName } as ListDTO;
        return;
      }
    }
    this.unit = new ListDTO();
    (this.unit as any).Code = (part.BaseUnit as any) || null;
    this.unit.ListName = part.BaseUnitName || '';
  }

  private findTypeOfPartInCategories(part: SALOrderDetailPartItemCusDTO, categoryIndex: number): void {
    if (!this.editingOrderDetail || categoryIndex >= this.listPartCategory.length) {
      this.subLoader.loader(false);
      return;
    }
    const currentCategory = this.listPartCategory[categoryIndex];
    const typeState = { OrderDetail: this.editingOrderDetail, Category: currentCategory };

    const cachedTypes = this.typeOfPartCache[currentCategory.Code || 0];
    const handleTypes = (typesOfPart: LSTypeOfPartCusDTO[]) => {
      const list = this.toTypeOfPartList(typesOfPart || []);
      const selectedType = list.find((t) => t.Code === part.TypeOfPart);
      if (selectedType) {
        this.partcategory = { ...currentCategory } as LSPartCategoryCusDTO;
        this.listTypeOfPart = list;
        this.typeofpart = { ...selectedType } as LSTypeOfPartCusDTO;

        const bindData = () => {
          this.bindUnit(part);
          this.loadApplicableVehicles();
          this.subLoader.loader(false);
        };
        if (part.TypeOfPartSpecs > 0) {
          const specsCache = this.typeOfPartSpecsCache[selectedType.Code || 0];
          if (specsCache && specsCache.length > 0) {
            this.listTypeOfPartSpecs = specsCache.map((item) => ({ ...item }));
            this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
            (this.typeofpartspecs as any).Code = part.TypeOfPartSpecs;
            bindData();
          } else {
            const subSpecs = this.mtbikeapi
              .GetListSALTypeOfPartSpecs({ OrderDetail: this.editingOrderDetail, TypeOfPart: selectedType })
              .subscribe(
                (resSpecs) => {
                  if (resSpecs && resSpecs.StatusCode === 0) {
                    this.listTypeOfPartSpecs = resSpecs.ObjectReturn || [];
                    this.typeOfPartSpecsCache[selectedType.Code || 0] = (this.listTypeOfPartSpecs || []).map((item) => ({ ...item }));
                    this.typeofpartspecs = new LSTypeOfPartSpecsDTO();
                    (this.typeofpartspecs as any).Code = part.TypeOfPartSpecs;
                  }
                  bindData();
                },
                bindData
              );
            this.arrUnsubscribe.push(subSpecs);
          }
        } else {
          bindData();
        }
      } else {
        this.subLoader.loader(false);
        this.findTypeOfPartInCategories(part, categoryIndex + 1);
      }
    };

    if (cachedTypes && cachedTypes.length > 0) {
      this.subLoader.loader(false);
      handleTypes(cachedTypes.map((item) => ({ ...item })));
      return;
    }

    if (categoryIndex > 0) this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALTypeOfPart(typeState).subscribe(
      (res) => {
        if (res && res.StatusCode === 0) {
          const typesOfPart = (res.ObjectReturn || []) as LSTypeOfPartCusDTO[];
          this.typeOfPartCache[currentCategory.Code || 0] = typesOfPart.map((item) => ({ ...item }));
          handleTypes(typesOfPart);
        } else {
          this.subLoader.loader(false);
          this.findTypeOfPartInCategories(part, categoryIndex + 1);
        }
      },
      () => {
        this.subLoader.loader(false);
        this.findTypeOfPartInCategories(part, categoryIndex + 1);
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region logic
  private toListUnit(raw: any): ListDTO[] {
    const arr = Array.isArray(raw) ? raw : (raw && raw.Data) || (raw && raw.List) || [];
    return arr.map((x: any) => Object.assign(new ListDTO(), { ...x, Code: x.Code ?? x.code, ListName: (x.ListName ?? x.listName ?? '').toString().trim() }));
  }

  private toPartCategoryList(raw: any): LSPartCategoryCusDTO[] {
    const arr = Array.isArray(raw) ? raw : (raw && raw.Data) || (raw && raw.List) || [];
    return arr.map((x: any) => Object.assign(new LSPartCategoryCusDTO(), { ...x, Code: x.Code ?? x.code, Category: x.Category ?? x.CategoryName ?? x.category ?? '', CategoryName: x.CategoryName ?? x.Category ?? x.category ?? '' }));
  }

  private toTypeOfPartList(list: LSTypeOfPartCusDTO[]): LSTypeOfPartCusDTO[] {
    return (list || []).map((x) => ({ ...x, TypeOfPart: (x.TypeOfPart ?? (x as any).typeOfPart ?? '').toString() })) as LSTypeOfPartCusDTO[];
  }
  //#endregion
}
