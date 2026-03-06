import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-master.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb028-sal-payment',
  templateUrl: './mtb028-sal-payment.component.html',
  styleUrls: ['./mtb028-sal-payment.component.scss'],
})

export class Mtb028SalPaymentComponent implements OnDestroy, OnInit {
  constructor(
    private api: MtbikeApiService,
    private cache: PsCache,
    private router: Router,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
  ) { }
  //#region life circle
  private arrUnsubscribe: Subscription[] = [];
  private isLoading = false;
  private isLastPage = false;
  @ViewChild('anchor', { static: true }) anchor: ElementRef;
  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
  private observer: IntersectionObserver;
  public filter: State = {
    skip: 0,
    take: 4,
    sort: [
      { field: 'Code', dir: 'desc' }
    ],
  };

  ngOnInit(): void {
    this.GetListSALPayment(this.filter);
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
    this.observer.disconnect();
  }
  //#endregion

  //#region main
  public data: SALOrderMasterCusDTO[] = [];
  private GetListSALPayment(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const temp = this.api.GetListSALPayment(filter).subscribe((res) => {
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
        this.isshowfilter = false;
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu thanh toán : ${res.ErrorString}`);
        this.isshowfilter = false;
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu thanh toán : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion
  //#region  filter
  public searchKeyword: string = '';
  public isshowfilter: boolean = false;
  private loadMore() {
    if (this.isLoading || this.isLastPage) return;

    // Nếu danh sách chưa đủ dài để có scroll => không gọi API thêm
    const listEl = this.bodyList.nativeElement as HTMLElement;
    if (listEl.scrollHeight <= listEl.clientHeight) {
      return;
    }

    this.filter.skip += this.filter.take;
    this.GetListSALPayment(this.filter);
  }

  public onnavigate(field: string, e: SALOrderMasterCusDTO = null) {
    if (e != null)
      this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, e);

    this.router.navigate([field]);
  }
  public onSearchTask() {
    this.filter.skip = 0;
    this.isLastPage = false;

    const filters: any[] = [];

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

    this.filter.filter = filters.length > 0 ? { logic: "and", filters } : undefined;

    this.data = [];
    this.GetListSALPayment(this.filter);
  }
  public openFilterPopup(v: boolean) {
    this.isshowfilter = v;
  }
  //#endregion
}
