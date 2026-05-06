---
name: code-review
description: >
  Pre-commit quality check for Capstone ERP Mobile Web (Angular 16 + Kendo UI).
  Use when reviewing code, running /review or /enhance, or before committing.
  Checks enum usage, component patterns, API integration, memory leaks, and security.
  Do NOT use for feature implementation (use coding-standard) or debugging (use debug).
---

# Code Review — Angular Mobile Web

> Read ALL component files (.ts, .html, .scss) before reviewing.
> Compare each file against this checklist.
> Report: 🔴 BLOCKING | 🟡 SUGGESTION | 🟢 NIT

---

## 1. Enum & Constants

- [ ] NO magic numbers in templates — use enum values
- [ ] Enum exposed in component class: `readonly Status = StatusEnum;`
- [ ] Enum values match DB `tbl_LSStatus.TypeOfStatus`

```typescript
// 🔴 BLOCKING
*ngIf="item.Status !== 1"
// ✅ CORRECT
*ngIf="item.Status !== StatusEnum.NEW"
```

## 2. Component Structure

- [ ] 3 files only: .ts, .html, .scss (NO .spec.ts)
- [ ] `ngOnDestroy` unsubscribes ALL subscriptions
- [ ] DTO/Enum files in `models/dtos/e-dtos/` and `models/enums/` — NOT in component folder
- [ ] `ChangeDetectionStrategy.OnPush` used

## 3. API Integration

- [ ] Uses `MtbikeApiService` — NOT direct `HttpClient`
- [ ] `res.StatusCode === 0` check before using data
- [ ] ALL subscriptions tracked in `arrUnsubscribe`
- [ ] `cdr.markForCheck()` called after async data change
- [ ] Error handler in ALL `.subscribe()` callbacks
- [ ] `onSuccess()` only for CUD — never for reads
- [ ] Loader: `subLoader.loader(true)` at start, `false` in both success AND error

```typescript
// 🔴 MEMORY LEAK
this.api.GetList(filter).subscribe(res => { ... });
// ✅ CORRECT
const sub = this.api.GetList(filter).subscribe(res => { ... });
this.arrUnsubscribe.push(sub);
```

## 4. Template Rules

- [ ] Uses ps-* wrappers — NOT raw Kendo components
- [ ] BANNED tags: `<ps-layout>`, `<ps-layout-header>`, `<ps-table>` — do NOT exist
- [ ] `trackBy` on every `*ngFor`
- [ ] `*ngIf` instead of `[hidden]`
- [ ] Filter bar uses standard components (ps-filter-textbox, ps-filter-status1, ps-filter-button)

## 5. SCSS Rules

- [ ] `@import 'src/assets/scss/colors'` as first line
- [ ] NO hardcoded hex values — uses `$variable`
- [ ] Wrapped in `::ng-deep { tag-selector { ... } }`
- [ ] No global CSS overrides (`.ps-filter-bar` display/gap/flex-wrap)

## 6. Registration

- [ ] `mtbike.module.ts` — component declared
- [ ] `mtbike.routing.ts` — route added
- [ ] `mtbike-api-static.service.ts` — namespace added
- [ ] `mtbike-api.service.ts` — methods added

## 7. Security

- [ ] NO `innerHTML` with user input — use `[textContent]` or interpolation
- [ ] NO `eval()` or dynamic script injection
- [ ] API errors shown via notification — NOT raw in HTML

## 8. Clean Code

- [ ] No dead code (unused imports, methods, variables)
- [ ] Clear region comments: `// #region LOAD DATA`
- [ ] Method names match service method names (consistency)
- [ ] No over-engineering — simplest solution that works

---

## Output Format

```
🔴 BLOCKING: [file:line] Magic number Status !== 1 in template
🟡 SUGGESTION: [file:line] Missing error handler in subscribe
🟢 NIT: [file:line] Consider extracting badge logic to pipe
```
