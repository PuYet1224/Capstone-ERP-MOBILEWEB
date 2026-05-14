---
skill: code-review
role: FE-MOBILE
version: 1.0
trigger: "/review, /enhance, 'audit code', 'check code'"
allowed-tools: Read, Glob, Grep
---

# Code Review Checklist -- FE Mobile (Angular 16)

> Load when running /review or /enhance. Compare code against each rule.

---

## Hard Rules (BLOCKING -- must fix before deploy)

### 1. Naming Convention

- [ ] Folder = `mtb{NNN}-{abbr}-{feature}/` (abbr from guide MODULE METADATA: sal/cs/wh/crm/hrm/prt/rpt)
- [ ] Class = `Mtb{NNN}{Abbr}{Feature}Component` (Abbr capitalized: Sal/Cs/Wh/Crm/Hrm/Prt/Rpt)
- [ ] Selector = `mtb{NNN}-{abbr}-{feature}` (matches folder?)

### 2. Service Usage

- [ ] Only `MtbikeApiService` used -- no custom service files
- [ ] No `this.http` (direct HttpClient) anywhere
- [ ] No `console.log` left in code

### 3. Icons

- [ ] Only `<span class="material-icons">` -- no lucide-icon

### 4. Styles

- [ ] No `style="..."` inline attributes in HTML
- [ ] No hardcoded hex colors in SCSS -- use `$primary`, `$error`, `$border`, etc.
- [ ] `@import "colors"` as first line in every .scss file
- [ ] `::ng-deep { mtb{NNN}-{abbr}-{feature} { } }` wrapper present

### 5. Memory Leak Prevention

- [ ] All `.subscribe()` calls push to `arrUnsubscribe`
- [ ] `ngOnDestroy` calls `this.loader.reset()` AND unsubscribes all
- [ ] No nested subscribes -- use switchMap/concatMap instead

### 6. Performance

- [ ] `*ngFor` lists have `trackBy` function
- [ ] No function calls in template interpolation `{{ }}` -- use Pipes instead

### 7. Touch UX

- [ ] Clickable areas (buttons, cards) >= 44px height
- [ ] No hover-only interactions (mobile has no hover)

### 8. API Integration

- [ ] API names match BE exactly (no shortening)
- [ ] Response read as `res.ObjectReturn.Data` or `res.ObjectReturn as any[]`
- [ ] Error handling present (notification shown, not silent failure)
- [ ] Loading state managed (loader.loader(true/false) around API call)

### 9. Registration

- [ ] Declared in `mtbike.module.ts`
- [ ] Route added to `mtbike.routing.ts` (path matches DLLPackage)
- [ ] APIID keys added to `mtbike-api-static.service.ts`
- [ ] Observable methods added to `mtbike-api.service.ts`

### 10. Build

- [ ] `ng build` returns 0 errors

---

## Review Output Format

| Severity | File:Line | Issue | Fix |
|---|---|---|---|
| [BLOCKING] | `file.ts:45` | Memory leak: missing unsubscribe | Push to arrUnsubscribe |
| [SUGGESTION] | `file.html:12` | Function in template | Use Angular Pipe |
| [OK] | - | Naming convention correct | - |
