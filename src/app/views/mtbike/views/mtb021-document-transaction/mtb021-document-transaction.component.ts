import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { SALOrderReceiptStatusEnum } from 'src/app/models/enums/e-status/sal-order-receipt-status.enum';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
interface FilterChip {
  label: string;
  value: string;
}

@Component({
  selector: 'mtb021-document-transaction',
  templateUrl: './mtb021-document-transaction.component.html',
  styleUrls: ['./mtb021-document-transaction.component.scss'],
})
export class Mtb021DocumentTransactionComponent implements OnInit {

  constructor(
    private api: MtbikeApiService,
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  private isLoading = false;
  private isLastPage = false;
  @ViewChild('anchor', { static: false }) anchor!: ElementRef;
  @ViewChild('bodyList', { static: false }) bodyList!: ElementRef;
  private observer: IntersectionObserver;
  public filter: State = {
    skip: 0,
    take: 15,
    sort: [
      { field: 'Code', dir: 'desc' }
    ],
  };

  public SALOrderReceiptStatusEnum = SALOrderReceiptStatusEnum;
  public SALOrderInvoiceStatusEnum = SALOrderInvoiceStatusEnum;
  public searchKeyword: string = '';
  public activeChips: string[] = ['all', 'new', 'pending', 'other'];

  public get isAllStatusActive(): boolean {
    return this.activeChips.includes('all');
  }

  public get isMineActive(): boolean {
    return this.activeChips.includes('mine');
  }  public listchip: FilterChip[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Mới', value: 'new' },
    { label: 'Chờ thu', value: 'pending' },
    { label: 'Khác', value: 'other' },
    { label: 'Của tôi', value: 'mine' },
  ];

  ngOnInit(): void {
    const temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    this.ordermaster = this.cache.parseValue(temp) || new SALOrderMasterCusDTO();

    if (this.ordermaster.Code !== 0) {
      this.filter.filter = {
        logic: 'and',
        filters: [{ field: 'OrderMaster', operator: 'eq', value: this.ordermaster.Code }]
      };
    }

    if (this.ordermaster.NumOfInvoice > 0) {
      this.tabactive = 'invoice';
    }

    if (this.tabactive === 'receipt') {
      this.GetListSALReceipt(this.filter);
    } else {
      this.GetListSALInvoice(this.filter);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.anchor) return;

      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.loadMore();
        }
      }, { threshold: 0.1 });

      this.observer.observe(this.anchor.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region core
  public ordermaster: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
  public FunctionPermissionDTO = FunctionPermissionDTO;

  public onnavigate(field: string = ''): void {
    if (field === '') {
      if (this.tabactive === 'receipt') {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, new SALOrderReceiptCusDTO());
        field = '/mtbike/payment/receipt';
      } else {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, new SALOrderInvoiceCusDTO());
        field = '/mtbike/payment/selection';
      }
    }
    this.router.navigate([field]);
  }
  //#endregion

  //#region main
  public listtab: { name: string; value: string }[] = [
    { name: 'Phiếu thu', value: 'receipt' },
    { name: 'Hoá đơn', value: 'invoice' },
  ];
  public tabactive: string = 'receipt';
  public datareceipt: SALOrderReceiptCusDTO[] = [];
  public datainvoice: SALOrderInvoiceCusDTO[] = [];

  public onchangetab(tab: string): void {
    this.datareceipt = [];
    this.datainvoice = [];
    this.filter.skip = 0;
    this.isLastPage = false;
    this.tabactive = tab;

    setTimeout(() => {
      if (this.anchor) {
        this.observer.observe(this.anchor.nativeElement);
      }
    });

    if (this.tabactive === 'receipt') {
      this.GetListSALReceipt(this.filter);
    } else {
      this.GetListSALInvoice(this.filter);
    }
  }

  public onChipSelect(chip: string): void {
    if (chip === 'all') {
      if (this.activeChips.includes('all')) {
        this.activeChips = this.activeChips.filter(c => c === 'mine'); // remove all statuses
      } else {
        this.activeChips = [...this.activeChips, 'all', 'new', 'pending', 'other']; // add all
      }
    } else if (chip === 'mine') {
       if (this.activeChips.includes('mine')) {
         this.activeChips = this.activeChips.filter(c => c !== 'mine');
       } else {
         this.activeChips.push('mine');
       }
    } else {
        if (this.activeChips.includes(chip)) {
            this.activeChips = this.activeChips.filter(c => c !== chip && c !== 'all');
        } else {
            this.activeChips.push(chip);
            if (['new', 'pending', 'other'].every(c => this.activeChips.includes(c))) {
                if (!this.activeChips.includes('all')) this.activeChips.push('all');
            }
        }
    }

    this.filter.skip = 0;
    this.isLastPage = false;
    this.datareceipt = [];
    this.datainvoice = [];
    this.buildFilterAndLoad();
  }

  public get sortedReceipts(): any[] {
     // Sắp xếp Mới (1), Chờ thu (2), Đã thu (3)
     return this.datareceipt.sort((a, b) => (a.Status || 0) - (b.Status || 0));
  }

  public getInvoiceCount(orderMasterNo: string): number {
    return this.datainvoice.filter((inv: any) => inv.OrderMasterNo === orderMasterNo).length;
  }

  public onSearchTask(): void {
    this.filter.skip = 0;
    this.isLastPage = false;
    this.datareceipt = [];
    this.datainvoice = [];
    this.buildFilterAndLoad();
  }

  private buildFilterAndLoad(): void {
    const filters: any[] = [];

    // OrderMaster filter if applicable
    if (this.ordermaster && this.ordermaster.Code !== 0) {
      filters.push({ field: 'OrderMaster', operator: 'eq', value: this.ordermaster.Code });
    }

    // Search keyword
    if (this.searchKeyword.trim() !== '') {
      filters.push({
        logic: 'or',
        filters: [
          { field: 'CustomerName', operator: 'contains', value: this.searchKeyword },
          { field: 'CellPhone', operator: 'contains', value: this.searchKeyword },
          { field: 'ReceiptNo', operator: 'contains', value: this.searchKeyword },
          { field: 'ID', operator: 'contains', value: this.searchKeyword },
        ]
      });
    }

    // Chip filter
    if (!this.activeChips.includes('all')) {
      const statusFilters: any[] = [];
      if (this.activeChips.includes('new')) statusFilters.push({ field: 'Status', operator: 'eq', value: 1 });
      if (this.activeChips.includes('pending')) statusFilters.push({ field: 'Status', operator: 'eq', value: 2 });
      if (this.activeChips.includes('other')) statusFilters.push({ field: 'Status', operator: 'eq', value: 3 });

      if (statusFilters.length > 0) {
        filters.push({
          logic: 'or',
          filters: statusFilters
        });
      }
    }

    this.filter.filter = filters.length > 0 ? { logic: 'and', filters } : undefined;

    if (this.tabactive === 'receipt') {
      this.GetListSALReceipt(this.filter);
    } else {
      this.GetListSALInvoice(this.filter);
    }
  }

  public trackByCode(index: number, item: any): any {
    return item.Code || index;
  }

  public onSetItem(item: any, field: string): void {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, item);
    if (item.Status === SALOrderInvoiceStatusEnum.New && field === '/mtbike/payment/total') {
      this.router.navigate(['/mtbike/payment/total']);
    } else if (item.Status === SALOrderInvoiceStatusEnum.Success && field === '/mtbike/payment/total') {
      this.router.navigate(['/mtbike/payment/invoice']);
    } else {
      this.router.navigate([field]);
    }
  }

  private loadMore(): void {
    if (this.isLoading || this.isLastPage) return;

    const listEl = this.bodyList?.nativeElement as HTMLElement;
    if (!listEl || listEl.scrollHeight <= listEl.clientHeight) return;

    this.filter.skip += this.filter.take;
    if (this.tabactive === 'receipt') {
      this.GetListSALReceipt(this.filter);
    } else {
      this.GetListSALInvoice(this.filter);
    }
  }

  private GetListSALReceipt(filter: State, isRefresh: boolean = false): void {
    this.isLoading = true;
    this.loader.loader(true);

    // Mock data based on Figma "Phiếu thu"
    const isAccountant = true; // payment-1.2: Xem được phiếu thu chưa ai nhận + của bản thân
    
    let mockData: any[] = [
      {
        Code: 1,
        ReceiptNo: 'PT1HM000005',
        OrderMasterNo: 'HM0000005',
        CustomerName: 'Lương Gia Quí',
        CellPhone: '0865419941',
        EffDate: new Date('2025-03-24T10:00:00'),
        CollectedAmount: 31702909,
        Status: 1, // Mới
        StatusName: 'Mới',
        PaymentTypeName: 'Tiền mặt',
        VehicleCount: 1,
        IsSigned: false,
        CashierName: '' // chưa ai nhận
      },
      {
        Code: 2,
        ReceiptNo: 'PT2HM000006',
        OrderMasterNo: 'HM0000006',
        CustomerName: 'Trần Thị Bích',
        CellPhone: '0912345678',
        EffDate: new Date('2025-03-24T10:00:00'),
        CollectedAmount: 67702909,
        Status: 2, // Chờ thu
        StatusName: 'Chờ thu',
        PaymentTypeName: 'Chuyển khoản',
        VehicleCount: 2,
        IsSigned: false,
        CashierName: 'Trần Văn Minh' 
      },
      {
        Code: 3,
        ReceiptNo: 'PT3HM000007',
        OrderMasterNo: 'HM0000007',
        CustomerName: 'Phạm Văn Đức',
        CellPhone: '0934567890',
        EffDate: new Date('2025-03-24T10:00:00'),
        CollectedAmount: 52702909,
        Status: 3, // Đã thu
        StatusName: 'Đã thu',
        PaymentTypeName: 'Tiền mặt',
        VehicleCount: 1,
        IsSigned: true,
        CashierName: 'Phạm Thị Hoa'
      }
    ];

    if (this.activeChips.includes('mine')) {
        mockData = mockData.filter(x => x.CashierName === 'Phạm Thị Hoa');
    }
    setTimeout(() => {
      if (mockData.length < this.filter.take) {
        this.isLastPage = true;
      }
      this.datareceipt = isRefresh ? mockData : [...this.datareceipt, ...mockData];
      this.isLoading = false;
      this.loader.loader(false);
    }, 500);
  }

  private GetListSALInvoice(filter: State, isRefresh: boolean = false): void {
    this.isLoading = true;
    this.loader.loader(true);

    // Mock data for SALOrderInvoiceCusDTO compatible mapped UI fields
    const mockData: any[] = [
      {
        Code: 1,
        OrderMasterNo: 'HM0000005',
        InvoiceNo: 'HD1HM0000005',
        VehicleGroup: 'FUTURE',
        VehicleName: 'Future 125 FI 2025...',
        ColorName: '5304 - Xanh đen',
        VATCustomerName: 'Nguyễn Văn An',
        VATCellPhone: '0865419941',
        EffDate: new Date('2025-03-24T10:00:00'),
        ReceiptNoRef: 'PTHM0000005',
        TotalAmount: 31702909,
        Status: SALOrderInvoiceStatusEnum.New,
        StatusName: 'Chưa xuất',
        VATPercent: 10,
        VATCustomerType: 'Cá nhân'
      },
      {
        Code: 2,
        OrderMasterNo: 'HM0000005',
        InvoiceNo: 'HD2HM0000005',
        VehicleGroup: 'FUTURE',
        VehicleName: 'Future 125 FI 2025...',
        ColorName: '5305 - Xanh đen',
        VATCustomerName: 'Nguyễn Văn An',
        VATCellPhone: '0865419941',
        EffDate: new Date('2025-03-24T10:00:00'),
        ReceiptNoRef: 'PT1HM0000005, PT2HM0000005',
        TotalAmount: 31702909,
        Status: SALOrderInvoiceStatusEnum.New,
        StatusName: 'Chưa xuất',
        VATPercent: 10,
        VATCustomerType: 'Cá nhân'
      },
      {
        Code: 3,
        OrderMasterNo: 'HM0000006',
        InvoiceNo: 'HD1HM0000006',
        VehicleGroup: 'VISION',
        VehicleName: 'Vision 125 FI 2025...',
        ColorName: '5304 - Đỏ',
        VATCustomerName: 'Nguyễn Văn An',
        VATCellPhone: '0865419941',
        EffDate: new Date('2025-03-24T10:00:00'),
        ReceiptNoRef: 'PT1HM0000006',
        TotalAmount: 35702909,
        Status: SALOrderInvoiceStatusEnum.Success,
        StatusName: 'Đã xuất',
        VATPercent: 8,
        VATCustomerType: 'Đơn vị công'
      }
    ];

    setTimeout(() => {
      if (mockData.length < this.filter.take) {
        this.isLastPage = true;
      }
      this.datainvoice = isRefresh ? mockData : [...this.datainvoice, ...mockData];
      this.isLoading = false;
      this.loader.loader(false);
    }, 500);
  }
  //#endregion
}
