---
description: Systematic debugging for mobile web. Use when builds break, runtime errors occur, or UI behaves unexpectedly. Usage /debug
skills:
  - debug
  - fe-mobile-pipeline
---

# /debug — Systematic Bug Fix

## STEP 1: Understand the Bug
- What is the expected behavior?
- What is the actual behavior?
- When did it start happening? (after which change?)

## STEP 2: Follow Debug Skill
- Load and follow the `debug` skill triage checklist
- Do NOT skip steps — work through in order

## STEP 3: Verify Fix
```
ng build                    # Must pass
ng serve                    # Manual test on 375px viewport
```

## STEP 4: Report
```
✅ Bug fixed:
   Root cause: {description}
   Fix: {what was changed}
   Files: {list of modified files}
   Build: Passed
```

## BANNED
- DO NOT guess at fixes without reproducing
- DO NOT refactor during debugging
- DO NOT swallow errors with try/catch
