---
name: standard-code
description: >
  MANDATORY. THE SINGLE SOURCE OF TRUTH for coding any screen in Capstone ERP Mobile.
  Contains: design tokens, colors, layout template, API pattern, component usage, icon guide.
  Read THIS skill BEFORE writing ANY code. If you skip this, you WILL produce wrong colors,
  wrong sizes, broken scrolling, and hallucinated components.
---

# Standard Code — Capstone ERP Mobile

> **READ THIS ENTIRE FILE before writing any code.**
> This file replaces reading 30+ individual SCSS/TS files.
> Everything you need is here.

---

## 1. COLORS (from _colors.scss)

### Main Colors (USE THESE)

| Variable | Hex | Usage |
|---|---|---|
| `$primary` | `#126433` | Main brand green. Buttons, links, selected items |
| `$secondary` | `#3c4858` | Default text color. ALL text uses this |
| `$success` | `#126433` | Same as primary. Success notifications |
| `$error` | `#e5322b` | Red. Errors, delete, required fields, order numbers |
| `$warning` | `#CD9000` | Yellow-gold. Transfer, pending status |
| `$info` | `#0074FF` | Blue. Info notifications |
| `$white` | `#ffffff` | Card backgrounds, button text on colored bg |
| `$black` | `#000000` | Rarely used |
| `$border` | `#979B9B` | Input borders, divider lines, inactive icons |
| `$placeholder` | `#979B9B` | Placeholder text |
| `$background-primary` | `#EEEEEE` | Page background (light gray) |
| `$disable-input` | `#F2F2F2` | Disabled input background |
| `$hover` | `#f0f0f0` | Hover state |
| `$gray-light` | `#f0f0f0` | Light gray background |

### Capstone Brand Colors
| Variable | Hex | Usage |
|---|---|---|
| `$hoaiminh-primary` | `#e5322b` | Company red (logo only) |
| `$hoaiminh-secondary` | `#fff00d` | Company yellow (logo only) |
| `$logo-primary` | `#891728` | 3P Logo dark red |

### NEVER DO THIS:
```scss
color: red;                    // WRONG - use $error
color: #126433;                // WRONG - use $primary
background: green;             // WRONG - use $primary
color: #3c4858;                // WRONG - use $secondary
background-color: #eee;        // WRONG - use $background-primary
```

---

## 2. TYPOGRAPHY

| Property | Value |
|---|---|
| Font family (body) | `"Mulish", serif` (global default, no need to set) |
| Font family (heading) | `"Playfair Display", serif` |
| Font size body | `13px` ($font-size-base) |
| Font size small | `11px` ($font-size-sm) |
| Font size badge | `10px` ($font-size-xs) |
| Font size heading | `16px` ($font-size-lg) |
| Font weight normal | `400` |
| Font weight bold | `700` (use `font-weight: bold`) |
| Default text color | `$secondary` (#3c4858) — set globally, no need to set per component |
| Line height | `1` (for labels, icons), default for body |

---

## 3. SIZES & SPACING

### Layout Dimensions
| Element | Height | Notes |
|---|---|---|
| Header (ps-header-back) | `56px` | Fixed top |
| Footer (ps-footer-action) | `40px` min, `fit-content` | Fixed bottom |
| Body content | `calc(100dvh - 56px - 40px)` | Scrollable area |
| Button (normal) | `32px` | |
| Button (footer action) | `36px` | Inside ps-footer-action |
| Button (icon + text) | `48px` | Large vertical button |
| Input field | `35px` | kendo-textbox, kendo-dropdown |
| List item (dropdown) | `35px` | kendo-dropdownlist popup items |

### Spacing
| Token | Value | Usage |
|---|---|---|
| `$spacing-xs` | `4px` | gap between rows in card, tight spacing |
| `$spacing-sm` | `8px` | card padding, button padding, gap between cards |
| `$spacing-md` | `10px` | header padding |
| `$spacing-lg` | `16px` | section spacing |
| `$spacing-xl` | `32px` | wide gaps (between info groups) |

### Border Radius
| Element | Radius |
|---|---|
| Cards | `8px` |
| Buttons | `8px` |
| Inputs | `5px` |
| Popups | `5px` |

### Shadows
| Element | Shadow |
|---|---|
| Cards | `rgba(149, 157, 165, 0.2) 0px 8px 24px` |
| Footer | `0 -2px 4px rgba(0, 0, 0, 0.1)` |
| Popup | `0px 1px 4px rgba(0, 0, 0, 0.5)` |

---

## 4. SCREEN LAYOUT TEMPLATE

### Every screen MUST follow this 3-part layout:

```html
<!-- TEMPLATE: Screen Layout -->
<div class="page">
    <!-- PART 1: HEADER (56px fixed) -->
    <ps-header-back>
        <ng-container header-right>
            <div class="header-title">Screen Title</div>
        </ng-container>
    </ps-header-back>

    <!-- PART 2: BODY (scrollable) -->
    <div class="body-list" #bodyList>
        <!-- Content here - this area SCROLLS -->
    </div>

    <!-- PART 3: FOOTER (fixed bottom) -->
    <ps-footer-action>
        <ps-kendo-button (onClick)="goBack()">
            <span class="material-icons">arrow_back</span>
        </ps-kendo-button>
        <ps-kendo-button [theme]="'primary'" (onClick)="onAction()">
            <span class="text">Action Label</span>
        </ps-kendo-button>
        <ps-kendo-button (onClick)="onSearch()">
            <span class="material-icons">search</span>
        </ps-kendo-button>
    </ps-footer-action>
</div>
```

### Screen SCSS template:
```scss
@import 'src/assets/scss/colors';

::ng-deep {
    my-screen {                       // replace with actual selector
        .page {
            display: flex;
            flex-direction: column;
            height: 100dvh;
            background-color: $background-primary;

            .body-list {
                flex: 1;
                overflow-y: auto;
                padding: $spacing-sm;
                display: flex;
                flex-direction: column;
                gap: $spacing-sm;
            }

            // Card item pattern
            .card {
                background: $white;
                border-radius: 8px;
                padding: $spacing-sm;
                box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
                display: flex;
                flex-direction: column;
                gap: $spacing-xs;
            }

            // Footer button layout
            ps-footer-action {
                .footer-action {
                    display: flex;
                    align-items: center;
                    gap: $spacing-sm;
                    padding: $spacing-sm;
                    height: fit-content;

                    ps-kendo-button:nth-child(2) {
                        flex: 1;
                        button { width: 100%; height: 36px; border-radius: 8px; }
                    }
                    ps-kendo-button:first-child,
                    ps-kendo-button:last-child {
                        button { width: 36px; height: 36px; border: 1px solid $border; border-radius: 8px; }
                    }
                }
            }
        }
    }
}
```

---

## 5. COMPONENT USAGE CHEAT SHEET

### ps-kendo-button
```html
<!-- Solid primary -->
<ps-kendo-button [theme]="'primary'" (onClick)="doAction()">
    <span class="text">Button Text</span>
</ps-kendo-button>

<!-- Outline -->
<ps-kendo-button [theme]="'primary-outline'" (onClick)="doAction()">
    <span class="text">Outline</span>
</ps-kendo-button>

<!-- Icon only (footer back/search) -->
<ps-kendo-button (onClick)="goBack()">
    <span class="material-icons">arrow_back</span>
</ps-kendo-button>

<!-- Themes: 'primary' | 'primary-outline' | 'error' | 'error-outline' |
             'warning' | 'warning-outline' | 'info' | 'info-outline' | 'secondary' -->
```

### ps-kendo-dropdown-list
```html
<ps-kendo-dropdown-list
    [label]="'Label'"
    [data]="dropdownData"
    [textField]="'Name'"
    [valueField]="'Code'"
    [valuePrimitive]="true"
    [(ngModel)]="selectedValue"
    (valueChange)="onChange($event)">
</ps-kendo-dropdown-list>
```

### ps-kendo-textbox
```html
<ps-kendo-textbox [label]="'Label'" [(ngModel)]="value"></ps-kendo-textbox>
```

### ps-kendo-numeric-textbox
```html
<ps-kendo-numeric-textbox [label]="'Amount'" [(ngModel)]="amount" [format]="'n0'">
</ps-kendo-numeric-textbox>
```

### ps-kendo-datepicker
```html
<ps-kendo-datepicker [label]="'Date'" [(ngModel)]="date"></ps-kendo-datepicker>
```

### ps-dialog-confirm
```html
<ps-dialog-confirm [open]="showDialog" [theme]="'primary'">
    <div class="main-title"><div>Confirm Title</div></div>
    <div class="sub-title">Are you sure?</div>
    <div class="dialog-actions">
        <ps-kendo-button (onClick)="cancel()"><span class="text">Cancel</span></ps-kendo-button>
        <ps-kendo-button [theme]="'primary'" (onClick)="confirm()"><span class="text">OK</span></ps-kendo-button>
    </div>
</ps-dialog-confirm>
```

### ps-filter-status
```html
<ps-filter-status [data]="statusList" (change)="onStatusChange($event)"></ps-filter-status>
```

---

## 6. ICONS

### Material Symbols (layout/navigation icons)
```html
<span class="material-icons">arrow_back</span>
<span class="material-icons">search</span>
<span class="material-icons">keyboard_arrow_down</span>
<span class="material-icons">close</span>
<span class="material-icons">add</span>
<span class="material-icons">delete</span>
<span class="material-icons">edit</span>
<span class="material-icons">check</span>
<span class="material-icons">more_vert</span>
<span class="material-icons">filter_list</span>
<!-- Default size: 24px. Override with font-size -->
```

### Lucide Angular (action/feature icons)
```html
<lucide-icon name="plus" [size]="20"></lucide-icon>
<lucide-icon name="trash-2" [size]="18"></lucide-icon>
```

### Inline SVG (specific icons — copy from existing screens)
Used for customer icon, phone icon. Copy exact SVG from existing components.

---

## 7. API CALLING PATTERN

### How components call API (CORRECT pattern):
```typescript
// In component constructor:
private api: MtbikeApiService  // inject via constructor (use relative import)

// Import:
import { MtbikeApiService } from '../../services/mtbike-api.service';

// Call API — use method name directly on MtbikeApiService:
const sub = this.api.GetListSALMaster(filter).subscribe((res) => {
    if (res.StatusCode === 0) {
        this.listData = res.ObjectReturn;
    }
});
this.arrUnsubscribe.push(sub);
```

### NEVER DO THIS:
```typescript
// WRONG - these don't exist:
this.api.fnPostStringDataForMobile(...)     // ❌ NOT a real method
this.http.post('/api/...')                   // ❌ Don't use HttpClient directly
MtbikeApiStaticService.GetListSOMaster      // ❌ Don't access static URLs directly
```

### How URLs work (dynamic from DB):
```
1. Login → system loads API list from tbl_SYSAPI
2. MtbikeApiStaticService.assignApi(apiList) fills URL strings
3. Each namespace (fdashboard, fconsultant, fpayment...) gets its URLs
4. MtbikeApiService methods use: MtbikeApiStaticService.getNamespace(dll).MethodName
5. Components just call: this.api.GetListSALMaster(filter)
```

### API Response shape:
```typescript
interface ResponseDTO {
    StatusCode: number;    // 0 = success
    ErrorString: string;
    ObjectReturn: any;     // actual data
}
```

---

## 7b. SCREEN-TO-SCREEN DATA PASSING

### Pattern: PsCache (localStorage wrapper)
```typescript
// SENDING screen (e.g., list → detail):
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';

onSelectItem(item: SALOrderMasterCusDTO): void {
    this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, item);
    this.router.navigate(['/mtbike/consultant/detail']);
}

// RECEIVING screen (e.g., detail page):
ngOnInit(): void {
    const cached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
    if (cached) {
        this.orderMaster = this.cache.parseValue(cached);
    }
}
```

### Available storage keys (KeyLocalStorageEnum):
| Key | Purpose |
|---|---|
| `SAL_ORDER_MASTER` | Pass selected order to detail/sub-screens |
| `SAL_ORDER_DETAIL` | Pass order detail to sub-screens |
| `SAL_ORDER_RECEIPT` | Pass receipt data |
| `SAL_ORDER_INVOICE` | Pass invoice data |
| `WOM_MASTER` | Pass work order to repair sub-screens |
| `WOM_SERVICE` | Pass service data |
| `LS_VEHICLE_COLOR` | Pass vehicle color selection |
| `HEAD_OBJECT` | Current store/branch |
| `USER_INFOR` | Current logged-in user |
| `BEARER_TOKEN` | Auth token |
| `USER_PERMISSION` | Permission data |

---

## 7c. PERMISSION PATTERN

```typescript
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';

// In component — access static properties:
FunctionPermissionDTO.master    // true = full access
FunctionPermissionDTO.creator   // true = can create
FunctionPermissionDTO.approver  // true = can approve
FunctionPermissionDTO.viewer    // true = view only

// In template — disable button based on role:
<ps-kendo-button [disabled]="FunctionPermissionDTO.approver" (onClick)="onCreate()">
    <span class="text">Tạo mới</span>
</ps-kendo-button>
```

---

## 8. STATUS PIPE PATTERN

### Using status pipe in template:
```html
<div class="status"
    [innerHTML]="{ Active: item.Status === StatusEnum.NEW ? 'consultant' : undefined,
                   Progress: item.Status,
                   ProgressName: item.StatusName } | SALOrderMasterStatusRetail">
</div>
```

### CSS for pipe output:
```scss
.pipe-class {
    padding: 4px 8px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 10px;
    border: 1px solid;
    width: fit-content;
    text-align: center;
}
```

---

## 9. SCSS IMPORT RULE

```scss
// EVERY component SCSS must start with:
@import 'src/assets/scss/colors';

// Use ::ng-deep with component selector:
::ng-deep {
    my-component-selector {
        // styles here
    }
}
```

---

## 10. NAMING CONVENTIONS

| Item | Pattern | Example |
|---|---|---|
| Screen folder | `mtbXXX-purpose` | `mtb009-sal-consultant` |
| Component class | `MtbXXXPurposeComponent` | `Mtb009SalConsultantComponent` |
| SCSS file | `mtbXXX-purpose.component.scss` | `mtb009-sal-consultant.component.scss` |
| Service | `mtbike-api.service.ts` | Centralized (existing) |
| DTO | `PascalCase` | `SALOrderMasterCusDTO` |
| Pipe | `PascalCase` | `SALOrderMasterStatusRetail` |
| Enum | `SCREAMING_SNAKE` | `SALOrderMasterStatusRetailEnum.NEW` |

---

## 11. MODULE REGISTRY (mtbike.module.ts)

### Already imported — DO NOT re-import:
```typescript
// UI Component Modules (already in mtbike.module.ts)
PSDropdownModule        // ps-kendo-dropdown-list, ps-kendo-autocomplete, ps-kendo-multiselect, ps-filter-status
PsButtonModule          // ps-kendo-button
PSInputModule           // ps-kendo-textbox, ps-kendo-numeric-textbox, ps-kendo-datepicker, ps-kendo-checkbox, ps-kendo-radiobutton, ps-kendo-textarea, ps-kendo-masked-textbox, ps-filter-textbox
PSDialogModule          // ps-dialog-confirm, ps-dialog-confirm-bottom, ps-dialog-confirm-signature
PsLayoutModule          // ps-header-back, ps-header-main, ps-footer-action, ps-footer-copyright
PsBarcodeModule         // ps-barcode-scan

// Kendo Modules
ChartModule             // kendo-chart
DatePickerModule        // kendo-datepicker
DateTimePickerModule    // kendo-datetimepicker
TimePickerModule        // kendo-timepicker
LabelModule             // kendo-label

// Angular
FormsModule             // ngModel, template-driven forms
CommonModule            // ngIf, ngFor, pipes
RouterModule            // routing
DecimalPipe             // number formatting

// External
LucideAngularModule     // lucide-icon
DragDropModule          // drag-drop
```

### When creating a new screen:
1. Add component to `declarations` array in `mtbike.module.ts`
2. Add route to `mtbike.routing.ts`
3. All UI modules above are ALREADY available — just use them in template

---

## 12. ENUM CATALOG

### Status Enums (e-status/) — Import: `src/app/models/enums/e-status/`

| Enum | Values | Used in |
|---|---|---|
| `SALOrderMasterStatusRetailEnum` | NEW=1, RETURN=2, PENDING=3, PROCESSING=4, COMPLETE=5, CANCEL=6 | Consultant, Collection |
| `SALOrderInvoiceStatusEnum` | New=1, Success=2, Cancled=3 | Invoice |
| `SALOrderReceiptStatusEnum` | New=1, Success=2, Cancled=3 | Receipt |
| `SALOrderDetailDeliveryStatusEnum` | DELIVERED=1, NOTDELIVERED=2, NEW=3 | Delivery |
| `SALOrderDetailStatusEnum` | NEW=1 | Order detail |
| `SALOrderMasterProcessEnum` | NEW=1, PROCESSING=2, END=3 | Order process |
| `PURDOMasterStatusEnum` | NEW=1, WAITINGDELIVERY=2, DELIVERING=3, OK=4 | Purchase DO |
| `PURDODetailStatusEnum` | NOTRECEIVED=1, RECEIVED=2 | DO detail |
| `WHIOMasterStatusEnum` | NEW=1, SENT=2, PENDING=3, RECEIVING=4, DONE=5 | Warehouse IO |
| `InventoryMasterStatusEnum` | NEW=1, DOING=2, DONE=3, CANCLE=4 | Inventory |
| `WOMStatusEnum` | RECEIVING=1, REPAIRING=2, WAITING_DELIVERY=3, DONE=4 | Work Order |
| `CSVehicleStatusEnum` | New=1, Selling=2, Delivering=3, Sold=4, Movement=5, Delivery=6 | Vehicle |
| `LSVehicleConfigStatusEnum` | New=1, Approved=2, Stop=3 | Vehicle config |

### Type Enums (e-type/) — Import: `src/app/models/enums/e-type/`

| Enum | Purpose |
|---|---|
| `SALOrderMasterTypeDataEnum` | Retail vs Wholesale |
| `SALOrderDetailTypeDataEnum` | Vehicle, Service, Part, Promotion |
| `SALOrderInvoiceTypeDataEnum` | Invoice types |
| `SALOrderInvoiceDetailTypeDataEnum` | Invoice detail types |
| `SALOrderInvoiceVATTypeEnum` | VAT types |
| `SALOrderDetailPaymentTypeEnum` | Payment methods |
| `SALOrderReceiptTypeDataEnum` | Receipt types |
| `CSListTypeDataEnum` | Customer service list types |
| `DashboardEnum` | Dashboard filter types |
| `WHIOMasterTypeDataEnum` | IO master types |
| `WHIOMasterTypeOfMasterEnum` | IO type of master |

---

## 13. PIPE CATALOG

### Declared in mtbike.module.ts (available in ALL screens):

| Pipe Name | Import Path | Usage in Template |
|---|---|---|
| `SALOrderMasterStatusRetail` | `pipes/e-style/sal-order-master-status-retail.pipe.ts` | `[innerHTML]="{ Active: ..., Progress: item.Status, ProgressName: item.StatusName } \| SALOrderMasterStatusRetail"` |
| `SALOrderDetailStatus` | `pipes/e-style/sal-order-detail-status.pipe.ts` | Same pattern as above |
| `SALOrderReceiptStatus` | `pipes/e-style/sal-order-receipt-status.pipe.ts` | Same pattern |
| `SALOrderInvoiceStatus` | `pipes/e-style/sal-order-invoice-status.pipe.ts` | Same pattern |
| `SALOrderMasterProcessRetail` | `pipes/e-style/sal-order-master-process-retail.pipe.ts` | Same pattern |
| `SALOrderDetailTypeData` | `pipes/e-style/sal-order-detail-type-data.pipe.ts` | Same pattern |
| `WOMProgressStatus` | `pipes/e-style/wom-progress-status.pipe.ts` | Same pattern |

### Pipe template pattern (ALL pipes follow this):
```html
<div class="status"
    [innerHTML]="{ Active: condition ? 'type' : undefined,
                   Progress: item.StatusValue,
                   ProgressName: item.StatusLabel } | PipeName">
</div>
```
> Pipe outputs `<span class="pipe-class" style="...">StatusName</span>` with correct colors.

---

## 14. CORE SERVICES REFERENCE

### Already `providedIn: 'root'` (inject anywhere):

| Service | Import Path | Purpose |
|---|---|---|
| `MtbikeApiService` | `views/mtbike/services/mtbike-api.service` | ALL API calls (god service) |
| `GetConfigService` | `services/core/ps-get-config.service` | GetHead(), GetToken(), GetUser(), GetDLL() |
| `PsKendoNotificationService` | `services/core/ps-kendo-notification.service` | success/error/warning toast notifications |
| `APIService` | `services/core/api.service` | Low-level HTTP post/get |
| `PsCache` | `services/utilities/ps-cache` | localStorage wrapper |
| `SystemLoaderService` | `views/system/services/system-loader.service` | Show/hide global loader |

### Utility classes (static, no injection):

| Utility | Import Path | Methods |
|---|---|---|
| `PsArray` | `services/utilities/ps-array` | Array manipulation |
| `PsString` | `services/utilities/ps-string` | isNullOrWhitespace(), etc |
| `PSObject` | `services/utilities/ps-object` | isNullOfUndefined() |
| `PsDate` | `services/utilities/ps-date` | Date formatting |
| `PsFile` | `services/utilities/ps-file` | File handling |

---

## 15. NEW SCREEN CHECKLIST

When creating screen `mtbXXX-feature-name`:

### Step 1: Create files
```
views/mtbike/views/mtbXXX-feature-name/
├── mtbXXX-feature-name.component.ts
├── mtbXXX-feature-name.component.html
└── mtbXXX-feature-name.component.scss
```

### Step 2: Component TS template
```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtbXXX-feature-name',
  templateUrl: './mtbXXX-feature-name.component.html',
  styleUrls: ['./mtbXXX-feature-name.component.scss']
})
export class MtbXXXFeatureNameComponent implements OnInit, OnDestroy {
  arrUnsubscribe: Subscription[] = [];

  constructor(
    private router: Router,
    private api: MtbikeApiService,
    private cache: PsCache,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
  }

  loadData(): void {
    // API call here
  }

  onNavigate(path: string): void {
    this.router.navigate(['mtbike/' + path]);
  }
}
```

### Step 3: Register (2 files to edit)

**mtbike.module.ts** — Add to declarations:
```typescript
import { MtbXXXFeatureNameComponent } from './views/mtbXXX-feature-name/mtbXXX-feature-name.component';
// Add to declarations array
```

**mtbike.routing.ts** — Add route:
```typescript
import { MtbXXXFeatureNameComponent } from './views/mtbXXX-feature-name/mtbXXX-feature-name.component';
// Add to routes:
{ path: 'feature-name', component: MtbXXXFeatureNameComponent }
```

### Step 4: Build verify
```bash
npx ng build
```
