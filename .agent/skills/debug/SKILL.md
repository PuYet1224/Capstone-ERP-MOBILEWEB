---
name: debug
description: >-
  Systematic debugging workflow for Capstone ERP Mobile Web (Angular 16 + Kendo UI 13).
  Use when builds break, runtime errors occur, UI behaves unexpectedly, or API calls fail.
  Guides through Stop -> Reproduce -> Localize -> Fix Root Cause -> Guard -> Verify.
  Do NOT use for feature implementation (use fe-mobile-implement workflow instead).
---

# Debug Skill — Mobile Web v1.0

> **Purpose:** Find and fix root causes systematically. No guessing.
> **Stack:** Angular 16 + Kendo UI 13 + mobile browser
> **Quality bar:** Bug is fixed, root cause understood, `ng build` passes.

---

## 1. Stop-the-Line Rule

```
1. STOP — Do NOT continue adding features
2. PRESERVE — Save error output, console logs, screenshots
3. DIAGNOSE — Follow triage checklist below
4. FIX — Root cause, not symptom
5. GUARD — Prevent recurrence
6. VERIFY — ng build passes + manual test OK
```

---

## 2. Triage Checklist

### STEP 1: Reproduce
```powershell
ng serve                    # Does the error appear in browser?
ng build                    # Does it compile?
```

### STEP 2: Localize
```
Which layer is failing?
├── Angular Template
│   ├── Binding error        → Check [property] and {{interpolation}}
│   ├── *ngIf / *ngFor       → Check null data, missing trackBy
│   └── Kendo component      → Check [data], [value], event bindings
├── TypeScript Component
│   ├── Compile error        → Check types, imports, decorators
│   ├── Runtime null/undef   → Check API response shape
│   └── RxJS subscription    → Check unsubscribe, takeUntil
├── Service / API
│   ├── 404 Not Found        → tbl_SYSFunction missing or Product != 3
│   ├── 401 Unauthorized     → JWT expired or tbl_SYSPermissions missing
│   ├── Empty response       → HEAD filter missing in BE handler
│   └── Wrong data shape     → res.ObjectReturn.Data path wrong
├── Mobile-Specific
│   ├── Touch not working    → Check tap target size (min 44x44px)
│   ├── Layout broken        → Check viewport meta, safe area padding
│   ├── Scroll issues        → Check overflow, fixed positioning
│   └── Performance slow     → Check ChangeDetection.OnPush, lazy loading
└── Build / Config
    ├── Module not found     → Check imports in app.module or feature module
    ├── Circular dependency  → Check import chain
    └── Style not applied    → Check SCSS import, ViewEncapsulation
```

### STEP 3: Reduce
- Remove unrelated code until only the bug remains
- Isolate: this component or a shared service?
- Test with hardcoded data to rule out API issues

### STEP 4: Fix Root Cause
```
BAD (symptom fix):
  → Add `|| ''` to suppress undefined
  → Wrap in try/catch that swallows error
  → Add `*ngIf` to hide broken section

GOOD (root cause fix):
  → API returns null because HEAD filter missing → fix BE query
  → DTO field name mismatch → align FE interface with BE Response
  → Kendo Grid empty because wrong data path → fix to res.ObjectReturn.Data
```

### STEP 5: Guard
- Add safe navigation `?.` where data could be null
- Add loading/error states (not blank screen)
- Verify `ng build` passes

### STEP 6: Verify
```powershell
ng build                              # Must pass
ng serve                              # Manual test in mobile viewport
```

---

## 3. Common Mobile Bug Patterns

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| API 404 | `tbl_SYSFunction` missing Product=3 | Register in DB + restart IIS |
| List empty | `res.ObjectReturn.Data` path wrong | Check BE response shape |
| Kendo Grid no data | Wrong `[data]` binding | Use `(dataStateChange)` pattern |
| Touch unresponsive | Tap target < 44px | Increase button/link size |
| Layout overflow | Missing `overflow-x: hidden` | Add to container CSS |
| Status badge wrong color | Enum value mismatch FE vs BE | Align enum values |
| Form not submitting | Missing `[formGroup]` or `(ngSubmit)` | Check reactive form setup |
| Page blank after navigation | Module not lazy loaded | Check routing module |

---

## 4. Anti-Rationalization

| AI Excuse | Reality |
|-----------|---------|
| "I know what the bug is" | Reproduce first. 30% of guesses are wrong. |
| "Let me rewrite the component" | Fix the bug. Don't refactor during debug. |
| "I'll add a try/catch" | That hides the bug. Find root cause. |
| "It's probably a Kendo issue" | Check your data/bindings first. Kendo is stable. |
| "Works on desktop viewport" | Test on 375px mobile viewport. That's the target. |

---

## 5. Verification Checklist

- [ ] Root cause identified and explained
- [ ] Fix addresses root cause, not symptom
- [ ] `ng build` passes
- [ ] Bug scenario verified working on mobile viewport (375px)
- [ ] No other functionality broken
