import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

export interface Mtb026DisplayGroup {
  name: string;
  items: Mtb026InvoiceIssueItem[];
}

export interface Mtb026InvoiceIssueItem extends SALOrderMasterCusDTO {
  invoices?: SALOrderInvoiceCusDTO[];
  isExpanded?: boolean;
  invoiceCount?: number;
}

@Component({
  selector: 'mtb026-invoice-issue',
  templateUrl: './mtb026-invoice-issue.component.html',
  styleUrls: ['./mtb026-invoice-issue.component.scss'],
})
export class Mtb026InvoiceIssueComponent implements OnInit, OnDestroy {
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  private arrUnsubscribe: Subscription[] = [];

  public displayGroups: Mtb026DisplayGroup[] = [];
  public openGroupSet = new Set<number>();
  public allInvoices: SALOrderInvoiceCusDTO[] = [];

  public isOpenedFilter = false;
  public searchKeyword = '';

  public activeTab: 'pending' | 'issued' = 'pending'; // kept for compatibility
  public pendingCount = 0;
  public issuedCount = 0;

  public isOpenedIssueConfirm = false;
  public selectedInvoice: SALOrderInvoiceCusDTO | null = null;

  public readonly invoiceStatusSuccess = SALOrderInvoiceStatusEnum.Success;

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
  }

  private loadList(): void {
    const sub = this.api.GetListSALMaster(this.buildFilter()).subscribe(
      res => {
        if (res.StatusCode === 0) {
          const rawGroups = res.ObjectReturn as any[];
          const allItems: Mtb026InvoiceIssueItem[] = [];
          rawGroups.forEach(g => {
            (g.ListData || []).forEach((item: any) => {
              allItems.push({ ...item, isExpanded: false });
            });
          });

          let filteredItems = allItems;
          if (this.searchKeyword?.trim()) {
            const kw = this.searchKeyword.trim().toLowerCase();

            const matchingOrderCodes = this.allInvoices
              .filter(inv => (inv.InvoiceNo && inv.InvoiceNo.toLowerCase().includes(kw)))
              .map(inv => inv.OrderMaster);

            filteredItems = filteredItems.filter(i => {
              const matchesDirect = (i.ID && i.ID.toLowerCase().includes(kw)) ||
                (i.CustomerName && i.CustomerName.toLowerCase().includes(kw)) ||
                (i.CustomerPhone && i.CustomerPhone.includes(kw));

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
          this.updateInvoiceCounts();
        }
        this.loadList();
      },
      err => {
        this.loadList();
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private buildFilter(): any {
    const filters: any[] = [];

    const statusFilters: any[] = [
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PENDING },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.PROCESSING },
      { field: 'Status', operator: 'eq', value: SALOrderMasterStatusRetailEnum.COMPLETE },
    ];

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

  private buildDisplayGroups(allItems: Mtb026InvoiceIssueItem[]): void {
    const pendingItems: Mtb026InvoiceIssueItem[] = [];
    const issuedItems: Mtb026InvoiceIssueItem[] = [];

    allItems.forEach(item => {
      const invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
      // Only show ready-to-issue invoices (complete info) + already issued
      const readyInvoices = invoices.filter(inv =>
        inv.Status === SALOrderInvoiceStatusEnum.Success || this.isInfoComplete(inv)
      );
      if (readyInvoices.length === 0) return;

      item.invoices = readyInvoices;
      item.invoiceCount = readyInvoices.length;

      const allIssued = readyInvoices.every(inv => inv.Status === SALOrderInvoiceStatusEnum.Success);
      if (allIssued) {
        issuedItems.push(item);
      } else {
        pendingItems.push(item);
      }
    });

    this.displayGroups = [];
    if (pendingItems.length > 0) {
      this.displayGroups.push({ name: 'Chưa phát hành', items: pendingItems });
    }
    if (issuedItems.length > 0) {
      this.displayGroups.push({ name: 'Đã phát hành', items: issuedItems });
    }

    this.openGroupSet.clear();
    this.displayGroups.forEach((_, i) => this.openGroupSet.add(i));
  }

  private assignInvoicesToItems(): void {
    this.displayGroups.forEach(g => {
      g.items.forEach(item => {
        item.invoices = this.allInvoices.filter(inv => inv.OrderMaster === item.Code);
        item.invoiceCount = item.invoices.length;
      });
    });
  }

  private updateInvoiceCounts(): void {
    this.pendingCount = this.allInvoices.filter(
      inv => inv.Status !== SALOrderInvoiceStatusEnum.Success && this.isInfoComplete(inv)
    ).length;
    this.issuedCount = this.allInvoices.filter(
      inv => inv.Status === SALOrderInvoiceStatusEnum.Success
    ).length;
  }
  //#endregion

  //#region UI actions
  onTabChange(tab: 'pending' | 'issued'): void {
    this.activeTab = tab;
  }

  getVisibleInvoices(item: Mtb026InvoiceIssueItem): SALOrderInvoiceCusDTO[] {
    return item.invoices || [];
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

  toggleItem(item: Mtb026InvoiceIssueItem): void {
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

  printInvoice(item: SALOrderInvoiceCusDTO): void {
    this.loader.Show('Đang tải hóa đơn ĐT...');
    const payload = {
      Code: item.Code,
      Type: 1
    };
    this.api.ExportSALInvoicePdf(payload).subscribe((res) => {
      this.loader.Hide();
      if (res && res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Base64) {
        const linkSource = `data:application/pdf;base64,${res.ObjectReturn.Base64}`;
        const downloadLink = document.createElement('a');
        const fileName = res.ObjectReturn.FileName || `HoaDon_${item.InvoiceNo}.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.notification.Show('Có lỗi xảy ra khi in hóa đơn', 'error');
      }
    }, () => {
      this.loader.Hide();
      this.notification.Show('Lỗi kết nối máy chủ', 'error');
    });
  }

  getInvoiceStatusClass(status: number): string {
    switch (status) {
      case SALOrderInvoiceStatusEnum.Success: return 'inv-issued';
      case SALOrderInvoiceStatusEnum.Cancled: return 'inv-cancelled';
      case SALOrderInvoiceStatusEnum.New: return 'inv-pending';
      default: return 'inv-pending';
    }
  }

  getInvoiceStatusLabel(status: number): string {
    switch (status) {
      case SALOrderInvoiceStatusEnum.Success: return 'Đã phát hành';
      case SALOrderInvoiceStatusEnum.Cancled: return 'Đã hủy';
      case SALOrderInvoiceStatusEnum.New: return 'Chờ xử lý';
      default: return 'Chờ xử lý';
    }
  }

  trackByGroup(_: number, group: Mtb026DisplayGroup): string {
    return group.name;
  }

  trackByItem(_: number, item: Mtb026InvoiceIssueItem): number {
    return item.Code;
  }

  trackByInvoice(_: number, inv: SALOrderInvoiceCusDTO): number {
    return inv.Code;
  }
  //#endregion

  //#region Issue invoice
  openIssueConfirm(inv: SALOrderInvoiceCusDTO): void {
    if (inv.Status === SALOrderInvoiceStatusEnum.Success) {
      this.notification.onWarning('Hóa đơn đã phát hành, không thể phát hành lại.');
      return;
    }
    this.selectedInvoice = inv;
    this.isOpenedIssueConfirm = true;
  }

  closeIssueConfirm(): void {
    this.isOpenedIssueConfirm = false;
    this.selectedInvoice = null;
  }

  confirmIssueInvoice(): void {
    if (!this.selectedInvoice) return;

    // Validate SK/SM before issuing
    if (!this.selectedInvoice['FrameSeri'] || !this.selectedInvoice['EngineSeri']) {
      this.notification.onWarning('Hóa đơn chưa gán Số Khung / Số Máy. Vui lòng vào Chứng từ HĐ để gán xe trước khi phát hành.');
      return;
    }

    this.loader.loader(true);
    const invoiceCode = this.selectedInvoice.Code;
    const orderMasterCode = this.selectedInvoice.OrderMaster;
    const sub = this.api.UpdateSALInvoiceIssue([invoiceCode]).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Phát hành hóa đơn thành công!');
          this.closeIssueConfirm();
          // Check if all invoices in this order are now issued
          this.checkAndUpdateOrderStatus(orderMasterCode);
          this.loadData();
        } else {
          this.notification.onError(`Lỗi phát hành: ${res.ErrorString}`);
        }
        this.loader.loader(false);
      },
      err => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi phát hành: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private checkAndUpdateOrderStatus(orderMasterCode: number): void {
    if (!orderMasterCode) return;
    const orderInvoices = this.allInvoices.filter(inv => inv.OrderMaster === orderMasterCode);
    // After issuing, the current invoice is now Success — check if all others are too
    const allIssued = orderInvoices.every(inv =>
      inv.Code === this.selectedInvoice?.Code || inv.Status === SALOrderInvoiceStatusEnum.Success
    );
    if (allIssued) {
      // Update order status to COMPLETE
      const masterDTO = new SALOrderMasterCusDTO();
      masterDTO.Code = orderMasterCode;
      masterDTO.Status = SALOrderMasterStatusRetailEnum.COMPLETE;
      const param = { DTO: masterDTO, Properties: ['Status'] };
      this.api.UpdateSALMaster(param).subscribe({
        next: (res) => {
          if (res.StatusCode === 0) {
            this.notification.onSuccess('Phiếu bán hàng đã hoàn tất!');
          }
        }
      });
    }
  }

  bulkIssueAll(): void {
    const pendingCodes = this.allInvoices
      .filter(inv => inv.Status !== SALOrderInvoiceStatusEnum.Success && inv.Status !== SALOrderInvoiceStatusEnum.Cancled)
      .map(inv => inv.Code);

    if (pendingCodes.length === 0) {
      this.notification.onWarning('Không có hóa đơn chờ phát hành');
      return;
    }

    // Validate SK/SM for all pending invoices
    const missingVehicle = this.allInvoices
      .filter(inv => pendingCodes.includes(inv.Code) && (!inv['FrameSeri'] || !inv['EngineSeri']));
    if (missingVehicle.length > 0) {
      this.notification.onWarning(`${missingVehicle.length} hóa đơn chưa gán Số Khung / Số Máy. Vui lòng gán xe trước khi phát hành.`);
      return;
    }

    this.loader.loader(true);
    const sub = this.api.UpdateSALInvoiceIssue(pendingCodes).subscribe(
      res => {
        if (res.StatusCode === 0) {
          const result = res.ObjectReturn;
          this.notification.onSuccess(`Đã phát hành ${result?.SuccessCount ?? pendingCodes.length} hóa đơn thành công!`);
        } else {
          this.notification.onError(`Lỗi phát hành: ${res.ErrorString}`);
        }
        this.loader.loader(false);
        this.loadData();
      },
      err => {
        this.loader.loader(false);
        this.notification.onError(`Lỗi phát hành: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
}
