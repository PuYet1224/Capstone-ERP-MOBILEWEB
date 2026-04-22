import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

export interface DisplayGroup {
  name: string;
  items: Mtb024InvoiceListComponent[];
}

export interface Mtb024InvoiceListComponent extends SALOrderMasterCusDTO {
  invoices?: SALOrderInvoiceCusDTO[];
  isExpanded?: boolean;
  invoiceCount?: number;
}

@Component({
  selector: 'mtb024-invoice-list',
  templateUrl: './mtb024-invoice-list.component.html',
  styleUrls: ['./mtb024-invoice-list.component.scss'],
})
export class Mtb024InvoiceListComponent implements OnInit, OnDestroy {
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  private arrUnsubscribe: Subscription[] = [];

  public displayGroups: DisplayGroup[] = [];
  public openGroupSet = new Set<number>();
  public allInvoices: SALOrderInvoiceCusDTO[] = [];

  public isOpenedFilter = false;
  public searchKeyword = '';
  public includeFinished = false;

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
  public loadData(): void {
    this.loader.loader(true);
    this.loadAllInvoices();
    this.loadList();
  }

  private loadList(): void {
    const sub = this.api.GetListSALMaster(this.buildFilter()).subscribe(
      res => {
        if (res.StatusCode === 0) {
          const rawGroups = res.ObjectReturn as any[];
          const allItems: Mtb024InvoiceListComponent[] = [];
          rawGroups.forEach(g => {
            (g.ListData || []).forEach((item: any) => {
              allItems.push({ ...item, isExpanded: false });
            });
          });

          let filteredItems = allItems;
          if (this.searchKeyword?.trim()) {
            const kw = this.searchKeyword.trim().toLowerCase();

            // Find IDs of orders that have matching invoices
            const matchingOrderCodes = this.allInvoices
              .filter(inv => (inv.InvoiceNo && inv.InvoiceNo.toLowerCase().includes(kw)))
              .map(inv => inv.OrderMaster);

            filteredItems = filteredItems.filter(i => {
              const matchesDirect = (i.ID && i.ID.toLowerCase().includes(kw)) ||
                (i.CustomerName && i.CustomerName.toLowerCase().includes(kw)) ||
                (i.CustomerPhone && i.CustomerPhone.includes(kw)) ||
                (i.SaleStaffName && i.SaleStaffName.toLowerCase().includes(kw));

              const matchesInvoice = matchingOrderCodes.includes(i.Code);

              if (matchesInvoice && !matchesDirect) {
                i.isExpanded = true;
              }

              return matchesDirect || matchesInvoice;
            });
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

  private loadAllInvoices(): void {
    const sub = this.api.GetListSALInvoice(this.buildInvoiceFilter()).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.allInvoices = res.ObjectReturn?.Data ?? res.ObjectReturn ?? [];
          this.assignInvoicesToItems();
        }
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private buildFilter(): any {
    const filters: any[] = [];

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

    return {
      ...this.filter,
      filter: filters.length > 0 ? { logic: 'and', filters } : undefined,
      isExcludeInstallment: true
    };
  }

  private buildInvoiceFilter(): any {
    const filters: any[] = [];

    if (this.searchKeyword?.trim()) {
      const keyword = this.searchKeyword.trim();
      filters.push({
        logic: 'or',
        filters: [
          { field: 'InvoiceNo', operator: 'contains', value: keyword },
          { field: 'OrderNo', operator: 'contains', value: keyword },
          { field: 'VATCustomerName', operator: 'contains', value: keyword },
        ]
      });
    }

    return {
      filter: filters.length > 0 ? { logic: 'and', filters } : undefined,
    };
  }

  private buildDisplayGroups(allItems: Mtb024InvoiceListComponent[]): void {
    const processingItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.NEW ||
      i.Status === SALOrderMasterStatusRetailEnum.PENDING ||
      i.Status === SALOrderMasterStatusRetailEnum.PROCESSING
    );

    const finishedItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.COMPLETE ||
      i.Status === SALOrderMasterStatusRetailEnum.CANCEL
    );

    processingItems.forEach(item => {
      item.invoiceCount = this.allInvoices.filter(inv => inv.OrderMaster === item.Code).length;
    });
    finishedItems.forEach(item => {
      item.invoiceCount = this.allInvoices.filter(inv => inv.OrderMaster === item.Code).length;
    });

    this.displayGroups = [];

    if (processingItems.length > 0) {
      this.displayGroups.push({ name: 'Đang xử lý', items: processingItems });
    }

    if (this.includeFinished && finishedItems.length > 0) {
      this.displayGroups.push({ name: 'Kết thúc', items: finishedItems });
    }

    this.openGroupSet.clear();
    this.displayGroups.forEach((_, i) => this.openGroupSet.add(i));
    this.assignInvoicesToItems();
  }

  private assignInvoicesToItems(): void {
    this.displayGroups.forEach(g => {
      g.items.forEach(item => {
        item.invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
        item.invoiceCount = item.invoices.length;
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

  toggleItem(item: Mtb024InvoiceListComponent): void {
    item.isExpanded = !item.isExpanded;
    if (item.isExpanded && !item.invoices) {
      item.invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
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

  onNavigateDetail(item: SALOrderInvoiceCusDTO): void {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_INVOICE, item);
    this.router.navigate(['detail'], { relativeTo: this.route });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case SALOrderMasterStatusRetailEnum.PENDING: return 'status-pending';
      case SALOrderMasterStatusRetailEnum.PROCESSING: return 'status-processing';
      case SALOrderMasterStatusRetailEnum.COMPLETE: return 'status-complete';
      case SALOrderMasterStatusRetailEnum.CANCEL: return 'status-cancel';
      default: return 'status-new';
    }
  }
  //#endregion
}
