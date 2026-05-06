---
description: Enhance or improve an existing mobile web feature. Use when user wants to add functionality, improve UX, or optimize an existing screen. Usage /enhance
skills:
  - coding-standard
  - code-review
---

# /enhance — Improve Existing Mobile Feature

## STEP 1: Understand the Enhancement
- What existing feature is being improved?
- What is the desired change?
- Locate the existing component files

## STEP 2: Read Current Code
- Read the existing component (.ts, .html, .scss) **fully** before making changes
- Read the existing service and DTO files
- Understand current data flow and API calls
- **Identify all methods, their signatures, and brace scoping** — never partially edit a method

## STEP 3: Plan Changes
- List specific files to modify
- Identify if new APIs, DTOs, or enums are needed
- Check if design reference exists in `{PROJECT_PIPELINE}\designs\`

## STEP 4: Implement
- Make changes incrementally (one logical change at a time)
- Follow `fe-mobile-pipeline` skill patterns
- Follow `clean-code` skill standards
- **Run `ng build` after EACH file edit** — do NOT batch multiple file edits before verifying

## STEP 5: Build Verification (MANDATORY — NEVER SKIP)
// turbo
```powershell
ng build 2>&1 | Select-Object -Last 30
```
- If build fails → **FIX immediately** before doing anything else
- If build passes → proceed to report
- **NEVER report success without a passing build**

## STEP 6: Report
```
✅ Enhancement complete:
   Feature: {feature name}
   Changes: {description}
   Files modified: {list}
   Files created: {list}
   Build: Passed (exit code 0)
```

## 🔴 BANNED (VIOLATION = BROKEN CODE)
- DO NOT rewrite entire components when small changes suffice
- DO NOT change unrelated code during enhancement
- DO NOT skip build verification — **this is the #1 cause of broken code**
- DO NOT partially replace methods — always include complete opening AND closing braces
- DO NOT use multi_replace_file_content on large code blocks — prefer replace_file_content for single contiguous edits
- DO NOT leave template string literals without backtick prefix (`` ` ``) — every `${variable}` must be inside backtick-quoted strings
- DO NOT mix method bodies when replacing code — always verify brace matching after edit
- DO NOT report "task complete" if `ng build` has not been run or has errors

## 🔴 ENCODING SAFETY RULES
- When editing files with Vietnamese text, preserve exact Unicode characters
- Never strip or corrupt backtick (`` ` ``) characters from template string literals
- After replacing code, **verify the replacement** by reading back the edited lines with `view_file`
