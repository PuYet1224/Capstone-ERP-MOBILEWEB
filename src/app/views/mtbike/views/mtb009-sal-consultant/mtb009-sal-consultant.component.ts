import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FilterDescriptor, State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
interface SALOrderMasterGroup {
  Type: number;
  NameType: string;
  Quantity: number;
  ListData: SALOrderMasterCusDTO[];
}
@Component({
  selector: 'mtb009-sal-consultant',
  templateUrl: './mtb009-sal-consultant.component.html',
  styleUrls: ['./mtb009-sal-consultant.component.scss'],
})
export class Mtb009SalConsultantComponent implements OnDestroy, OnInit {
  [x: string]: any;
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private config: GetConfigService,
    private router: Router,
  ) { }
  //#region life circle 
  private arrUnsubscribe: Subscription[] = [];
  public isOpenedFilter: boolean = false;
  public userId: any;
  public tabactive: number = 1;
  openSet = new Set<number>();
  public listRetailMaster: SALOrderMasterGroup[] = [];
  public NameType: string = 'Mới';
  public itemworkordermaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public searchKeyword: string = '';
  public searchKeywordcopy: string = '';
  // public type = SALOrderMasterStatusRetailEnum.NEW;
  public SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
  public FunctionPermissionDTO = FunctionPermissionDTO;
  public statusFilters: FilterDescriptor[] = [];

  public progressStatusTree: any[] = [
    {
      Status: SALOrderMasterStatusRetailEnum.NEW,
      StatusName: 'Mới',
      IsActive: true
    },
    {
      Status: SALOrderMasterStatusRetailEnum.RETURN,
      StatusName: 'Trả về',
      IsActive: true
    },
    {
      Status: SALOrderMasterStatusRetailEnum.PENDING,
      StatusName: 'Chờ xử lý',
      IsActive: true
    },
    {
      Status: SALOrderMasterStatusRetailEnum.PROCESSING,
      StatusName: 'Đang xử lý',
      IsActive: true
    },
    {
      Status: SALOrderMasterStatusRetailEnum.COMPLETE,
      StatusName: 'Hoàn tất',
      IsActive: false
    },
    {
      Status: SALOrderMasterStatusRetailEnum.CANCEL,
      StatusName: 'Hủy giao dịch',
      IsActive: false
    }
  ];

  public customerInfo: any;
  public filter: State = {
    sort: [
      { field: 'Code', dir: 'desc' }
    ],
  };
  private isLoading = false;
  private isLastPage = false;
  @ViewChild('anchor', { static: true }) anchor: ElementRef;
  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
  private observer: IntersectionObserver;

  ngOnInit(): void {
    const userId = this.config.GetUser();
    this.userId = userId.Code;
    this.filter.filter = { logic: 'and', filters: [] };
    this.filter.filter.filters.push({
      logic: "or",
      filters: [
        { field: "Status", operator: "eq", value: SALOrderMasterStatusRetailEnum.NEW },
        { field: "Status", operator: "eq", value: SALOrderMasterStatusRetailEnum.RETURN },
        { field: "Status", operator: "eq", value: SALOrderMasterStatusRetailEnum.PENDING },
        { field: "Status", operator: "eq", value: SALOrderMasterStatusRetailEnum.PROCESSING }
      ]
    });
    this.filter.filter.filters.push({
      field: "SaleStaff",
      operator: "eq",
      value: this.userId
    });
    this.GetListSALMaster(this.filter);

  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  public onChangeType(type: number): void {
    this.filter.filter = { logic: 'and', filters: [] };
    this.listRetailMaster = [];
    this.tabactive = type;

    if (type == 1) {
      this.filter.filter.filters.push({
        field: "SaleStaff",
        operator: "eq",
        value: this.userId
      });
    } else if (type == 2) {
      this.filter.filter.filters.push({
        field: "SaleStaff",
        operator: "neq",
        value: this.userId
      });
    }

    if (this.statusFilters && this.statusFilters.length > 0) {
      this.filter.filter.filters.push({
        logic: 'or',
        filters: this.statusFilters
      });
    }
    this.GetListSALMaster(this.filter)
  }

  toggleItem(index: number) {
    if (this.openSet.has(index)) {
      this.openSet.delete(index);
    } else {
      this.openSet.add(index);
    }
  }

  isOpen(index: number): boolean {
    return this.openSet.has(index);
  }

  onSetItem(item: SALOrderMasterCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, item);
    // if (item.Status == SALOrderMasterStatusRetailEnum.VEHICLESELECTION) {
    //   this.router.navigate(['/mtbike/consultant/vehicle']);
    // } else if (item.Status == SALOrderMasterStatusRetailEnum.VEHICLEBUY) {
    //   this.router.navigate(['/mtbike/consultant/cart']);
    // } else if (item.Status == SALOrderMasterStatusRetailEnum.SUCCESS) {
    //   this.router.navigate(['/mtbike/consultant/cart']);
    // }
    // else {
    this.router.navigate(['/mtbike/consultant/detail']);
  }

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;
  }

  public onStatusFilterChange(filters: FilterDescriptor[]) {
    this.statusFilters = filters;
  }

  public onSearchTask() {
    this.openFilterPopup(false);

    this.isLastPage = false;

    const filters: any[] = [];

    // search
    if (this.searchKeyword.trim() !== '') {
      filters.push({
        logic: "or",
        filters: [
          { field: "ID", operator: "contains", value: this.searchKeyword },
          { field: "CustomerName", operator: "contains", value: this.searchKeyword },
          { field: "CustomerPhone", operator: "contains", value: this.searchKeyword }
        ]
      });
    }

    // status
    if (this.statusFilters && this.statusFilters.length > 0) {
      filters.push({
        logic: 'or',
        filters: this.statusFilters
      });
    }

    // SaleStaff filter
    this.searchKeywordcopy = this.searchKeyword;
    if (this.searchKeyword.trim() === '') {
      if (this.tabactive === 1) {
        filters.push({
          field: "SaleStaff",
          operator: "eq",
          value: this.userId
        });
      } else if (this.tabactive === 2) {
        filters.push({
          field: "SaleStaff",
          operator: "neq",
          value: this.userId
        });
      }
    }

    this.filter.filter = {
      logic: "and",
      filters
    };


    this.listRetailMaster = [];
    this.GetListSALMaster(this.filter);
  }


  onNavigate(field: string) {
    if (field == 'home') {
      this.router.navigate(['/menu']);
    } else {
      const newDTO = new SALOrderMasterCusDTO()
      this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, newDTO);
      this.router.navigate(['/mtbike/consultant/detail']);

    }
  }

  public static listCache = new Map<string, SALOrderMasterGroup[]>();
  public static clearCache() {
    Mtb009SalConsultantComponent.listCache.clear();
  }

  private GetListSALMaster(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const cacheKey = JSON.stringify(filter);
    if (!isRefresh && Mtb009SalConsultantComponent.listCache.has(cacheKey)) {
        this.listRetailMaster = Mtb009SalConsultantComponent.listCache.get(cacheKey)!;
        this.openSet.clear();
        this.listRetailMaster.forEach((_, index) => this.openSet.add(index));
        this.isLoading = false;
        this.loader.loader(false);
        return;
    }

    const apiFilter = JSON.parse(JSON.stringify(filter));
    if (!apiFilter.filter) apiFilter.filter = { logic: 'and', filters: [] };
    apiFilter.filter.filters.push({ field: 'BypassCache', operator: 'eq', value: new Date().getTime() });

    const temp = this.api.GetListSALMaster(apiFilter).subscribe((res) => {
      if (res.StatusCode === 0) {
        this.listRetailMaster = res.ObjectReturn as SALOrderMasterGroup[];
        Mtb009SalConsultantComponent.listCache.set(cacheKey, this.listRetailMaster);
        this.openSet.clear();
        this.listRetailMaster.forEach((_, index) => {
          this.openSet.add(index);
        });
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu bán lẻ: ${res.ErrorString}`);
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu bán lẻ: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}