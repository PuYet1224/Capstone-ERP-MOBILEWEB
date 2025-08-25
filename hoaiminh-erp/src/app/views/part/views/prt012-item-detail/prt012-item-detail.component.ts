import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from "@angular/core";
import { CompositeFilterDescriptor, State } from "@progress/kendo-data-query";
import { BehaviorSubject, Subscription } from "rxjs";
import { PSPartApiService } from "../../services/ps-part-api.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LSPartCategoryCusDTO } from "../../../../models/dtos/e-dtos/ls-part-category.dto";
import { LSStatusCusDTO } from "src/app/models/dtos/e-dtos/ls-status.dto";
import { LSTypeOfVehicleCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSPartItemVehicleCusDTO } from "../../../../models/dtos/e-dtos/ls-part-item-vehicle.dto";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { LSStatusTypeDataEnum } from "src/app/models/enums/e-type/ls-status-type-data.enum";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { LSTypeOfPartCusDTO } from "../../../../models/dtos/e-dtos/ls-type-of-part.dto";
import { LSTypeOfSpecsCusDTO } from "../../../../models/dtos/e-dtos/ls-type-of-part-specs.dto";
import { LSTypeOfPartnerCusDTO } from "../../../../models/dtos/e-dtos/ls-type-of-partner.dto";
import { LSPartItemCusDTO } from "../../../../models/dtos/e-dtos/ls-part-item.dto";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { FileDTO } from "src/app/models/dtos/file.dto";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { ProcessStatusEnum } from "src/app/models/enums/process-status.enum";

@Component({
  selector: 'prt012-item-detail',
  templateUrl: './prt012-item-detail.component.html',
  styleUrls: ['./prt012-item-detail.component.scss'],
})
export class Prt012ItemDetailComponent implements OnInit, OnDestroy {

  public partCache: LSPartItemCusDTO;
  public partItem: LSPartItemCusDTO = new LSPartItemCusDTO();
  public listCategory: LSPartCategoryCusDTO[] = []
  public listTypeOfPart: LSTypeOfPartCusDTO[] = [];
  public listTypeOfPartSpec: LSTypeOfSpecsCusDTO[] = [];
  public listSupplier: LSTypeOfPartnerCusDTO[] = [];
  public ProcessStatusEnum: ProcessStatusEnum
  private arrUnsubscribe: Subscription[] = [];

  constructor(
    private partapi: PSPartApiService,
    private coreapi: PSCoreApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
    private cache: PSCache,
  ) { }

  ngOnInit(): void {
    const temp = this.cache.getItem(KeyLocalStorageEnum.PART_ITEM_OBJECT);
    this.partCache = this.cache.parseValue(temp);
    if (this.partCache.Code != 0) {
      this.GetPartItemConfig(this.partCache);
    } else {
      this.partItem = new LSPartItemCusDTO();
      this.partItem.PartCategory = 1;
      this.partItem.TypeOfPart = 16554;
      this.partItem.TypeOfPartSpecs = 134;
      this.partItem.TypeData = 1;
    }
    this.GetListPartCategory(this.filter);
    this.GetListSupplier();
    this.GetListStatusWhole();
    this.GetListStatusBuy();
    this.GetListLSList()
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  onAddUpdateStore(): void {
    this.partItem = new LSPartItemCusDTO();
    this.partItem.Code = 0
    this.partItem.PartCategory = 1;
    this.partItem.TypeOfPart = 16554;
    this.partItem.TypeOfPartSpecs = 134;
    this.partItem.TypeData = 1;

    this.data.next([]);
    this.GetListTypeOfVehicle();

  }



  onCategoryChanged(id: any): void {
    const isValid = id.Code !== null && id !== 0;
    if (isValid) {
      this.getListTypeOfPart(this.filter);
    }
    this.partItem.TypeOfPart = null;
    this.partItem.TypeOfPartSpecs = null;
  }

  onTypeOfPartChanged(event: LSTypeOfPartnerCusDTO): void {
    const isValid = event.Code !== null && event.Code !== 0;
    if (isValid) {
      const selectedPart = new LSTypeOfPartCusDTO();
      selectedPart.Code = event.Code;
      this.GetListTypeOfPartSpecs(selectedPart);
    }
    this.partItem.TypeOfPartSpecs = null;
  }

  public onFieldChanged<K extends keyof LSPartItemCusDTO>(_: any, prop: K): void {
    let value = this.partItem[prop];
    if (value === this.oldValue) return;

    const baseFields: (keyof LSPartItemCusDTO)[] = [
      'TypeOfPart',
      'WHUnit',
      'IsDate',
      'TypeData'
    ];


    const payload: UpdatePropertiesInterface<LSPartItemCusDTO> = {
      DTO: { ...this.partItem },
      Properties: [prop, ...baseFields] as (keyof LSPartItemCusDTO)[]
    };

    this.UpdatePartItem(payload);
  }

  public oldValue: any;
  onCheckFieldChange(event: LSPartItemCusDTO, prop: keyof LSPartItemCusDTO): void {
    this.oldValue = event[prop];
  }

  public onValueChanged(dataItem: LSPartItemVehicleCusDTO): void {
    switch (this.editingField) {
      case 'TypeOfVehicle': {
        const selected = this.listTypeOfVehicle.find(x => x.Code === dataItem.TypeOfVehicle);
        if (!selected) return;
        dataItem.TypeOfVehicleName = selected.TypeOfVehicle;
        this.GetListVehicle(selected)
        break;
      }

      case 'VehicleName': {
        const selectedVehicle = this.listVehicle.find(v => v.Code === dataItem.Vehicle);
        if (!selectedVehicle) return;
        dataItem.VehicleName = selectedVehicle.VehicleName;
        dataItem.VehicleVersion = selectedVehicle.Version;
        this.GetListVehicleColor(selectedVehicle)
        break;
      }

      case 'ColorVehicleName': {
        const selectedColor = this.listVehicleColor?.find(c => c.Code === dataItem.VehicleColor);
        dataItem.ColorVehicleName = selectedColor?.ColorVehicleName || '';
        this.UpdatePartItemVehicle(dataItem);
        break;
      }
    }
  }

  public data = new BehaviorSubject<LSPartItemVehicleCusDTO[]>([]);
  public items: LSPartCategoryCusDTO[] = [];
  public total = 0;

  isOpen: boolean = false;
  onOpen() {
    this.GetListPartItemImage();
    this.isOpen = true;
  }

  public isExpand = true;
  OpenBlock1() {
    this.isExpand = !this.isExpand;
  }
  public isBlock1: any;

  private groupfilter: CompositeFilterDescriptor = {
    filters: [],
    logic: 'and',
  };

  private filter: State = {
    filter: this.groupfilter,
    sort: [{ field: 'Code', dir: 'desc' }],
  };

  onFileChosen(file: FileDTO) {
    const segments = file.Path.split('/');
    const startIndex = segments.indexOf('resource');
    const path = '/' + segments.slice(startIndex).join('/');

    this.partItem.URLThumbImage = path;
    this.imageActive = file.Path;

    const payload: UpdatePropertiesInterface<LSPartItemCusDTO> = {
      DTO: { ...this.partItem },
      Properties: ['URLThumbImage']
    };

    this.UpdatePartItem(payload);
    this.isOpen = false;
  }

  onUploadFile() {
    this.GetListPartItemImage();
  }

  onDeleteFile() {
    this.GetListPartItemImage();
  }

  @ViewChildren('dropdownRef', { read: ElementRef }) dropdownRefs: QueryList<ElementRef>;

  public isOpenDropdown = false;
  public editingRowIndex: number | null = null;
  public editingField: string | null = null;
  onOpenList(field: string, rowIndex: number): void {
    this.isOpenDropdown = true;
    this.editingRowIndex = rowIndex;
    this.editingField = field;

    setTimeout(() => {
      const dropdown = this.dropdownRefs.toArray()[rowIndex]?.nativeElement;
      dropdown?.querySelector('input')?.focus();

    }, 0);
  }

  closeDropdown() {
    this.isOpenDropdown = false;
    this.editingRowIndex = null;
    this.editingField = null;
  }
  onAddNew() {
    const newRow = Object.assign(new LSPartItemVehicleCusDTO(), {
      Code: 0,
      PartItem: this.partItem.Code,
    });
    newRow.Vehicle = 7;
    newRow.VehicleColor = null;

    const currentList = this.data.getValue() || [];

    this.data.next([newRow, ...currentList]);

    this.isOpenDropdown = true;
    this.editingRowIndex = 0;
    this.editingField = 'TypeOfVehicle';
  }
  //#region API Call Methods
  public FunctionPermissionDTOs = FunctionPermissionDTO;

  private GetPartItemConfig(param: LSPartItemCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.partapi.GetPartItemConfig(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.partItem = res.ObjectReturn;
          this.GetListPartItemVehicle(this.filter);
        } else {
          this.notification.onError(`Lỗi lấy thông tin phân loại phụ tùng: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin phân loại phụ tùng: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }

  private GetListPartCategory(filter: State): void {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartCategory(filter).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.listCategory = res.ObjectReturn.Data;
          this.getListTypeOfPart(this.filter);
        } else {
          this.notification.onError(`Lỗi lấy phân nhóm: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy phân nhóm: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }

  private getListTypeOfPart(filter: State) {
    this.groupfilter.filters = [];
    this.subLoader.loader(true);
    const sub = this.partapi.GetListTypeOfPart(filter).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          this.listTypeOfPart = res.ObjectReturn.Data;
          const dto = new LSTypeOfPartCusDTO();
          dto.Code = this.partItem?.TypeOfPart;
          this.GetListTypeOfPartSpecs(dto);
          this.subLoader.loader(false);
        } else {
          this.notification.onError(`Lỗi lấy loại phụ tùng: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy loại phụ tùng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);
  }

  private GetListTypeOfPartSpecs(param: LSTypeOfPartCusDTO): void {
    this.subLoader.loader(true);
    this.partapi.GetListTypeOfPartSpecs(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.listTypeOfPartSpec = res.ObjectReturn
        } else {
          this.notification.onError(`Lỗi lấy chi tiết phân loại: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy chi tiết phân loại: ${err.message}`);
      }
    });
  }

  private GetListSupplier() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListSupplier().subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.listSupplier = res.ObjectReturn
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy thông tin nhà cung cấp: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin nhà cung cấp: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  public listStatusWhole: LSStatusCusDTO[] = [];
  public listStatusBuy: LSStatusCusDTO[] = [];

  private GetListStatusWhole() {
    this.coreapi.GetListStatus(LSStatusTypeDataEnum.WHOLE).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.listStatusWhole = res.ObjectReturn;
        } else {
          this.notification.onError(`Lỗi tình trạng kinh doanh: ${res.ErrorString}`);
        }
      },
      err => {
        this.notification.onError(`Lỗi tình trạng kinh doanh: ${err.message}`);
      }
    );
  }

  private GetListStatusBuy() {
    this.coreapi.GetListStatus(LSStatusTypeDataEnum.BUY).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.listStatusBuy = res.ObjectReturn;
        } else {
          this.notification.onError(`Lỗi tình trạng mua hàng: ${res.ErrorString}`);
        }
      },
      err => {
        this.notification.onError(`Lỗi tình trạng mua hàng: ${err.message}`);
      }
    );
  }

  public listLSList: LSPartItemCusDTO[] = [];

  private GetListLSList() {
    this.coreapi.GetListLSList(LSListTypeDataEnum.Unit).subscribe(
      res => {
        if (res.StatusCode === 0) {
          this.listLSList = res.ObjectReturn;
        } else {
          this.notification.onError(`Lỗi lấy đơn vị tính: ${res.ErrorString}`);
        }
      },
      err => {
        this.notification.onError(`Lỗi lấy đơn vị tính: ${err.message}`);
      }
    );
  }

  private GetListPartItemVehicle(param: State): void {
    this.groupfilter.filters = [];

    if (this.partItem?.Code != 0) {
      this.groupfilter.filters.push({
        field: 'PartItem',
        operator: 'eq',
        value: this.partItem?.Code
      });
    }

    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartItemVehicle(param).subscribe({
      next: res => {
        this.data.next(res.ObjectReturn?.Data);
        this.GetListTypeOfVehicle();
        this.subLoader.loader(false);
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi lấy danh sách xe thích hợp: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách xe thích hợp: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }

  public listTypeOfVehicle: LSTypeOfVehicleCusDTO[] = []
  private GetListTypeOfVehicle(): void {
    this.groupfilter.filters = [];
    this.subLoader.loader(true);
    const sub = this.partapi.GetListTypeOfVehicle().subscribe({
      next: res => {
        this.listTypeOfVehicle = res.ObjectReturn
        this.subLoader.loader(false);
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi lấy dòng xe: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy dòng xe: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }
  public listVehicle: any
  private GetListVehicle(param: LSTypeOfVehicleCusDTO): void {
    this.groupfilter.filters = [];
    this.subLoader.loader(true);
    const sub = this.partapi.GetListVehicle(param).subscribe({
      next: res => {
        this.listVehicle = res.ObjectReturn
        this.subLoader.loader(false);
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi nhóm: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi nhóm: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }
  public listVehicleColor: any
  public GetListVehicleColor(param: LSTypeOfVehicleCusDTO): void {
    this.groupfilter.filters = [];
    this.subLoader.loader(true);
    const sub = this.partapi.GetListVehicleColor(param).subscribe({
      next: res => {
        this.listVehicleColor = res.ObjectReturn
        this.subLoader.loader(false);
        if (res.StatusCode !== 0) {
          this.notification.onError(`Lỗi nhóm: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi nhóm: ${err.message}`);
      },
    });
    this.arrUnsubscribe.push(sub);
  }
  //#endregion
  private UpdatePartItem<K extends keyof LSPartItemCusDTO>(param: UpdatePropertiesInterface<LSPartItemCusDTO>) {
    this.subLoader.loader(true);
    const sub = this.partapi.UpdatePartItem(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          const field = param.Properties[0] as K;
          this.partItem[field] = param.DTO[field] as LSPartItemCusDTO[K];
          this.partItem.Code = res.ObjectReturn.Code
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  public partItemVehicle: LSPartItemVehicleCusDTO[] = []
  private UpdatePartItemVehicle(dto: LSPartItemVehicleCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.partapi.UpdatePartItemVehicle(dto).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListPartItemVehicle(this.filter);
          this.isOpenDropdown = false;
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  onDeleteClick(data: LSPartItemVehicleCusDTO) {
    this.DeletePartItemVehicle(data);
    this.GetListPartItemVehicle(this.filter)
  }
  private DeletePartItemVehicle(dto: LSPartItemVehicleCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.partapi.DeletePartItemVehicle(dto).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.GetListPartItemVehicle(this.filter)
          this.notification.onSuccess('Thành công');
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message);
      }
    });
    this.arrUnsubscribe.push(sub);
  }


  public listimage: FileDTO[] = [];
  public imageActive: string;
  private GetListPartItemImage() {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartItemImage(this.partItem).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.listimage = res.ObjectReturn;
        } else {
          this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hình ảnh: ${err.message}`);
      }
    });
    this.arrUnsubscribe.push(sub);
  }
}
