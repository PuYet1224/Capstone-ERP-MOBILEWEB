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
  public selectedConsultant: any = null;
  public listConsultants: any[] = [];

  public filter: State = {
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  ngOnInit(): void {
    ConfigDTO.dllpackage = 'document';
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, 'document');
    this.loadConsultants();
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
    // Use forkJoin or ensure receipts are loaded before list if we want to search by receipt number
    this.loadAllReceipts();
    this.loadList();
  }

  private loadConsultants(): void {
    this.api.GetListWOMConsultant({}).subscribe(res => {
      if (res.StatusCode === 0) {
        this.listConsultants = res.ObjectReturn?.Data || res.ObjectReturn || [];
      }
    });
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

          // Fallback: Local filtering for grouped results (since server-side may ignore filter on groups)
          let filteredItems = allItems;
          if (this.searchKeyword?.trim()) {
            const kw = this.searchKeyword.trim().toLowerCase();

            // Find IDs of orders that have matching receipts
            const matchingOrderCodes = this.allReceipts
              .filter(r => (r.ReceiptNo && r.ReceiptNo.toLowerCase().includes(kw)))
              .map(r => r.OrderMaster);

            filteredItems = filteredItems.filter(i => {
              const matchesDirect = (i.ID && i.ID.toLowerCase().includes(kw)) ||
                (i.CustomerName && i.CustomerName.toLowerCase().includes(kw)) ||
                (i.CustomerPhone && i.CustomerPhone.includes(kw)) ||
                (i.SaleStaffName && i.SaleStaffName.toLowerCase().includes(kw));

              const matchesReceipt = matchingOrderCodes.includes(i.Code);

              // If matches via receipt, auto-expand to show it
              if (matchesReceipt && !matchesDirect) {
                i.isExpanded = true;
              }

              return matchesDirect || matchesReceipt;
            });
          }

          if (this.selectedConsultant) {
            const consultantName = (this.selectedConsultant.StaffName || this.selectedConsultant).toLowerCase();
            filteredItems = filteredItems.filter(i =>
              i.SaleStaffName && i.SaleStaffName.toLowerCase().includes(consultantName)
            );
          }

          this.buildDisplayGroups(filteredItems);
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

  private buildFilter(): any {
    const filters: any[] = [];

    // Group statuses: 1(New), 3(Pending), 4(Processing) are "Active"
    const statusFilters: any[] = [
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PENDING },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PROCESSING },
    ];

    if (this.includeFinished) {
      statusFilters.push(
        { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.COMPLETE },
        { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.CANCEL },
      );
    }

    filters.push({ logic: 'or', filters: statusFilters });

    if (this.searchKeyword?.trim()) {
      const keyword = this.searchKeyword.trim();
      const searchFilters: any[] = [
        { field: 'ID', operator: 'contains', value: keyword },
        { field: 'CustomerName', operator: 'contains', value: keyword },
        { field: 'CustomerPhone', operator: 'contains', value: keyword },
      ];

      filters.push({ logic: 'or', filters: searchFilters });
    }

    if (this.selectedConsultant) {
      const consultantName = this.selectedConsultant.StaffName || this.selectedConsultant;
      filters.push({ field: 'SaleStaffName', operator: 'contains', value: consultantName });
    }

    return {
      ...this.filter,
      filter: filters.length > 0 ? { logic: 'and', filters } : undefined
    };
  }

  private buildReceiptFilter(): any {
    const filters: any[] = [];

    if (this.searchKeyword?.trim()) {
      const keyword = this.searchKeyword.trim();
      filters.push({
        logic: 'or',
        filters: [
          { field: 'ReceiptNo', operator: 'contains', value: keyword },
          { field: 'OrderNo', operator: 'contains', value: keyword },
          { field: 'CustomerName', operator: 'contains', value: keyword },
          { field: 'CellPhone', operator: 'contains', value: keyword },
        ]
      });
    }

    return {
      filter: filters.length > 0 ? { logic: 'and', filters } : undefined
    };
  }

  private buildDisplayGroups(allItems: Mtb021DocumentReceiptComponent[]): void {
    // Group 1: "Đang xử lý" = status NEW(1) + PENDING(3) + PROCESSING(4)
    const processingItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.NEW ||
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
    const sub = this.api.GetListSALReceipt(this.buildReceiptFilter()).subscribe(
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
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, receipt);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, master);

    // If receipt is still "New", go to Update page, otherwise go to Detail page
    if (receipt.Code === 0) {
      this.router.navigate(['/mtbike/document/receipt/update']);
    } else {
      this.router.navigate(['/mtbike/document/receipt']);
    }
  }

  onCreateReceipt(master: Mtb021DocumentReceiptComponent): void {
    const newReceipt = new SALOrderReceiptCusDTO();
    newReceipt.OrderMaster = master.Code; // Link to master Order
    newReceipt.CustomerName = master.CustomerName;
    newReceipt.CellPhone = master.CustomerPhone;
    newReceipt.Address = master.Address;

    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, master);
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, newReceipt);
    this.router.navigate(['/mtbike/document/receipt/update']);
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