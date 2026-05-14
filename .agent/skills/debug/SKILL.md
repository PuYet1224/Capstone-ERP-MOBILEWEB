---
skill: debug
role: FE-MOBILE
version: 1.0
trigger: "/debug, 'bug', 'not working', 'blank screen', 'build error', 'runtime error'"
---

# Debug Skill -- FE Mobile (Angular 16)

## Purpose

Systematic, layer-by-layer bug investigation. Eliminates guesswork.
Load this skill before attempting any fix.

## Hard Rules

- R1: Read the code before guessing -- never propose a fix without reading the affected file
- R2: Fix the root cause -- do NOT swallow errors with try/catch
- R3: No refactoring during debugging -- one minimal fix only
- R4: `ng build` must pass after fix before reporting done

---

## The 4-Layer Isolation Strategy

Investigate in this exact order. Do NOT skip layers.

### Layer 1 -- Network (check this first)
- Action: Analyze the API call via `MtbikeApiService`.
- Verify:
  - Did API return `StatusCode === 0`?
  - Is `res.ObjectReturn` / `res.ObjectReturn.Data` the right path?
  - If API returned 404 → check DLL namespace chain (3 links in fe-pipeline SKILL)
  - If API returned 500 → this is a BE bug, stop and report
- Gate: If network layer is the cause → stop debugging UI, report BE issue.

### Layer 2 -- State & Cache
- Action: Trace how data flows via `PsCache` or component variables.
- Verify:
  - Correct `KeyLocalStorageEnum` key used?
  - Previous screen called `cache.setItem()` before `router.navigate()`?
  - `this.listData` properly reassigned (not mutated)?
- Gate: If stale cache → fix the write-side, not the read-side.

### Layer 3 -- Change Detection
- Action: Check if data arrived but UI is blank.
- Verify:
  - `OnPush` component: array mutated instead of new reference? (`push()` vs spread `[...arr, x]`)
  - Async outside Angular Zone → need `ChangeDetectorRef.detectChanges()`?
- Gate: If CD layer is cause → fix reference assignment.

### Layer 4 -- Render & CSS
- Action: Check if data is present but layout is broken.
- Verify:
  - Parent container has `flex: 1` with `overflow-y: auto`?
  - Hardcoded `height: 500px` instead of flex layout?
  - `::ng-deep` wrapper scope correct?
- Gate: If render layer → fix SCSS only, no TS changes.

---

## Common Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|---|---|---|
| Ghost subscription | Screen freezes, memory grows | Add sub to `arrUnsubscribe` in `ngOnDestroy` |
| Infinite loop | App slow, CPU spike | Remove function call `{{ fn() }}` from template, use Pipe |
| Race condition | Data sometimes missing | Use `switchMap` / `combineLatest` |
| Wrong response path | Empty list, no error | Check `res.ObjectReturn` vs `res.ObjectReturn.Data` |

---

## Output Format

After investigation, report in this structure:

1. **Symptom:** {what is wrong}
2. **Layer Isolated:** {Network | State | Change Detection | Render}
3. **Root Cause:** {exact file:line or logic failure}
4. **Evidence:** {why this is the root cause}
5. **Solution:** {exact code change}
