---
name: code-review-checklist
description: HM ERP Frontend code review checklist. Angular + Kendo UI specific rules for enum usage, component patterns, PS wrappers, and template magic numbers.
allowed-tools: Read, Glob, Grep
---

# Code Review Checklist — FE (Angular 16 + Kendo UI)

> Agent reads this skill when running `/enhance` or `/review`.

## 1. Enum & Constants

- [ ] Enum values match production DB `tbl_LSStatus TypeOfStatus`
- [ ] NO magic numbers in `.html` templates
- [ ] Enum exposed in component class for template binding

```typescript
// 🔴 BLOCKING: Magic number in template
*ngIf="item.Status !== 1"
// ✅ CORRECT
*ngIf="item.Status !== ReceiptStatus.NEW"
```

```typescript
// Component must expose enum:
readonly ReceiptStatus = SALReceiptStatusEnum;
```

## 2. Component Patterns

- [ ] Folder: `mtb{NNN}-{feature}/` with 3 files (.ts, .html, .scss)
- [ ] Class: `Mtb{NNN}{Feature}Component`
- [ ] **Feature with grid + detail = 2 components** (list + detail, e.g. mtb015-receipt + mtb016-receipt-detail)
- [ ] NO sub-folders, NO `shared/` folder
- [ ] `ngOnDestroy` unsubscribes ALL subscriptions
- [ ] Use `const` not `var` for subscription variables

## 3. DTO & Enum Reuse (SCAN EXISTING FIRST)

- [ ] **Listed `e-dtos/` folder BEFORE creating DTO** — reuse if exists
- [ ] **Listed `enums/e-status/` and `enums/e-type/` BEFORE creating enum** — reuse if exists
- [ ] Cross-module enums reused (e.g. `SALOrderMasterStatusEnum` shared by retail + receipt)
- [ ] Base `{Entity}DTO` (private) + exported `{Entity}CusDTO extends base`
- [ ] All fields initialized with defaults (`= 0`, `= ''`)
- [ ] Using `UpdatePropertiesInterface<T>` for create/update
- [ ] Using `UpdateStatusInterface<T>` for status changes

## 4. API Service (NO new service files)

- [ ] Methods added to existing `ps-mtbike-api.service.ts`
- [ ] Namespace added to `ps-mtbike-api-static.service.ts`
- [ ] Using `ResponseDTO` response type
- [ ] Success check: `res.StatusCode == 0`
- [ ] **Data binding uses `res.ObjectReturn.Data` + `res.ObjectReturn.Total`** — NEVER `Items`/`TotalCount`
- [ ] **Template field names match BE response EXACTLY** (e.g. `CreatedTime` not `CreateTime`, `CustomerName` not `Customer`)
- [ ] **Namespace in static service matches DB `DLLPackage`** (singular/plural, case-sensitive)

## 5. HTML Template (MUST scan reference component first)

- [ ] Read `mtb001-delivery.component.html` BEFORE writing HTML
- [ ] Layout: `<div class="{selector}">` wrapper — NOT `<ps-layout>`
- [ ] Toolbar: `<ps-toolbar-top>` — NOT invented tags
- [ ] Dialog: `<ps-dialog-confirm>` — NOT `<ps-dialog>`
- [ ] Button: `<ps-kendo-button>` — correct
- [ ] Input: `<ps-kendo-textbox>` — correct
- [ ] Dropdown: `<ps-kendo-dropdown-list>` — correct
- [ ] BANNED: `<ps-layout>`, `<ps-layout-header>`, `<ps-layout-content>`, `<ps-table>` — DO NOT EXIST

### Filter Bar (MANDATORY standard pattern)
- [ ] Uses `<ps-filter-textbox>` for search — NOT custom `<input>` or `<kendo-textbox>`
- [ ] Search textbox `min-width` matches placeholder length: Short(<20chars)=270px, Med(20-40)=340px, Long(40+)=420px
- [ ] **`ps-filter-textbox` contains built-in "Lọc" button (~60px)** — if min-width too small, placeholder is CUT OFF
- [ ] Uses `<ps-filter-status1>` for status filter — NOT custom `<kendo-multiselect>` or `<kendo-dropdownlist>`
- [ ] **`ps-filter-status1` has API data loaded** — check `getliststatus()` is called in `ngOnInit()`
- [ ] **`ps-filter-status1` uses `GetListStatus(LSStatusTypeDataEnum.XXX)`** — NOT hardcoded number
- [ ] **`LSStatusTypeDataEnum` entry exists** for your entity — check the enum file first
- [ ] `[data]="liststatus"` is bound — NOT `[data]="[]"` or missing
- [ ] `[valueField]="'TypeOfStatus'"` and `[field]="'StatusID'"` are set correctly
- [ ] Uses `<ps-filter-button>` for reload/clear/reset — NOT custom buttons
- [ ] All filter items left-aligned (default flexbox)
- [ ] NO extra buttons beyond standard `ps-filter-button`
- [ ] NO custom toggle switches — use `<ps-filter-status1>` instead
- [ ] NO custom date range with `<kendo-datepicker>` + "Từ ngày"/"Đến ngày" labels
- [ ] NO wrapper divs (`.filter-cashier`, `.filter-toggle`, `.filter-date-range`, `.header-col-2`)
- [ ] NO `<kendo-label>` above dropdowns in filter bar — use `[label]` input property
- [ ] `.ps-filter-bar` CSS NOT overridden: no `display:flex`, `flex-wrap`, `row-gap`, `gap`, `align-items` in component SCSS
- [ ] ONLY allowed SCSS override: `ps-filter-textbox .kendo-textbox { min-width }` and `ps-kendo-dropdown-list { min-width }`

### Status Badges
- [ ] Outline badges (e.g. "Tạo mới") use `border + text color, transparent bg`
- [ ] Filled badges (e.g. "Đang xử lý") use `solid bg + white text`
- [ ] Colors match Figma exactly: `$warning`=yellow, `$primary`=green, `$error`=red
- [ ] NEVER swap border/bg/text colors — if Figma shows outline → code outline

### Grid Action Column
- [ ] Uses built-in `ps-kendo-grid` action column: `[hasColumnAction]="true"`
- [ ] NEVER custom action dropdown — gets cut off by grid overflow

## 6. Registration (ALL 4 mandatory)

- [ ] `mtbike.module.ts` — import + declarations
- [ ] `mtbike.routing.ts` — route added
- [ ] `ps-mtbike-api-static.service.ts` — namespace
- [ ] `ps-mtbike-api.service.ts` — methods

## 7. Performance & Memory

- [ ] ALL subscriptions tracked in `arrUnsubscribe` array
- [ ] `ngOnDestroy` unsubscribes ALL — prevents memory leaks
- [ ] Use `const` for subscription variables — prevents reassignment bugs
- [ ] Avoid complex logic in templates — pre-compute in component
- [ ] Pagination: grid must support `skip/take` — never load all records
- [ ] Avoid calling functions in `*ngFor` — cache results in property

```typescript
// 🔴 MEMORY LEAK: subscription not tracked
this.mtbikeapi.GetList(filter).subscribe(res => { ... });
// ✅ CORRECT: tracked + will be cleaned up
const sub = this.mtbikeapi.GetList(filter).subscribe(res => { ... });
this.arrUnsubscribe.push(sub);
```

## 8. Security (FE)

- [ ] NO `innerHTML` binding — use `[textContent]` or interpolation
- [ ] NO `eval()`, `Function()`, or dynamic script injection
- [ ] NO sensitive data in `localStorage` (tokens, passwords)
- [ ] User input sanitized before display — Angular auto-escapes but verify `[innerHTML]`
- [ ] API error messages displayed via notification — NOT raw in HTML

## 9. Maintainability

- [ ] Clear region comments: `//#region list`, `//#region dialog`
- [ ] Status display logic in `getStatusName()` method — NOT inline in template
- [ ] Loader pattern: `subLoader.loader(true)` at start, `false` in BOTH success AND error
- [ ] Error handling in ALL `.subscribe()` — never ignore error callback
- [ ] No dead code — remove unused imports, methods, variables

```typescript
// 🔴 MISSING ERROR HANDLER
this.mtbikeapi.Update(dto).subscribe(res => { ... });
// ✅ CORRECT: handle both success and error
this.mtbikeapi.Update(dto).subscribe(
  (res) => { ... },
  (err) => { this.subLoader.loader(false); this.notification.onError(err.message); }
);
```

## 10. Banned

- [ ] NO `.spec.ts` files
- [ ] NO `.md`, `.txt`, `.log` in project root
- [ ] NO files outside `src/app/`
- [ ] NO new service files

## Review Output Format

```
🔴 BLOCKING: [file:line] Magic number Status !== 1 in template
🟡 SUGGESTION: [file:line] Use const instead of var
🟢 NIT: [file:line] Consider extracting badge logic to pipe
```

