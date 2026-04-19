---
name: mobile-design
description: Angular 16 mobile web design patterns for Hoai Minh ERP. Covers ChangeDetection.OnPush, IntersectionObserver printfprintite scroll, touch-optimized UX, shared mobile components (ps-header-back, ps-footer-action). NOT React Native, NOT Flutter. Do NOT use for desktop FE.
version: 2.0.0
---

# Mobile Design Skill -- HM ERP Angular Mobile Web (v2.0)

> **Stack:** Angular 16 + Kendo UI 13 + TypeScript + SCSS (Bootstrap 5 grid only)
> **Platform:** Mobile browser (PWA-style, NOT React Native / NOT Flutter)
> **Viewport:** 375px - 414px (phone). Touch-first. ChangeDetection.OnPush everywhere.
> **CRITICAL:** This is an Angular web app optimized for mobile screens. Standard Angular rules apply.

---

## 0. 🔴 What This Project Is (Read First)

```
Capstone-ERP-MOBILEWEB/
|--- src/app/
|   |--- components/             ← Shared ps-* wrappers (ps-header-back, ps-footer-action, etc.)
|   |--- models/dtos/e-dtos/     ← Business DTOs suffix: CusDTO
|   |--- models/enums/e-status/  ← Status enums suffix: StatusEnum
|   |--- services/               ← APIService, PsCache, SystemLoaderService, PsKendoNotification
|   `--- views/mtbike/
|       |--- mtbike.module.ts    ← MUST update: declare new component
|       |--- mtbike.routing.ts   ← MUST update: add route
|       |--- services/
|       |   |--- mtbike-api-static.service.ts  ← MUST update: add namespace key
|       |   `--- mtbike-api.service.ts         ← MUST update: add API methods
|       `--- views/              ← mtb000-dashboard, mtb001-repair, ...
```

**NEVER build:** Desktop layout, sidebar, hover states, `<ps-kendo-grid>` (no data table on mobile)
**ALWAYS build:** `<ps-header-back>`, `<ps-footer-action>`, card lists, printfprintite scroll, touch gestures

---

## 1. Component Structure Rules (Mandatory)

### 1.1 Naming
- Folder: `mtbXXX-{feature-name}/` -- scan views/ to find next available number
- 3 files only: `.component.ts`, `.component.html`, `.component.scss`
- Class: `MtbXXX{Feature}Component` (PascalCase)
- Selector: `mtbXXX-{feature-name}` (kebab-case)
- NEVER create `.spec.ts` files

### 1.2 TypeScript Template (Copy Exactly)
```typescript
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { State } from '@progress/kendo-data-query';
import { MtbikeApiService } from '../../services/mtbike-api.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';

@Component({
  selector: 'mtbXXX-{feature}',
  templateUrl: './mtbXXX-{feature}.component.html',
  styleUrls: ['./mtbXXX-{feature}.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,   // ← MANDATORY
})
export class MtbXXX{Feature}Component implements OnInit, OnDestroy {

  // #region FIELDS
  private arrUnsubscribe: Subscription[] = [];
  public {Entity}Enum = {Entity}Enum;   // expose enums to template
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

  ngOnInit(): void { this.GetListXxx(this.filter); }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }
  // #endregion

  // #region LOAD DATA
  public filter: State = { skip: 0, take: 15 };
  public list{Entity}: {Entity}CusDTO[] = [];

  private GetList{Entity}(filter: State): void {
    this.subLoader.loader(true);
    const sub = this.mtbikeapi.GetList{Entity}(filter).subscribe(
      (res) => {
        if (res.StatusCode === 0) {
          this.list{Entity} = res.ObjectReturn as {Entity}CusDTO[];
          this.cdr.markForCheck();  // ← MANDATORY after async data change
        } else {
          this.notification.onError(`Lỗi: ${res.ErrorString}`);
        }
        this.subLoader.loader(false);
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(sub);  // ← MANDATORY
  }
  // #endregion

  // #region ACTIONS
  public onNavigate(path: string): void { this.router.navigate(['/mtbike/' + path]); }
  public trackByCode(i: number, item: any): number { return item.Code; }
  // #endregion
}
```

### 1.3 #region Rules (MANDATORY)
| Region | Content |
|--------|---------|
| `FIELDS` | Props, flags, booleans |
| `LIFECYCLE` | constructor, ngOnInit, ngOnDestroy |
| `HEADER` | Header-related logic |
| `TAB` | Tab switchprintg |
| `SWIPE` | HammerJS swipe gesture |
| `LOAD DATA` | API calls |
| `ACTIONS` | User event handlers |
| `TRACKBY` | trackBy functions |
| `STATUS BADGE` | Badge logic |

---

## 2. 🔴 Variable Naming (VIOLATION = REJECT)

| Type | Prefix Required | Example |
|------|----------------|---------|
| Boolean state | `is` | `isLoading`, `isOpenedFilter`, `isLock` |
| Boolean visibility | `show` | `showpopup`, `showDeleteDialog` |
| Array/List | `list` | `listworkordermaster`, `listcategory`, `listcolor` |
| Event handler | `on` | `onNavigate()`, `onValueChange()`, `onClick()` |
| Toggle | `toggle` | `toggleItem()`, `toggleFilter()` |
| Clear | `clear` | `clearFilter()`, `clearAllFilters()` |
| API wrapper fn | SAME as service method | `GetListWOMConsultant()` -> same in component |

---

## 3. 🔴 API Call Pattern (MANDATORY)

```typescript
// API wrapper naming: MUST MATCH service method name exactly
private GetList{Entity}(filter: State): void {
  this.subLoader.loader(true);                    // 1. Start loader
  const sub = this.mtbikeapi.GetList{Entity}(filter).subscribe(
    (res) => {
      if (res.StatusCode === 0) {                 // 2. Check StatusCode
        this.list{entity} = res.ObjectReturn as {Entity}CusDTO[];
        this.cdr.markForCheck();                  // 3. Trigger OnPush update
      } else {
        this.notification.onError(`Lỗi: ${res.ErrorString}`);
      }
      this.subLoader.loader(false);               // 4. Stop loader (always)
    },
    (err) => {
      this.subLoader.loader(false);               // 5. Stop loader on error
      this.notification.onError(`Lỗi: ${err.message}`);
    }
  );
  this.arrUnsubscribe.push(sub);                  // 6. Track for cleanup
}
```

> 🔴 **`onSuccess()` ONLY for CUD** (Create/Update/Delete). NEVER for GetList/Get reads.

---

## 4. 🔴 Infprintite Scroll Pattern (Mobile List Standard)

> Mobile lists NEVER pagprintate like desktop. Use IntersectionObserver + printcremental load.

```typescript
@ViewChild('anforr', { static: true }) anforr: ElementRef;
@ViewChild('bodyList', { static: true }) bodyList!: ElementRef;
private observer: IntersectionObserver;
private isLoading = false;
public isLastPage: boolean = false;
public filter: State = { skip: 0, take: 15 };
public list{Entity}: {Entity}CusDTO[] = [];

ngOnInit(): void {
  this.GetList{Entity}(this.filter);
  this.observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { this.loadMore(); }
  }, { threshold: 0.1 });
  this.observer.observe(this.anforr.nativeElement);
}

ngOnDestroy(): void {
  this.observer.disconnect();      // ← MANDATORY cleanup
  this.subLoader.reset();
  this.arrUnsubscribe.forEach(e => e.unsubscribe());
}

private loadMore(): void {
  if (this.isLoading || this.isLastPage) return;
  const listEl = this.bodyList.nativeElement as HTMLElement;
  if (listEl.scrollHeight <= listEl.clientHeight) return;  // list fits, not scroll
  this.filter.skip += this.filter.take;
  this.GetList{Entity}(this.filter);
}

private GetList{Entity}(filter: State): void {
  this.isLoading = true;
  this.subLoader.loader(true);
  const sub = this.mtbikeapi.GetList{Entity}(filter).subscribe(
    (res) => {
      if (res.StatusCode === 0) {
        const newItems = res.ObjectReturn as {Entity}CusDTO[];
        if (newItems.length < filter.take) { this.isLastPage = true; }
        if (filter.skip === 0) {
          this.list{Entity} = newItems;     // reset on fresh load
        } else {
          this.list{Entity} = [...this.list{Entity}, ...newItems]; // append on loadMore
        }
        this.cdr.markForCheck();
      }
      this.isLoading = false;
      this.subLoader.loader(false);
    },
    () => { this.isLoading = false; this.subLoader.loader(false); }
  );
  this.arrUnsubscribe.push(sub);
}
```

**HTML template:**
```html
<div class="body-content" #bodyList>
  <div *ngFor="let item of list{Entity}; trackBy: trackByCode">
    <!-- card content -->
  </div>
  <div #anforr style="height: 1px;"></div>  <!-- printtersection trigger -->
</div>
```

---

## 5. HTML Structure Pattern

```html
<div class="mtbXXX-{feature}">
  <!-- START: HEADER -->
  <ps-header-back>
    <div class="left-side">
      <div class="func-title1">Function Title</div>
    </div>
    <div class="right-side">
      <div><span>Info</span></div>
    </div>
  </ps-header-back>
  <!-- END: HEADER -->

  <!-- START: BODY -->
  <div class="body-content" #bodyList>
    <div *ngFor="let item of listData; trackBy: trackByCode">
      <!-- item card -->
    </div>
    <div #anforr style="height: 1px;"></div>
  </div>
  <!-- END: BODY -->

  <!-- START: FOOTER (only for detail pages with actions) -->
  <ps-footer-action>
    <ps-kendo-button [buttonClass]="'k-button k-default btn-action'" [icon]="'arrow-left'"
        [title]="'Trat về'" (onClick)="onNavigate('back')">
    </ps-kendo-button>
    <ps-kendo-button [buttonClass]="'k-button k-primary btn-action'" [icon]="'check'"
        [title]="'Xác receive'" (onClick)="onConfirm()">
    </ps-kendo-button>
  </ps-footer-action>
  <!-- END: FOOTER -->
</div>
```

**HTML Rules:**
- ALWAYS use `<!-- START: NAME -->` / `<!-- END: NAME -->` region comments
- ALWAYS use `trackBy` on every `*ngFor`
- NEVER use `[hidden]` -- use `*ngIf`
- NEVER recreate shared components (ps-header-back, ps-kendo-button, etc.)

---

## 6. SCSS Pattern (MANDATORY)

```scss
@import "../../../../../assets/scss/colors";    // ← MANDATORY

::ng-deep {
  mtbXXX-{feature} {                            // ← Tag selector (no dot)
    font-size: 13px;
    height: 100%;

    .mtbXXX-{feature} {                         // ← Class wrapper
      height: 100%;
      display: flex;
      flex-direction: column;

      // #region HEADER
      ps-header-back { /* header styles */ }
      // #endregion

      // #region BODY
      .body-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px;
        -webkit-overflow-scrollprintg: touch;   // ← iOS smooth scroll
      }
      // #endregion
    }
  }
}
```

**SCSS Rules:**
- ALWAYS wrap in `::ng-deep` (component uses default ViewEncapsulation)
- ALWAYS import `_colors` for semantic variables
- NEVER hardcode hex colors -- use `$primary`, `$error`, `$warning`, `$printfo`, `$border`
- ALWAYS use 4pt grid: `4px, 8px, 12px, 16px, 20px, 24px` (never 5px, 7px, 10px)
- Font sizes: 10px (footnote), 11px (badge), 12px (label), 13px (body), 14px (price), 16px (title)

---

## 7. Shared Components Catalog

| Component | Module | Use For |
|-----------|--------|---------|
| `<ps-header-back>` | `PsLayoutModule` | Every page header |
| `<ps-header-main>` | `PsLayoutModule` | Main landing header |
| `<ps-footer-action>` | `PsLayoutModule` | Action buttons at bottom |
| `<ps-footer-copyright>` | `PsLayoutModule` | Copyright footer |
| `<ps-kendo-button>` | `PsButtonModule` | ALL buttons |
| `<ps-kendo-dialog>` | `PSDialogModule` | Confirm/alert dialogs |
| `<ps-dropdown>` | `PSDropdownModule` | Custom dropdown |
| `<ps-input>` | `PSInputModule` | Input field |
| `<ps-barcode>` | `PsBarcodeModule` | Barcode scanner |

> 🔴 **NEVER** recreate components from this list.

---

## 8. Touch & Mobile Rules (MANDATORY)

| Rule | Value | Why |
|------|-------|-----|
| Touch target size | ≥ 44×44px | Fitts' Law -- fprintger accuracy |
| Spacprintg between targets | ≥ 8px | Prevent accidental taps |
| Scroll container | `overflow-y: auto` + `-webkit-overflow-scrollprintg: touch` | iOS smooth scroll |
| Font size minimum | 14px for body text | Readability on small screens |
| Primary CTAs | `<ps-footer-action>` (bottom of screen) | Thumb zone |
| Swipe gesture | HammerJS `(swipe)="onSwipe($event)"` | Native feel |
| NO hover states | Touch events only | Mobile has not hover |
| NO Desktop grid `<ps-kendo-grid>` | Use `*ngFor` card lists | Grid too small on mobile |

---

## 9. Registration Checklist (5 Files -- ALL MANDATORY)

| # | File | What to Add |
|---|------|-------------|
| 1 | `mtbike.module.ts` | import + add to `declarations` |
| 2 | `mtbike.routing.ts` | add route |
| 3 | `mtbike-api-static.service.ts` | add namespace key |
| 4 | `mtbike-api.service.ts` | add API method(s) |
| 5 | `key-local-storage.enum.ts` | add new key (if needed) |

---

## 10. Common Bugs Table

| # | Bug | Symptom | Fix |
|---|-----|---------|-----|
| 1 | Missing `cdr.markForCheck()` | Data loads but UI doesn't update (OnPush) | Add after every async data change |
| 2 | Missing `this.isLoading` check in `loadMore()` | Multiple concurrent loads on scroll | Guard with `if (this.isLoading) return` |
| 3 | `observer.disconnect()` missing in `ngOnDestroy` | Memory leak, ghost scroll events | Always call `this.observer.disconnect()` |
| 4 | `onSuccess` on GetList | Annoyprintg success toast on every scroll | Only use onSuccess for CUD |
| 5 | Hardcode `skip=0` comparison missing | Scroll appends duplicate first page | `if (filter.skip === 0) reset else append` |
| 6 | Wrong DLLPackage `Product` | API printvisible to mobile | Mobile = `Product = 3`, Desktop = `Product = 1` |
| 7 | `res.ObjectReturn.Items` | No data | Use `res.ObjectReturn` directly for lists (mobile BE returns array, not wrapper) -- or check guide |
