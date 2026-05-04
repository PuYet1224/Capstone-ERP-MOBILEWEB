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
        this.isInvoiceSuccess(inv) || this.isInfoComplete(inv)
      );
      if (readyInvoices.length === 0) return;

      item.invoices = readyInvoices;
      item.invoiceCount = readyInvoices.length;

      const allIssued = readyInvoices.every(inv => this.isInvoiceSuccess(inv));
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
      inv => !this.isInvoiceSuccess(inv) && this.isInfoComplete(inv)
    ).length;
    this.issuedCount = this.allInvoices.filter(
      inv => this.isInvoiceSuccess(inv)
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

  // Workaround for BE bug in GetListSALInvoice: it returns Status=135 instead of TypeOfStatus=2
  isInvoiceSuccess(inv: SALOrderInvoiceCusDTO): boolean {
    return inv.TypeOfStatus === SALOrderInvoiceStatusEnum.Success || inv.Status === 135;
  }

  isInvoiceCancelled(inv: SALOrderInvoiceCusDTO): boolean {
    return inv.TypeOfStatus === SALOrderInvoiceStatusEnum.Cancled || inv.Status === 136; // Assuming 136 is cancelled
  }

  isInfoComplete(inv: SALOrderInvoiceCusDTO): boolean {
    if (!inv.FrameSeri?.trim() || !inv.EngineSeri?.trim()) return false;
    if (!inv.VATCustomerName?.trim()) return false;
    if (!inv.VATAddress?.trim()) return false;
    if (inv.VATType === 1) {
      const cccd = inv.VATCCCD?.replace(/\D/g, '') || '';
      const phone = inv.VATCellPhone?.replace(/\D/g, '') || '';
      return cccd.length >= 9 && phone.length >= 10;
    }
    if (inv.VATType === 2 || inv.VATType === 3) {
      return !!(inv.VATCompanyName?.trim() && inv.VATCompanyTax?.trim());
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
    this.loader.loader(true);
    
    // Get company details for the invoice header
    const headInfo: any = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
    
    const payload = {
      Code: item.Code,
      Type: item.VATType || 1,
      HeadName: headInfo?.CompanyName || headInfo?.HeadName || '',
      TaxCode: headInfo?.TaxCode || '',
      Address: headInfo?.Address || ''
    };

    const sub = this.api.ExportSALInvoicePdf(payload).subscribe(
      (res) => {
        this.loader.loader(false);
        if (res && res.StatusCode === 0 && res.ObjectReturn && res.ObjectReturn.Base64) {
          const linkSource = `data:application/pdf;base64,${res.ObjectReturn.Base64}`;
          const downloadLink = document.createElement('a');
          const fileName = res.ObjectReturn.FileName || `HoaDon_GTGT_${item.InvoiceNo}.pdf`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
          this.notification.onSuccess('Tải hóa đơn điện tử thành công');
        } else {
          this.notification.onError(res?.ErrorString || 'Không thể tạo bản thể hiện hóa đơn');
        }
      },
      () => {
        this.loader.loader(false);
        this.notification.onError('Lỗi kết nối máy chủ khi tạo hóa đơn');
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  getInvoiceStatusClass(inv: SALOrderInvoiceCusDTO): string {
    if (this.isInvoiceSuccess(inv)) return 'inv-issued';
    if (this.isInvoiceCancelled(inv)) return 'inv-cancelled';
    return 'inv-pending';
  }

  getInvoiceStatusLabel(inv: SALOrderInvoiceCusDTO): string {
    if (this.isInvoiceSuccess(inv)) return 'Đã phát hành';
    if (this.isInvoiceCancelled(inv)) return 'Đã hủy';
    return 'Chờ xử lý';
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
    if (this.isInvoiceSuccess(inv)) {
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
    const inv = this.selectedInvoice;

    // Validate SK/SM
    if (!inv.FrameSeri?.trim() || !inv.EngineSeri?.trim()) {
      this.notification.onWarning('Hóa đơn chưa gán Số Khung / Số Máy. Vui lòng vào Chứng từ HĐ để gán xe.');
      return;
    }

    // Validate customer info completeness
    if (!inv.VATCustomerName?.trim()) {
      this.notification.onWarning('Chưa nhập tên khách hàng. Vui lòng bổ sung trong Chứng từ HĐ.');
      return;
    }
    if (!inv.VATAddress?.trim()) {
      this.notification.onWarning('Chưa nhập địa chỉ khách hàng. Vui lòng bổ sung trong Chứng từ HĐ.');
      return;
    }

    // Validate by VATType
    if (inv.VATType === 1) {
      const cccd = inv.VATCCCD?.replace(/\D/g, '') || '';
      if (cccd.length < 9) {
        this.notification.onWarning('Số CCCD/CMND không hợp lệ (tối thiểu 9 số). Vui lòng kiểm tra lại.');
        return;
      }
      const phone = inv.VATCellPhone?.replace(/\D/g, '') || '';
      if (phone.length < 10) {
        this.notification.onWarning('Số điện thoại không hợp lệ (tối thiểu 10 số). Vui lòng kiểm tra lại.');
        return;
      }
    }
    if (inv.VATType === 2 || inv.VATType === 3) {
      if (!inv.VATCompanyName?.trim()) {
        this.notification.onWarning('Chưa nhập tên công ty / đơn vị. Vui lòng bổ sung trong Chứng từ HĐ.');
        return;
      }
      if (!inv.VATCompanyTax?.trim()) {
        this.notification.onWarning('Chưa nhập mã số thuế / mã đơn vị. Vui lòng bổ sung trong Chứng từ HĐ.');
        return;
      }
    }

    this.loader.loader(true);
    const invoiceCode = this.selectedInvoice.Code;
    const orderMasterCode = this.selectedInvoice.OrderMaster;
    const sub = this.api.UpdateSALInvoiceIssue([invoiceCode]).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Phát hành hóa đơn thành công!');
          this.closeIssueConfirm();
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

    // Only consider invoices that are relevant (complete info OR already issued)
    const relevantInvoices = orderInvoices.filter(inv =>
      inv.TypeOfStatus === SALOrderInvoiceStatusEnum.Success || this.isInfoComplete(inv)
    );
    if (relevantInvoices.length === 0) return;

    const issuedCount = relevantInvoices.filter(inv =>
      inv.Code === this.selectedInvoice?.Code || this.isInvoiceSuccess(inv)
    ).length;

    const allIssued = issuedCount >= relevantInvoices.length;

    // Find current order to check its status
    const currentGroup = this.displayGroups.flatMap(g => g.items).find(i => i.Code === orderMasterCode);
    const currentStatus = currentGroup?.Status;

    let newStatus: number;
    let message: string;

    if (allIssued) {
      // All relevant invoices issued → COMPLETE
      newStatus = SALOrderMasterStatusRetailEnum.COMPLETE;
      message = 'Phiếu bán hàng đã hoàn tất!';
    } else {
      // Some invoices issued but not all → at least PROCESSING
      newStatus = SALOrderMasterStatusRetailEnum.PROCESSING;
      message = `Đang xử lý (${issuedCount}/${relevantInvoices.length} hóa đơn đã phát hành)`;
    }

    // Rule: only move status FORWARD, never backward
    if (currentStatus && currentStatus >= newStatus) return;

    const masterDTO = new SALOrderMasterCusDTO();
    masterDTO.Code = orderMasterCode;
    masterDTO.Status = newStatus;
    const param = { DTO: masterDTO, Properties: ['Status'] };
    this.api.UpdateSALMaster(param).subscribe({
      next: (res) => {
        if (res.StatusCode === 0) {
          this.notification.onSuccess(message);
        }
      }
    });
  }

  bulkIssueAll(): void {
    // Only collect invoices that are visible on screen (ready + not yet issued)
    const pendingCodes: number[] = [];
    this.displayGroups.forEach(group => {
      group.items.forEach(item => {
        (item.invoices || []).forEach(inv => {
          if (!this.isInvoiceSuccess(inv) && !this.isInvoiceCancelled(inv)) {
            pendingCodes.push(inv.Code);
          }
        });
      });
    });

    if (pendingCodes.length === 0) {
      this.notification.onWarning('Không có hóa đơn chờ phát hành');
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
