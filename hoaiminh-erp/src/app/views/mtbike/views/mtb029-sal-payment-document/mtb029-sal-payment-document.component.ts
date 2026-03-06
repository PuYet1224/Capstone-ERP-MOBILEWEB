import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderInvoiceCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-invoice.dto';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { SALOrderReceiptCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-receipt.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb029-sal-payment-document',
  templateUrl: './mtb029-sal-payment-document.component.html',
  styleUrls: ['./mtb029-sal-payment-document.component.scss'],
})

export class Mtb029SalPaymentDocumentComponent implements OnInit {

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

  ngOnInit(): void {
    var temp = this.cache.getItem(KeyLocalStorageEnum.WOM_MASTER);
    this.ordermaster = this.cache.parseValue(temp);
    this.filter.filter = { logic: 'and', filters: [{ field: "OrderMaster", operator: "eq", value: this.ordermaster.Code }] };

    if (this.ordermaster.NumOfInvoice) {
      this.tabactive = 'invoice';
    }

    if (this.tabactive == 'receipt') {
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

  public onnavigate(field: string = '') {
    if (field == '') {
      if (this.tabactive == 'receipt') {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, new SALOrderReceiptCusDTO())
        field = '/mtbike/payment/receipt'
      }
      else {
        this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, new SALOrderInvoiceCusDTO())
        field = '/mtbike/payment/selection'
      }
    }
    this.router.navigate([field]);
  }
  //#endregion


  //#region main
  public listtab: { name: string, value: string }[] = [
    { name: 'Phiếu thu', value: 'receipt' },
    { name: 'Hoá đơn', value: 'invoice' }
  ];
  public tabactive: string = 'receipt';
  public datareceipt: SALOrderReceiptCusDTO[] = [];
  public datainvoice: SALOrderInvoiceCusDTO[] = [];

  public onchangetab(tab: string) {
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

    if (this.tabactive == 'receipt') {
      this.GetListSALReceipt(this.filter);
    } else {
      this.GetListSALInvoice(this.filter);
    }
  }

  public onSetItem(item: any, field: string) {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_RECEIPT, item);
    if (item.Status == SALOrderInvoiceStatusEnum.New && field == '/mtbike/payment/total') {
      this.router.navigate(['/mtbike/payment/total']);
    } else if (item.Status == SALOrderInvoiceStatusEnum.Success && field == '/mtbike/payment/total') {
      this.router.navigate(['/mtbike/payment/invoice']);
    }
    else {
      this.router.navigate([field]);
    }
  }

  private loadMore() {
    if (this.isLoading || this.isLastPage) return;

    // Nếu danh sách chưa đủ dài để có scroll => không gọi API thêm
    const listEl = this.bodyList.nativeElement as HTMLElement;
    if (listEl.scrollHeight <= listEl.clientHeight) {
      return;
    }

    this.filter.skip += this.filter.take;
    if (this.tabactive == 'receipt') {
      this.GetListSALReceipt(this.filter)
    } else {
      this.GetListSALInvoice(this.filter)
    }
  }

  private GetListSALReceipt(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const temp = this.api.GetListSALReceipt(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn.Data;

        if (data.length < this.filter.take) {
          this.isLastPage = true;
        }

        // 🔹 Nếu refresh (tức là search mới hoặc sau khi xóa) thì gán lại
        if (isRefresh) {
          this.datareceipt = data;
        } else {
          // 🔹 Nếu loadMore thì nối thêm
          this.datareceipt = [...this.datareceipt, ...data];
        }
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu thu : ${res.ErrorString}`);
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu thu : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }

  private GetListSALInvoice(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const temp = this.api.GetListSALInvoice(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn.Data;

        if (data.length < this.filter.take) {
          this.isLastPage = true;
        }

        // 🔹 Nếu refresh (tức là search mới hoặc sau khi xóa) thì gán lại
        if (isRefresh) {
          this.datainvoice = data;
        } else {
          // 🔹 Nếu loadMore thì nối thêm
          this.datainvoice = [...this.datainvoice, ...data];
        }
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách hóa đơn : ${res.ErrorString}`);
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách hóa đơn : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
