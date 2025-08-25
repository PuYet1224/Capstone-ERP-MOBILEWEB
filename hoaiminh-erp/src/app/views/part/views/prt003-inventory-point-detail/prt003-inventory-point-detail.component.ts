import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { searchIcon } from '@progress/kendo-svg-icons';
import { WHInventoryPointCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-point.dto';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { Subject, Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { WHInventorySessionCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-session.dto';
import { WHLocationCusDTO } from '../../../../models/dtos/e-dtos/wh-location.dto';
import { InventoryMasterStatusEnum } from '../../../../models/enums/e-status/wh-inventory-master-status.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WHInventoryMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-master.dto';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { WHInventoryPointDetailTagEnum } from '../../../../models/enums/e-type/wh-inventory-point-detail-tag.enum';
import { WHInventoryScanCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-scan.dto';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { PsFilterTextboxComponent } from 'src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component';
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  State,
} from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { PSFile } from 'src/app/services/utilities/ps-file';
import { PSObject } from 'src/app/services/utilities/ps-object';
@Component({
  selector: 'prt003-inventory-point-detail',
  templateUrl: './prt003-inventory-point-detail.component.html',
  styleUrls: ['./prt003-inventory-point-detail.component.scss'],
})
export class Prt003InventoryPointDetailComponent implements OnInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = [];
  public enumStatus = InventoryMasterStatusEnum;
  public items: string[] = ['nguyen van a', 'tran van b'];
  constructor(
    private partapi: PSPartApiService,
    private cache: PSCache,
    private subLoader: PsLayoutLoaderService,
    private notification: PSKendoNotificationService
  ) { }

  ngOnInit(): void {
    this.getCacheInventoryMaster();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  //Danh sách SVG Icon
  public icons = { searchIcon: searchIcon };
  //Data giả của dropdown lượt kiểm kê

  //biến quản lý trạng thái của radio
  allowInventory = false;
  //Đầu mục các tabs

  public isBlock1: boolean = true;
  OpenBlock1() {
    this.isBlock1 = !this.isBlock1;
  }

  //#region inventory point
  public inventoryPoint: WHInventoryPointCusDTO = new WHInventoryPointCusDTO();
  public inventoryPointCacge: WHInventoryPointCusDTO;

  private getCacheInventoryMaster() {
    var temp = this.cache.getItem(KeyLocalStorageEnum.INV_POINT_OBJECT);
    this.inventoryPointCacge = this.cache.parseValue(temp);
    this.getInventoryPoint(this.inventoryPointCacge);
  }

  private getInventoryPoint(param: WHInventoryPointCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetInventoryPoint(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.inventoryPoint = res.ObjectReturn;
          this.getListInventorySession(this.inventoryPoint);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin điểm kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin điểm kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public updateInventoryMaster(e) {
    var temp = new WHInventoryMasterCusDTO();
    temp.Code = this.inventoryPoint.InventoryMaster;
    temp.HiddenStock = e;
    var dto: UpdatePropertiesInterface<WHInventoryMasterCusDTO> = {
      DTO: temp,
      Properties: ['HiddenStock'],
    };
    this.UpdateInventoryMaster(dto);
  }

  private UpdateInventoryMaster(
    param: UpdatePropertiesInterface<WHInventoryMasterCusDTO>
  ) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryMaster(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          if (this.activeTabIndex == 1) {
            this.onTabResult();
          }
          this.subLoader.loader(false);
          this.notification.onSuccess(
            `Cập nhật thông tin kỳ kiểm kê thành công`
          );
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi cập nhật thông tin kỳ kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi cập nhật thông tin kỳ kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region inventory session
  public inventorySessionList: WHInventorySessionCusDTO[] = [];
  public inventorySessionActive: WHInventorySessionCusDTO =
    new WHInventorySessionCusDTO();
  private inventorySessionTemp: WHInventorySessionCusDTO;

  public onSelectionChange(value) {
    this.activeTabIndex = 0;
    this.inventorySessionActive = value;
    this.getListSessionLocation(this.inventorySessionActive);
  }

  public onFocusSession() {
    this.inventorySessionTemp = { ...this.inventorySessionActive };
  }

  public endDisable(): boolean {
    return (
      this.inventorySessionActive.StatusID == InventoryMasterStatusEnum.DONE ||
      this.inventoryPoint.StatusID == InventoryMasterStatusEnum.DONE
    );
  }

  public createDisable(): boolean {
    return (
      this.inventorySessionActive.StatusID != InventoryMasterStatusEnum.DONE ||
      this.inventorySessionList.length == 3 ||
      this.inventoryPoint.StatusID == this.enumStatus.DONE ||
      this.inventorySessionList[this.inventorySessionList.length - 1]
        .StatusID == InventoryMasterStatusEnum.DOING
    );
  }

  public endCreateDisable(): boolean {
    return (
      this.inventorySessionActive.StatusID == InventoryMasterStatusEnum.DONE ||
      this.inventorySessionList.length == 3 ||
      this.inventoryPoint.StatusID == InventoryMasterStatusEnum.DONE
    );
  }

  public createSession() {
    this.selectTab(0);
    var temp = new WHInventorySessionCusDTO();
    temp.InventoryPoint = this.inventoryPoint.Code;
    this.UpdateInventorySession(temp);
  }

  public onEndSession() {
    if (
      this.inventorySessionActive.StatusID == InventoryMasterStatusEnum.DOING
    ) {
      this.inventorySessionActive.StatusID = InventoryMasterStatusEnum.DONE;
      this.UpdateInventorySession(this.inventorySessionActive);
    }
  }

  public onEndAndCreateSession() {
    this.selectTab(0);
    if (this.inventorySessionActive.StatusID == InventoryMasterStatusEnum.DOING)
      this.inventorySessionActive.StatusID = InventoryMasterStatusEnum.DONE;
    this.UpdateAndCreateInventorySession(this.inventorySessionActive);
  }

  public onBlurSession() {
    if (
      this.inventorySessionTemp.Description !=
      this.inventorySessionActive.Description
    )
      this.UpdateInventorySession(this.inventorySessionActive);
  }

  private getListInventorySession(param: WHInventoryPointCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListInventorySession(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.inventorySessionList = res.ObjectReturn;
          if (this.inventorySessionList.length == 1)
            this.inventorySessionActive = this.inventorySessionList[0];
          else
            this.inventorySessionActive =
              this.inventorySessionList[this.inventorySessionList.length - 1];

          this.getListSessionLocation(this.inventorySessionActive);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin danh sách lượt kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin danh sách lượt kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateInventorySession(param: WHInventorySessionCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventorySession(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.inventorySessionActive = res.ObjectReturn;
          this.getListInventorySession(this.inventoryPoint);
          this.notification.onSuccess(
            `${param.Code == 0 ? 'Tạo mới' : 'Cập nhật'
            } lượt kiểm kê thành công`
          );
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `${param.Code == 0 ? 'Tạo mới' : 'Cập nhật'
            } lượt kiểm kê không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `${param.Code == 0 ? 'Tạo mới' : 'Cập nhật'
          } lượt kiểm kê không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateAndCreateInventorySession(param: WHInventorySessionCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateAndCreateInventorySession(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.getListInventorySession(this.inventoryPoint);
          this.inventorySessionActive = res.ObjectReturn;
          this.getListInventorySession(this.inventoryPoint);
          this.notification.onSuccess(`Cập nhật lượt kiểm kê thành công`);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Cập nhật lượt kiểm kê không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Cập nhật lượt kiểm kê không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region inventory session detail
  public tabs = [
    'LỖI KIỂM KÊ',
    'GIÁM SÁT KIỂM KÊ',
    'KẾT QUẢ KIỂM KÊ',
    'TỒN ĐẦU KỲ',
  ];
  public activeTabIndex: WHInventoryPointDetailTagEnum =
    WHInventoryPointDetailTagEnum.MONITOR; // chỉ số tab đang được chọn
  public enumTag = WHInventoryPointDetailTagEnum;

  // Filter cấu hình chung
  @ViewChild(PsFilterTextboxComponent) filterTextbox: PsFilterTextboxComponent;
  public listfiltertext = ['Barcode', 'TypePartItemName'];
  public skip = 0;

  private filterstatus: CompositeFilterDescriptor = {
    filters: [],
    logic: 'or',
  };
  private filtertext: CompositeFilterDescriptor = {
    filters: [],
    logic: 'or',
  };
  // --- Filter từng tab ---
  // Filter riêng cho Tab 0 - Giám sát
  private groupfilterTab0: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };
  private filterTab0: State = {
    filter: this.groupfilterTab0,
    skip: 0,
    take: 25,
  };

  // Filter riêng cho Tab 1 - Kết quả
  private groupfilterTab1: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };
  private filterTab1: State = {
    filter: this.groupfilterTab1,
    skip: 0,
    take: 25,
  };
  // Filter riêng cho Tab 2
  private groupfilterTab2: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };
  private filterTab2: State = {
    filter: this.groupfilterTab2,
    skip: 0,
    take: 25,
  };

  // Các datatab dùng cho grid
  public datatab0: Subject<any> = new Subject<any>();
  public datatab1: Subject<any> = new Subject<any>();
  public datatab2: Subject<any> = new Subject<any>();

  // Danh sách quầy kệ
  public locationlist: WHLocationCusDTO[] = [];
  public locationActive: WHLocationCusDTO = new WHLocationCusDTO();

  //Phân trang tab 1
  public onPageChangedTab1(e: PageChangeEvent) {
    this.filterTab1.skip = e.skip;
    this.filterTab1.take = e.take;
    this.getListInventoryOnSessionWithFilter(this.filterTab1);
  }
  //Phân trang tab 2
  public onPageChangedTab2(e: PageChangeEvent) {
    this.filterTab2.skip = e.skip;
    this.filterTab2.take = e.take;
    this.getListInventoryPointStock(this.filterTab2);
  }
  public selectTab(index: number): void {
    this.activeTabIndex = index;

    switch (index) {
      case WHInventoryPointDetailTagEnum.RESULT:
        this.handleFilter([], 'text', this.groupfilterTab1, this.filterTab1);
        this.getListInventoryOnSessionWithFilter(this.filterTab1);
        break;

      case WHInventoryPointDetailTagEnum.MONITOR:
        this.handleFilter([], 'text', this.groupfilterTab0, this.filterTab0);
        this.getListSessionScanLocationWithFilter(this.filterTab0);
        break;

      case WHInventoryPointDetailTagEnum.STOCK:
        this.handleFilter([], 'text', this.groupfilterTab2, this.filterTab2);
        this.getListInventoryPointStock(this.filterTab2);
        break;

      case WHInventoryPointDetailTagEnum.ERROR:
        this.GetListPartItemError(this.inventorySessionActive);
        break;
    }
  }

  //#region scan error part item
  public scanErrorList: WHInventoryScanCusDTO[] = [];
  public scanErrorActive: WHInventoryScanCusDTO;
  public datatab: Subject<any> = new Subject<any>();
  public isOpenDialogConfirm: boolean = false;
  public barcodeChange: string = '';

  public selectedScanError(e) {
    this.scanErrorActive = e;
    this.GetListPartItemErrorDetail(this.scanErrorActive);
  }

  public onSeletedDeleteError(e) {
    this.scanErrorActive = e;
    this.isOpenDialogConfirm = true;
  }

  public onDeletedError() {
    this.DeletePartItemScanByBarcode(this.scanErrorActive);
  }

  public onUpdateErrorBarcode(dto, prop) {
    if (dto.Barcode != this.barcodeChange) {
      var item: UpdatePropertiesInterface<WHInventoryScanCusDTO> = {
        DTO: dto,
        Properties: [prop],
      };
      this.UpdateInventoryScan(item);
    }
  }

  public getDataFocus(param) {
    this.barcodeChange = param;
  }

  private GetListPartItemError(param: WHInventorySessionCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListPartItemError(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.scanErrorList = res.ObjectReturn;
          if (!PSArray.isNullOrEmpty(res.ObjectReturn)) {
            this.scanErrorActive = this.scanErrorList[0];
            this.GetListPartItemErrorDetail(this.scanErrorActive);
          }
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin danh sách lỗi kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin danh sách lỗi kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private GetListPartItemErrorDetail(param: WHInventoryScanCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListPartItemErrorDetail(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.datatab.next({
            data: res.ObjectReturn,
            total: res.ObjectReturn.length,
          });
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy danh sách chi tiết lỗi kiểm kê: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy danh sách chi tiết lỗi kiểm kê: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private DeletePartItemScanByBarcode(param: WHInventoryScanCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeletePartItemScanByBarcode(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListPartItemError(this.inventorySessionActive);
          this.isOpenDialogConfirm = false;
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Xoá barcode sai không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Xoá barcode sai không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private UpdateInventoryScan(
    param: UpdatePropertiesInterface<WHInventoryScanCusDTO>
  ) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryScan(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListPartItemErrorDetail(this.scanErrorActive);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Cập nhật mã kiểm kê lỗi thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Cập nhật mã kiểm kê lỗi không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Cập nhật mã kiểm kê lỗi không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  private handleFilter(
    filter: FilterDescriptor[],
    type: 'text' | 'status',
    groupfilter: CompositeFilterDescriptor,
    state: State,
    resetPage = true
  ) {
    if (resetPage) {
      state.skip = 0;
      this.skip = 0;
    }

    groupfilter.filters = [];

    if (type === 'status') this.filterstatus.filters = filter;
    if (type === 'text') this.filtertext.filters = filter;

    if (this.filterstatus.filters.length !== 0) {
      groupfilter.filters.push(this.filterstatus);
    }

    if (this.filtertext.filters.length !== 0) {
      groupfilter.filters.push(this.filtertext);
    }

    if (this.activeTabIndex === WHInventoryPointDetailTagEnum.MONITOR) {
      if (this.inventorySessionActive?.Code) {
        groupfilter.filters.push({
          field: 'InventorySession',
          operator: 'eq',
          value: this.inventorySessionActive.Code,
        });
      }

      if (this.locationActive?.Code) {
        groupfilter.filters.push({
          field: 'WHLocation',
          operator: 'eq',
          value: this.locationActive.Code,
        });
      }
    }

    if (this.activeTabIndex === WHInventoryPointDetailTagEnum.RESULT) {
      if (this.inventorySessionActive?.Code) {
        groupfilter.filters.push({
          field: 'InventorySession',
          operator: 'eq',
          value: this.inventorySessionActive.Code,
        });
      }
    }

    if (this.activeTabIndex === WHInventoryPointDetailTagEnum.STOCK) {
      if (this.inventoryPoint?.Code) {
        groupfilter.filters.push({
          field: 'InventoryPoint',
          operator: 'eq',
          value: this.inventoryPoint.Code,
        });
      }
    }
  }

  setSelectedCode(e: WHLocationCusDTO) {
    if (e.Code != this.locationActive.Code) {
      this.locationActive = e;
      this.getListSessionScanLocation(e);
    }
  }
  // Tab 0: Giám sát
  textFilterChangeForTab0(e) {
    this.handleFilter(e, 'text', this.groupfilterTab0, this.filterTab0);
    this.getListSessionScanLocationWithFilter(this.filterTab0);
  }
  private getListSessionScanLocationWithFilter(filter: State) {
    filter.filter = this.groupfilterTab0;

    this.subLoader.loader(true);
    const temp = this.partapi.GetListSessionScanLocation(filter).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          this.datatab0.next({
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          });
        } else {
          this.notification.onError(
            `Lỗi lấy danh sách hàng hoá: ${res.ErrorString}`
          );
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hàng hoá: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getListSessionLocation(param: WHInventorySessionCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListSessionLocation(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.locationActive = res.ObjectReturn[0];
          this.locationlist = res.ObjectReturn;
          if (this.locationActive != undefined)
            this.getListSessionScanLocation(this.locationActive);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin danh sách quầy kệ: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin danh sách quầy kệ: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getListSessionScanLocation(location: WHLocationCusDTO) {
    this.locationActive = location;
    this.handleFilter([], 'text', this.groupfilterTab0, this.filterTab0);
    this.getListSessionScanLocationWithFilter(this.filterTab0);
  }

  public onTabResult() {
    this.getListInventoryOnSession(this.inventorySessionActive);
  }
  // Tab 1: Kết quả
  textFilterChangeForTab1(e) {
    this.handleFilter(e, 'text', this.groupfilterTab1, this.filterTab1);
    this.getListInventoryOnSessionWithFilter(this.filterTab1);
  }
  private getListInventoryOnSessionWithFilter(filterState: State) {
    filterState.filter = this.groupfilterTab1;

    this.subLoader.loader(true);
    const temp = this.partapi.GetListInventoryOnSession(filterState).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          this.datatab1.next({
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          });
        } else {
          this.notification.onError(
            `Lỗi lấy kết quả kiểm kê: ${res.ErrorString}`
          );
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy kết quả kiểm kê: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getListInventoryOnSession(sessionDto: WHInventorySessionCusDTO) {
    this.inventorySessionActive = sessionDto;
    this.handleFilter([], 'text', this.groupfilterTab1, this.filterTab1);
    this.getListInventoryOnSessionWithFilter(this.filterTab1);
  }
  // Tab 2: Tồn đầu kỳ
  textFilterChangeForTab2(e) {
    this.handleFilter(e, 'text', this.groupfilterTab2, this.filterTab2);
    this.getListInventoryPointStock(this.filterTab2);
  }
  private getListInventoryPointStock(filterState: State) {
    filterState.filter = this.groupfilterTab2;

    this.subLoader.loader(true);
    var temp = this.partapi.GetListInventoryPointStock(filterState).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.datatab2.next({
            data: res.ObjectReturn.Data,
            total: res.ObjectReturn.Total,
          });
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi lấy thông tin danh sách tồn đầu kỳ: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Lỗi lấy thông tin danh sách tồn đầu kỳ: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public onFormatLocation(param: string[]) {
    if (param == undefined) return '';
    if (param.length == 0) return '';
    else {
      var temp = '';
      temp += param[0];

      if (param[1] != null && param[1] != undefined) temp += ', ' + param[1];

      if (param[2] != null && param[1] != undefined)
        temp += ', ' + (param.length - 2);

      return temp;
    }
  }

  public uploadEventHandler(e: File) {
    this.ImportInventoryStock(e);
  }

  public ImportInventoryStock(file) {
    this.subLoader.loader(true);
    var temp = this.partapi.ImportInventoryStock(file, this.inventoryPoint.Code).subscribe(
      (res) => {
        if (!PSObject.isNullOfUndefined(res) && res.StatusCode == 0) {
          this.getListInventoryPointStock(this.filterTab2);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Import tồn đầu kỳ thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Import tồn đầu kỳ không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Import tồn đầu kỳ không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public uploadScan(e: File) {
    this.ImportInventoryScan(e);
  }

  public ImportInventoryScan(file) {
    this.subLoader.loader(true);
    var temp = this.partapi.ImportInventoryScan(file, this.inventoryPoint.Code).subscribe(
      (res) => {
        if (!PSObject.isNullOfUndefined(res) && res.StatusCode == 0) {
          this.getListSessionScanLocation(this.locationActive);
          this.subLoader.loader(false);
          this.notification.onSuccess(`Import kiểm kê sản phẩm thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Import kiểm kê sản phẩm không thành công: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Import kiểm kê sản phẩm không thành công: ${err.message}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public ExportInventorySummary() {
    this.subLoader.loader(true);
    var temp = this.partapi.ExportInventorySummary(this.inventoryPoint.Code).subscribe(
      (res) => {
        if (!PSObject.isNullOfUndefined(res)) {
          PSFile.getFile(res, 0, 'inventory_summary_template.xlsx');
          this.subLoader.loader(false);
          this.notification.onSuccess(`Xuất báo cáo tổng hợp thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Xuất báo cáo tổng hợp không thành công`);
        }
      },
      (f) => {
        this.subLoader.loader(false);
        this.notification.onError(
          `Xuất báo cáo tổng hợp không thành công: ${f?.error?.ExceptionMessage}`
        );
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public ExportInventorySession() {
    this.subLoader.loader(true);
    var temp = this.partapi
      .ExportInventorySession(this.inventorySessionActive.Code)
      .subscribe(
        (res) => {
          if (!PSObject.isNullOfUndefined(res)) {
            PSFile.getFile(res, 0, 'inventory_session_template.xlsx');
            this.subLoader.loader(false);
            this.notification.onSuccess(`Xuất báo cáo vị trí thành công`);
          } else {
            this.subLoader.loader(false);
            this.notification.onError(`Xuất báo cáo vị trí không thành công`);
          }
        },
        (f) => {
          this.subLoader.loader(false);
          this.notification.onError(
            `Xuất báo cáo vị trí không thành công: ${f?.error?.ExceptionMessage}`
          );
        }
      );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}
