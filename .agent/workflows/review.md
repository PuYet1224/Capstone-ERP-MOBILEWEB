---
workflow: review
role: FE-MOBILE
version: 1.0
trigger: "/review"
---

# /review

## Purpose

Pre-commit quality check for mobile web code. Load code-review SKILL and run full checklist against changed files.

## Pre-conditions

- [ ] Files to review are identified (git diff or explicit list)

---

## Steps

### Step 1 -- Identify Changed Files
- Action: Run `git diff --name-only` to list all modified/new files.
  Group by type: .ts / .html / .scss / registration files
- Gate: File list known. At least 1 file to review.

### Step 2 -- Load Code-Review Skill
- Action: Read `.agent/skills/code-review/SKILL.md` fully.
  Run every checklist item against the changed files.
- Gate: Skill loaded. All 10 rule categories checked.

### Step 3 -- Check Registration Completeness
- Action: If new component added, verify ALL 4 files updated:
  1. `mtbike.module.ts` -- imported + declared
  2. `mtbike.routing.ts` -- route path matches DLLPackage
  3. `mtbike-api-static.service.ts` -- APIID keys present
  4. `mtbike-api.service.ts` -- Observable methods present
- Gate: Registration complete or confirmed not needed (enhancement only).

### Step 4 -- Build Check (MANDATORY GATE)
- Action: `ng build`
  - 0 errors -> proceed to report
  - Errors -> list ALL errors -> stop (do not auto-fix unless user asks)
- Gate: Build status confirmed.

### Step 5 -- Report

Output format (from code-review SKILL):

| Severity | File:Line | Issue | Fix |
|---|---|---|---|
| [BLOCKING] | `file.ts:45` | Missing unsubscribe | Push to arrUnsubscribe |
| [SUGGESTION] | `file.html:12` | Function in template | Use Angular Pipe |
| [OK] | - | Naming convention correct | - |

Then summary:
```
[REVIEW COMPLETE]
  Files checked: {N}
  BLOCKING issues: {N}
  SUGGESTIONS: {N}
  Build: Passed / Failed
```

---

## Banned
- DO NOT approve code that does not compile
- DO NOT skip the ng build step
- DO NOT ignore BLOCKING issues -- they must be resolved before commit
