---
description: Enhance or improve an existing mobile web feature. Use when user wants to add functionality, improve UX, or optimize an existing screen. Usage /enhance
skills:
  - fe-mobile-pipeline
  - mobile-design
  - clean-code
---

# /enhance — Improve Existing Mobile Feature

## STEP 1: Understand the Enhancement
- What existing feature is being improved?
- What is the desired change?
- Locate the existing component files

## STEP 2: Read Current Code
- Read the existing component (.ts, .html, .scss)
- Read the existing service and DTO files
- Understand current data flow and API calls

## STEP 3: Plan Changes
- List specific files to modify
- Identify if new APIs, DTOs, or enums are needed
- Check if design reference exists in `{PROJECT_PIPELINE}\designs\`

## STEP 4: Implement
- Make changes incrementally (one logical change at a time)
- Follow `fe-mobile-pipeline` skill patterns
- Follow `clean-code` skill standards
- Verify `ng build` after each significant change

## STEP 5: Verify
```powershell
ng build                    # Must pass
ng serve                    # Manual test on mobile viewport
```

## STEP 6: Report
```
✅ Enhancement complete:
   Feature: {feature name}
   Changes: {description}
   Files modified: {list}
   Files created: {list}
   Build: Passed
```

## BANNED
- DO NOT rewrite entire components when small changes suffice
- DO NOT change unrelated code during enhancement
- DO NOT skip build verification
