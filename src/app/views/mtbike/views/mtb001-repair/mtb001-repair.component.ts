import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { Subscription } from 'rxjs';
import { CSWorkOrderMasterCusDTO } from 'src/app/models/dtos/e-dtos/cs-work-order-master.dto';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';

@Component({
  selector: 'mtb001-repair',
  templateUrl: './mtb001-repair.component.html',
  styleUrls: ['./mtb001-repair.component.scss'],
})

export class Mtb001RepairComponent implements OnDestroy, OnInit {
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private router: Router,
  ) { }
  //#region life circle
  private arrUnsubscribe: Subscription[] = [];
  public isOpenedFilter: boolean = false;
  public showpopup: boolean = false;
  public listworkordermaster: CSWorkOrderMasterCusDTO[] = [];
  public itemworkordermaster: CSWorkOrderMasterCusDTO = new CSWorkOrderMasterCusDTO();
  public searchKeyword: string = '';
  public WOMStatusEnum = WOMStatusEnum
  private pressTimer: any;

  public selectedProgress: number | null = null;
  public progressList = [
    { text: 'Tất cả', value: null },
    { text: 'Tiếp nhận xe', value: WOMStatusEnum.RECEIVING },
    { text: 'Tiếp nhận khách hàng', value: WOMStatusEnum.REPAIRING },
    { text: 'Chờ giao xe', value: WOMStatusEnum.WAITING_DELIVERY },
    { text: 'Hoàn tất', value: WOMStatusEnum.DONE }
  ];


  public customerInfo: any;
  public filter: State = {
    skip: 0,
    take: 15,
  };
  private isLoading = false;
  private isLastPage = false;
  @ViewChild('anchor', { static: true }) anchor: ElementRef;
  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
  private observer: IntersectionObserver;

  ngOnInit(): void {
    this.GetListWOMConsultant(this.filter);

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
    this.observer.disconnect();
  }

  private loadMore() {
    if (this.isLoading || this.isLastPage) return;

    // Nếu danh sách chưa đủ dài để có scroll => không gọi API thêm
    const listEl = this.bodyList.nativeElement as HTMLElement;
    if (listEl.scrollHeight <= listEl.clientHeight) {
      return;
    }

    this.filter.skip += this.filter.take;
    this.GetListWOMConsultant(this.filter);
  }


  onSetItem(item: CSWorkOrderMasterCusDTO) {
    item.CustomerPhone = null;
    this.cache.setItem(KeyLocalStorageEnum.WOM_MASTER, item);
    this.router.navigate(['/mtbike/repair/vehicle']);
  }


  startPress(item: any) {
    this.pressTimer = setTimeout(() => {
      this.openPopup(item);
    }, 1000);

    this.itemworkordermaster = item;
  }

  endPress() {
    clearTimeout(this.pressTimer);
  }

  openPopup(item: any) {
    if (item.Progress !== WOMStatusEnum.RECEIVING) return;
    this.customerInfo = item;
    this.showpopup = true;
  }

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;
  }

  public onSearchTask() {
    this.openFilterPopup(false);

    this.filter.skip = 0;
    this.isLastPage = false;

    const filters: any[] = [];

    // Nếu có keyword thì lọc theo tên, SĐT, biển số
    if (this.searchKeyword.trim() !== '') {
      filters.push({
        logic: "or",
        filters: [
          { field: "CustomerName", operator: "contains", value: this.searchKeyword },
          { field: "CustomerPhone", operator: "contains", value: this.searchKeyword },
          { field: "VehiclePlateNo", operator: "contains", value: this.searchKeyword }
        ]
      });
    }
    // Nếu có chọn progress thì thêm filter theo Progress
    if (this.selectedProgress !== null) {
      filters.push({
        field: "Progress",
        operator: "eq",
        value: this.selectedProgress
      });
    }

    // Gán filter nếu có ít nhất 1 điều kiện
    this.filter.filter = filters.length > 0 ? { logic: "and", filters } : undefined;

    this.listworkordermaster = [];
    this.GetListWOMConsultant(this.filter);
    // this.selectedProgress = null;
    this.searchKeyword = '';
  }




  onAddNew(field: string) {
    if (field === 'next') {
      this.router.navigate(['/mtbike/repair/scan']);
    } else if (field === 'home') {
      this.router.navigate(['/menu']);
    }
  }

  //#endregion

  //#region list

  private GetListWOMConsultant(filter: State, isRefresh: boolean = false) {
    this.isLoading = true;
    this.loader.loader(true);

    const temp = this.api.GetListWOMConsultant(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn.Data;

        if (data.length < this.filter.take) {
          this.isLastPage = true;
        }

        // 🔹 Nếu refresh (tức là search mới hoặc sau khi xóa) thì gán lại
        if (isRefresh) {
          this.listworkordermaster = data;
        } else {
          // 🔹 Nếu loadMore thì nối thêm
          this.listworkordermaster = [...this.listworkordermaster, ...data];
        }
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu tiếp nhận : ${res.ErrorString}`);
      }
      this.isLoading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isLoading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách phiếu tiếp nhận : ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }


  public DeleteWOMConsultant(param: CSWorkOrderMasterCusDTO) {
    this.loader.loader(true);
    const temp = this.api.DeleteWOMConsultant(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.notification.onSuccess(`Thành công`);
        this.showpopup = false;
        this.listworkordermaster = this.listworkordermaster.filter(
          (x) => x.Code !== param.Code
        );
        // this.GetListWOMConsultant(this.filter, true);

      } else {
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
        this.showpopup = false;
      }
      this.loader.loader(false);
    }, (err) => {
      this.loader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
      this.showpopup = false;
    });
    this.arrUnsubscribe.push(temp);
  }

  //#endregion
}

