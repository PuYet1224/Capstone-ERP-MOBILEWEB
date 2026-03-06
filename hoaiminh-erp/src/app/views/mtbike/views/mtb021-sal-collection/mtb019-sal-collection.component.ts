import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb019-sal-collection',
  templateUrl: './mtb019-sal-collection.component.html',
  styleUrls: ['./mtb019-sal-collection.component.scss'],
})

export class Mtb019SalCollectionComponent implements OnInit {
  constructor(
    private api: MtbikeApiService,
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
  ) { }

  //#region life circle
  private arrUnsubscribe: Subscription[] = [];
  public isOpenedFilter: boolean = false;
  public searchKeyword: string = '';
  public SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
  public FunctionPermissionDTO = FunctionPermissionDTO;

  private isLoading = false;
  private isLastPage = false;
  @ViewChild('anchor', { static: true }) anchor: ElementRef;
  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
  private observer: IntersectionObserver;

  ngOnInit(): void {
    this.handlefilter();
    this.GetListSALCollection(this.filter);
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private loadMore() {
    if (this.isLoading || this.isLastPage) return;

    // Nếu danh sách chưa đủ dài để có scroll => không gọi API thêm
    const listEl = this.bodyList.nativeElement as HTMLElement;
    if (listEl.scrollHeight <= listEl.clientHeight) {
      return;
    }

    this.filter.skip += this.filter.take;
    this.GetListSALCollection(this.filter);
  }

  public onNavigate(field: string) {
    this.router.navigate([field]);
  }
  //#end region

  //#region body
  public data: Array<SALOrderDetailCusDTO> = [];
  public actionactive: string = 'payment';
  public actiontab = [
    { text: 'Chưa hoàn tất', type: 'payment' },
    { text: 'Hoàn tất', type: 'paid' }
  ]

  public onChangeType(type: string): void {
    this.data = [];
    this.actionactive = type;
    this.handlefilter();
    this.GetListSALCollection(this.filter)
  }

  private GetListSALCollection(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const temp = this.api.GetListSALCollection(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn.Data;

        if (data.length < this.filter.take) {
          this.isLastPage = true;
        }

        // 🔹 Nếu refresh (tức là search mới hoặc sau khi xóa) thì gán lại
        if (isRefresh) {
          this.data = data;
        } else {
          // 🔹 Nếu loadMore thì nối thêm
          this.data = [...this.data, ...data];
        }
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu bán hàng : ${res.ErrorString}`);
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu bán hàng : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region  footer
  public filter: State = { skip: 0, take: 15, filter: { filters: [], logic: 'and' }, sort: [{ field: 'Code', dir: 'desc' }] };
  public selectedstt: SALOrderDetailStatusEnum;
  public liststtpaid: Array<{ text: string, enum: SALOrderDetailStatusEnum, isdefault: boolean }> = [
    { text: 'Tất cả', enum: null, isdefault: false },
    { text: 'Lắp ráp, kiểm tra', enum: SALOrderDetailStatusEnum.Technical, isdefault: true },
    { text: 'Hoàn tất', enum: SALOrderDetailStatusEnum.Completed, isdefault: true },
    { text: 'Yêu cầu xuất kho', enum: SALOrderDetailStatusEnum.OutboundRequest, isdefault: true },
    { text: 'Đã xuất kho', enum: SALOrderDetailStatusEnum.OutboundCompleted, isdefault: true },
    { text: 'Thanh toán', enum: SALOrderDetailStatusEnum.Payment, isdefault: true },
    { text: 'Huỷ giao dịch', enum: SALOrderDetailStatusEnum.Canceled, isdefault: true }
  ];
  public liststtpayment: Array<{ text: string, enum: SALOrderDetailStatusEnum, isdefault: boolean }> = [
    { text: 'Tất cả', enum: null, isdefault: false },
    { text: 'Yêu cầu thanh toán', enum: SALOrderDetailStatusEnum.PaymentRequest, isdefault: true },
    { text: 'Lấy t.tin chủ xe', enum: SALOrderDetailStatusEnum.OwnerInfo, isdefault: true },
    { text: 'Lấy t.tin liên lạc', enum: SALOrderDetailStatusEnum.ContactInfo, isdefault: true },
    { text: 'Lấy t.tin khác', enum: SALOrderDetailStatusEnum.OtherInfo, isdefault: true },
    { text: 'Chuẩn bị thanh toán', enum: SALOrderDetailStatusEnum.RePayment, isdefault: true },
  ]

  public onSearchTask() {
    this.openFilterPopup(false);

    this.filter.skip = 0;
    this.isLastPage = false;

    this.data = [];
    this.handlefilter();
    this.GetListSALCollection(this.filter);
  }

  private handlefilter() {
    this.filter.filter = { logic: 'and', filters: [] };
    const statusFilters = [];

    if (this.selectedstt) {
      statusFilters.push({ field: 'Status', operator: 'eq', value: this.selectedstt });
    }
    else {
      var arrname = '';
      if (this.actionactive == 'paid')
        arrname = 'liststtpaid';
      else
        arrname = 'liststtpayment';

      this[arrname].forEach(f => {
        if (f.isdefault)
          statusFilters.push({ field: 'Status', operator: 'eq', value: f.enum })
      })
    }

    if (statusFilters.length) {
      this.filter.filter.filters.push({ logic: 'or', filters: statusFilters });
    }

    if (this.searchKeyword.trim() !== '') {
      this.filter.filter.filters.push({
        logic: "or", filters: [
          { field: "ID", operator: "contains", value: this.searchKeyword },
          { field: "CustomerName", operator: "contains", value: this.searchKeyword },
          { field: "CustomerPhone", operator: "contains", value: this.searchKeyword }
        ]
      });
    }
  }

  public onSetItem(item: SALOrderDetailCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, item);
    switch (item.Status) {
      case SALOrderDetailStatusEnum.PaymentRequest:
        this.onNavigate('/mtbike/collection/vehicle');
        break;

      case SALOrderDetailStatusEnum.OwnerInfo:
        this.onNavigate('/mtbike/collection/owner');
        break;

      case SALOrderDetailStatusEnum.ContactInfo:
        this.onNavigate('/mtbike/collection/contact');
        break;

      case SALOrderDetailStatusEnum.OtherInfo:
        this.onNavigate('/mtbike/collection/other');
        break;

      default:
        this.onNavigate('/mtbike/collection/payment');
        break;
    }
  }

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;
  }
  //#endregion
}
