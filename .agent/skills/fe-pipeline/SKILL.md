---
name: fe-pipeline
description: Implement Angular Mobile Web component from FE mobile guide. Covers card-based list, detail page with cache navigation, and registration in 5 files. Use when running /fe-mobile-implement or implementing a mobile FE feature.
metadata:
  role: FE-MOBILE
  version: "1.0"
  trigger: "/fe-mobile-implement, 'implement feature', 'implement component'"
---

# FE Pipeline Skill -- Hoai Minh ERP Mobile Web

## Goal
Read FE_MOBWEB guide → implement Angular card-based list + detail components → register in 5 files → `ng build` passes 0 errors.

---

## GOTCHAS (read first — these are the mistakes the agent makes without this list)
- **5 files** to register, not 4 — `key-local-storage.enum.ts` is mandatory for cache navigation
- Component naming: `mtb{NNN}-{abbr}-{feature}` — **never omit the abbreviation segment** (sal/cs/wh/prt)
- `PsKendoNotificationService` and `SystemLoaderService` — NEVER `NotificationService` or `LoaderService` (they don't exist, compile error)
- `res.StatusCode === 0` / `res.ObjectReturn` / `res.ErrorString` — NEVER `res.Success`, `res.Data`, `res.Message`
- tbl_LSList dropdowns: `[valueField]="'TypeOfList'"` NOT `'Code'` — entity stores TypeOfList integer
- Dropdown loaders must call real API — NEVER empty `// Implement API call` placeholder
- Vietnamese strings must have full diacritics: `'Lỗi: '` not `'Loi: '`, `'Lưu thành công'` not `'Luu thanh cong'`
- List and Detail = SEPARATE components — NEVER `isDetailView` toggle
- `ng build` must pass before reporting done — NEVER skip this gate

---

## Hard Rules

- R1: MtbikeApiService only -- no custom services, no direct this.http
- R2: No lucide-icon -- use `<span class="material-icons">icon_name</span>`
- R3: No inline styles -- `style="..."` in HTML is BANNED. SCSS classes only.
- R4: API names copied from BE guide exactly -- never shorten
- R5: List and Detail = SEPARATE components -- never toggle with isDetailView
- R6: Naming must include module abbreviation: `mtb{NNN}-{abbr}-{feature}`. Abbr from FE guide MODULE METADATA block 'FE Mobile Abbr' field (e.g., `sal`=Sale, `cs`=Repair, `wh`=Warehouse, `crm`=CRM, `hrm`=HRM, `prt`=Parts, `rpt`=Report). NEVER omit the abbr segment.
- R7: No mock data by default -- call real API from day one (opt-in via /enhance only)

---

## Step 1 -- Read Reference Files (MANDATORY BEFORE WRITING)

Action: Read ALL of these before writing any code. Skipping = wrong code.
```
1. src/app/views/mtbike/views/mtb009-sal-consultant/mtb009-sal-consultant.component.ts
2. src/app/views/mtbike/views/mtb009-sal-consultant/mtb009-sal-consultant.component.html
3. src/app/views/mtbike/views/mtb009-sal-consultant/mtb009-sal-consultant.component.scss
4. src/app/views/mtbike/services/mtbike-api-static.service.ts  (namespaceMap + existing keys)
5. src/app/views/mtbike/services/mtbike-api.service.ts         (API method pattern)
```
Gate: All 5 files read -> proceed. If any file not found -> report error.

---

## Step 2 -- DLL Namespace Chain (3 Links Must All Match)

FE API routing has 3 links. Any mismatch = silent 404.

```
LINK 1: mtbike-api-static.service.ts
   export const fpayment = {
     loader: false,
     GetListSALOrderReceipt: '',    <- APIID key
   };
   const namespaceMap = {
     payment: fpayment,             <- DLLPackage -> namespace mapping
     receipt: fpayment,             <- alias OK
   };

LINK 2: mtbike-api.service.ts
   GetListSALOrderReceipt(filter: State) {
     return this.post(fpayment.GetListSALOrderReceipt, filter);
   }

LINK 3: DB tbl_SYSAPI
   APIID     = 'GetListSALOrderReceipt'  <- must match LINK 1 key
   URL       = '/api/sale/'              <- route prefix: MapModuleEndpoints() wraps ALL in /api group
   ServerURL = 'http://10.10.30.121:31'  <- with port!
   Final URL = ServerURL + URL + APIID
             = http://10.10.30.121:31/api/sale/GetListSALOrderReceipt
```

Route prefix: read from FE guide MODULE METADATA block 'Route prefix' field -- do NOT guess.
- MapModuleEndpoints() (ModuleDiscoveryExtensions.cs) wraps ALL modules in a central /api group.
- Examples: MTB/M.Sale=`/api/sale/`, MTB/M.Repair=`/api/repair/`, CRM/M.Config=`/api/config/`

Gate: All 3 links verified consistent before registration.

---

## Step 3 -- Component TS Pattern

Copy from mtb009. Key patterns (DO NOT skip):
- `loader.reset()` in `ngOnDestroy` (not just `loader(false)`)
- `openSet` for group expand/collapse
- `cache.setItem()` BEFORE `router.navigate()` for detail navigation
- `arrUnsubscribe` for memory leak prevention
- Error strings: use Vietnamese WITH diacritics (e.g., `Lỗi lấy danh sách`) OR English -- NEVER Vietnamese without diacritics

```typescript
@Component({
  selector: 'mtb{NNN}-{abbr}-{feature}',
  templateUrl: './mtb{NNN}-{abbr}-{feature}.component.html',
  styleUrls: ['./mtb{NNN}-{abbr}-{feature}.component.scss'],
})
export class Mtb{NNN}{Abbr}{Feature}Component implements OnDestroy, OnInit {
  constructor(
    private router: Router,
    private api: MtbikeApiService,
    private cache: PsCache,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
  ) {}

  private arrUnsubscribe: Subscription[] = [];
  public listData: any[] = [];
  public filter: State = { sort: [{ field: 'Code', dir: 'desc' }] };

  ngOnInit(): void { this.GetList{Feature}(this.filter); }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private GetList{Feature}(filter: State) {
    this.loader.loader(true);
    const sub = this.api.GetList{Feature}(filter).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          const obj = res.ObjectReturn;
          this.listData = Array.isArray(obj) ? obj : (obj?.Data || []);
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
        this.loader.loader(false);
      },
      (err) => { this.loader.loader(false); this.notification.onError(`Lỗi: ${err.message}`); }
    );
    this.arrUnsubscribe.push(sub);
  }

  onSetItem(item: any): void {
    this.cache.setItem(KeyLocalStorageEnum.{FEATURE}_DETAIL, item);
    this.router.navigate(['/mtbike/{dllpackage}-detail']);
  }

  onBack(): void { this.router.navigate(['/mtbike']); }
}
```

---

## Step 4 -- Component HTML Pattern (3-Part Layout)

```html
<div class="mtb{NNN}-{abbr}-{feature}">
  <!-- HEADER -->
  <ps-header-back>
    <div class="left-side">
      <div class="func-title1">{Module Name}</div>
      <div class="func-title2">{Feature Name}</div>
    </div>
  </ps-header-back>

  <!-- BODY: scrollable card list -->
  <div class="list-body">
    <div class="card-item" *ngFor="let item of listData" (click)="onSetItem(item)">
      <div class="card-row">
        <span class="card-label">{Label1}</span>
        <span class="card-value">{{ item.{Field1} }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">{Label2}</span>
        <span class="card-value">{{ item.{Field2} }}</span>
      </div>
    </div>
    <div class="empty-state" *ngIf="listData.length === 0">Không có dữ liệu</div>
  </div>

  <!-- FOOTER -->
  <ps-footer-action>
    <ps-kendo-button (onClick)="onBack()">
      <span class="material-icons">arrow_back</span>
    </ps-kendo-button>
  </ps-footer-action>
</div>
```

Shared components (MUST use, DO NOT create alternatives):
- `<ps-header-back>` -- header with back
- `<ps-footer-action>` -- bottom action bar
- `<ps-kendo-button>` -- button with theme
- `<ps-kendo-textbox>` -- text input
- `<ps-dialog-confirm-bottom>` -- bottom sheet dialog

---

## Step 5 -- Component SCSS Pattern

```scss
@import "../../../../../assets/scss/colors";  /* ALWAYS first line */

::ng-deep {
  mtb{NNN}-{abbr}-{feature} {
    .mtb{NNN}-{abbr}-{feature} {
      height: 100%;
      .repair-body {
        height: calc(100% - 124px);
        overflow: hidden;
        .body-list {
          font-size: 13px;
          padding: 0 8px;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
      }
    }
  }
}
```

Rules: Use `$primary`, `$error`, `$border`, `$white` -- NEVER hex codes. Font: 13px base, 11px secondary. Border-radius: 8px.

---

## Step 5b -- Detail Component (MANDATORY when feature has detail/edit screen)

Rule R5: List and Detail MUST be SEPARATE components. NEVER toggle `isDetailView`.

### Navigation: List -> Detail (in list component)
```typescript
onSetItem(item: any): void {
  this.cache.setItem(KeyLocalStorageEnum.{FEATURE}_DETAIL, item);
  this.router.navigate(['/mtbike/{dllpackage}-detail']);
}
```

### Detail Component TS Pattern (mtb{NNN+1}-{abbr}-{feature}-detail)
```typescript
@Component({
  selector: 'mtb{NNN+1}-{abbr}-{feature}-detail',
  templateUrl: './mtb{NNN+1}-{abbr}-{feature}-detail.component.html',
  styleUrls: ['./mtb{NNN+1}-{abbr}-{feature}-detail.component.scss']
})
export class Mtb{NNN+1}{Abbr}{Feature}DetailComponent implements OnInit, OnDestroy {
  public item: any = null;
  private arrUnsubscribe: Subscription[] = [];

  constructor(
    private router: Router,
    private api: MtbikeApiService,
    private cache: PsCache,
    private notification: PsKendoNotificationService,
    private loader: SystemLoaderService,
  ) {}

  ngOnInit(): void {
    this.item = this.cache.getItem(KeyLocalStorageEnum.{FEATURE}_DETAIL);
    if (this.item?.Code) { this.loadDetail(this.item.Code); }
  }

  ngOnDestroy(): void {
    this.loader.reset();
    this.arrUnsubscribe.forEach(s => s.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private loadDetail(code: number): void {
    this.loader.loader(true);
    const sub = this.api.Get{Feature}({ Code: code }).subscribe(
      (res) => {
        if (res.StatusCode === 0) { this.item = res.ObjectReturn; }
        else { this.notification.onError('Lỗi: ' + res.ErrorString); }
        this.loader.loader(false);
      },
      (err) => { this.loader.loader(false); this.notification.onError('Lỗi: ' + err.message); }
    );
    this.arrUnsubscribe.push(sub);
  }

  onSave(): void {
    if (!this.item) return;
    this.loader.loader(true);
    const sub = this.api.Update{Feature}({ DTO: this.item, Properties: ['{Field1}', '{Field2}'] }).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          this.notification.onSuccess('Lưu thành công');
          this.router.navigate(['/mtbike/{dllpackage}']);
        } else { this.notification.onError('Lỗi: ' + res.ErrorString); }
        this.loader.loader(false);
      },
      (err) => { this.loader.loader(false); this.notification.onError('Lỗi: ' + err.message); }
    );
    this.arrUnsubscribe.push(sub);
  }

  onBack(): void { this.router.navigate(['/mtbike/{dllpackage}']); }
}
```

### Detail HTML Pattern
```html
<div class="mtb{NNN+1}-{abbr}-{feature}-detail">
  <ps-header-back (onBack)="onBack()">
    <div class="left-side">
      <div class="func-title1">{Module}</div>
      <div class="func-title2">Chi tiết {Feature}</div>
    </div>
  </ps-header-back>

  <div class="detail-body" *ngIf="item">
    <div class="form-group">
      <label>{Field Label}</label>
      <ps-kendo-textbox [(value)]="item.{FieldName}"></ps-kendo-textbox>
    </div>
  </div>

  <ps-footer-action>
    <ps-kendo-button (onClick)="onBack()">
      <span class="material-icons">arrow_back</span>
    </ps-kendo-button>
    <ps-kendo-button (onClick)="onSave()">
      <span class="material-icons">save</span>
    </ps-kendo-button>
  </ps-footer-action>
</div>
```

### KeyLocalStorageEnum entry
```typescript
{FEATURE}_DETAIL = '{feature}-detail',
```

---

## Step 6 -- Registration (5 Files, ALL MANDATORY -- for BOTH List + Detail)

| File | Action |
|---|---|
| `mtbike.module.ts` | import + add BOTH list and detail to declarations[] |
| `mtbike.routing.ts` | `{ path: '{dllpackage}', component: Mtb{NNN}{Abbr}{Feature}Component }` AND `{ path: '{dllpackage}-detail', component: Mtb{NNN+1}{Abbr}{Feature}DetailComponent }` |
| `mtbike-api-static.service.ts` | Add APIID keys to existing namespace (e.g., fpayment) |
| `mtbike-api.service.ts` | Add Observable API methods (GetList, Get, Update, Delete) |
| `key-local-storage.enum.ts` | Add `{FEATURE}_DETAIL` key for cache navigation |

Gate: All 5 files updated. Route path matches DB DLLPackage exactly.

---

## Step 7 -- Build Verify (MANDATORY GATE)

```powershell
ng build
```

Gate: 0 errors required. Any error -> fix immediately before reporting done.
NEVER report "task complete" without a passing build.

---

## Self-Check (Run Before Reporting Done)

### List Component
- [ ] Module abbr confirmed from FE guide Section 1 (sal/cs/wh/prt/crm/hrm) -- RULE-MOB-04
- [ ] Folder = `mtb{NNN}-{abbr}-{feature}/` (has module abbr?) -- RULE-MOB-04
- [ ] Class = `Mtb{NNN}{Abbr}{Feature}Component` (has abbr PascalCase?) -- RULE-MOB-04
- [ ] Selector = `mtb{NNN}-{abbr}-{feature}` (matches folder?) -- RULE-MOB-04
- [ ] All 3 files exist: .component.ts, .html, .scss
- [ ] `loader.reset()` in ngOnDestroy (not just forEach unsubscribe)
- [ ] Uses MtbikeApiService (no custom service, no direct this.http)
- [ ] Uses material-icons (no lucide-icon)
- [ ] Has arrUnsubscribe for memory leak prevention
- [ ] Real API (no mock data, no USE_MOCK)

### Detail Component (if feature has detail)
- [ ] Folder = `mtb{NNN+1}-{abbr}-{feature}-detail/` (separate from list)
- [ ] Class = `Mtb{NNN+1}{Abbr}{Feature}DetailComponent` (has abbr PascalCase, has `Detail`)
- [ ] List navigates via `cache.setItem()` THEN `router.navigate()`
- [ ] Detail reads from `cache.getItem()` in ngOnInit then calls Get{Feature}
- [ ] Back button navigates back to list route

### Registration
- [ ] mtbike.module.ts: BOTH list and detail declared
- [ ] mtbike.routing.ts: path for list AND `{dllpackage}-detail` route
- [ ] mtbike-api-static.service.ts: APIID keys added (GetList, Get, Update)
- [ ] mtbike-api.service.ts: Observable methods added (GetList, Get, Update, Delete)
  - [ ] key-local-storage.enum.ts: `{FEATURE}_DETAIL` key added
- [ ] key-local-storage.enum.ts: `{FEATURE}_DETAIL` key added

### Build
- [ ] `ng build` = 0 errors
