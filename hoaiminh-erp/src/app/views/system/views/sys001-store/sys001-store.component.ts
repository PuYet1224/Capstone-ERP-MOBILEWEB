import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { PSSystemApiService } from "../../services/ps-system-api.service";
import { Subject, Subscription } from "rxjs";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { PSArray } from "src/app/services/utilities/ps-array";
import { ProcessStatusEnum } from "src/app/models/enums/process-status.enum";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSProvinceDTO } from "src/app/models/dtos/e-dtos/ls-province.dto";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { PSObject } from "src/app/services/utilities/ps-object";
import { LSDistrictDTO } from "src/app/models/dtos/e-dtos/ls-district.dto";
import { PSString } from "src/app/services/utilities/ps-string";
import { FileDTO } from "src/app/models/dtos/file.dto";
import { LSWardDTO } from "src/app/models/dtos/e-dtos/ls-ward.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { LSHeadTransferCusDTO } from "src/app/models/dtos/e-dtos/ls-head-transfer.dto";

@Component({
  selector: 'sys001-store',
  templateUrl: './sys001-store.component.html',
  styleUrls: ['./sys001-store.component.scss'],
})

export class Sys001StoreComponent implements OnInit, OnDestroy {
  constructor(
    private sysapi: PSSystemApiService,
    private subLoader: PsLayoutLoaderService,
    private notification: PSKendoNotificationService,
    private coreapi: PSCoreApiService
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];
  public head: LSHeadCusDTO = new LSHeadCusDTO();
  public headCopy: LSHeadCusDTO;

  ngOnInit(): void {
    this.getliststoretypedata();
    this.getlistprovince();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region filter
  @ViewChild(PsFilterTextboxComponent) filterTextbox: PsFilterTextboxComponent;
  public typefilter = LSStatusTypeDataEnum.PROCESS;
  private filterstatus: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  private groupfilter: CompositeFilterDescriptor = { filters: [], logic: 'and' };
  private filter: State = { filter: this.groupfilter, skip: 0, take: 25, sort: [{ field: "Code", dir: "desc" }] };
  public listfiltertext = ['BriefName', 'TradeName', 'HeadID', 'TypeDataName', 'Phone', 'Fax', 'FullAddress'];
  public skip = 0;
  private lasttextvalue = '';
  public isDisabledClear: boolean = false;
  public isDisabledReset: boolean = true;

  public textFilterChange(e) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.handleFilter(e, 'text');
      this.getliststore(this.filter);
      this.lasttextvalue = text;
    }
  }

  public statusFilterChange(e) {
    this.handleFilter(e, 'status');
    this.getliststore(this.filter);
  }

  public statusFilterClear(e) {
    this.filtertext.filters = [];
    this.lasttextvalue = '';
    this.handleFilter(e, 'status');
    this.filterTextbox.clear();
    this.getliststore(this.filter);
  }

  private handleFilter(filter: FilterDescriptor[], type: 'text' | 'status', resetPage = true) {
    //nếu tìm kiếm thì reset page lại là 1
    if (resetPage) {
      this.filter.skip = 0;
      this.skip = 0;
    }
    //đưa filter về [], kiểm tra loại filter
    this.groupfilter.filters = [];
    if (type == 'status') {
      this.filterstatus.filters = filter;
    }
    if (type == 'text') {
      this.filtertext.filters = filter;
    }
    //kiểm tra có filter không
    //##: kiểm tra filter để chặn gọi api nhiều lần
    if (this.filterstatus.filters.length != 0 || this.filtertext.filters.length != 0) {
      this.isDisabledClear = false; //##
      if (this.filterstatus.filters.length != 0) {
        this.groupfilter.filters.push(this.filterstatus)

        //##
        let listfilter = (this.filterstatus.filters as FilterDescriptor[]).map(f => f.value);
        let listmap = [ProcessStatusEnum.NEW, ProcessStatusEnum.SENT, ProcessStatusEnum.NOTAPPROVED]
        if (PSArray.areEqual(listfilter, listmap)) {
          this.isDisabledReset = true;
        }
        else
          this.isDisabledReset = false;
      }

      if (this.filtertext.filters.length != 0) {
        this.groupfilter.filters.push(this.filtertext);
        this.isDisabledReset = false;
      }
    }
    else {
      this.isDisabledClear = true; //##
      this.isDisabledReset = false; //##
    }
  }
  //#endregion

  //#region drawer
  public typedatalist: ListDTO[] = [];
  public provincelsit: LSProvinceDTO[] = [];
  public headmanagement: LSHeadCusDTO[] = [];
  public districtlsit: LSDistrictDTO[] = [];
  public wardlsit: LSWardDTO[] = [];
  public listprop: string[];
  private action: string | number;
  public isshowpopupdelete: boolean = false;
  public expanded = false;
  public isOpen = false;
  public listimage: FileDTO[];
  public imageActive: string;
  public status = ProcessStatusEnum;

  onOpen() {
    this.GetListStoreMapImage();
    this.isOpen = true;
  }

  public onExpanded() {
    this.head = new LSHeadCusDTO();
    this.headCopy = new LSHeadCusDTO();
    this.imageActive = '';
    this.action = 'edit'
    this.getliststoremanagement();
    this.expanded = true;
  }

  public onCollapse(e: boolean) {
    this.expanded = e;
  }

  public disabledrawer(prop: string = '') {
    if ((prop == 'District' && PSObject.isNullOfUndefined(this.head.Province)) ||
      (prop == 'Ward' && PSObject.isNullOfUndefined(this.head.District)) ||
      this.action == "view")
      return true;
    return false
  }

  public statusactionactive(stt: string) {
    if ((stt == 'sent' && (this.head.StatusID == ProcessStatusEnum.NEW || this.head.StatusID == ProcessStatusEnum.RETURN || this.head.StatusID == ProcessStatusEnum.NOTAPPROVED) &&
      (FunctionPermissionDTO.creator || FunctionPermissionDTO.master)) ||
      ((((stt == 'noapproved' || stt == 'approved') && this.head.StatusID == ProcessStatusEnum.SENT) ||
        ((stt == 'approved' || stt == 'return') && this.head.StatusID == ProcessStatusEnum.STOP) ||
        (stt == 'stop' && this.head.StatusID == ProcessStatusEnum.APPROVED)) &&
        (FunctionPermissionDTO.approver || FunctionPermissionDTO.master)))
      return true;
    return false;
  }

  public onValueChangeProvince() {
    this.getlistdistrict();
  }

  public onValueChangeDisctrict() {
    this.getlistward();
  }

  public onAddUpdateStore() {
    if (this.head.Code == 0) {
      if (PSString.isNullOrWhitespace(this.head.HeadID) || PSString.isNullOrWhitespace(this.head.BriefName) ||
        PSString.isNullOrWhitespace(this.head.TradeName) || PSObject.isNullOfUndefined(this.head.TypeData))
        this.notification.onError('Chưa đầy đủ các thông tin bắt buộc của cửa hàng')
      else
        this.updatestore();
    }
    else {
      const changed = this.listprop.some(f => this.head[f] != this.headCopy[f]);
      if (changed)
        this.updatestore();
      else
        this.expanded = false;
    }
  }

  public ondeletestore() {
    this.isshowpopupdelete = true;
  }

  private updatestatus(stt: ProcessStatusEnum) {
    this.head.StatusID = stt;
    this.updatestore();
  }

  onFileChosen(file: FileDTO) {
    var listlink = file.Path.split('/');
    const startIndex = listlink.indexOf('resource');
    const slicedArr = listlink.slice(startIndex);
    this.head.ImageMap = '/' + slicedArr.join('/');
    this.imageActive = file.Path;
    this.isOpen = false;
  }

  public onUploadFile() {
    this.GetListStoreMapImage();
  }

  public onDeleteFile() {
    this.GetListStoreMapImage();
  }

  private getliststoretypedata() {
    this.subLoader.loader(true);
    var temp = this.sysapi.GetListStoreTypeData().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.typedatalist = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách loại cửa hàng: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách loại cửa hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getlistprovince() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListProvince().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.provincelsit = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách tỉnh/thành: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getlistdistrict() {
    this.subLoader.loader(true);
    var province: LSProvinceDTO = new LSProvinceDTO();
    province.Code = this.head.Province;
    var temp = this.coreapi.GetListDistrict(province).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.districtlsit = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách quận/huyện/thị xã: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getlistward() {
    this.subLoader.loader(true);
    var district: LSDistrictDTO = new LSDistrictDTO();
    district.Code = this.head.District;
    district.Province = this.head.Province;
    var temp = this.coreapi.GetListWard(district).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.wardlsit = res.ObjectReturn;
        console.log('a');

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phường/xã: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách phường/xã: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private getliststoremanagement() {
    this.subLoader.loader(true);
    var temp = this.sysapi.GetListStoreManagement(this.head).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.headmanagement = res.ObjectReturn;
        this.headmanagement.unshift({ Code: null, BriefName: 'Không có head quản lý' } as LSHeadCusDTO)
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách cửa hàng quản lý: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách cửa hàng quản lý: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private updatestore() {
    this.subLoader.loader(true);
    if (this.head.ImageMap && this.head.ImageMap.includes('http')) {
      var listlink = this.head.ImageMap.split('/');
      const startIndex = listlink.indexOf('resource');
      const slicedArr = listlink.slice(startIndex);
      this.head.ImageMap = '/' + slicedArr.join('/');
    }

    var temp = this.sysapi.UpdateStore(this.head).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getliststore(this.filter);
        this.expanded = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi ${this.head.Code == 0 ? 'thêm mới' : 'cập nhật'}: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi ${this.head.Code == 0 ? 'thêm mới' : 'cập nhật'}: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public deletestore() {
    this.subLoader.loader(true);
    var temp = this.sysapi.DeleteStore(this.head).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.getliststore(this.filter);
        this.isshowpopupdelete = false;
        this.expanded = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá cửa hàng: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá cửa hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private GetListStoreMapImage() {
    this.subLoader.loader(true);
    var temp = this.sysapi.GetListStoreMapImage().subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.listimage = res.ObjectReturn;
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region list
  public data: Subject<any> = new Subject<any>();
  public actionColumn: ActionColumnDTO[] = [];

  public onPageChanged(e: PageChangeEvent) {
    this.filter.skip = e.skip;
    this.filter.take = e.take;
    this.skip = e.skip;
    this.getliststore(this.filter);
  }

  public onActionColumnFocus(e) {
    this.actionColumn = [];
    if (FunctionPermissionDTO.master) {
      switch (e.StatusID) {
        case ProcessStatusEnum.NEW:
        case ProcessStatusEnum.NOTAPPROVED:
          this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'send', text: 'Gửi duyệt', action: ProcessStatusEnum.SENT });
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
          break;

        case ProcessStatusEnum.SENT:
        case ProcessStatusEnum.APPROVED:
        case ProcessStatusEnum.STOP:
        case ProcessStatusEnum.RETURN:
          this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });
          this.actionColumn.push({ separator: true });

          switch (e.StatusID) {
            case ProcessStatusEnum.SENT:
              this.actionColumn.push({ icon: 'check_circle', text: 'Duyệt', action: ProcessStatusEnum.APPROVED });
              this.actionColumn.push({ icon: 'cancel', text: 'Không duyệt', action: ProcessStatusEnum.NOTAPPROVED });
              break;

            case ProcessStatusEnum.APPROVED:
              this.actionColumn.push({ icon: 'do_not_disturb_on', text: 'Ngưng áp dụng', action: ProcessStatusEnum.STOP });
              break;

            case ProcessStatusEnum.STOP:
              this.actionColumn.push({ icon: 'check_circle', text: 'Duyệt', action: ProcessStatusEnum.APPROVED });
              this.actionColumn.push({ icon: 'undo', text: 'Trả về', action: ProcessStatusEnum.RETURN });
              break;

            case ProcessStatusEnum.RETURN:
              this.actionColumn.push({ icon: 'send', text: 'Gửi duyệt', action: ProcessStatusEnum.SENT });
              break;
          }
          break;
      }
    }
    else if (FunctionPermissionDTO.creator) {
      switch (e.StatusID) {
        case ProcessStatusEnum.NEW:
        case ProcessStatusEnum.NOTAPPROVED:
          this.actionColumn.push({ iconClass: 'edit', text: 'Chỉnh sửa', action: 'edit' });
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ icon: 'send', text: 'Gửi duyệt', action: ProcessStatusEnum.SENT });
          this.actionColumn.push({ separator: true });
          this.actionColumn.push({ iconClass: 'trash', text: 'Xoá', action: 'delete' });
          break;

        case ProcessStatusEnum.SENT:
        case ProcessStatusEnum.APPROVED:
        case ProcessStatusEnum.STOP:
        case ProcessStatusEnum.RETURN:
          this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });
          if (e.StatusID == ProcessStatusEnum.RETURN) {
            this.actionColumn.push({ separator: true });
            this.actionColumn.push({ icon: 'send', text: 'Gửi duyệt', action: ProcessStatusEnum.SENT });
          }
          break;
      }
    }
    else if (FunctionPermissionDTO.approver) {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });
      this.actionColumn.push({ separator: true });
      switch (e.StatusID) {
        case ProcessStatusEnum.SENT:
          this.actionColumn.push({ icon: 'check_circle', text: 'Duyệt', action: ProcessStatusEnum.APPROVED });
          this.actionColumn.push({ icon: 'cancel', text: 'Không duyệt', action: ProcessStatusEnum.NOTAPPROVED });
          break;

        case ProcessStatusEnum.APPROVED:
          this.actionColumn.push({ icon: 'do_not_disturb_on', text: 'Ngưng áp dụng', action: ProcessStatusEnum.STOP });
          break;

        case ProcessStatusEnum.STOP:
          this.actionColumn.push({ icon: 'check_circle', text: 'Duyệt', action: ProcessStatusEnum.APPROVED });
          this.actionColumn.push({ icon: 'undo', text: 'Trả về', action: ProcessStatusEnum.RETURN });
          break;

        case ProcessStatusEnum.RETURN:
          this.actionColumn.push({ icon: 'send', text: 'Gửi duyệt', action: ProcessStatusEnum.SENT });
          break;
      }
    }
    else if (FunctionPermissionDTO.viewer) {
      this.actionColumn.push({ iconClass: 'eye', text: 'Xem chi tiết', action: 'view' });
    }
  }

  public onActionClick(e: ActionColumnDTO) {
    if (typeof e.action == 'string')
      this.action = e.action;
    this.head = e.data;
    this.headCopy = { ...e.data };

    switch (e.action) {
      case 'view':
      case 'edit':
        this.listprop = Object.keys(this.head);
        if (!PSObject.isNullOfUndefined(this.head.Province))
          this.getlistdistrict();
        if (!PSObject.isNullOfUndefined(this.head.District))
          this.getlistward();
        if (this.head.Code != 0)
          this.getliststoremanagement();
        this.imageActive = this.head.ImageMap;
        this.expanded = true;
        break;

      case 'delete':
        this.ondeletestore();
        break;

      default:
        if (e.action == ProcessStatusEnum.APPROVED &&
          (PSString.isNullOrWhitespace(this.head.HeadID) || PSString.isNullOrWhitespace(this.head.BriefName) ||
            PSString.isNullOrWhitespace(this.head.TradeName) || PSObject.isNullOfUndefined(this.head.TypeData))) {
          this.notification.onWarning('Vui lòng cung cấp đầy đủ thông tin mã, tên viết tắt, tên kinh doanh, loại của cửa hàng')
        }
        else
          this.updatestatus(e.action as ProcessStatusEnum);
        break;
    }
  }

  private getliststore(filter: State) {
    this.subLoader.loader(true);
    var temp = this.sysapi.GetListStore(filter).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.data.next({ data: res.ObjectReturn.Data, total: res.ObjectReturn.Total });
        this.head = new LSHeadCusDTO();
        this.headCopy = undefined;
        this.imageActive = '';
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách cửa hàng: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách cửa hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //region popup transfer
  public isOpenTransfer: boolean = false;
  public liststoretransfer: LSHeadTransferCusDTO[] = [];
  public liststoretransfercopy: LSHeadTransferCusDTO[] = [];

  public ontransferblur(index: number) {
    var valuechange = this.liststoretransfer[index].OrderBy;
    console.log(index, valuechange);

    if (index > valuechange) {
      this.liststoretransfer.slice(valuechange - 1, index).forEach((item, i) => {
        item.OrderBy = item.OrderBy + 1;
      });
    }
    else if (index == valuechange) {
      this.liststoretransfer[index - 1].OrderBy = this.liststoretransfer[index - 1].OrderBy + 1
    }
    else {
      this.liststoretransfer.slice(index + 1, valuechange).forEach((item, i) => {
        item.OrderBy = item.OrderBy - 1;
      });
    }

    this.liststoretransfer = this.liststoretransfer.sort((a, b) => a.OrderBy - b.OrderBy);
  }

  public onclicksavetransfer() {
    if (this.liststoretransfer.some((obj, i) => JSON.stringify(obj) !== JSON.stringify(this.liststoretransfercopy[i]))) {
      this.updateliststoretransfer();
    }
    else {
      this.isOpenTransfer = false;
    }
  }

  public onopenpopuptransfer() {
    this.subLoader.loader(true);
    var temp = this.sysapi.GetListStoreTransfer(this.head).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.liststoretransfer = res.ObjectReturn;
        this.liststoretransfercopy = [...res.ObjectReturn];
        this.isOpenTransfer = true;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thứ tự điều hàng: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thứ tự điều hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public updateliststoretransfer() {
    this.subLoader.loader(true);
    var temp = this.sysapi.UpdateListStoreTransfer(this.liststoretransfer).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.isOpenTransfer = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Thành công`);
      }
      else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thứ tự điều hàng: ${res.ErrorString}`);
      }
    },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thứ tự điều hàng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //endregion
}
