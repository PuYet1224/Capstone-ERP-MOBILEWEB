import { Component, OnDestroy, OnInit } from '@angular/core';
import { PSPartApiService } from '../../services/ps-part-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { Subscription, Subject } from 'rxjs';
import { LSTypeOfPartSpecsDTO } from '../../../../models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { LSTypeOfPartCusDTO } from '../../../../models/dtos/e-dtos/ls-type-of-part.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { Router } from '@angular/router';
import { LSTypeOfPartTypeDataEnum } from '../../../../models/enums/e-type/ls-type-of-part-type-data.enum';
import { State } from '@progress/kendo-data-query';
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { PSHeaderService } from 'src/app/layouts/main-layout/services/ps-header.service';

@Component({
  selector: 'prt010-type-detail',
  templateUrl: './prt010-type-detail.component.html',
  styleUrls: ['./prt010-type-detail.component.scss'],
})
export class Prt010TypeDetailComponent implements OnInit, OnDestroy {
  private arrUnsubscribe: Subscription[] = [];
  private categoryFilter: State = { skip: 0, take: 999 };
  public typeTouched: boolean = false;
  public specsActive: LSTypeOfPartSpecsDTO | null = null;
  public partSpecs: LSTypeOfPartSpecsDTO[] = [];
  public typePartCache: LSTypeOfPartCusDTO;
  public typePart: LSTypeOfPartCusDTO = new LSTypeOfPartCusDTO();
  public reftypePart: LSTypeOfPartCusDTO = new LSTypeOfPartCusDTO();
  public listCategory: Array<{ id: number; text: string }> = [];
  public listOrderBy: { OrderBy: number }[] = [];
  public editing: { [row: number]: 'TypeOfPartSpecs' | 'Description' | null } = {};
  public isTab1: boolean;
  public isTab2: boolean;
  public isTab3: boolean;
  public isTab4: boolean;

  constructor(
    private partapi: PSPartApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
    private cache: PSCache,
    private header: PSHeaderService,
    private router: Router,
  ) {
  }
  //#region life cycle
  ngOnInit(): void {
    const raw = this.cache.getItem(KeyLocalStorageEnum.TYPE_PART_OBJECT);
    this.typePartCache = this.cache.parseValue(raw) ?? new LSTypeOfPartCusDTO();
    this.typePart = { ...new LSTypeOfPartCusDTO(), ...this.typePartCache, IsModify: this.typePartCache?.IsModify ?? true };
    this.reftypePart = { ...this.typePart };
    if (this.typePart.Code) {
      this.typeTouched = true;
      this.GetTypeOfPart(this.typePart);
    } else {
      this.typeTouched = false;
    }
    this.GetListPartCategory(this.categoryFilter);
    this.GetListTypeOfPartSpecs(this.typePart);
    this.header.headObs$.subscribe(val => {
      if (val != null) {
        this.router.navigate(['/part/config/type']);
        this.header.headChange.next(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  get canModify(): boolean {
    return FunctionPermissionDTO.master || FunctionPermissionDTO.creator;
  }

  get detailCanModify(): boolean {
    return this.canModify && this.typePart.IsModify;
  }
  //#endregion

  //#region header
  public isShowDialog: boolean = false;
  public isShowDialogDone: boolean = false;
  public isShowDeleteDialog: boolean = false;
  public confirmDeleteTypePart(): void {
    this.isShowDeleteDialog = false;

    this.DeleteTypeOfPart();
  }
  public addNewTypePart(): void {
    if (!this.canModify) return;
    const dto = new LSTypeOfPartCusDTO();
    dto.IsModify = true;
    this.typePart = dto;
    this.reftypePart = { ...dto };
    this.partSpecs = [];
    this.typeTouched = false;
    this.cache.setItem(KeyLocalStorageEnum.TYPE_PART_OBJECT, dto);
  }

  public DeleteTypeOfPart() {
    this.subLoader.loader(true);
    const param = [this.typePart];
    const sub = this.partapi.DeleteTypeOfPart(param).subscribe({
      next: (res) => {
        this.subLoader.loader(false);
        if (res.StatusCode == 0) {
          this.typePart = new LSTypeOfPartCusDTO();
          this.partSpecs = [];
          this.isShowDeleteDialog = false;
          this.notification.onSuccess(`Đã xoá loại phụ tùng`);
        } else {
          this.notification.onError(`Lỗi xoá không thành công: ${res.ErrorString}`);
        }
      },
      error: (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xóa không thành công: ${err.message}`);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  //#endregion

  //#region typePart
  public isBlock1: boolean = true;
  public listPartSpecs: LSTypeOfPartSpecsDTO[] = [];

  public OpenBlock1() {
    this.isBlock1 = !this.isBlock1;
  }

  public onFieldChanged(dto: LSTypeOfPartCusDTO, prop: string[]) {
    const field = prop[0] as keyof LSTypeOfPartCusDTO;
    const value = dto[field];
    if (value === null || value === undefined) {
      return;
    }

    let list: string[];

    if (dto.Code === 0) {
      if (field !== 'TypeOfPart') {
        return;
      }
      if ((dto.TypeOfPart || '').trim() === '') {
        return;
      }
      this.typeTouched = true;
      dto.TypeData = LSTypeOfPartTypeDataEnum.Part;
      list = ['TypeData', 'TypeOfPart', 'Category', 'OrderBy', 'Description'];
    } else {
      if (this.reftypePart[field] === value) {
        return;
      }
      list = [field];
    }

    const { IsModify, ...dtoWithoutIsModify } = dto;
    const payload: UpdatePropertiesInterface<LSTypeOfPartCusDTO> = {
      DTO: dtoWithoutIsModify as LSTypeOfPartCusDTO,
      Properties: list
    };
    this.UpdateTypeOfPart(payload);
  }

  private GetListPartCategory(filter: State): void {
    this.subLoader.loader(true);
    const sub = this.partapi.GetListPartCategory(filter).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.listCategory = res.ObjectReturn.Data.map(f => ({
            id: f.Code,
            text: f.Category,
          }));
          if (!this.typePart.Code && this.listCategory.length > 0) {
            this.typePart.Category = this.listCategory[0].id;
            this.onFieldChanged(this.typePart, ['Category']);
          }
        } else {
          this.notification.onError(`Lỗi nhóm: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi nhóm: ${err.message}`);
      }
    });

    this.arrUnsubscribe.push(sub);
  }


  private GetTypeOfPart(param: LSTypeOfPartCusDTO): void {
    this.subLoader.loader(true);
    const sub = this.partapi.GetTypeOfPart(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.typePart = res.ObjectReturn;
          this.reftypePart = { ...res.ObjectReturn };
        } else {
          this.notification.onError(`Lỗi lấy loại phụ tùng: ${res.ErrorString}`);
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy loại phụ tùng: ${err.message}`);
      }
    });
    this.arrUnsubscribe.push(sub);
  }

  private UpdateTypeOfPart(param: UpdatePropertiesInterface<LSTypeOfPartCusDTO>) {
    this.subLoader.loader(true);
    const sub = this.partapi.UpdateTypeOfPart(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.typePart = res.ObjectReturn;
          this.reftypePart = { ...res.ObjectReturn };
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
  //#endregion

  //#region typePartdetail
  public total = 0;
  public data: Subject<{ data: LSTypeOfPartSpecsDTO[]; total: number }> = new Subject();
  private specValueChange: { [row: number]: string } = {};
  tempDescription: string = '';

  public refreshGrid() {
    let items = this.partSpecs;
    if (!(this.canModify && this.typePart.IsModify)) {
      items = items.filter(x => x.Code !== 0);
    }

    const gridData = this.specsActive
      ? [this.specsActive, ...items]
      : items;

    this.data.next({ data: gridData, total: items.length });
  }

  public onAddNewSpec(): void {
    if (!this.canModify) return;
    const draft = new LSTypeOfPartSpecsDTO();
    draft.TypeOfPart = this.typePart.Code;
    draft.TypeOfPartSpecs = '';
    draft.Description = '';
    draft.TypeData = this.typePart.TypeData;
    this.partSpecs.unshift(draft);
    this.editing[0] = 'TypeOfPartSpecs';
    setTimeout(() => document.getElementById('input-TypeOfPartSpecs-0')?.focus());
  }


  public isEditingDetail(
    rowIndex: number,
    field: 'TypeOfPartSpecs' | 'Description'
  ): boolean {
    return this.editing[rowIndex] === field;
  }

  startEditDetail(rowIndex: number, field: 'TypeOfPartSpecs' | 'Description'): void {
    if (!this.canModify) return;
    this.editing[rowIndex] = field;
    const value = this.partSpecs[rowIndex][field] || '';
    this.specValueChange[rowIndex] = value;
    if (field === 'Description') this.tempDescription = value;
  }

  public saveDetail(
    item: LSTypeOfPartSpecsDTO,
    field: 'TypeOfPartSpecs' | 'Description',
    rowIndex: number
  ): void {
    if (!this.canModify) return;
    const rawValue = field === 'Description' ? this.tempDescription : (item[field] ?? '');
    const trimmedValue = rawValue.trim();
    const oldValue = (this.specValueChange[rowIndex] ?? '').trim();
    const isNewItem = item.Code === 0;
  
    if (field === 'Description') {
      item.Description = trimmedValue === '' ? null : trimmedValue;
    } else {
      item[field] = trimmedValue === '' ? null : trimmedValue;
    }
  
    if ((field === 'TypeOfPartSpecs' && trimmedValue === '') || (item.TypeOfPartSpecs ?? '').trim() === '') {
      if (!isNewItem && item.Code) {
        this.subLoader.loader(true);
        this.partapi.DeleteTypeOfPartSpecs([item]).subscribe({
          next: res => {
            this.subLoader.loader(false);
            this.GetListTypeOfPartSpecs(this.typePart);
          },
          error: () => {
            this.subLoader.loader(false);
          }
        });
        this.editing[rowIndex] = null;
        delete this.specValueChange[rowIndex];
        return;
      }
      this.partSpecs.splice(rowIndex, 1);
      this.refreshGrid();
      this.editing[rowIndex] = null;
      delete this.specValueChange[rowIndex];
      return;
    }
  
    const noChange = !isNewItem && trimmedValue === oldValue;
    if (noChange) {
      this.editing[rowIndex] = null;
      delete this.specValueChange[rowIndex];
      return;
    }
  
    const props = isNewItem
      ? ['TypeOfPart', 'TypeData', 'TypeOfPartSpecs', 'Description']
      : [field];
  
    delete this.editing[rowIndex];
    delete this.specValueChange[rowIndex];
  
    this.subLoader.loader(true);
    this.partapi.UpdateTypeOfPartSpecs({ DTO: item, Properties: props }).subscribe({
      next: () => {
        this.subLoader.loader(false);
        this.GetListTypeOfPartSpecs(this.typePart);
      },
      error: () => {
        this.subLoader.loader(false);
        this.editing[rowIndex] = field;
      }
    });
  }

  public getDetailFocus(item: LSTypeOfPartSpecsDTO): void {
    this.specsActive = item;
  }

  private GetListTypeOfPartSpecs(param: LSTypeOfPartCusDTO): void {
    this.subLoader.loader(true);
    this.partapi.GetListTypeOfPartSpecs(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          const raw = res.ObjectReturn;
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray((raw as any).Data)
              ? (raw as any).Data
              : [];
          this.partSpecs = list;
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

  private UpdateTypeOfPartSpecs(param: UpdatePropertiesInterface<LSTypeOfPartSpecsDTO>) {
    this.subLoader.loader(true);
    this.partapi.UpdateTypeOfPartSpecs(param).subscribe({
      next: res => {
        this.subLoader.loader(false);
        if (res.StatusCode === 0) {
          this.notification.onSuccess(
            param.DTO.Code === 0 ? 'Tạo mới thành công' : 'Cập nhật thành công'
          );
          this.GetListTypeOfPartSpecs(this.typePart);
        } else {
          this.notification.onError(res.ErrorString || 'Lỗi cập nhật');
        }
      },
      error: err => {
        this.subLoader.loader(false);
        this.notification.onError(err.message || 'Lỗi mạng');
      }
    });
  }

  //#region confirm delete
  public popupConfirmOpen = false;
  public onDeleteDetail(item: LSTypeOfPartSpecsDTO): void {
    if (!this.canModify) return;
    this.specsActive = item;
    this.popupConfirmOpen = true;
  }

  public confirmDeleteDetail(): void {
    if (!this.specsActive) { return; }
    if (this.specsActive.Code === 0) {
      this.partSpecs = this.partSpecs.filter(x => x !== this.specsActive);
      this.notification.onSuccess('Xóa nháp thành công');
      this.refreshGrid();
      this.popupConfirmOpen = false;
      this.specsActive = null;
      return;
    }

    this.DeleteTypeOfPartSpecs([this.specsActive]);
    this.popupConfirmOpen = false;
    this.specsActive = null;
  }

  public DeleteTypeOfPartSpecs(param: LSTypeOfPartSpecsDTO[]) {
    this.subLoader.loader(true);
    var temp = this.partapi.DeleteTypeOfPartSpecs(param).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.GetListTypeOfPartSpecs(this.typePart);
          this.popupConfirmOpen = false;
          this.subLoader.loader(false);
          this.notification.onSuccess(`Xoá thông tin chi tiết phân loại phụ tùng thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(
            `Lỗi xoá thông tin phụ tùng: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi xoá thông tin chi tiết phân loại phụ tùng: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }
  //#endregion
}