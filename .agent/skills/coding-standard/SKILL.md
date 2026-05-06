---
name: coding-standard
description: >
  The single source of truth for coding any screen in Capstone ERP Mobile.
  Use when implementing, modifying, or reviewing any Angular component.
  Covers project structure, layout template, API pattern, SCSS rules, and screen checklist.
  Read this skill BEFORE writing any code to avoid wrong patterns and broken layouts.
  Do NOT use for debugging (use debug skill) or Figma reading (use figma-reader skill).
---

# Coding Standard — Capstone ERP Mobile

> **Read this file before writing any code.**
> For values that change (colors, enums, services), this skill points you to the SOURCE FILES.
> For structural patterns (layout, API, SCSS), this skill provides the template to follow.

---

## 1. Project Structure — Where Things Live

```
src/app/
├── components/                    ← Shared ps-* wrappers (DO NOT modify)
├── models/
│   ├── dtos/e-dtos/               ← Business DTOs (create new ones HERE)
│   └── enums/
│       ├── e-status/              ← Status enums (create new ones HERE)
│       └── e-type/                ← Type enums (create new ones HERE)
├── services/                      ← Core services (PsCache, APIService, etc.)
└── views/mtbike/
    ├── mtbike.module.ts           ← MUST update: declare new component
    ├── mtbike.routing.ts          ← MUST update: add route
    ├── services/
    │   ├── mtbike-api-static.service.ts  ← MUST update: add namespace
    │   └── mtbike-api.service.ts         ← MUST update: add API methods
    ├── pipes/                     ← Status display pipes
    └── views/                     ← All screen components (mtb000-, mtb001-, ...)
```

> **Source files to READ (not hardcoded here because they change):**
> - Colors: `src/assets/scss/_colors.scss` — All `$primary`, `$error`, etc. variables
> - Typography: `src/assets/scss/_colors.scss` — Font sizes, families
> - Enums: `src/app/models/enums/` — Scan before creating new ones
> - DTOs: `src/app/models/dtos/e-dtos/` — Scan before creating new ones
> - Services: `src/app/views/mtbike/services/mtbike-api.service.ts` — Available API methods
> - Modules: `src/app/views/mtbike/mtbike.module.ts` — Already imported modules
> - Pipes: `src/app/views/mtbike/pipes/` — Available status pipes

> **Domain knowledge (business rules, flows, glossary) lives in BA workspace:**
> - `{BA_ROOT}\.agent\projects\capstone\domain\` — Sales flow, service flow, DB schema, business rules
> - Read domain files ONLY when you need to understand business logic (e.g., status transitions, field meanings)
> - Do NOT read domain files for routine coding tasks

---

## 2. Screen Layout Template (EVERY screen follows this)

```html
<div class="page">
    <!-- HEADER (56px fixed) -->
    <ps-header-back>
        <ng-container header-right>
            <div class="header-title">Screen Title</div>
        </ng-container>
    </ps-header-back>

    <!-- BODY (scrollable) -->
    <div class="body-list" #bodyList>
        <!-- Content here -->
    </div>

    <!-- FOOTER (fixed bottom) -->
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

---

## 3. SCSS Pattern

```scss
@import 'src/assets/scss/colors';  // MANDATORY — provides all $variables

::ng-deep {
    my-screen {
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

            .card {
                background: $white;
                border-radius: 8px;
                padding: $spacing-sm;
                box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
                display: flex;
                flex-direction: column;
                gap: $spacing-xs;
            }
        }
    }
}
```

> **SCSS Rules:**
> - NEVER hardcode hex — always use `$variable` from `_colors.scss`
> - ALWAYS wrap in `::ng-deep { tag-selector { ... } }`
> - ALWAYS `@import 'src/assets/scss/colors'` as first line

---

## 4. API Calling Pattern

```typescript
import { MtbikeApiService } from '../../services/mtbike-api.service';

// Call API — always track subscription for cleanup:
const sub = this.api.GetListSALMaster(filter).subscribe((res) => {
    if (res.StatusCode === 0) {
        this.listData = res.ObjectReturn;
        this.cdr.markForCheck();  // Required for OnPush
    }
});
this.arrUnsubscribe.push(sub);
```

> **API Rules:**
> - NEVER use `this.http.post(...)` directly — always go through `MtbikeApiService`
> - ALWAYS check `res.StatusCode === 0` before using data
> - ALWAYS push subscription to `arrUnsubscribe` for cleanup
> - ALWAYS call `this.cdr.markForCheck()` after async data change (OnPush)
> - `onSuccess()` notification ONLY for Create/Update/Delete — NEVER for GetList reads

---

## 5. Data Passing Between Screens

```typescript
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';

// Sending: list → detail
this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, item);
this.router.navigate(['/mtbike/consultant/detail']);

// Receiving: detail page
const cached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
if (cached) { this.orderMaster = this.cache.parseValue(cached); }
```

> Check `KeyLocalStorageEnum` for available keys. Add new keys there if needed.

---

## 6. Naming Conventions

| Item | Pattern | Example |
|---|---|---|
| Screen folder | `mtbXXX-purpose` | `mtb009-sal-consultant` |
| Component class | `MtbXXXPurposeComponent` | `Mtb009SalConsultantComponent` |
| Selector | `mtbXXX-purpose` (kebab) | `mtb009-sal-consultant` |
| DTO | `{Entity}CusDTO` | `SALOrderMasterCusDTO` |
| Enum | `{Entity}StatusEnum.VALUE` | `SALOrderMasterStatusRetailEnum.NEW` |
| Boolean | `is` / `show` prefix | `isLoading`, `showDialog` |
| List | `list` prefix | `listworkordermaster` |
| Handler | `on` prefix | `onNavigate()`, `onClick()` |

---

## 7. New Screen Checklist

1. **Create 3 files** in `views/mtbike/views/mtbXXX-feature-name/`
2. **Copy pattern** from nearest existing screen (read its .ts, .html, .scss)
3. **Register** in `mtbike.module.ts` (declarations) + `mtbike.routing.ts` (route)
4. **Add API** in `mtbike-api-static.service.ts` (namespace) + `mtbike-api.service.ts` (methods)
5. **Verify** with `ng build`

> **Before writing ANY code, read a reference component** from `views/mtbike/views/mtb00X-{existing}/`
> to understand the actual patterns used in this project.

---

## Extended References (loaded on demand)

- Component API cheat sheet: see [references/component-api.md](references/component-api.md)
- Gotchas and common mistakes: see [references/gotchas.md](references/gotchas.md)
