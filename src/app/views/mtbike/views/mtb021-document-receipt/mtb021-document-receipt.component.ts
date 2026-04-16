import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

export interface DisplayGroup {
  name: string;
  items: Mtb021DocumentReceiptComponent[];
}

export interface Mtb021DocumentReceiptComponent extends SALOrderMasterCusDTO {
  receipts?: SALOrderReceiptCusDTO[];
  isExpanded?: boolean;
  isLoadingReceipts?: boolean;
  receiptCount?: number;
}

@Component({
  selector: 'mtb021-document-receipt',
  templateUrl: './mtb021-document-receipt.component.html',
  styleUrls: ['./mtb021-document-receipt.component.scss'],
})
export class Mtb021DocumentReceiptComponent implements OnInit, OnDestroy {
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private router: Router,
  ) { }

  private arrUnsubscribe: Subscription[] = [];

  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;

  public displayGroups: DisplayGroup[] = [];
  public openGroupSet = new Set<number>();
  public allReceipts: SALOrderReceiptCusDTO[] = [];

  public isOpenedFilter = false;
  public searchKeyword = '';
  public includeFinished = false;
  public selectedConsultant: string = '';

  public filter: State = {
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  ngOnInit(): void {
    ConfigDTO.dllpackage = 'document';
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, 'document');
    this.loadData();
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
    this.arrUnsubscribe = [];
  }

  //#region data loading
  private loadData(): void {
    this.loader.loader(true);
    this.loadAllReceipts();
    this.loadList();
  }

  private loadList(): void {
    const sub = this.api.GetListSALMaster(this.buildFilter()).subscribe(
      res => {
        if (res.StatusCode === 0) {
          const rawGroups = res.ObjectReturn as any[];
          const allItems: Mtb021DocumentReceiptComponent[] = [];
          rawGroups.forEach(g => {
            (g.ListData || []).forEach((item: any) => {
              allItems.push({ ...item, isExpanded: false });
            });
          });
          this.buildDisplayGroups(allItems);
        } else {
          this.notification.onError(`Lỗi tải danh sách: ${res.ErrorString}`);
        }
        this.loader.loader(false);
      },
      err => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi tải danh sách: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private buildFilter(): State {
    const filters: any[] = [];

    // Always include "Đang xử lý" statuses (PENDING + PROCESSING)
    const statusFilters: any[] = [
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PENDING },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PROCESSING },
    ];

    // When checkbox is checked, also include "Kết thúc" statuses (COMPLETE + CANCEL)
    if (this.includeFinished) {
      statusFilters.push(
        { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.COMPLETE },
        { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.CANCEL },
      );
    }

    filters.push({ logic: 'or', filters: statusFilters });

    if (this.searchKeyword.trim()) {
      filters.push({
        logic: 'or',
        filters: [
          { field: 'ID', operator: 'contains', value: this.searchKeyword },
          { field: 'CustomerName', operator: 'contains', value: this.searchKeyword },
          { field: 'CustomerPhone', operator: 'contains', value: this.searchKeyword },
        ]
      });
    }

    if (this.selectedConsultant?.trim()) {
      filters.push({ field: 'SaleStaffName', operator: 'contains', value: this.selectedConsultant });
    }

    return {
      ...this.filter,
      filter: filters.length > 0 ? { logic: 'and', filters } : undefined,
    };
  }

  private buildDisplayGroups(allItems: Mtb021DocumentReceiptComponent[]): void {
    // Group 1: "Đang xử lý" = status PENDING(3) + PROCESSING(4)
    const processingItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.PENDING ||
      i.Status === SALOrderMasterStatusRetailEnum.PROCESSING
    );

    // Group 2: "Kết thúc" = status COMPLETE(5) + CANCEL(6)
    const finishedItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.COMPLETE ||
      i.Status === SALOrderMasterStatusRetailEnum.CANCEL
    );

    // Assign receipt counts
    processingItems.forEach(item => {
      item.receiptCount = this.allReceipts.filter(r => r.OrderMaster === item.Code).length;
    });
    finishedItems.forEach(item => {
      item.receiptCount = this.allReceipts.filter(r => r.OrderMaster === item.Code).length;
    });

    this.displayGroups = [];

    if (processingItems.length > 0) {
      this.displayGroups.push({ name: 'Đang xử lý', items: processingItems });
    }

    if (this.includeFinished && finishedItems.length > 0) {
      this.displayGroups.push({ name: 'Kết thúc', items: finishedItems });
    }

    // Open all groups by default
    this.openGroupSet.clear();
    this.displayGroups.forEach((_, i) => this.openGroupSet.add(i));
  }

  private loadAllReceipts(): void {
    const sub = this.api.GetListSALReceipt({ filter: { logic: 'and', filters: [] } }).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.allReceipts = res.ObjectReturn?.Data ?? res.ObjectReturn ?? [];
          this.assignReceiptsToItems();
        }
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private assignReceiptsToItems(): void {
    this.displayGroups.forEach(g => {
      g.items.forEach(item => {
        item.receipts = this.allReceipts.filter(r => r.OrderMaster === item.Code);
        item.receiptCount = item.receipts.length;
      });
    });
  }
  //#endregion

  //#region UI actions
  toggleGroup(idx: number): void {
    if (this.openGroupSet.has(idx)) {
      this.openGroupSet.delete(idx);
    } else {
      this.openGroupSet.add(idx);
    }
  }

  isGroupOpen(idx: number): boolean {
    return this.openGroupSet.has(idx);
  }

  toggleItem(item: Mtb021DocumentReceiptComponent): void {
    item.isExpanded = !item.isExpanded;
    if (item.isExpanded && !item.receipts) {
      item.receipts = this.allReceipts.filter(r => r.OrderMaster === item.Code);
    }
  }

  onSearch(): void {
    this.isOpenedFilter = false;
    this.displayGroups = [];
    this.loadData();
  }

  openFilter(v: boolean): void {
    this.isOpenedFilter = v;
  }

  onNavigateBack(): void {
    this.router.navigate(['/menu']);
  }

  onNavigateReceipt(receipt: SALOrderReceiptCusDTO, master: Mtb021DocumentReceiptComponent): void {
    this.loader.loader(true);
    this.loader.loader(false);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, receipt);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, master);
    this.router.navigate(['/mtbike/document/receipt']);
    console.log(receipt);

  }

  onCreateReceipt(master: Mtb021DocumentReceiptComponent): void {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, master);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, new SALOrderReceiptCusDTO());
    this.router.navigate(['/mtbike/document/receipt']);
    console.log('áđá');
  }
  //#endregion

  //#region helpers
  getStatusClass(status: number): string {
    switch (status) {
      case SALOrderMasterStatusRetailEnum.PENDING: return 'status-pending';
      case SALOrderMasterStatusRetailEnum.PROCESSING: return 'status-processing';
      case SALOrderMasterStatusRetailEnum.COMPLETE: return 'status-complete';
      case SALOrderMasterStatusRetailEnum.CANCEL: return 'status-cancel';
      default: return 'status-new';
    }
  }

  getPaymentMethodClass(method: number): string {
    switch (method) {
      case 1: return 'pm-cash';
      case 2: return 'pm-transfer';
      case 3: return 'pm-card';
      case 4: return 'pm-mixed';
      default: return 'pm-cash';
    }
  }
  //#endregion
}