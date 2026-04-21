---
description: Pre-commit quality check for mobile web code. Use before committing to catch common mistakes. Usage /review
skills:
  - fe-mobile-pipeline
  - clean-code
  - debug
---

# /review — Mobile Web Code Review

## STEP 1: Read Changed Files
- Identify all modified/new files in the current working tree
- Run `git diff --name-only` to list changes

## STEP 2: Check Each File Against Rules

### Service Files (.service.ts)
- [ ] API URL uses `PSGetConfigService` (not hardcoded)
- [ ] Response reads `res.ObjectReturn.Data` (not `res.data`)
- [ ] Error handling present (not empty subscribe)

### Component Files (.component.ts)
- [ ] `ChangeDetectionStrategy.OnPush` used where possible
- [ ] Subscriptions cleaned up (takeUntil or async pipe)
- [ ] No `console.log` left in code
- [ ] Loading state handled (skeleton/spinner)
- [ ] Error state handled (not blank screen)

### Template Files (.component.html)
- [ ] Safe navigation `?.` used for nullable data
- [ ] Touch targets >= 44x44px
- [ ] No desktop-only patterns (hover, sidebar)
- [ ] `trackBy` used on `*ngFor`

### DTO Files (.dto.ts)
- [ ] Field names match BE Response record exactly (case-sensitive)
- [ ] All required fields present per SRS Sec. 6.2

### Style Files (.scss)
- [ ] Uses project color variables (not hardcoded hex)
- [ ] Mobile-first (375px base, no min-width > 414px)
- [ ] No `!important` unless overriding Kendo defaults

## STEP 3: Build Check
```powershell
ng build
```

## STEP 4: Report
```
✅ Review complete:
   Files checked: {N}
   Issues found: {N}
   Issues fixed: {N}
   Build: Passed
```

## BANNED
- DO NOT approve code that doesn't compile
- DO NOT skip DTO field name validation
- DO NOT ignore console.log statements
