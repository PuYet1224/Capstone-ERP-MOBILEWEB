---
workflow: fe-mobile-implement
role: FE-MOBILE
version: 1.0
trigger: "/fe-mobile-implement [feature-name]"
goal: "List + Detail components created (6 files), registered in 5 files (module + routing + api-static + api-service + key-local-storage.enum), ng build 0 errors"
---

# /fe-mobile-implement [feature-name]

## Purpose

Read FE Mobile guide from pipeline -> implement Angular component -> register -> build verify.

## Pre-conditions

- [ ] `FE_MOBWEB_*.md` guide file exists in `{PROJECT_PIPELINE}\guides\`
- [ ] `ng build` currently passes (no pre-existing errors)

---

## Steps

### Step 1 -- Load Skill + Read Structure (run in parallel)
- Action:
  1. Read skill: `.agent/skills/fe-pipeline/SKILL.md` (full -- all steps and rules)
  2. Read `src/app/views/mtbike/services/mtbike-api-static.service.ts` (all namespaces)
  3. Read `src/app/views/mtbike/mtbike.module.ts` (all registered components)
  4. Read `src/app/views/mtbike/mtbike.routing.ts` (all routes)
  5. List `src/app/views/mtbike/views/` to determine NEXT component number (mtb0XX)
  6. Read ONE existing component similar to the feature as reference (e.g., mtb009)
- Gate: Skill loaded + guide found. Highest mtb number known. If no guide -> STOP: "No FE Mobile guide found. Ask BA to run /ba-analyst first."

### Step 2 -- Design Reference (optional)
- Action:
  1. Try `figma_status` -- if connected: read mobile frames via figma-reader skill
  2. If not connected: scan `{PROJECT_PIPELINE}\designs\{feature}\mobile\` for PNG images
  3. If images found: analyze layout, colors, structure
  4. If nothing available: use FE guide text only
- Gate: Design source declared. Proceed regardless of outcome.

### Step 3 -- Read Guide
- Action: Scan `{PROJECT_PIPELINE}\guides\` for `FE_MOBWEB_*.md`.
  - 1 file matching feature -> read it directly
  - Multiple files -> ask user which to use
  - 0 files -> STOP: "No FE Mobile guide found."
- Gate: Guide read. API names, component number, DLLPackage confirmed.

### Step 4 -- Determine Component Location
- Action:
  ```
  NEXT_NUMBER   = highest existing mtb0XX + 1
  ABBR          = FE Mobile Abbr from guide MODULE METADATA (sal/cs/wh/crm/hrm/prt/rpt)
  COMPONENT_FOLDER = mtb{NEXT_NUMBER}-{abbr}-{feature}
  COMPONENT_PATH   = src/app/views/mtbike/views/{COMPONENT_FOLDER}/
  ```
- BANNED: `views/sal/`, new module folders, sal001/sal002 naming, hardcoding `sal` for non-Sale modules
- Gate: Component number, abbr, and path confirmed from guide MODULE METADATA.

### Step 5 -- Implement Component (Real API -- No Mock Data)
- Action: Follow fe-pipeline SKILL Steps 3-5:
  1. Write `mtb{NNN}-{abbr}-{feature}.component.ts` -- copy from mtb009 pattern, real API call
  2. Write `mtb{NNN}-{abbr}-{feature}.component.html` -- 3-part layout (header/body/footer)
  3. Write `mtb{NNN}-{abbr}-{feature}.component.scss` -- ::ng-deep wrapper, SCSS variables only
- Rule: DEFAULT is real API. No `USE_MOCK`, no `loadMockData()`.
  If API not ready -> show loading spinner while waiting.
- Gate: All 3 files created. No mock data in code.

### Step 6 -- Register in 5 Files (ALL MANDATORY)
- Action: Follow fe-pipeline SKILL Step 6:
  1. `mtbike.module.ts` -- import + add BOTH list and detail to declarations[]
  2. `mtbike.routing.ts` -- add route for list AND `{dllpackage}-detail`, path MUST match DLLPackage
  3. `mtbike-api-static.service.ts` -- add APIID keys to existing namespace
  4. `mtbike-api.service.ts` -- add Observable API methods (GetList, Get, Update, Delete)
  5. `key-local-storage.enum.ts` -- add `{FEATURE}_DETAIL` key for cache navigation
- Gate: All 5 files updated. Route path verified against DLLPackage.

### Step 7 -- Build Verify (MANDATORY GATE -- Cannot Skip)
- Action: `ng build`
  - 0 errors -> proceed to Step 8
  - Errors found -> fix all compile errors -> rebuild -> repeat
  - 3+ failures on same error -> STOP: report error to user
- Gate: `ng build` returns exit code 0. NEVER report done without this passing.

### Step 8 -- Self-Check (Run checklist from fe-pipeline SKILL)
- Action: Verify all 12 items in fe-pipeline self-check list.
- Gate: All critical items pass.

### Step 9 -- Verify Goal (MANDATORY before reporting done)
- Action: Re-read the `goal:` field from this workflow's frontmatter. Check EACH condition:
  - [ ] List component: 3 files exist (.ts, .html, .scss)
  - [ ] Detail component: 3 files exist (.ts, .html, .scss)
  - [ ] Registered in 5 files: mtbike.module.ts, mtbike.routing.ts, api-static, api-service, key-local-storage.enum
  - [ ] `ng build` returned 0 errors
- If ALL conditions met → proceed to Step 10 (Report)
- If ANY condition not met → fix it NOW, then re-verify. Do NOT skip to Report.
- Gate: Every condition in goal: field confirmed true.

### Step 10 -- Report to User (STOP -- Do Not Deploy)

```
[OK] Mobile FE Implementation Complete
  Feature:   {FeatureName}
  Component: mtb{NNN}-{abbr}-{feature} (Mtb{NNN}{Abbr}{Feature}Component)
  Files created:
    - src/app/views/mtbike/views/mtb{NNN}-{abbr}-{feature}/
      (3 files: .ts, .html, .scss)
  Registered: mtbike.module.ts, mtbike.routing.ts, api-static, api-service
  API: Real API (no mock data)
  Build: ng build -- 0 errors [OK]

[!] YOUR TURN:
  1. Review the code
  2. Test on mobile browser (route: /mtbike/{dllpackage})
  3. If API 404: logout + login on FE (or call GetConfig via Postman)
  4. Deploy when ready
```
