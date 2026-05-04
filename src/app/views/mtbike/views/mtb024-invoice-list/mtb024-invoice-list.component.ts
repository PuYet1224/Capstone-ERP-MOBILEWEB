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
  items: Mtb024InvoiceItem[];
}

export interface Mtb024InvoiceItem extends SALOrderMasterCusDTO {
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

  public displayItems: Mtb024InvoiceItem[] = [];
  public allItems: Mtb024InvoiceItem[] = [];
  public allInvoices: SALOrderInvoiceCusDTO[] = [];

  public isOpenedFilter = false;
  public searchKeyword = '';
  public includeFinished = false;

  public filter: State = {
    take: 20,
    skip: 0,
    filter: undefined
  };

  ngOnInit(): void {
    ConfigDTO.dllpackage = 'document';
    this.cache.setItem(KeyLocalStorageEnum.DLLPACKAGE, 'document');
    this.initFilter();
    this.loadData();
    this.loadAllInvoices();
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private initFilter() {
    this.filter = {
      take: 20,
      skip: 0,
      filter: undefined
    };
  }

  public onSearch(): void {
    this.filter.skip = 0;
    this.loadData();
    this.loadAllInvoices();
  }

  public onToggleIncludeFinished(checked: boolean): void {
    this.includeFinished = checked;
    this.filter.skip = 0;
    this.loadData();
  }

  public loadData(append = false): void {
    this.loader.loader(true);
    const sub = this.api.GetListSALMaster(this.buildFilter()).subscribe(
      res => {
        if (res.StatusCode === 0) {
          const rawResponse = res.ObjectReturn?.Data ?? res.ObjectReturn ?? [];
          const items: Mtb024InvoiceItem[] = [];
          if (Array.isArray(rawResponse)) {
            rawResponse.forEach(g => {
              if (g.ListData && Array.isArray(g.ListData)) {
                items.push(...g.ListData);
              } else if (g.ID) {
                items.push(g);
              }
            });
          }

          if (append) {
            this.allItems = [...this.allItems, ...items];
          } else {
            this.allItems = items;
          }
          let filteredItems = this.allItems;
          
          if (this.searchKeyword?.trim()) {
            const keyword = this.searchKeyword.trim().toLowerCase();
            
            const matchingInvoices = this.allInvoices.filter(inv => 
              (inv.InvoiceNo && inv.InvoiceNo.toLowerCase().includes(keyword)) ||
              (inv.OrderNo && inv.OrderNo.toLowerCase().includes(keyword)) ||
              (inv.VATCustomerName && inv.VATCustomerName.toLowerCase().includes(keyword))
            );
            
            const matchingOrderCodes = matchingInvoices.map(inv => inv.OrderMaster);

            filteredItems = this.allItems.filter(i => {
              const matchesDirect = 
                (i.ID && i.ID.toLowerCase().includes(keyword)) ||
                (i.CustomerName && i.CustomerName.toLowerCase().includes(keyword)) ||
                (i.CustomerPhone && i.CustomerPhone.toLowerCase().includes(keyword));

              const matchesInvoice = matchingOrderCodes.includes(i.Code);

              if (matchesInvoice && !matchesDirect) {
                i.isExpanded = true;
              }

              return matchesDirect || matchesInvoice;
            });
          }

          this.buildDisplayItems(filteredItems);
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
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.NEW },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PENDING },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PROCESSING }
    ];

    if (this.includeFinished) {
      statusFilters.push({ field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.COMPLETE });
      statusFilters.push({ field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.CANCEL });
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

  private buildDisplayItems(allItems: Mtb024InvoiceItem[]): void {
    const processingItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.NEW ||
      i.Status === SALOrderMasterStatusRetailEnum.PENDING ||
      i.Status === SALOrderMasterStatusRetailEnum.PROCESSING
    );

    const finishedItems = allItems.filter(i =>
      i.Status === SALOrderMasterStatusRetailEnum.COMPLETE ||
      i.Status === SALOrderMasterStatusRetailEnum.CANCEL
    );

    this.displayItems = [];

    if (processingItems.length > 0) {
      this.displayItems.push(...processingItems);
    }

    if (this.includeFinished && finishedItems.length > 0) {
      this.displayItems.push(...finishedItems);
    }

    this.assignInvoicesToItems();
  }

  private assignInvoicesToItems(): void {
    this.displayItems.forEach(item => {
      item.invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
      item.invoiceCount = item.invoices.length;
    });
  }

  public getVehicleStatus(inv: any): { label: string, class: string } | null {
    if (inv.OrderDetailTypeData === 3) {
      return { label: 'Xe đặt', class: 'r-preorder-badge' };
    }
    const currentHeadCode = ConfigDTO.head?.Code;
    if (inv.HeadTransfer != null && inv.HeadTransfer !== currentHeadCode) {
      return { label: 'Xe điều chuyển', class: 'r-transfer-badge' };
    }
    return { label: 'Xe tại Head', class: 'r-local-badge' };
  }

  public toggleItem(item: Mtb024InvoiceItem): void {
    item.isExpanded = !item.isExpanded;
    if (item.isExpanded && !item.invoices) {
      item.invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
    }
  }

  public openFilter(v: boolean): void {
    this.isOpenedFilter = v;
  }

  public onNavigateBack(): void {
    this.router.navigate(['/menu']);
  }

  public onNavigateDetail(inv: SALOrderInvoiceCusDTO): void {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_INVOICE, inv);
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

  getVATTypeBadgeClass(vatType: number): string {
    switch (vatType) {
      case 1: return 'badge-personal';
      case 2: return 'badge-company';
      case 3: return 'badge-public';
      default: return 'badge-personal';
    }
  }

  getVATTypeLabel(vatType: number): string {
    switch (vatType) {
      case 1: return 'Cá nhân';
      case 2: return 'Doanh nghiệp';
      case 3: return 'Đơn vị công';
      default: return 'Cá nhân';
    }
  }

  isInfoComplete(inv: SALOrderInvoiceCusDTO): boolean {
    if (!inv.FrameSeri || !inv.EngineSeri) return false;
    if (!inv.VATCustomerName) return false;
    if (!inv.VATAddress) return false;
    if (inv.VATType === 1) {
      return !!(inv.VATCCCD && inv.VATCellPhone);
    }
    if (inv.VATType === 2 || inv.VATType === 3) {
      return !!(inv.VATCompanyName && inv.VATCompanyTax);
    }
    return false;
  }

  getInfoCompletionClass(inv: SALOrderInvoiceCusDTO): string {
    if (inv.Status === 2 || inv.Status === 135) return 'info-complete';
    return this.isInfoComplete(inv) ? 'info-complete' : 'info-incomplete';
  }

  getInvoiceStatusText(inv: SALOrderInvoiceCusDTO): string {
    if (inv.Status === 134 || inv.Status === 1) {
      return this.isInfoComplete(inv) ? 'Đủ thông tin' : 'Thiếu thông tin';
    }
    if (inv.Status === 135 || inv.Status === 2) return 'Đã phát hành';
    if (inv.Status === 136 || inv.Status === 3) return 'Đã hủy';
    return inv.StatusName || 'Thiếu thông tin';
  }

  getInvoiceStatusClass(inv: SALOrderInvoiceCusDTO): string {
    if (inv.Status === 135 || inv.Status === 2) return 'badge-success';
    if (inv.Status === 136 || inv.Status === 3) return 'badge-danger';
    return this.isInfoComplete(inv) ? 'badge-primary' : 'badge-warning';
  }

  trackByGroup(_: number, group: DisplayGroup): string {
    return group.name;
  }

  trackByItem(_: number, item: Mtb024InvoiceItem): number {
    return item.Code;
  }

  trackByInvoice(_: number, inv: SALOrderInvoiceCusDTO): number {
    return inv.Code;
  }
  //#endregion
}
