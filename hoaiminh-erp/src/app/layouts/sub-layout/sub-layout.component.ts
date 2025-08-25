import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { DrawerComponent, DrawerItemExpandedFn, DrawerMode, DrawerSelectEvent } from "@progress/kendo-angular-layout";
import * as $ from 'jquery';
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";
import { Router } from "@angular/router";
import { PSString } from "src/app/services/utilities/ps-string";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { LayoutApiService } from "src/app/services/layout/layout-api.service";
import { PsLayoutLoaderService } from "../main-layout/services/ps-layout-loader.service";
import { DrawerItemCusInterface } from "../main-layout/models/dtos/drawer-item-cus.interface";
import { PSMtbikeApiService } from "src/app/views/mtbike/services/ps-mtbike-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { Subscription } from "rxjs";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";

@Component({
  selector: 'ps-sub-layout',
  templateUrl: './sub-layout.component.html',
  styleUrls: ['./sub-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SubLayoutComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() data: DrawerItemCusInterface[] = [];
  @ViewChild('main_layout_drawer') mainlayoutdrawer!: DrawerComponent;

  public drawerexpanded: boolean = true;
  public drawermode: DrawerMode = 'push';
  public showw: boolean = false;

  constructor(private cdr: ChangeDetectorRef,
    private PSHeaderService: PSHeaderService,
    public subLoader: PsLayoutLoaderService,
    private route: Router,
    private cache: PSCache,
    private cdRef: ChangeDetectorRef,
    private admimapi: LayoutApiService,
    private mtbikeapi: PSMtbikeApiService,
    private notification: PSKendoNotificationService,
  ) { }

  //#region lifecycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit(): void {
    this.PSHeaderService.expanded.subscribe(() => {
      this.mainlayoutdrawer.toggle();
    });

    this.selectedTypeOfVehicle = this.newSelectedTypeOfVehicle;
    this.selectedVehicle = this.newSelectedVehicle;
    this.selectedColorVehicle = this.newSelectedColorVehicle;

    var itemcache = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
    var parseitemcahe = this.cache.parseValue(itemcache);
    this.headCode = itemcache ? parseitemcahe.Head : 0;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      const firstExpanded = this.data.find(item => item.opend === true);
      this.expandedId = firstExpanded?.id ?? null;
      this.showw = true;
      this.cdRef.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    var that = this;
    this.cdr.detectChanges();
    var element = $('ul.k-drawer-items');

    //drawer collapse hover
    var isExpanded: { value: Boolean };
    element.hover(
      function () {
        isExpanded = { value: that.drawerexpanded };
        if (!isExpanded.value) {
          that.mainlayoutdrawer.toggle();
        }
      },
      function () {
        if (!isExpanded.value) {
          that.mainlayoutdrawer.toggle();
        }
      }
    );

    //setup drawer scroll
    this.isScroll = this.set_scroll(element);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region drawer scroll
  public isScroll: boolean = false;

  private set_scroll(element: any) {
    return element.prop("scrollHeight") > element.innerHeight();
  }
  //#endregion

  //#region drawer item
  public expandedId = null;

  public isItemExpanded: DrawerItemExpandedFn = (item): boolean => {
    return this.expandedId === item.id;
  };

  public onSelect(ev: DrawerSelectEvent): void {
    if (ev.item.type == 'module') {
      const current = ev.item.id;
      if (this.expandedId == current)
        this.expandedId = null;
      else
        this.expandedId = current;
    }
  }

  onClick(e) {
    if (!PSString.isNullOrWhitespace(e.url) && e.url != this.route.url && e.type != 'm_lookup') {
      this.admimapi.GetPermissionDLL(e.url.split('/')[e.url.split('/').length - 1]).subscribe(() => {
        var link = e.url.split('/').slice(1);
        this.cache.setItem(KeyLocalStorageEnum.OUT_URL, e.url)
        this.route.navigate(link)
      });
    }
    else if (e.type == 'm_lookup') {
      this.GetListTypeOfVehicle();
    }
  }
  //#endregion

  //#region lookup
  public isOpenedLookup: boolean = false;
  public listTypeOfVehicle: LSTypeOfVehicleCusDTO[] = [];
  public listVehicle: LSVehicleCusDTO[] = [];
  public listcolor: LSVehicleColorCusDTO[] = [];
  public selectedTypeOfVehicle: LSTypeOfVehicleCusDTO = new LSTypeOfVehicleCusDTO();
  public selectedVehicle: LSVehicleCusDTO = new LSVehicleCusDTO();
  public selectedColorVehicle: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public newSelectedTypeOfVehicle: LSTypeOfVehicleCusDTO = { Code: null, TypeOfVehicle: '--Không lựa chọn--' } as LSTypeOfVehicleCusDTO;
  public newSelectedVehicle: LSVehicleCusDTO = { Code: null, VehicleName: '--Không lựa chọn--' } as LSVehicleCusDTO;
  public newSelectedColorVehicle: LSVehicleColorCusDTO = { Code: null, ColorName: '--Không lựa chọn--' } as LSVehicleColorCusDTO;
  public vehiclecolor: LSVehicleColorCusDTO = new LSVehicleColorCusDTO();
  public listStock: {
    Code: number; storeName: string, stock: number
  }[] = [];
  public headCode: number;


  public closePopup() {
    this.selectedTypeOfVehicle = this.newSelectedTypeOfVehicle;
    this.selectedVehicle = this.newSelectedVehicle;
    this.selectedColorVehicle = this.newSelectedColorVehicle;
    this.vehiclecolor = new LSVehicleColorCusDTO();
    this.listStock = [];
    this.isOpenedLookup = false;
    var isdetail = false;
    var functionactive = this.route.url.split('/').pop();

    if (functionactive == 'detail') {
      functionactive = this.route.url.replace('/detail', '').split('/').pop();
      isdetail = true;
    }

    this.data = this.data.map(item => {
      if (item.url && (item.url.endsWith(functionactive) || (isdetail && item.url.replace('/detail', '').endsWith(functionactive)))) {
        return { ...item, selected: true };
      }
      return { ...item, selected: false };
    });

  }

  public onFieldChange(field: string, value: any) {
    if (field === 'typevehivle') {
      this.selectedVehicle = this.newSelectedVehicle;
      this.selectedColorVehicle = this.newSelectedColorVehicle;
      this.GetListVehicle(value);
    } else if (field === 'vehivle') {
      this.selectedColorVehicle = this.newSelectedColorVehicle;
      this.getlistvehiclecolor(value);
    }
  }

  public onLoopUp() {
    this.GetListStockVehicleColor(this.selectedColorVehicle);
  }

  private GetListTypeOfVehicle(): void {
    this.subLoader.loader(true);
    var sub = this.mtbikeapi.GetListTypeOfVehicle().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listTypeOfVehicle = res.ObjectReturn;
        this.isOpenedLookup = true;
        this.subLoader.loader(false);
      }
      else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy dòng xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy dòng xe: ${err.message}`);
    })
    this.arrUnsubscribe.push(sub);
  }

  private GetListVehicle(param: LSTypeOfVehicleCusDTO): void {
    this.subLoader.loader(true);
    var sub = this.mtbikeapi.GetListVehicle(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listVehicle = res.ObjectReturn;
        if (this.listVehicle.length == 0) {
          this.selectedVehicle = { Code: null, VehicleName: '--Không lựa chọn--' } as LSVehicleCusDTO;
        }
        this.subLoader.loader(false);
      }
      else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy loại xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy loại xe: ${err.message}`);
    })
    this.arrUnsubscribe.push(sub);
  }

  private getlistvehiclecolor(params: LSVehicleCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListVehicleColor(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listcolor = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách màu xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách màu xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private GetListStockVehicleColor(params: LSVehicleColorCusDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetListStockVehicleColor(params).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.vehiclecolor = res.ObjectReturn;
        this.listStock = this.vehiclecolor.ListStock;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi tra cứu xe: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi tra cứu xe: ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
