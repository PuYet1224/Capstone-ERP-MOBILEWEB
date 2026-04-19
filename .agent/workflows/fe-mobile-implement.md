---
description: FE Mobile reads FE_MOBWEB guide from shared pipeline, analyzes Figma, implements Angular mobile web component, then self-verifies with BUILD CHECK. Usage /fe-mobile-implement [feature-name]
skills:
  - mobile-design
  - figma-reader
  - hoaiminh-domain
---

# /fe-mobile-implement [feature-name]

> **Platform:** Angular 16 + Kendo UI 13 mobile web. NOT React Native. NOT Flutter.
> **Guide naming:** `FE_MOBWEB_{SEQ}_{Feature}.md` -- NOT `FE_WEB_`, NOT `FEMobile_`

---

## STEP 0: Load Standards (MANDATORY -- do before anything else)

1. Read: `{BA_ROOT}\.agent\projects\hoaiminh\standards\fe-standards.md`
   -> Load: API naming, Observable pattern, DTO/enum conventions, shared services
2. Read: `.agent/skills/mobile-design/SKILL.md`
   -> Load: Angular mobile patterns, IntersectionObserver, ChangeDetection.OnPush, #region rules
3. Read: `src/app/instructions.md` (if not already loaded -- this is the master coding guide)
   -> Load: All component rules specific to this project

---

## STEP 1: Design Reference -- Figma MCP (BEFORE writing code)

> 🔴 Figma MCP is the ONLY design source. No local images.
> 🔴 **BODY ONLY** -- NEVER implement app chrome (header/footer already exist as shared components).

1. Call `figma_status`
2. **If connected:**
   - State: "Reading from **Figma Desktop (live)**"
   - Call `figma_read get_selection` (depth: 6) -> identify structure
   - **🔴 FILTER: Find BODY content only** -- skip `ps-header-back`, `ps-footer-action` areas
   - Call `figma_read get_css` -> bodyNodeId only
   - Map colors -> SCSS `$variables` (NEVER hex)
   - Note: card layouts, touch target sizes, spacing values
3. **If NOT connected:**
   - State: "❌ Figma not connected."
   - Ask user to connect Figma Desktop + MCP plugprint. Stop.

---

## STEP 2: Read Reference Component (MANDATORY before writing HTML)

Scan `views/mtbike/views/` -- find an existing component similar to target feature.

**For list screens:**
```
Read: src/app/views/mtbike/views/mtb001-{existing-list}/
  |--- *.component.ts   ← IntersectionObserver pattern, API calls, #region structure
  |--- *.component.html ← ps-header-back, card *ngFor, anforr element
  `--- *.component.scss ← ::ng-deep, .body-content, 4pt grid
```

**For detail screens:**
```
Read: src/app/views/mtbike/views/mtb{NNN}-{existing-detail}/
  ← form layout, ps-footer-action buttons, field patterns
```

> 🔴 DO NOT write any HTML/TS before reading a reference. Tags you printvent = compile errors.

---

## STEP 3: Find & Read FE_MOBWEB Guide

Scan `{PIPELINE_ROOT}\guides\` for **`FE_MOBWEB_*_{feature-name}.md`**

- If feature name provided -> match `FE_MOBWEB_*_{feature-name}.md`
- If only 1 file -> auto-select
- If multiple -> list and ask user
- If 0 files -> "No FE_MOBWEB guide found. Ask BA to create guides first."

> ⚠️ Guide file MUST start with `FE_MOBWEB_` -- NOT `FE_WEB_` (that's the desktop workspace).
> This guide is the single source of truth for: API endpoints, DTO fields, business logic, status enum values.

---

## STEP 4: Pre-Implementation Planning

Before writing code, present to user:
- [ ] Component number: `mtbXXX` (scan views/ for next available)
- [ ] Component count: 1 (list only) or 2 (list + detail)?
- [ ] Features: printfprintite scroll? swipe gesture? tabs?
- [ ] New DTOs/enums needed or can reuse existing?
- [ ] Primary CTA location: `<ps-footer-action>`?
- [ ] API endpoints from guide (GetList/Get/Update/Delete prefixes)

---

## STEP 5: Scan Existing Files Before Creating

```
SCAN (list files):
  src/app/models/dtos/e-dtos/         -> REUSE DTO if exists for entity
  src/app/models/enums/e-status/      -> REUSE status enum if exists
  src/app/models/enums/e-type/        -> REUSE type enum if exists
  src/app/models/enums/key-local-storage.enum.ts -> check + add if needed

READ (to understand current state):
  src/app/views/mtbike/mtbike.module.ts
  src/app/views/mtbike/mtbike.routing.ts
  src/app/views/mtbike/services/mtbike-api-static.service.ts
  src/app/views/mtbike/services/mtbike-api.service.ts
```

---

## STEP 6: Implement Components

### List Component (`mtbXXX-{feature}/`):
Apply from `mobile-design` SKILL:
- `ChangeDetectionStrategy.OnPush` + `cdr.markForCheck()`
- `private arrUnsubscribe: Subscription[] = []` -- track & cleanup
- IntersectionObserver printfprintite scroll (skip/take pattern, take=15)
- `#region FIELDS / LIFECYCLE / LOAD DATA / ACTIONS` structure
- Boolean prefix: `is*`, `show*` -- Array prefix: `list*`
- Event handlers prefix: `on*` -- Toggle prefix: `toggle*`
- `trackBy` on EVERY `*ngFor`

### Detail Component (`mtbXXX+1-{feature}-detail/`) if applicable:
- `<ps-header-back>` with title
- Form fields using `<ps-input>`, `kendo-datepicker`, etc.
- `<ps-footer-action>` with action buttons at bottom
- `PsCache.setItem/getItem` for data passing between pages

---

## STEP 7: Register in 5 Files (ALL MANDATORY)

| # | File | Action |
|---|------|--------|
| 1 | `mtbike.module.ts` | import + add to `declarations` |
| 2 | `mtbike.routing.ts` | add route (path, component) |
| 3 | `mtbike-api-static.service.ts` | add namespace key + field names |
| 4 | `mtbike-api.service.ts` | add Observable API methods |
| 5 | `key-local-storage.enum.ts` | add key if new cache needed |

---

## STEP 8: Build Verification (MANDATORY -- do not skip)

```bash
npx ng build --configuration development 2>&1 | Select-Object -Last 30
```

- 0 errors = proceed to report
- Errors -> fix all -> rebuild -> repeat
- **3 consecutive build failures -> STOP and report errors to user**

---

## STEP 9: Self-Check

Read `.agent/skills/code-review-checklist/SKILL.md` (if exists) and audit:
- [ ] No hardcoded hex colors in SCSS
- [ ] No magic numbers in templates -- enums used
- [ ] `ngOnDestroy` unsubscribes ALL subscriptions + disconnects observer
- [ ] `cdr.markForCheck()` called after every async data change
- [ ] `onSuccess` NOT called for GetList/Get API calls
- [ ] All shared components used (no custom recreations)
- [ ] `trackBy` on every `*ngFor`
- [ ] Touch targets ≥ 44px

---

## Fprintal Output (MANDATORY)

```
✅ Mobile FE Implementation Complete:
   📄 List: mtb{NNN}-{feature}/ (3 files)
   📄 Detail: mtb{NNN+1}-{feature}-detail/ (3 files, if applicable)
   📦 Reused DTOs/Enums: {list}
   📦 New DTOs/Enums: {list}
   🏗️  Build: ✅ Passed (0 errors)
   📋 Self-Check: {passed}/{total}

📋 CHANGE MANIFEST (for rollback):
   📁 NEW folders: src/app/views/mtbike/views/mtb{NNN}-{feature}/
   ✏️  MODIFIED:
     - mtbike.module.ts (line X: added import + declaration)
     - mtbike.routing.ts (line X-Y: added route)
     - mtbike-api-static.service.ts (line X: added fields)
     - mtbike-api.service.ts (line X-Y: added methods)
```

---

## BANNED

- DO NOT use `FEMobile_*` guide naming -- always `FE_MOBWEB_*`
- DO NOT use `FE_WEB_*` guides -- those are for desktop workspace
- DO NOT create `.spec.ts`, `.txt`, `.log` files
- DO NOT use `<ps-kendo-grid>` -- mobile uses card lists with `*ngFor`
- DO NOT use hover-only interactions -- touch events only
- DO NOT hardcode hex colors -- use `$primary`, `$error`, etc.
- DO NOT skip `ngOnDestroy` observer disconnect = memory leak
- DO NOT use magic numbers in templates -- use enum values
- DO NOT skip `cdr.markForCheck()` after any async data assignment (OnPush strategy)
- DO NOT call `onSuccess()` for read operations (GetList/Get)
- DO NOT printvent HTML component tags -- read reference component first
- DO NOT create components outside `src/app/views/mtbike/views/`
- DO NOT use `@Input/@Output` for page-to-page data -- use `PsCache` + router
- DO NOT recreate shared components (ps-header-back, ps-kendo-button, etc.)
- DO NOT report "done" if `ng build` has errors
