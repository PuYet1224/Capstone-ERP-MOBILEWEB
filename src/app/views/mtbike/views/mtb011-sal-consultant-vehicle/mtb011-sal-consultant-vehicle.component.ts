import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { LSPartCategoryCusDTO } from 'src/app/models/dtos/e-dtos/ls-part-category.dto';
import { LSVehicleColorCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle-color.dto';
import { LSVehicleCusDTO } from 'src/app/models/dtos/e-dtos/ls-vehicle.dto';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALVehicleCusDTO } from 'src/app/models/dtos/e-dtos/sal-vehicle.dto.';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
@Component({
  selector: 'mtb011-sal-consultant-vehicle',
  templateUrl: './mtb011-sal-consultant-vehicle.component.html',
  styleUrls: ['./mtb011-sal-consultant-vehicle.component.scss'],
})
export class Mtb011SalConsultantVehicleComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private sanitizer: DomSanitizer,
  ) { }

  //#region LIFECYCLE
  ngOnInit(): void {
    var tempp = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
    this.headCode = this.cache.parseValue(tempp);

    var temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    let retailMaster = this.cache.parseValue(temp);
    this.masterId = retailMaster.Code;
    this.detailVehicle.Master = retailMaster.Code;
    this.retailMaster = retailMaster;
    this.listsortcopy = this.listsort.filter(item => item.Code == 1 || item.Code == 2);
    this.currentSortCode = 1;
    this.GetListSALVehicle(this.filter);
    this.GetListVehicleOptions();
    this.salorderdetail.Master = retailMaster.Code;
    this.salordermaster.Code = retailMaster.Code;
    this.onSortChange(this.currentSortCode);
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  ngAfterViewInit(): void {
    this.enableAutoSlide();
  }
  //#endregion

  private arrUnsubscribe: Subscription[] = [];
  public showpopup: boolean = false;
  public comparepopup: boolean = false;
  public headCode: any;
  public retailMaster: SALOrderMasterCusDTO;
  public showpopupcompare: boolean = false;
  public collapse: boolean = false;
  public listcategory: LSPartCategoryCusDTO[] = [];
  public listSalVehicle: LSVehicleCusDTO[] = [];
  public masterId: number;
  public OrderTotal: number = 0;
  public CompareTotal: number = 0;
  public filter: State = {
    filter: {
      logic: 'and', filters: []
    }
  };
  public liseVehicleCategory: {
    ListVehicleCategory: any[];
    ListTypeOfVehicle: any[];
    ListGroupVehicleColor: any[];
    PriceRange: { MinPrice: number; MaxPrice: number };
  } = {
    ListVehicleCategory: [],
    ListTypeOfVehicle: [],
    ListGroupVehicleColor: [],
    PriceRange: { MinPrice: 0, MaxPrice: 0 }
  };
  public salVehicle: SALVehicleCusDTO = new SALVehicleCusDTO();
  public selectedCode: number | null = null;
  public salordermaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public salorderdetail: SALOrderDetailCusDTO = new SALOrderDetailCusDTO();
  public detailVehicle: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public salCompare: any[] = [];
  public compareVehicles = [];
  public totalQuantityCare: number;
  public canBuyDetail: boolean;
  public canTransferDetail: boolean;
  public canBuyCompare: boolean;
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public SALOrderDetailTypeDataEnum = SALOrderDetailTypeDataEnum;
  private vehicleColorCache = new Map<string, LSVehicleColorCusDTO>();
  public listStock: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();

  //#region HEADER
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

  public show: boolean = false;
  onFocus() {
    this.show = true;
  }


  //#region APPLY FILTER
  public isFilterApplied: boolean = false;
  public onClose(): void {
    this.updateTags();
    this.show = false;

    const filters: any[] = [];

    if (this.selectedCategoryCodes.length > 0) {
      filters.push({
        logic: 'or',
        filters: this.selectedCategoryCodes.map(code => ({
          field: 'Category',
          operator: 'eq',
          value: code
        }))
      });
    }

    if (this.selectedVehicleCodes.length > 0) {
      filters.push({
        logic: 'or',
        filters: this.selectedVehicleCodes.map(code => ({
          field: 'TypeOfVehicle',
          operator: 'eq',
          value: code
        }))
      });
    }

    if (this.keyword && this.keyword.trim() !== '') {
      const searchStr = this.keyword.trim();
      filters.push({
        logic: 'or',
        filters: [
          {
            field: 'VehicleName',
            operator: 'contains',
            value: searchStr,
            ignoreCase: true
          },
          {
            field: 'ColorName',
            operator: 'contains',
            value: searchStr,
            ignoreCase: true
          }
        ]
      });
    }

    if (this.selectedColorNames.length > 0) {
      filters.push({
        logic: 'or',
        filters: this.selectedColorNames.map(name => ({
          field: 'ColorName',
          operator: 'contains',
          value: name
        }))
      });
    }

    filters.push({ field: 'Price', operator: 'gte', value: this.minValue });
    filters.push({ field: 'Price', operator: 'lte', value: this.maxValue });

    if (this.isFollowFilter) {
      filters.push({ field: 'IsFollow', operator: 'eq', value: true });
    }

    if (this.isCartFilter) {
      filters.push({ field: 'IsSelected', operator: 'eq', value: true });
    }

    this.filter.filter.filters = filters;

    const isPriceFiltered = this.minValue !== this.min || this.maxValue !== this.max;

    this.isFilterApplied = this.selectedColorNames.length > 0 || this.isFollowFilter || this.isCartFilter;

    const isNextMode2 = !!(this.selectedColorNames.length > 0 || this.isFollowFilter || this.isCartFilter || isPriceFiltered);
    const isCurrentMode2 = this.listsortcopy.length > 2;
    if (isCurrentMode2 !== isNextMode2) {
      this.onSortChange(1);
    }
    if (isNextMode2) {
      this.listsortcopy = [...this.listsort];
    } else {
      this.listsortcopy = [...this.listsort].filter(item => item.Code === 1 || item.Code === 2);
    }

    this.isFilterApplied = isNextMode2;
    this.GetListSALVehicle(this.filter);
  }
  //#end region

  mockSpecificationsMatrix: any
  //endregion

  //#region CART
  //
  //
  public isCartFilter: boolean = false;

  onCartFilter() {
    this.isCartFilter = !this.isCartFilter;
    this.onClose();
  }
  //#endregion

  //#region FAVOURITE
  //
  //
  public isFollowFilter: boolean = false;

  onFavoriteFilter() {
    this.isFollowFilter = !this.isFollowFilter;
    this.onClose();
  }
  //#endregion

  //#region POPUP lựa chọn các options
  //
  //
  // START CATEGORY ===================================
  public keyword: string = '';
  public activeTags: string[] = [];
  public selectedCategoryCodes: number[] = [];
  public selectedVehicleCodes: number[] = [];
  public selectedColorNames: string[] = [];
  public filteredTypeOfVehicle: any[] = [];
  public filteredVehicleColors: any[] = [];

  updateTags() {
    const tags: string[] = [];
    if (this.keyword && this.keyword.trim() !== '') {
      tags.push(this.keyword.trim());
    }

    // 1. Gom tất cả Phân nhóm xe đã chọn vào 1 chuỗi: "Xe ga, Xe số"
    if (this.selectedCategoryCodes.length > 0) {
      const categories = this.liseVehicleCategory.ListVehicleCategory
        .filter((c: any) => this.selectedCategoryCodes.includes(c.Code))
        .map((c: any) => c.Category)
        .join(', ');
      tags.push(categories);
    }

    // 2. Gom tất cả Dòng xe đã chọn vào 1 chuỗi: "SH350i, ADV350"
    if (this.selectedVehicleCodes.length > 0) {
      const vehicles = this.liseVehicleCategory.ListTypeOfVehicle
        .filter((v: any) => this.selectedVehicleCodes.includes(v.Code))
        .map((v: any) => v.TypeOfVehicle)
        .join(', ');
      tags.push(vehicles);
    }

    // 3. Gom tất cả Màu xe đã chọn vào 1 chuỗi: "Đỏ, Đen, Trắng"
    if (this.selectedColorNames.length > 0) {
      tags.push(this.selectedColorNames.join(', '));
    }

    // 4. Gom Khoảng giá
    if (this.minValue > this.min || this.maxValue < this.max) {
      const formatPrice = (val: number) => (val / 1000000).toFixed(0) + 'tr';
      tags.push(`${formatPrice(this.minValue)} - ${formatPrice(this.maxValue)}`);
    }

    this.activeTags = tags;
  }

  toggleCategory(categoryCode: number) {
    const index = this.selectedCategoryCodes.indexOf(categoryCode);
    index > -1 ? this.selectedCategoryCodes.splice(index, 1) : this.selectedCategoryCodes.push(categoryCode);

    this.sortAll();
  }

  toggleVehicleType(vehicleCode: number) {
    const index = this.selectedVehicleCodes.indexOf(vehicleCode);
    index > -1 ? this.selectedVehicleCodes.splice(index, 1) : this.selectedVehicleCodes.push(vehicleCode);

    this.sortAll();
  }

  toggleColor(colorName: string) {
    const index = this.selectedColorNames.indexOf(colorName);
    if (index > -1) {
      this.selectedColorNames.splice(index, 1);
    } else {
      this.selectedColorNames.push(colorName);
    }
  }

  isColorHighlighted(color: any): boolean {
    return this.selectedColorNames.includes(color.ColorName);
  }

  sortAll() {
    this.sortTypeOfVehicle();
    this.sortVehicleColors();
  }

  sortTypeOfVehicle() {
    const list = [...this.liseVehicleCategory.ListTypeOfVehicle];
    this.filteredTypeOfVehicle = list.sort((a, b) => {
      const indexA = this.selectedCategoryCodes.indexOf(a.Category);
      const indexB = this.selectedCategoryCodes.indexOf(b.Category);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }

  sortVehicleColors() {
    const colorList = [...this.liseVehicleCategory.ListGroupVehicleColor];

    this.filteredVehicleColors = colorList.sort((a, b) => {
      // Kiểm tra màu 'a' có thuộc Dòng xe hoặc Phân nhóm đang chọn không
      const aHasSelectedVehicle = a.ListTypeOfVehicle.some(v => this.selectedVehicleCodes.includes(v));
      const aHasSelectedCategory = a.ListCategory.some(c => this.selectedCategoryCodes.includes(c));

      // Kiểm tra màu 'b'
      const bHasSelectedVehicle = b.ListTypeOfVehicle.some(v => this.selectedVehicleCodes.includes(v));
      const bHasSelectedCategory = b.ListCategory.some(c => this.selectedCategoryCodes.includes(c));

      // Ưu tiên 1 (Dòng xe): 2 điểm
      // Ưu tiên 2 (Phân nhóm): 1 điểm
      const scoreA = (aHasSelectedVehicle ? 2 : 0) + (aHasSelectedCategory ? 1 : 0);
      const scoreB = (bHasSelectedVehicle ? 2 : 0) + (bHasSelectedCategory ? 1 : 0);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return 0;
    });
  }

  clearCategoryFilter() {
    this.selectedCategoryCodes = [];
    this.sortAll();
  }

  clearVehicleTypeFilter() {
    this.selectedVehicleCodes = [];
    this.sortAll();
  }

  clearColorFilter() {
    this.selectedColorNames = [];
  }

  clearPriceFilter() {
    this.minValue = this.min;
    this.maxValue = this.max;
    this.onMinChange();
    this.onMaxChange();
  }

  clearAllFilters() {
    this.keyword = '';
    this.selectedCategoryCodes = [];
    this.selectedVehicleCodes = [];
    this.selectedColorNames = [];
    this.clearPriceFilter();
    this.minValue = this.min;
    this.maxValue = this.max;
    this.isFilterApplied = false;
    this.activeTags = [];
    this.sortAll();
  }

  // START RANGE SLIDER ===================================
  min = 0;
  max = 0;
  minValue = 0;
  maxValue = 0;
  get lineStyle() {
    return {
      'left': this.calcLeftPosition(this.minValue) + '%',
      'right': (100 - this.calcLeftPosition(this.maxValue)) + '%'
    };
  }

  get thumbMinStyle() {
    return { 'left': this.calcLeftPosition(this.minValue) + '%' };
  }

  get thumbMaxStyle() {
    return { 'left': this.calcLeftPosition(this.maxValue) + '%' };
  }

  onMinInputChange(value: number) {
    const newValue = Number(value);

    if (newValue < this.min) {
      this.minValue = this.min;
    } else if (newValue > this.maxValue) {
      this.minValue = this.maxValue;
    } else {
      this.minValue = newValue;
    }
  }

  onMaxInputChange(value: number) {
    const newValue = Number(value);

    if (newValue > this.max) {
      this.maxValue = this.max;
      return;
    } else if (newValue < this.minValue) {
      this.maxValue = this.minValue;
    } else {
      this.maxValue = newValue;
    }
  }

  calcLeftPosition(value: number): number {
    return (100 / (this.max - this.min)) * (value - this.min);
  }

  onMinChange() {
    const newValue = Number(this.minValue);
    if (newValue > this.maxValue) {
      this.minValue = this.maxValue;
    } else {
      this.minValue = newValue;
    }
  }
  onMaxChange() {
    const newValue = Number(this.maxValue);
    if (newValue < this.minValue) {
      this.maxValue = this.minValue;
    } else {
      this.maxValue = newValue;
    }
  }
  // END RANGE SLIDER ===================================

  // API ======================================================
  private GetListVehicleOptions() {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListVehicleOptions().subscribe(res => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn || {};
        this.liseVehicleCategory = {
          ListVehicleCategory: data.ListVehicleCategory || [],
          ListTypeOfVehicle: data.ListTypeOfVehicle || [],
          ListGroupVehicleColor: data.ListGroupVehicleColor || [],
          PriceRange: data.PriceRange || { MinPrice: 0, MaxPrice: 0 }
        };

        this.filteredTypeOfVehicle = [...this.liseVehicleCategory.ListTypeOfVehicle];
        this.filteredVehicleColors = [...this.liseVehicleCategory.ListGroupVehicleColor];

        this.min = this.liseVehicleCategory.PriceRange.MinPrice;
        this.max = this.liseVehicleCategory.PriceRange.MaxPrice;
        this.minValue = this.liseVehicleCategory.PriceRange.MinPrice;
        this.maxValue = this.liseVehicleCategory.PriceRange.MaxPrice;

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy lựa chọn: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy lựa chọn: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endgerion

  //#region POPUP SORT
  public currentSortCode: number = 1;
  public listsort: any[] = [
    { Code: 1, Name: 'A-Z' },
    { Code: 2, Name: 'Z-A' },
    { Code: 3, Name: 'Giá thấp đến cao' },
    { Code: 4, Name: 'Giá cao đến thấp' }
  ]
  public listsortcopy = [...this.listsort];

  onSortChange(sortCode: number) {
    this.currentSortCode = sortCode;

    if (sortCode == 3 || sortCode == 4) {
      this.sortDataByPrice(sortCode);
    }
    else if (sortCode === 1 || sortCode == 2) {
      this.sortDataByName(sortCode);
    }
  }

  sortDataByPrice(sortCode: number) {

    this.listSalVehicle.forEach(card => {
      card.ListVehicleColor.sort((a, b) => {
        return sortCode == 3
          ? a.Price - b.Price
          : b.Price - a.Price;
      });
    });

    this.listSalVehicle.sort((a, b) => {
      return sortCode == 3
        ? a.MinPrice - b.MinPrice
        : b.MaxPrice - a.MaxPrice;
    });
  }

  sortDataByName(sortCode: number) {
    this.listSalVehicle.sort((a, b) => {
      const nameA = a.VehicleName.toLowerCase();
      const nameB = b.VehicleName.toLowerCase();
      if (sortCode === 1) return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
  }
  //#endregion

  //#region xem chi tiết/thu gọn
  collapsedMap = new Map<number, boolean>();

  toggleCard(index: number) {
    this.collapsedMap.set(index, !this.collapsedMap.get(index));
  }

  isCollapsed(index: number): boolean {
    return this.collapsedMap.get(index) ?? false;
  }
  //#endregion

  //#region POPUP COMPARE
  public specColumns: any[] = [];
  public rowLabels: string[] = [];


  @ViewChildren('specRow', { read: ElementRef })
  specRows!: QueryList<ElementRef<HTMLDivElement>>;

  private syncing = false;



  onSpecRowScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (this.syncing) return;
    this.syncing = true;

    const scrollLeft = target.scrollLeft;

    // Sync wrapper chính
    // if (this.scrollWrapper.nativeElement.scrollLeft !== scrollLeft) {
    // this.scrollWrapper.nativeElement.scrollLeft = scrollLeft;
    // }

    // Sync các row khác
    this.specRows.forEach(row => {
      const el = row.nativeElement;
      if (el !== target && el.scrollLeft !== scrollLeft) {
        el.scrollLeft = scrollLeft;
      }
    });

    // Reset flag tương tự như trên
    window.requestAnimationFrame(() => {
      this.syncing = false;
    });
  }

  public onDropColumn(event: any) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) return;

    moveItemInArray(this.compareVehicles, previousIndex, currentIndex);
    this.compareVehicles = [...this.compareVehicles];

    if (this.mockSpecificationsMatrix) {
      this.mockSpecificationsMatrix.forEach(row => {
        if (row.listValue) {
          moveItemInArray(row.listValue, previousIndex, currentIndex);
          row.listValue = [...row.listValue];
        }
      });
      this.mockSpecificationsMatrix = [...this.mockSpecificationsMatrix];
    }
  }

  public onShowCompare() {
    const param = new SALOrderMasterCusDTO();
    param.Code = this.salorderdetail.Master;
    this.GetListSALCompareVehicleSpecs(param);
  }

  public onRemoveFromCompare(item: any) {
    if (!item) return;

    const colIndex = this.compareVehicles.findIndex(v => String(v.Code) === String(item.Code));

    if (colIndex > -1) {
      this.compareVehicles.splice(colIndex, 1);
      this.compareVehicles = [...this.compareVehicles];
      if (this.CompareTotal > 0) this.CompareTotal--;
      if (this.mockSpecificationsMatrix) {
        this.mockSpecificationsMatrix.forEach(row => {
          if (row.listValue) {
            row.listValue.splice(colIndex, 1);
            row.listValue = [...row.listValue];
          }
        });
        this.mockSpecificationsMatrix = [...this.mockSpecificationsMatrix];
      }

      if (this.CompareTotal === 0) this.comparepopup = false;
      item.IsCompare = false;

      const param = new SALOrderDetailCusDTO();
      param.Master = this.salorderdetail.Master;
      param.VehicleColor = item.Code;
      param.IsCompare = false;
      param.IsFollow = item.IsFollow;
      param.TypeData = null;

      this.UpdateSALDetail(param);
    }
  }

  private GetListSALCompareVehicleSpecs(param: SALOrderMasterCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListSALCompareVehicleSpecs(param).subscribe(res => {
      if (res.StatusCode === 0) {
        const vehicleIds = res.ObjectReturn.Matrix[0].listValue;

        this.compareVehicles = vehicleIds.map(id => {
          const key = String(id);
          return this.vehicleColorCache.get(key) || null;
        });

        this.mockSpecificationsMatrix = res.ObjectReturn.Matrix.slice(1);

        this.rowLabels = this.mockSpecificationsMatrix.map(row => row.label);

        this.subLoader.loader(false);
      }
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion

  //#region BODY
  //
  //
  public onBuyVehicle(v: any, type: SALOrderDetailTypeDataEnum) {
    if (!v.ActionHistory) v.ActionHistory = [];

    if (type === SALOrderDetailTypeDataEnum.BUY) {
      if (v.ListStock[0].Quantity > 0) {
        v.ListStock[0].Quantity--;
        v.BuyQuantity = (v.BuyQuantity || 0) + 1;
      }
    } else if (type === SALOrderDetailTypeDataEnum.TRANSFER) {
      if (v.ListStock[1].Quantity > 0) {
        v.ListStock[1].Quantity--;
        v.TransferQuantity = (v.TransferQuantity || 0) + 1;
      }
    } else if (type === SALOrderDetailTypeDataEnum.BOOK) {
      v.BookingQuantity = (v.BookingQuantity || 0) + 1;
    }

    if (!v.IsCompare) {
      this.CompareTotal++;
    }

    this.OrderTotal++;
    v.ActionHistory.push(type);

    v.IsSelected = true;
    v.IsCompare = true;
    v.IsFollow = true;

    const param = new SALOrderDetailCusDTO();
    param.Master = this.salorderdetail.Master;
    param.VehicleColor = v.Code;
    param.TypeData = type;
    param.IsCompare = v.IsCompare;
    param.IsFollow = v.IsFollow;
    this.UpdateSALDetail(param);
  }

  public onToggleCompare(item: any) {
    item.IsCompare = !item.IsCompare;
    if (item.IsCompare) {
      item.IsFollow = true;
      this.CompareTotal++;
    } else {
      if (this.CompareTotal > 0) this.CompareTotal--;
    }

    const param = new SALOrderDetailCusDTO();
    param.Master = this.salorderdetail.Master;
    param.VehicleColor = item.Code;
    param.IsCompare = item.IsCompare;
    param.IsFollow = item.IsFollow;
    param.TypeData = null;

    this.UpdateSALDetail(param);
  }

  public onToggleFollow(item: any) {
    item.IsFollow = !item.IsFollow;

    if (this.isFollowFilter && !item.IsFollow) {
      this.removeVehicleFromLocalList(item.Code);
    }
    const param = new SALOrderDetailCusDTO();
    param.Master = this.salorderdetail.Master;
    param.VehicleColor = item.Code;
    param.IsCompare = item.IsCompare;
    param.IsFollow = item.IsFollow;
    param.TypeData = null;

    this.UpdateSALDetail(param);
  }

  get currentCompareCount(): number {
    const count = this.CompareTotal || 0;
    if (count < 2) { this.comparepopup = false; }
    return count;
  }

  public onDeleteVehicle(v: any) {
    const totalInCart = (v.BuyQuantity || 0) + (v.TransferQuantity || 0) + (v.BookingQuantity || 0);

    if (totalInCart > 0 && v.ActionHistory && v.ActionHistory.length > 0) {
      const lastAction = v.ActionHistory.pop();

      if (lastAction === SALOrderDetailTypeDataEnum.BUY) {
        if (v.ListStock && v.ListStock[0]) v.ListStock[0].Quantity++;
        v.BuyQuantity--;
      } else if (lastAction === SALOrderDetailTypeDataEnum.TRANSFER) {
        if (v.ListStock && v.ListStock[1]) v.ListStock[1].Quantity++;
        v.TransferQuantity--;
      } else if (lastAction === SALOrderDetailTypeDataEnum.BOOK) {
        v.BookingQuantity--;
      }

      if (this.OrderTotal > 0) this.OrderTotal--;

      const newTotal = (v.BuyQuantity || 0) + (v.TransferQuantity || 0) + (v.BookingQuantity || 0);
      if (newTotal === 0) {
        v.IsSelected = false; //

        if (this.isCartFilter) {
          this.removeVehicleFromLocalList(v.Code);
        }
      }

      const param = new SALOrderDetailCusDTO();
      param.Master = this.salorderdetail.Master;
      param.VehicleColor = v.Code;
      param.TypeData = lastAction;
      this.DeleteSALDetail(param);
    }
  }

  private removeVehicleFromLocalList(vehicleColorCode: any) {
    this.listSalVehicle = this.listSalVehicle.map(card => {
      const updatedList = card.ListVehicleColor.filter(item =>
        String(item.Code) !== String(vehicleColorCode)
      );

      return {
        ...card,
        ListVehicleColor: updatedList
      };
    }).filter(card => card.ListVehicleColor && card.ListVehicleColor.length > 0);
  }
  //
  //
  private GetListSALVehicle(param: State) {
    this.subLoader.loader(true);
    const params = {
      Master: this.masterId,
      ...param
    };
    const sub = this.mtbikeapi.GetListSALVehicle(params).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listSalVehicle = res.ObjectReturn.Data;
        this.listSalVehicle.forEach(card => {
          card.ListVehicleColor?.forEach((item: any) => {
            item.ActionHistory = [];

            if (item.BuyQuantity > 0) {
              for (let i = 0; i < item.BuyQuantity; i++)
                item.ActionHistory.push(SALOrderDetailTypeDataEnum.BUY);
            }
            if (item.TransferQuantity > 0) {
              for (let i = 0; i < item.TransferQuantity; i++)
                item.ActionHistory.push(SALOrderDetailTypeDataEnum.TRANSFER);
            }
            if (item.BookingQuantity > 0) {
              for (let i = 0; i < item.BookingQuantity; i++)
                item.ActionHistory.push(SALOrderDetailTypeDataEnum.BOOK);
            }

            item.IsSelected = item.ActionHistory.length > 0;
            this.vehicleColorCache.set(String(item.Code), item);
          });
        });
        this.OrderTotal = res.ObjectReturn.OrderTotal;
        this.CompareTotal = res.ObjectReturn.CompareTotal;
        // this.totalQuantityCare = this.listSalVehicle[0].TotalQuantityCare || 0;

        if (this.totalQuantityCare == 0 && this.showpopupcompare == true) {
          this.showpopupcompare = false;
        }
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách xe: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  //endregion

  //#region FOOTER
  onNavigate(field: string) {
    this.router.navigate([field]);
  }

  onCancel() {
    if (this.retailMaster && this.retailMaster.Code > 0) {
      if (!confirm('Bạn có chắc chắn muốn hủy giao dịch này không?')) {
        return;
      }

      const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
        ListDTO: [this.retailMaster],
        Status: 6 // CANCEL
      };

      this.subLoader.loader(true);
      const sub = this.mtbikeapi.UpdateSALStatus(param).subscribe(res => {
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
  //endregion

  //#region POPUP STOCK
  //
  //
  public onGetStock(item) {
    const param = new SALOrderDetailCusDTO();
    param.Master = this.salorderdetail.Master;
    param.VehicleColor = item.Code;
    this.GetListStockForOrder(param);
  }
  //
  //
  private GetListStockForOrder(param: SALOrderDetailCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetListStockForOrder(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listStock = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách head tồn: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách head tồn: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion




  //#region CALL API
  //
  //
  private UpdateSALDetail(param: SALOrderDetailCusDTO) {
    this.subLoader.loader(true);
    // param.DeliveryStatus = null;
    const sub = this.mtbikeapi.UpdateSALDetail(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.notification.onSuccess(`Thành công`);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateSALStatus(param: UpdateStatusInterface<SALOrderMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.UpdateSALStatus(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.subLoader.loader(false);
          this.retailMaster.Status = param.Status;
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


  private DeleteSALDetail(param: SALOrderDetailCusDTO) {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.DeleteSALDetail(param).subscribe(res => {
      if (res.StatusCode === 0) {
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật: ${res.ErrorString}`);
      }
    }, err => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật: ${err.message}`);
    });
    this.arrUnsubscribe.push(sub);
  }

  sanitizeImageUrl(url: string): SafeUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustUrl('');
    return this.sanitizer.bypassSecurityTrustUrl(url.replace('unsafe:', ''));
  }
}
