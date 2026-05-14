---
workflow: debug
role: FE-MOBILE
version: 1.0
trigger: "/debug"
---

# /debug

## Purpose

Systematic bug fix for mobile web. Use when builds break, runtime errors occur, or UI behaves unexpectedly.

## Pre-conditions

- [ ] Bug is reproducible or error message is available
- [ ] Affected component / file is known (or can be inferred)

---

## Steps

### Step 1 -- Define the Bug
- Action: Confirm:
  1. Expected behavior: what should happen?
  2. Actual behavior: what does happen?
  3. When did it start? (after which change, if known)
  4. Error message or stack trace (if available)
- Gate: Bug is clearly described. Do NOT proceed to code changes without this.

### Step 2 -- Read Affected Files
- Action:
  1. Read the affected component (.ts, .html, .scss) fully
  2. If build error: read the error output carefully -- identify file:line
  3. If runtime error: identify which API call or template binding fails
  4. Do NOT guess -- read the actual code first
- Gate: Root cause hypothesis formed from reading the code, not from guessing.

### Step 3 -- Triage by Category
Match the bug to a category and apply the targeted fix:

| Category | Symptoms | Check |
|---|---|---|
| Build error | `ng build` fails | Read exact TypeScript error, check imports, types |
| Memory leak | Screen freezes, dev tools shows leaked subs | Check `arrUnsubscribe`, `ngOnDestroy` |
| Blank screen / no data | List empty, no error shown | Check `res.StatusCode === 0`, `res.ObjectReturn` path |
| API 404 | Network tab shows 404 | Check DLL namespace chain (3 links) |
| Style broken | Layout off, colors wrong | Check SCSS variables, `::ng-deep` wrapper |
| Template crash | `Cannot read property of undefined` | Add `?.` safe navigation |
| Route not found | Page 404 in browser | Check `mtbike.routing.ts` path vs DLLPackage |

- Gate: Category identified. Fix strategy decided.

### Step 4 -- Apply Fix
- Action:
  1. Make the minimal change that fixes the root cause
  2. Do NOT refactor unrelated code
  3. Do NOT add try/catch to hide errors -- fix the cause
- Gate: Fix applied. Only affected code changed.

### Step 5 -- Verify Fix (MANDATORY GATE)
- Action: `ng build`
  - 0 errors -> proceed
  - Still failing -> re-read error, adjust fix, rebuild
  - 3+ attempts on same error -> STOP: report to user with full error output
- Gate: `ng build` returns exit code 0.

### Step 6 -- Report
```
[BUG FIXED]
  Root cause: {description}
  Fix:        {what was changed}
  Files:      {list of modified files}
  Build:      ng build -- 0 errors [OK]
```

---

## Banned
- DO NOT guess at fixes without reading the code
- DO NOT refactor during debugging
- DO NOT swallow errors with try/catch
- DO NOT report done without a passing ng build
