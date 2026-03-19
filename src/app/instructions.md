# HoaiMinh ERP WebMobile – Component Creation Rules

> **MỤC ĐÍCH**: File này chứa tất cả các quy tắc và quy ước mà AI (hoặc dev) **PHẢI** tuân thủ khi tạo component mới trong dự án.  
> **ĐỌC FILE NÀY TRƯỚC KHI TẠO BẤT KỲ COMPONENT MỚI NÀO.**

---

## 1. Tổng quan Tech Stack

| Layer          | Công nghệ                                                          |
| -------------- | ------------------------------------------------------------------- |
| Framework      | **Angular 16** (NgModule, không standalone)                         |
| UI Library     | **Kendo UI for Angular v13** (`@progress/kendo-angular-*`)          |
| CSS            | **SCSS** (component-scoped) + Bootstrap 5 (grid only)               |
| Icons          | **Material Icons** (font) + **Lucide Angular** (SVG, selective pick) |
| Gestures       | **HammerJS** (swipe / pan)                                          |
| State passing  | **LocalStorage** qua `PsCache` + `KeyLocalStorageEnum`              |
| HTTP           | `APIService` (custom wrapper) → **Observable\<ResponseDTO\>**       |
| Notifications  | `PsKendoNotificationService` (`.onSuccess`, `.onError`, `.onWarning`, `.onInfo`) |
| Loading        | `SystemLoaderService` (`.loader(true/false)`, `.reset()`)           |

---

## 2. Cấu trúc thư mục

```
src/app/
├── components/           ← Shared components (prefix: ps-*)
│   ├── ps-barcodes/
│   ├── ps-button/
│   ├── ps-dialog/
│   ├── ps-dropdown/
│   ├── ps-input/
│   └── ps-layout/        ← ps-header-back, ps-header-main, ps-footer-action, ps-footer-copyright
├── guards/
├── models/
│   ├── dtos/
│   │   └── e-dtos/       ← DTOs nghiệp vụ (VD: sal-order-master.dto.ts)
│   └── enums/
│       ├── e-status/     ← Enum trạng thái (VD: sal-order-detail-status.enum.ts)
│       └── e-type/       ← Enum loại dữ liệu (VD: ls-list-type-data.enum.ts)
├── pipes/
│   └── e-style/          ← Pipes hiển thị trạng thái / loại dữ liệu
├── services/
│   ├── auth/
│   ├── core/             ← APIService, PsKendoNotificationService, GetConfigService
│   └── utilities/        ← PsCache, PsString
└── views/
    ├── mtbike/
    │   ├── mtbike.module.ts
    │   ├── mtbike.routing.ts
    │   ├── services/     ← MtbikeApiService, MtbikeApiStaticService
    │   └── views/        ← mtb000-dashboard, mtb001-repair, ... mtb033-*
    └── system/
        ├── system.module.ts
        └── services/     ← SystemLoaderService, SystemApiService
```

---

## 3. Quy tắc đặt tên

### 3.1. Tên thư mục & selector

- **Quy tắc**: `mtbXXX-<tên-chức-năng>` (VD: `mtb034-sal-payment-detail`).
- `XXX` là số thứ tự tiếp theo (tăng dần).
- Selector component trùng tên thư mục: `selector: 'mtb034-sal-payment-detail'`.

### 3.2. Tên class component

- PascalCase, bắt đầu bằng `MtbXXX`: `Mtb034SalPaymentDetailComponent`.
- Export **duy nhất 1 class** component trong mỗi file `.ts`.

### 3.3. Tên file

Mỗi component gồm **đúng 3 file** (không tạo file `.spec.ts` mặc định):

```
mtb034-sal-payment-detail/
├── mtb034-sal-payment-detail.component.ts
├── mtb034-sal-payment-detail.component.html
└── mtb034-sal-payment-detail.component.scss
```

### 3.4. Shared components

- Prefix: `ps-` (VD: `ps-header-back`, `ps-kendo-button`).
- Nằm trong `src/app/components/ps-*/`.
- Được export qua module riêng (VD: `PsLayoutModule`).

---

## 4. Cấu trúc file TypeScript (.component.ts)

### 4.1. Template bắt buộc

```typescript
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
// ... các import khác

@Component({
  selector: 'mtbXXX-ten-chuc-nang',
  templateUrl: './mtbXXX-ten-chuc-nang.component.html',
  styleUrls: ['./mtbXXX-ten-chuc-nang.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,   // ← BẮT BUỘC khi component cần performance
})
export class MtbXXXTenChucNangComponent implements OnInit, OnDestroy {

  // #region FIELDS
  private arrUnsubscribe: Subscription[] = [];
  // ... các field khác
  // #endregion

  // #region LIFECYCLE
  constructor(
    private router: Router,
    private cache: PsCache,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Khởi tạo dữ liệu
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  // #endregion

  // #region LOAD DATA
  // ... các method load data từ API
  // #endregion

  // #region ACTIONS
  // ... các method user interaction
  // #endregion
}
```

### 4.2. Quy tắc `#region`

**BẮT BUỘC** sử dụng `// #region TÊN_VÙNG` và `// #endregion` để tổ chức code. Các region phổ biến:

| Region          | Nội dung                                         |
| --------------- | ------------------------------------------------ |
| `FIELDS`        | Biến, properties, flags                          |
| `LIFECYCLE`     | constructor, ngOnInit, ngOnDestroy, ngAfterViewInit |
| `HEADER`        | Logic liên quan đến header                       |
| `TAB`           | Logic chuyển tab                                 |
| `SWIPE`         | Logic swipe gesture                              |
| `LOAD DATA`     | Gọi API, load dữ liệu                           |
| `ACTIONS`       | Các method do user tương tác                     |
| `TRACKBY`       | trackBy functions cho *ngFor                     |
| `STATUS BADGE`  | Logic hiển thị badge trạng thái                  |

### 4.3. Subscription management

```typescript
// Khai báo
private arrUnsubscribe: Subscription[] = [];

// Khi subscribe
const sub = this.api.SomeMethod().subscribe(res => { ... });
this.arrUnsubscribe.push(sub);

// Trong ngOnDestroy
ngOnDestroy(): void {
  this.subLoader.reset();
  this.arrUnsubscribe.forEach(e => e.unsubscribe());
  this.arrUnsubscribe = [];
}
```

### 4.4. ChangeDetection

- Sử dụng `ChangeDetectionStrategy.OnPush`.
- Inject `ChangeDetectorRef` trong constructor.
- Gọi `this.cdr.markForCheck()` sau mỗi thay đổi data (đặc biệt sau callback bất đồng bộ).

### 4.5. Interface khai báo nội bộ

- Nếu interface chỉ dùng trong 1 component → khai báo ngay trong file `.ts` phía **trên** `@Component`.
- Nếu interface dùng chung → tạo file `.dto.ts` trong `models/dtos/e-dtos/`.

---

## 5. Quy tắc đặt tên API & Hàm gọi API

### 5.1. Tên method API trong Service (`MtbikeApiService`, `PSCoreApiService`)

Tên method API viết theo PascalCase, sử dụng các prefix sau:

| Prefix     | Mục đích                         | Ví dụ                                                                 |
| ---------- | -------------------------------- | --------------------------------------------------------------------- |
| `GetList`  | Lấy danh sách (trả về mảng)     | `GetListSALMaster`, `GetListWOMConsultant`, `GetListVehicleOptions`   |
| `Get`      | Lấy 1 object chi tiết            | `GetSALMaster`, `GetWOMVehicle`, `GetSALPayment`, `GetConsutantOrderDetail` |
| `Update`   | Cập nhật (tạo mới hoặc sửa)     | `UpdateSALMaster`, `UpdateWOMConsultant`, `UpdateSALDetail`           |
| `Delete`   | Xóa                              | `DeleteWOMConsultant`, `DeleteSALDetail`, `DeleteSALSelectedVehicles` |
| `Add`      | Thêm mới (chỉ dùng khi không dùng Update) | `AddSALSelectedVehicles`                                   |
| `Import`   | Import dữ liệu                  | `ImportTypeOfVehicle`, `ImportVehicle`                                |

> **Quy tắc**: Tên API method trong Service **PHẢI TRÙNG** tên API key trong `MtbikeApiStaticService` (VD: `fconsultant.GetListSALMaster`).

### 5.2. Tên hàm gọi API trong Component

Hàm wrapper trong component **PHẢI TRÙNG** tên method API trong service:

```typescript
// ✅ ĐÚNG: Tên hàm trùng tên API method
private GetListWOMConsultant(filter: State) { ... }
private GetSALMaster(param: SALOrderMasterCusDTO) { ... }
private UpdateWOMVehicle(param: UpdatePropertiesInterface<CSVehicleCusDTO>) { ... }
public DeleteWOMConsultant(param: CSWorkOrderMasterCusDTO) { ... }

// ❌ SAI: Đặt tên khác với API
private loadConsultantList(filter: State) { ... }
private fetchMasterData(param: ...) { ... }
```

**Ngoại lệ**: Một số hàm helper load data dùng tên camelCase:

```typescript
// Chấp nhận: Hàm helper gọi API core (PSCoreApiService)
private getlisthead() { ... }        // gọi this.coreapi.GetListHead()
private getlistprovince() { ... }    // gọi this.coreapi.GetListProvince()
private getlistvehicle(params) { ... } // gọi this.mtbikeapi.GetListVehicle()
```

### 5.3. Pattern gọi API — Flow chuẩn

```typescript
private GetListWOMConsultant(filter: State): void {
  this.subLoader.loader(true);                           // ← Bật loader

  const sub = this.mtbikeapi.GetListWOMConsultant(filter).subscribe(
    (res) => {
      if (res.StatusCode === 0) {                        // ← Check StatusCode
        this.listworkordermaster = res.ObjectReturn as CSWorkOrderMasterCusDTO[];  // ← Cast ObjectReturn
        this.cdr.markForCheck();
      } else {
        this.notification.onError(`Lỗi lấy danh sách phiếu: ${res.ErrorString}`);
      }
      this.subLoader.loader(false);                      // ← Tắt loader
    },
    (err) => {
      this.subLoader.loader(false);                      // ← Tắt loader khi lỗi
      this.notification.onError(`Lỗi lấy danh sách phiếu: ${err.message}`);
    }
  );

  this.arrUnsubscribe.push(sub);                         // ← Push subscription
}
```

### 5.4. Pattern cập nhật — `UpdatePropertiesInterface<T>`

Khi cập nhật từng field (partial update), dùng `UpdatePropertiesInterface<T>`:

```typescript
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';

// Ví dụ: Cập nhật thông tin khách hàng
onValueChange(field: string): void {
  if (this.data[field] === this.dataCopy[field]) return;  // ← Kiểm tra thay đổi

  this.dataCopy = { ...this.data };
  const param: UpdatePropertiesInterface<SALOrderMasterCusDTO> = {
    DTO: this.dataCopy,
    Properties: [field],           // ← Chỉ gửi field thay đổi
  };
  this.UpdateSALMaster(param);
}
```

### 5.5. Pattern thay đổi trạng thái — `UpdateStatusInterface<T>`

Khi cập nhật trạng thái đơn hàng:

```typescript
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';

const param: UpdateStatusInterface<SALOrderMasterCusDTO> = {
  DTO: this.retailDetailDTOcopy,
  Status: SALOrderMasterStatusRetailEnum.PENDING,
};
this.UpdateSALStatus(param);
```

### 5.6. ResponseDTO

```typescript
class ResponseDTO {
  ErrorString: string;
  ObjectReturn: any;
  StatusCode: number;      // 0 = success, khác 0 = error
}
```

### 5.7. Notification sau API

| Trường hợp            | Method                                        | Ví dụ message                                |
| ---------------------- | --------------------------------------------- | -------------------------------------------- |
| **Thành công (CUD)**   | `this.notification.onSuccess('Thành công')`    | `"Thành công"`                               |
| **Lỗi (StatusCode≠0)** | `this.notification.onError(...)`               | `` `Lỗi lấy danh sách: ${res.ErrorString}` `` |
| **Lỗi HTTP**           | `this.notification.onError(...)`               | `` `Lỗi lấy danh sách: ${err.message}` ``    |
| **Cảnh báo**           | `this.notification.onWarning(...)`             | `"Tên khách hàng không được để trống"`       |

> **Lưu ý**: Chỉ hiển thị `onSuccess` cho thao tác CUD (Create/Update/Delete). Không hiển thị cho thao tác Read (GetList, Get).

### 5.8. Truyền dữ liệu giữa các trang

Dùng `PsCache` (localStorage wrapper):

```typescript
// Lưu trước khi navigate
this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, item);
this.router.navigate(['/mtbike/consultant/detail']);

// Đọc ở component đích
const temp = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
this.master = this.cache.parseValue(temp);
```

> **Lưu ý**: Nếu cần thêm key mới → thêm vào `KeyLocalStorageEnum` trong `models/enums/key-local-storage.enum.ts`.

### 5.9. Đăng ký API endpoint mới

Khi thêm API mới, cần cập nhật 2 file:

1. **`MtbikeApiStaticService`** — thêm key vào namespace tương ứng:
   ```typescript
   // VD: thêm vào fconsultant
   export const fconsultant = {
     // Gets
     GetListNewFeature: '',
     // Update
     UpdateNewFeature: '',
   };
   ```
2. **`MtbikeApiService`** — thêm method mới theo pattern:
   ```typescript
   public GetListNewFeature(p: SomeDTO): Observable<ResponseDTO> {
     return new Observable<ResponseDTO>((obs) => {
       this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListNewFeature, p)
         .subscribe((res: ResponseDTO) => {
           obs.next(res);
           obs.complete();
         }, (errors) => {
           obs.error(errors);
           obs.complete();
         });
     });
   }
   ```

---

## 6. Quy tắc đặt tên biến

### 6.1. Biến Boolean — prefix `is`, `show`, `can`

| Prefix   | Sử dụng cho                        | Ví dụ thực tế                                                 |
| -------- | ---------------------------------- | ------------------------------------------------------------- |
| `is`     | Trạng thái của đối tượng / hành vi | `isOpenedFilter`, `isLoading`, `isLastPage`, `isLock`, `isCompare`, `isFollow`, `isSelected`, `isFilterApplied`, `isCartFilter`, `isFollowFilter`, `isShowNoti`, `isOpenePopup` |
| `show`   | Hiển thị/ẩn UI element            | `showpopup`, `showDeleteDialog`, `show`, `showToday`, `showFromDateToDate`, `showYearMonth` |

```typescript
// ✅ ĐÚNG
public isOpenedFilter: boolean = false;
public isLoading: boolean = false;
public isLastPage: boolean = false;
public showpopup: boolean = false;

// ❌ SAI
public filterOpened: boolean = false;
public loading: boolean = false;
public popupVisible: boolean = false;
```

### 6.2. Getter Boolean — prefix `is` (computed property)

Dùng TypeScript getter khi boolean phụ thuộc nhiều điều kiện:

```typescript
public get isContinue(): boolean {
  return !(
    this.vehicleInfo.PlateNo &&
    this.vehicleInfo.Category &&
    this.vehicleInfo.TypeOfVehicle &&
    this.vehicleInfo.Vehicle
  );
}
```

### 6.3. Biến danh sách mảng — prefix `list`

```typescript
// ✅ ĐÚNG
public listworkordermaster: CSWorkOrderMasterCusDTO[] = [];
public listcategory: LSPartCategoryCusDTO[] = [];
public listtypeofvehicle: LSTypeOfVehicleCusDTO[] = [];
public listcolor: LSVehicleColorCusDTO[] = [];
public listgender: ListDTO[] = [];
public listSalVehicle: LSVehicleCusDTO[] = [];

// ❌ SAI
public workOrderMasters: CSWorkOrderMasterCusDTO[] = [];
public categories: LSPartCategoryCusDTO[] = [];
```

### 6.4. DTO / Object đơn lẻ

- Tên viết camelCase, không có prefix đặc biệt.
- Nếu cần bản sao để so sánh, thêm hậu tố `copy`.

```typescript
public vehicleInfo: CSVehicleCusDTO = new CSVehicleCusDTO();
public oldVehicleInfo: CSVehicleCusDTO = new CSVehicleCusDTO(); // bản cũ để so sánh
public retailDetailDTO: SALOrderMasterCusDTO = new SALOrderMasterCusDTO();
public retailDetailDTOcopy: SALOrderMasterCusDTO = new SALOrderMasterCusDTO(); // bản copy
```

### 6.5. Enum instance công khai — Để sử dụng trong template

Khai báo enum public để template sử dụng:

```typescript
public WOMStatusEnum = WOMStatusEnum;
public SALOrderMasterStatusRetailEnum = SALOrderMasterStatusRetailEnum;
public FunctionPermissionDTO = FunctionPermissionDTO;
public SALOrderDetailTypeDataEnum = SALOrderDetailTypeDataEnum;
```

Sử dụng trong template:

```html
<div *ngIf="item.Status === SALOrderMasterStatusRetailEnum.NEW">Mới</div>
```

---

## 7. Quy tắc đặt tên hàm (Event Handlers & Actions)

### 7.1. Event Handlers — prefix `on`

Mọi hàm xử lý sự kiện từ UI (click, change, input) **PHẢI** bắt đầu bằng `on`:

| Pattern               | Mục đích                     | Ví dụ                                                      |
| --------------------- | ---------------------------- | ---------------------------------------------------------- |
| `onNavigate(field)`   | Điều hướng trang             | `onNavigate('back')`, `onNavigate('continue')`             |
| `onValueChange(e, f)` | Khi field thay đổi giá trị   | `onValueChange(item, 'PlateNo')`                           |
| `onFocus(e)`          | Khi focus vào field (lưu old) | `onFocus(this.vehicleInfo)`                                |
| `onSearchTask()`      | Khi submit search            | `onSearchTask()`                                           |
| `onSortChange(code)`  | Khi thay đổi sort            | `onSortChange(1)` = A-Z                                   |
| `onClose()`           | Khi đóng popup/filter        | `onClose()`                                                |
| `onAddNew(field)`     | Khi nhấn thêm mới            | `onAddNew('next')`                                         |
| `onSetItem(item)`     | Khi chọn item từ danh sách   | `onSetItem(item)` → cache + navigate                      |
| `onBuyVehicle(v, t)`  | Khi mua/chọn xe              | `onBuyVehicle(vehicle, SALOrderDetailTypeDataEnum.BUY)`    |
| `onCartFilter()`      | Toggle filter giỏ hàng       | `onCartFilter()`                                           |
| `onStoreChange(n)`    | Khi thay đổi cửa hàng        | `onStoreChange(headCode)`                                  |
| `onChangeType(n)`     | Khi thay đổi tab/loại        | `onChangeType(1)` = tab đầu                               |

### 7.2. Toggle — prefix `toggle`

```typescript
toggleItem(index: number) { ... }      // Mở/đóng item
toggleCard(index: number) { ... }      // Thu gọn/mở rộng card
toggleCategory(code: number) { ... }   // Bật/tắt filter category
toggleColor(name: string) { ... }      // Bật/tắt filter màu
```

### 7.3. Clear — prefix `clear`

```typescript
clearCategoryFilter() { ... }          // Xóa filter category
clearAllFilters() { ... }              // Xóa tất cả filter
clearPriceFilter() { ... }             // Xóa filter giá
```

### 7.4. Open/close popup

```typescript
public openFilterPopup(v: boolean) {
  this.isOpenedFilter = v;
}

public openPopup(item: any) {
  this.showpopup = true;
}
```

### 7.5. Long press gesture

```typescript
private pressTimer: any;

startPress(item: any) {
  this.pressTimer = setTimeout(() => {
    this.openPopup(item);
  }, 1000);                            // ← 1 giây
}

endPress() {
  clearTimeout(this.pressTimer);
}
```

Sử dụng trong template:

```html
<div (touchstart)="startPress(item)" (touchend)="endPress()">
```

---

## 8. Infinite Scroll Pattern (Lazy Loading danh sách)

Dùng `IntersectionObserver` với anchor element:

```typescript
@ViewChild('anchor', { static: true }) anchor: ElementRef;
@ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
private observer: IntersectionObserver;
private isLoading = false;
private isLastPage = false;
public filter: State = { skip: 0, take: 15 };

ngOnInit(): void {
  this.GetListData(this.filter);

  this.observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      this.loadMore();
    }
  }, { threshold: 0.1 });
  this.observer.observe(this.anchor.nativeElement);
}

ngOnDestroy(): void {
  this.observer.disconnect();
}

private loadMore() {
  if (this.isLoading || this.isLastPage) return;

  const listEl = this.bodyList.nativeElement as HTMLElement;
  if (listEl.scrollHeight <= listEl.clientHeight) return;

  this.filter.skip += this.filter.take;
  this.GetListData(this.filter);
}
```

Trong template:

```html
<div class="body-content" #bodyList>
  <div *ngFor="let item of items">...</div>
  <div #anchor style="height: 1px;"></div>
</div>
```

---

## 9. Filter & Search Pattern

Dùng Kendo `State` filter:

```typescript
import { State, FilterDescriptor } from '@progress/kendo-data-query';

public filter: State = {
  sort: [{ field: 'Code', dir: 'desc' }],
};
public searchKeyword: string = '';
public statusFilters: FilterDescriptor[] = [];

public onSearchTask(): void {
  const filters: any[] = [];

  // Search keyword
  if (this.searchKeyword.trim() !== '') {
    filters.push({
      logic: 'or',
      filters: [
        { field: 'CustomerName', operator: 'contains', value: this.searchKeyword },
        { field: 'CustomerPhone', operator: 'contains', value: this.searchKeyword },
      ]
    });
  }

  // Status filter
  if (this.statusFilters.length > 0) {
    filters.push({ logic: 'or', filters: this.statusFilters });
  }

  this.filter.filter = filters.length > 0 ? { logic: 'and', filters } : undefined;
  this.listData = [];
  this.GetListData(this.filter);
}
```

---

## 10. Navigation (Routing)

### 10.1. Đăng ký route

Thêm route mới vào `src/app/views/mtbike/mtbike.routing.ts`:

```typescript
{
  path: 'consultant/new-page',
  component: MtbXXXNewPageComponent,
},
```

### 10.2. Navigate trong code

```typescript
this.router.navigate(['/mtbike/consultant/new-page']);
```

### 10.3. Đăng ký component trong module

Thêm component vào `declarations` trong `src/app/views/mtbike/mtbike.module.ts`:

```typescript
import { MtbXXXNewPageComponent } from './views/mtbXXX-new-page/mtbXXX-new-page.component';

@NgModule({
  declarations: [
    // ... existing
    MtbXXXNewPageComponent,
  ],
})
```

### 10.4. Pattern `onNavigate`

```typescript
public onNavigate(field: string) {
    this.router.navigate(['/mtbike/' + field]);
}
```

---

## 11. Quy tắc SCSS

### 11.1. Cấu trúc file SCSS

```scss
@import "../../../../../assets/scss/colors";    // ← BẮT BUỘC import colors

::ng-deep {
  mtbXXX-ten-chuc-nang {                         // ← Tag selector (không có dấu .)
    font-size: 13px;                             // ← Font base
    height: 100%;

    .mtbXXX-ten-chuc-nang {                      // ← Class wrapper bên trong
      height: 100%;
      display: flex;
      flex-direction: column;

      // #region HEADER
      ps-header-back {
        // styles cho header
      }
      // #endregion

      // #region BODY
      .body-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px;
      }
      // #endregion
    }
  }
}
```

### 11.2. Lưu ý quan trọng

- **LUÔN** sử dụng `::ng-deep` wrapping toàn bộ SCSS vì component dùng ViewEncapsulation mặc định.
- **LUÔN** import `_colors.scss` để dùng biến màu semantic.
- **KHÔNG** hardcode màu → sử dụng biến SCSS.
- **Sử dụng `#region`** comments trong SCSS giống như TypeScript.

### 11.3. Biến màu semantic (ĐÃ ĐỊNH NGHĨA trong _colors.scss)

| Biến                  | Giá trị     | Sử dụng cho                        |
| --------------------- | ----------- | ----------------------------------- |
| `$primary`            | `#126433`   | Màu chủ đạo (xanh lá đậm)          |
| `$secondary`          | `#3c4858`   | Tiêu đề, text phụ                   |
| `$success`            | `#126433`   | Trạng thái thành công, giá          |
| `$error`              | `#e5322b`   | Lỗi, nút xóa                        |
| `$warning`            | `#CD9000`   | Cảnh báo                            |
| `$info`               | `#0074FF`   | Thông tin, link                      |
| `$white`              | `#ffffff`   | Nền trắng                           |
| `$border`             | `#979B9B`   | Viền                                 |
| `$background-primary` | `#EEEEEE`   | Nền xám nhạt                        |
| `$grey-400`           | `#bdbdbd`   | Placeholder, icon nhạt               |
| `$grey-500`           | `#9e9e9e`   | Text mờ                             |
| `$grey-600`           | `#757575`   | Text phụ, info-line                  |

### 11.4. Grid System 4pt

- **LUÔN** sử dụng bội số của **4px** cho spacing: `4px, 8px, 12px, 16px, 20px, 24px, ...`.
- Gaps giữa elements: `4px` hoặc `8px`.
- Padding containers: `8px`.
- Border-radius: `4px`, `8px`, `12px`.

### 11.5. Font size chuẩn

| Kích thước | Sử dụng cho                        |
| ---------- | ----------------------------------- |
| `10px`     | Info line nhỏ, footnote            |
| `11px`     | Sub-info, badge                     |
| `12px`     | Label phụ, color info              |
| `13px`     | Body text mặc định                 |
| `14px`     | Price (medium)                     |
| `16px`     | Price (large), dialog title        |

---

## 12. Template HTML

### 12.1. Cấu trúc chuẩn

```html
<div class="mtbXXX-ten-chuc-nang">
    <!-- START: HEADER -->
    <ps-header-back>
        <div class="left-side">
            <div class="func-title1">Tiêu đề chức năng</div>
        </div>
        <div class="right-side">
            <div><span>Thông tin</span></div>
        </div>
    </ps-header-back>
    <!-- END: HEADER -->

    <!-- START: BODY -->
    <div class="body-content">
        <!-- Content -->
    </div>
    <!-- END: BODY -->

    <!-- START: FOOTER -->
    <ps-footer-action>
        <!-- Nút Trở về (Back) -->
        <ps-kendo-button [buttonClass]="'k-button k-default btn-action'" [icon]="'arrow-left'"
            [title]="'Trở về'" (onClick)="onNavigate('back')">
        </ps-kendo-button>

        <!-- Nút Về danh sách (List) -->
        <ps-kendo-button [buttonClass]="'k-button k-default btn-action'" [icon]="'list'"
            [title]="'Về danh sách'" (onClick)="onNavigate('to-list')">
        </ps-kendo-button>

        <!-- Nút bấm action chính (Xác nhận/Lưu/...) -->
        <ps-kendo-button [buttonClass]="'k-button k-primary btn-action'" [icon]="'check'"
            [title]="'Xác nhận'" (onClick)="onConfirm()">
        </ps-kendo-button>
    </ps-footer-action>
    <!-- END: FOOTER -->
</div>
```

### 12.2. Quy tắc HTML

- **LUÔN** sử dụng comment `<!-- START: TÊN -->` và `<!-- END: TÊN -->` để đánh dấu vùng.
- Sử dụng `*ngFor` với `trackBy` function: `*ngFor="let item of items; trackBy: trackByCode"`.
- Sử dụng `*ngIf` cho conditional rendering (không dùng `[hidden]`).
- Header sử dụng shared component `<ps-header-back>`.
- Nút bấm sử dụng `<ps-kendo-button>`.

### 12.3. TrackBy

**BẮT BUỘC** viết trackBy function cho mọi `*ngFor`:

```typescript
public trackByCode(index: number, item: SomeType): number {
  return item.Code;
}
```

---

## 13. Shared Components có sẵn

| Component            | Module            | Mô tả                                |
| -------------------- | ----------------- | ------------------------------------- |
| `<ps-header-back>`   | `PsLayoutModule`  | Header với nút back                   |
| `<ps-header-main>`   | `PsLayoutModule`  | Header chính                          |
| `<ps-footer-action>` | `PsLayoutModule`  | Footer với action buttons             |
| `<ps-footer-copyright>` | `PsLayoutModule` | Footer copyright                    |
| `<ps-kendo-button>`  | `PsButtonModule`  | Button wrapper                        |
| `<ps-kendo-dialog>`  | `PSDialogModule`  | Dialog (confirm, alert)               |
| `<ps-dropdown>`      | `PSDropdownModule` | Dropdown tùy chỉnh                   |
| `<ps-input>`         | `PSInputModule`   | Input field tùy chỉnh                |
| `<ps-barcode>`       | `PsBarcodeModule`  | Barcode scanner/display               |

> **KHÔNG** tạo lại component đã có. Ưu tiên dùng shared component.

---

## 14. Utility Services có sẵn

| Service                       | Import Path                                | Phương thức chính                                      |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `PsCache`                     | `services/utilities/ps-cache`              | `setItem()`, `getItem()`, `parseValue()`, `removeItem()` |
| `PsString`                    | `services/utilities/ps-string`             | `formatPrice()`, `isNullOrWhitespace()`                |
| `PsKendoNotificationService`  | `services/core/ps-kendo-notification.service` | `onSuccess()`, `onError()`, `onWarning()`, `onInfo()` |
| `SystemLoaderService`         | `views/system/services/system-loader.service` | `loader(bool)`, `reset()`                            |
| `MtbikeApiService`            | `views/mtbike/services/mtbike-api.service`  | Các method gọi API nghiệp vụ                          |
| `GetConfigService`            | `services/core/ps-get-config.service`       | `GetDLL()`, `GetUser()`                               |

---

## 15. Models & Enums

### 15.1. DTOs

- Đặt trong `src/app/models/dtos/e-dtos/`.
- Tên file: `kebab-case.dto.ts` (VD: `sal-order-master.dto.ts`).
- Tên class: PascalCase + hậu tố `CusDTO` (VD: `SALOrderMasterCusDTO`).

### 15.2. Enums

- **Enums trạng thái**: `src/app/models/enums/e-status/` (VD: `sal-order-detail-status.enum.ts`).
- **Enums loại dữ liệu**: `src/app/models/enums/e-type/` (VD: `ls-list-type-data.enum.ts`).
- **Enums chung**: `src/app/models/enums/` (VD: `key-local-storage.enum.ts`).

---

## 16. Pipes

- Đặt trong `src/app/pipes/e-style/`.
- Khai báo trong `declarations` của module sử dụng (VD: `MtbikeModule`).
- Tên file: `kebab-case.pipe.ts`.
- Dùng để transform giá trị hiển thị (VD: status code → label + CSS class).

---

## 17. Checklist tạo component mới

Khi tạo component mới, hãy thực hiện theo thứ tự:

- [ ] **Tạo thư mục** `mtbXXX-ten-chuc-nang/` trong `src/app/views/mtbike/views/`.
- [ ] **Tạo 3 file**: `.component.ts`, `.component.html`, `.component.scss`.
- [ ] **TypeScript**: Implement `OnInit`, `OnDestroy`, sử dụng `#region`, `Subscription[]`, `ChangeDetectionStrategy.OnPush`.
- [ ] **Đặt tên biến**: boolean dùng `is*/show*/can*`, mảng dùng `list*`, API wrapper trùng tên service method.
- [ ] **SCSS**: Import `_colors`, dùng `::ng-deep`, tuân thủ 4pt grid, KHÔNG hardcode màu.
- [ ] **HTML**: Sử dụng `<ps-header-back>`, comment vùng, `trackBy`.
- [ ] **Đăng ký trong Module**: Import và thêm vào `declarations` trong `mtbike.module.ts`.
- [ ] **Đăng ký Route**: Thêm route trong `mtbike.routing.ts`.
- [ ] **API calls**: Tuân thủ pattern `loader → subscribe → check StatusCode → notification`.
- [ ] **API naming**: `GetList*`, `Get*`, `Update*`, `Delete*`, `Add*` — trùng tên service method.
- [ ] **API Static**: Thêm key tương ứng vào `MtbikeApiStaticService`.
- [ ] **KeyLocalStorageEnum**: Nếu cần key mới, thêm vào file enum.
- [ ] **DTO/Enum mới**: Tạo file trong đúng thư mục nếu cần.

---

## 18. Anti-patterns (KHÔNG LÀM)

| ❌ Không làm                                    | ✅ Thay thế bằng                                       |
| ----------------------------------------------- | ------------------------------------------------------ |
| Hardcode màu trong SCSS                         | Dùng biến `$primary`, `$error`, `$success`,...          |
| Quên `ngOnDestroy` / unsubscribe                | Luôn implement `OnDestroy` + `arrUnsubscribe`          |
| Dùng `Default` ChangeDetection khi có nhiều data | Dùng `OnPush` + `cdr.markForCheck()`                  |
| Tạo lại button/dialog/input                     | Dùng `ps-kendo-button`, `ps-kendo-dialog`, `ps-input`  |
| Dùng `@Input/@Output` truyền data giữa trang    | Dùng `PsCache` + `router.navigate`                    |
| Spacing lẻ (VD: 5px, 7px, 10px)                 | Tuân thủ 4pt grid: 4, 8, 12, 16, 20, 24px             |
| Subscribe không push vào `arrUnsubscribe`        | Luôn `this.arrUnsubscribe.push(sub)`                  |
| Không check `res.StatusCode` trong API callback | Luôn check `=== 0` trước khi xử lý data               |
| Quên gọi `this.subLoader.loader(false)` khi lỗi | Luôn tắt loader trong cả success và error callback    |
| Đặt file component ngoài thư mục `views/`       | Luôn đặt trong `src/app/views/mtbike/views/mtbXXX-*/` |
| Boolean không có prefix `is`/`show`/`can`       | Luôn dùng `isLock`, `showPopup`, `canEdit`             |
| Event handler không có prefix `on`              | Luôn dùng `onNavigate()`, `onValueChange()`            |
| Đặt tên hàm API khác tên service method         | `GetListWOMConsultant` giống hệt service method        |
| Đặt tên mảng không có prefix `list`             | `listworkordermaster`, `listcategory`, `listcolor`     |
| `onSuccess` cho thao tác Read (Get/GetList)     | Chỉ `onSuccess` cho CUD (Create/Update/Delete)         |
| Đặt tên API key khác giữa Static và Service     | Key trong StaticService = tên method trong ApiService  |
