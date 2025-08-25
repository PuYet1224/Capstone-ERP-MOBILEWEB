import { Component, OnDestroy, OnInit } from '@angular/core';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { WHInventoryMasterCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-master.dto';
import { Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { WHInventoryPointCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-point.dto';
import { Router } from '@angular/router';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { WHInventoryMasterTypeEnum } from 'src/app/models/enums/e-type/wh-inventory-master-type.enum';
import { LSWarehouseCusDTO } from 'src/app/models/dtos/e-dtos/ls-warehouse.dto';
import { HREmployeeCusDTO } from 'src/app/models/dtos/e-dtos/hr-employee.dto';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { WHInventoryStaffCusDTO } from '../../../../models/dtos/e-dtos/wh-inventory-staff.dto';
import { WHInventoryStaffTypeDataEnum } from '../../../../models/enums/e-type/wh-inventory-staff-type-data.enum';
import { InventoryMasterStatusEnum } from '../../../../models/enums/e-status/wh-inventory-master-status.enum';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { PSDate } from 'src/app/services/utilities/ps-date';

@Component({
  selector: 'prt002-inventory-detail',
  templateUrl: './prt002-inventory-detail.component.html',
  styleUrls: ['./prt002-inventory-detail.component.scss']
})
export class Prt002InventoryDetailComponent implements OnInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = []
  public userCode: number;
  // Track the collapse state
  isCollapsed = false;
  showBlock2 = false;

  constructor(private subLoader: PsLayoutLoaderService,
    private notification: PSKendoNotificationService,
    private partapi: PSPartApiService,
    private coreapi: PSCoreApiService,
    private cache: PSCache,
    private router: Router,
  ) { }
  public enumstatus = InventoryMasterStatusEnum;

  //#region ngOn
  ngOnInit(): void {
    this.getCacheInventoryMaster();
    this.GetListWarehouse();
    this.GetListEmployee();

    var userCodeCache = this.cache.getItem(KeyLocalStorageEnum.USER_INFOR);
    this.userCode = this.cache.parseValue(userCodeCache).StaffID;
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  // Toggle the collapse state
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  //#region inventory master
  private inventoryMasterCache: WHInventoryMasterCusDTO;
  public inventoryMaster: WHInventoryMasterCusDTO = new WHInventoryMasterCusDTO();
  public listEmployee: HREmployeeCusDTO[] = [];
  public popupConfirmOpen = false;
  public enumStatus = InventoryMasterStatusEnum;
  public listEmployeeOrder: { StaffID: number, FullName: string }[] = [];

  public ownerChange(e) {
    this.inventoryMaster.Owner = e.Code;
    this.updateMaster("Owner")
  }

  public onMasterDateChange(e, prop) {
    const newDate = new Date(e);
    this.inventoryMaster[prop] = PSDate.setHours(newDate, 0, 0, 0, 0);;
    this.updateMaster(prop);
  }

  private getCacheInventoryMaster() {
    var temp = this.cache.getItem(KeyLocalStorageEnum.INVENTORY_OBJECT);
    this.inventoryMasterCache = this.cache.parseValue(temp);
    if (this.inventoryMasterCache.Code != 0)
      this.getInventoryMaster(this.inventoryMasterCache);
  }

  private getInventoryMaster(param: WHInventoryMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetInventoryMaster(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.inventoryMaster = res.ObjectReturn;
        this.inventoryMaster.FromDate = new Date(this.inventoryMaster.FromDate);
        this.inventoryMaster.ToDate = new Date(this.inventoryMaster.ToDate);
        this.getListInventoryPoint(this.inventoryMaster);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public updateMaster(prop: string) {
    var list;
    if (this.inventoryMaster.Code == 0) {
      list = [prop, "HiddenStock", "FromDate", "ToDate", "TypeData"]
      var nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);
      this.inventoryMaster.FromDate = PSDate.addDays(nowDate, 5);
      this.inventoryMaster.ToDate = PSDate.addDays(nowDate, 25);
      this.inventoryMaster.TypeData = WHInventoryMasterTypeEnum.InventoryPart;
    } else {
      list = [prop];
    }
    var updateprop: UpdatePropertiesInterface<WHInventoryMasterCusDTO> = { DTO: this.inventoryMaster, Properties: list }
    this.UpdateInventoryMaster(updateprop);
  }

  private UpdateInventoryMaster(param: UpdatePropertiesInterface<WHInventoryMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryMaster(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.cache.setItem(KeyLocalStorageEnum.INVENTORY_OBJECT, res.ObjectReturn);
        this.inventoryMaster = res.ObjectReturn;
        this.inventoryMaster.FromDate = new Date(this.inventoryMaster.FromDate);
        this.inventoryMaster.ToDate = new Date(this.inventoryMaster.ToDate);
        this.subLoader.loader(false);
        this.notification.onSuccess(`${param.DTO.Code == 0 ? 'Thêm mới' : 'Cập nhật'} thông tin kỳ kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi ${param.DTO.Code == 0 ? 'thêm mới' : 'cập nhật'} thông tin kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi ${param.DTO.Code == 0 ? 'thêm mới' : 'cập nhật'} thông tin kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public DeleteInventoryMaster(param: WHInventoryMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeleteInventoryMaster(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.cache.setItem(KeyLocalStorageEnum.INVENTORY_OBJECT, new WHInventoryMasterCusDTO());
        this.inventoryMaster = new WHInventoryMasterCusDTO();
        this.popupConfirmOpen = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Xoá thông tin kỳ kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá thông tin kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi xoá thông tin kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private GetListEmployee() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListEmployee().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listEmployeeOrder = res.ObjectReturn.map((item: any) => ({
          StaffID: item.Code,
          FullName: item.FullName
        }));
        this.listEmployee = res.ObjectReturn;
        this.listEmployee.unshift({ Code: null, FullName: 'Không lựa chọn' });
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin nhân sự: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin nhân sự: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public openPopupDelete() {
    this.popupConfirmOpen = true;
  }

  public newInvMater() {
    this.cache.setItem(KeyLocalStorageEnum.INVENTORY_OBJECT, new WHInventoryMasterCusDTO());
    this.inventoryMaster = new WHInventoryMasterCusDTO();
  }

  public onUpdateInventoryMasterStatus(dto, stt) {
    const temp: UpdateStatusInterface<WHInventoryMasterCusDTO> = {
      ListDTO: [dto],
      Status: stt
    }
    this.UpdateInventoryMasterStatus(temp);
  }

  public UpdateInventoryMasterStatus(param: UpdateStatusInterface<WHInventoryMasterCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryMasterStatus(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getInventoryMaster(this.inventoryMaster);
        this.subLoader.loader(false);
        this.notification.onSuccess(`Cập nhật thông tin trạng thái kỳ kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region inventory point
  public inventoryPoint: WHInventoryPointCusDTO[] = [];
  public listWH: LSWarehouseCusDTO[] = [];
  public inventoryPointDelete: WHInventoryPointCusDTO;
  public popupConfirmOpenPoint = false;
  private listTag: WHInventoryStaffCusDTO[] = [];

  public setPointMinForm() {
    return new Date(this.inventoryMaster.FromDate);
  }

  public setPointMaxTo() {
    return new Date(this.inventoryMaster.ToDate);
  }

  public setPointMaxForm(data) {
    return new Date(data.ToDate);
  }

  public setPointMinTo(data) {
    return new Date(data.FromDate);
  }

  public setMaterMaxForm(): Date {
    var date = new Date(this.inventoryMaster.ToDate);
    if (this.inventoryPoint.length !== 0) {
      this.inventoryPoint.reduce((min, item) => {
        return new Date(item.FromDate) < new Date(min) ? new Date(item.FromDate) : new Date(min);
      }, this.inventoryPoint[0].FromDate);
    }
    return date;
  }

  private getListInventoryPoint(param: WHInventoryMasterCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.GetListInventoryPoint(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.inventoryPoint = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin điểm kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin điểm kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private GetListWarehouse() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListWarehouse().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listWH = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách thông tin kho hàng: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  private UpdateInventoryPoint(param: UpdatePropertiesInterface<WHInventoryPointCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryPoint(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getListInventoryPoint(this.inventoryMaster);
        this.subLoader.loader(false);
        this.notification.onSuccess(`${param.DTO.Code == 0 ? 'Thêm mới' : 'Cập nhật'} thông tin điểm kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi ${param.DTO.Code == 0 ? 'thêm mới' : 'cập nhật'} thông tin điểm kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi ${param.DTO.Code == 0 ? 'thêm mới' : 'cập nhật'} thông tin điểm kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public formatDate(date: string): Date {
    return new Date(date);
  }

  public onDetailClick(e: WHInventoryPointCusDTO) {
    if (e.StatusID == InventoryMasterStatusEnum.NEW) {
      var temp: UpdateStatusInterface<WHInventoryPointCusDTO> = {
        ListDTO: [e],
        Status: InventoryMasterStatusEnum.DOING
      }
      this.UpdateInventoryPointStatus(temp);
    }
    this.cache.setItem(KeyLocalStorageEnum.INV_POINT_OBJECT, e);
    this.router.navigate(['part', 'warehouse', 'inventory', 'point-detail']);
  }

  public updatePoint(dto: WHInventoryPointCusDTO, prop: string) {
    var list = [];
    if (dto.Code == 0) {
      list = [prop, "InventoryMaster", "FromDate", "ToDate", "IsAll", "TypeData", "StatusID"];
      if (dto.Owner != null)
        list.push("Owner");
    }
    else
      list = [prop];

    var temp: UpdatePropertiesInterface<WHInventoryPointCusDTO> = {
      Properties: list,
      DTO: dto
    };
    this.UpdateInventoryPoint(temp);
  }

  public addInvPoint() {
    var temp = new WHInventoryPointCusDTO();
    temp.InventoryMaster = this.inventoryMaster.Code;
    temp.FromDate = this.inventoryMaster.FromDate;
    temp.ToDate = this.inventoryMaster.ToDate;
    temp.Owner = this.inventoryMaster.Owner;
    this.inventoryPoint.push(temp);
  }

  public onPointChange(e: any, dto: WHInventoryPointCusDTO, prop: string) {
    if (prop == 'IsAll')
      dto[prop] = e;
    else
      dto[prop] = e.Code;
    this.updatePoint(dto, prop);
  }

  public onPointFocus() {
    const inventoryCodes = this.inventoryPoint.map(p => p.Warehouse);
    this.listWH.forEach(f => {
      if (inventoryCodes.includes(f.Code))
        f.Disabled = true;
    });
  }

  public onPointDateChange(e, dto, prop) {
    const newDate = new Date(e);
    dto[prop] = PSDate.setHours(newDate, 0, 0, 0, 0);
    this.updatePoint(dto, prop);
  }

  public onDeleteInvPoint(dto: WHInventoryPointCusDTO) {
    this.inventoryPointDelete = dto;
    this.popupConfirmOpenPoint = true;
  }

  public DeleteInventoryPoint(param: WHInventoryPointCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeleteInventoryPoint(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getListInventoryPoint(this.inventoryMaster);
        this.popupConfirmOpenPoint = false;
        this.subLoader.loader(false);
        this.notification.onSuccess(`Xoá thông tin điểm kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá thông tin điểm kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi xoá thông tin điểm kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public onUpdatePointStatus(dto, stt) {
    var temp: UpdateStatusInterface<WHInventoryPointCusDTO> = {
      ListDTO: [dto],
      Status: stt
    }
    this.UpdateInventoryPointStatus(temp);
  }

  private UpdateInventoryPointStatus(param: UpdateStatusInterface<WHInventoryPointCusDTO>) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateInventoryPointStatus(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.getListInventoryPoint(this.inventoryMaster);
        this.subLoader.loader(false);
        this.notification.onSuccess(`Cập nhật thông tin trạng thái điểm kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin trạng thái điểm kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật thông tin trạng thái điểm kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public onChangePointStaff(e, d: WHInventoryPointCusDTO) {
    this.listTag = e;
  }

  public onOtherStaffFocus(e) {
    this.listTag = e.ListStaffJoin;
  }

  public onOtherStaffBlur(e) {
    var list: WHInventoryStaffCusDTO[] = [];
    this.listTag.forEach(f => {
      var temp = new WHInventoryStaffCusDTO();
      temp.InventoryMaster = this.inventoryMaster.Code;
      temp.InventoryPoint = e.Code;
      temp.StaffID = f.StaffID;
      temp.FullName = f.FullName;
      temp.TypeData = WHInventoryStaffTypeDataEnum.OtherPoint;
      list.push(temp);
    });
    const joinStaffIds = new Set(e.ListStaffJoin.map(x => x.StaffID));
    const listStaffIds = new Set(list.map(x => x.StaffID));
    const listin = list.filter(x => !joinStaffIds.has(x.StaffID));
    const listout = e.ListStaffJoin.filter(x => !listStaffIds.has(x.StaffID));

    if (!PSArray.isNullOrEmpty(listin) || !PSArray.isNullOrEmpty(listout)) {
      e.ListStaffJoin = list;
      this.UpdateListInventoryStaff(e);
    }
  }

  private UpdateListInventoryStaff(param: WHInventoryPointCusDTO) {
    this.subLoader.loader(true);
    var temp = this.partapi.UpdateListInventoryStaff(param).subscribe(res => {
      if (res.StatusCode == 0) {
        this.listTag = [];
        this.subLoader.loader(false);
        this.notification.onSuccess(`Cập nhật thông tin nhân sự tham gia kiểm kê thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi cập nhật thông tin nhân sự tham gia kiểm kê: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi cập nhật thông tin nhân sự tham gia kiểm kê: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  public CheckPointDisabled(e: WHInventoryPointCusDTO, prop: string) {
    if (this.inventoryMaster.StatusID == this.enumStatus.DONE ||
      this.inventoryMaster.StatusID == this.enumStatus.CANCLE ||
      e.StatusID == this.enumStatus.DONE ||
      e.StatusID == this.enumStatus.CANCLE)
      return true;

    if (this.userCode == e.Owner || this.userCode == this.inventoryMaster.Owner) {
      if (e.StatusID == this.enumStatus.DOING) {
        if (prop == "Owner" && this.userCode == this.inventoryMaster.Owner) {
          return false;
        }

        if (prop == 'Delete' || prop == 'WHName' || prop == 'FromDate' || prop == 'IsAll')
          return true;

        if (prop == 'Start') {
          var now = new Date();
          var fromdate = new Date(this.inventoryMaster.FromDate);
          var todate = new Date(this.inventoryMaster.ToDate);
          if (fromdate > now || now > todate)
            return true;
          else {
            var fromdatepoint = new Date(e.FromDate);
            var todatepoint = new Date(e.ToDate);
            if (fromdatepoint > now || now > todatepoint)
              return true;
          }
        }
      }
      else {
        if (prop == 'Done' || prop == 'Cancle')
          return true;
      }
    }

    return false;
  }

  // public CheckPointDisabled(e: WHInventoryPointCusDTO, prop: string): boolean {
  //   const { DONE, CANCLE, NEW } = this.enumStatus;
  //   const now = new Date();
  //   const fromMaster = new Date(this.inventoryMaster.FromDate);
  //   const toMaster = new Date(this.inventoryMaster.ToDate);
  //   const fromPoint = new Date(e.FromDate);
  //   const toPoint = new Date(e.ToDate);

  //   return (
  //     // 1. Nếu inventory hoặc điểm đã DONE hoặc CANCLE
  //     [DONE, CANCLE].includes(this.inventoryMaster.StatusID) ||
  //     [DONE, CANCLE].includes(e.StatusID) ||

  //     // 2. Nếu prop là "Owner" và user không phải owner của điểm nhưng là owner của master
  //     (prop === "Owner" && this.userCode !== e.Owner && this.userCode === this.inventoryMaster.Owner) ||

  //     // 3. prop luôn bị disable
  //     ["ListStaffJoin", "IsAll"].includes(prop) ||

  //     // 4. prop là Done/Cancle mà trạng thái điểm là NEW
  //     (["Done", "Cancle"].includes(prop) && e.StatusID === NEW) ||

  //     // 5. prop là Delete mà trạng thái điểm KHÔNG phải NEW
  //     (prop === "Delete" && e.StatusID !== NEW) ||

  //     // 6. prop là Start mà không nằm trong thời gian hợp lệ
  //     (prop === "Start" &&
  //       (now < fromMaster || now > toMaster || now < fromPoint || now > toPoint))
  //   );
  // }

  //#endregion
}
