import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { SALOrderDetailCusDTO } from 'src/app/models/dtos/e-dtos/sal-order-detail.dto';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PsString } from 'src/app/services/utilities/ps-string';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb017-sal-warehouse',
  templateUrl: './mtb017-sal-warehouse.component.html',
  styleUrls: ['./mtb017-sal-warehouse.component.scss'],
})

export class Mtb017SalWarehouseComponent {
  //#region  life circle
  constructor(
    private api: MtbikeApiService,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
    private cache: PsCache,
    private router: Router,
  ) { }

  private arrUnsubscribe: Subscription[] = [];
  public FunctionPermissionDTO = FunctionPermissionDTO;
  ngOnInit(): void {
    this.handlefilter();
    this.getlistsalwarehouse(this.filter);

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting)
        this.loadmore();
    }, { threshold: 0.1 });

    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region body
  @ViewChild('anchor', { static: true }) anchor: ElementRef;
  @ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
  public typ2e: SALOrderDetailStatusEnum = SALOrderDetailStatusEnum.Completed;
  public type: SALOrderDetailStatusEnum = SALOrderDetailStatusEnum.OutboundRequest;
  public actiontabs: Array<{ text: string; type: SALOrderDetailStatusEnum }> = [
    { text: 'Chờ xuất', type: SALOrderDetailStatusEnum.OutboundRequest },
    { text: 'Đã xuất', type: null },
    { text: 'Điều chuyển', type: SALOrderDetailStatusEnum.TransferRequest },
  ]
  public listdetailwarehouse: Array<SALOrderDetailCusDTO> = [];
  public filter: State = { skip: 0, take: 15, sort: [{ field: 'Code', dir: 'desc' }], filter: { logic: 'and', filters: [] } };
  private islastpage: boolean = false;
  private isloading = false;
  private observer: IntersectionObserver;

  public onclickitem(item: SALOrderDetailCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_DETAIL, item);
    this.router.navigate(['/mtbike/sale_wh/detail']);
  }

  public onchangeactiontab(type: SALOrderDetailStatusEnum): void {
    this.type = type;
    this.listdetailwarehouse = [];
    this.handlefilter();
    this.getlistsalwarehouse(this.filter);
  }

  private loadmore() {
    if (this.isloading || this.islastpage) return;

    const listEl = this.bodyList.nativeElement as HTMLElement;
    if (listEl.scrollHeight <= listEl.clientHeight) {
      return;
    }

    this.filter.skip += this.filter.take;
    this.getlistsalwarehouse(this.filter);
  }

  private handlefilter() {
    this.filter.filter.filters = [];

    if (this.type != null) {
      if (this.type === SALOrderDetailStatusEnum.TransferRequest) {
        this.filter.filter.filters.push({
          logic: 'or',
          filters: [
            { field: 'Status', operator: 'eq', value: SALOrderDetailStatusEnum.TransferRequest },
            { field: 'TransferCSVehicle', operator: 'neq', value: null },
          ]
        });
      } else {
        this.filter.filter.filters.push({
          field: 'Status',
          operator: 'eq',
          value: this.type
        });
      }
    } else {
      this.filter.filter.filters.push({
        logic: 'or',
        filters: [
          { field: 'Status', operator: 'eq', value: SALOrderDetailStatusEnum.Completed },
          { field: 'CSVehicle', operator: 'neq', value: null }
        ]
      });
    }

    if (!PsString.isNullOrWhitespace(this.searchKeyword)) {
      const searchFilter: CompositeFilterDescriptor = {
        logic: 'or',
        filters: [
          { field: 'ID', operator: 'contains', value: this.searchKeyword },
          { field: 'SaleStaffName', operator: 'contains', value: this.searchKeyword },
          { field: 'VehicleName', operator: 'contains', value: this.searchKeyword },
          { field: 'VehicleColorName', operator: 'contains', value: this.searchKeyword },
        ]
      };

      this.filter.filter.filters.push(searchFilter);
    }

    this.openfilterpopup(false);

    this.filter.skip = 0;
    this.islastpage = false;
  }

  private getlistsalwarehouse(filter: State, isRefresh: boolean = false) {
    this.isloading = true;
    this.loader.loader(true);

    const temp = this.api.GetListSALWarehouse(filter).subscribe((res) => {
      if (res.StatusCode === 0) {
        const data = res.ObjectReturn.Data;

        if (data.length < this.filter.take)
          this.islastpage = true;

        if (isRefresh) {
          this.listdetailwarehouse = data;
        } else {
          this.listdetailwarehouse = [...this.listdetailwarehouse, ...data];
        }
        this.loader.loader(false);
      } else {
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
      this.isloading = false;
      this.loader.loader(false);
    }, (err) => {
      this.isloading = false;
      this.loader.loader(false);
      this.notification.onError(`Lỗi: ${err.message}`);
    });

    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region footer
  public onnavigate(link) {
    this.router.navigate([link]);
  }
  //#endregion

  //#region popup filter
  public isopenedfilter: boolean = false;
  public searchKeyword: string = '';

  public openfilterpopup(v: boolean) {
    this.isopenedfilter = v;
  }

  public onsearchtask() {
    this.handlefilter();
    this.listdetailwarehouse = [];
    this.getlistsalwarehouse(this.filter, true);
  }
  //#endregion
}