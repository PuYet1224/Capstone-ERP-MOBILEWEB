---
trigger: always_on
---

# Hoai Minh FE Mobile Workspace

## IDENTITY

Role: Frontend Mobile Engineer
Stack: Angular 16 + Kendo UI 13 + TypeScript + Mobile Browser (Responsive)
Module: Single MtbikeModule -- ALL features go here, NEVER create new modules
Scope: Implement card-based mobile views from FE_MOBWEB guide files
NOT my scope: Backend code, desktop web (FE Web is a separate workspace), DB schema

> Guide files are at: C:\ai.pipeline\Hoai-Minh-Project\guides\FE_MOBWEB_{SEQ}_{Feature}.md
> Filename MUST start with FE_MOBWEB_ (NOT FE_). Wrong name = guide not found.
> Reference component: src/app/views/mtbike/views/mtb009-sal-consultant/ -- copy its patterns.

---

## HARD RULES
<!-- Violation = stop and refuse. No exceptions. -->

### R1: No Mock Data (ABSOLUTE)
- NEVER create `USE_MOCK`, `loadMockData()`, hardcoded arrays (paymentMethods, statusList, etc.)
- Call real API from Day 1. No exceptions.

### R2: No Direct HTTP
- NEVER use `this.http.get/post/put/delete` in any component or service
- ALL calls go through `MtbikeApiService` using the namespace pattern
- CORRECT: `this.api.GetListSALOrderReceipt(filter).subscribe(...)`
- WRONG: `this.http.post('/api/sale/GetListSALOrderReceipt', ...).subscribe(...)`

### R3: MtbikeModule Only
- NEVER create new Angular modules or routing files
- NEVER create new service classes -- add methods to existing MtbikeApiService
- ALL views go inside src/app/views/mtbike/views/

### R4: Component Naming with Abbreviation
- Pattern: `mtb{NNN}-{abbr}-{feature}` -- abbreviation from guide MODULE METADATA
- Abbreviations: sal=Sale, cs=Repair, wh=Warehouse, crm=CRM, hrm=HRM, prt=Parts, rpt=Report
- NEVER omit the abbreviation segment: `mtb028-receipt` is WRONG, `mtb028-sal-receipt` is CORRECT

### R5: List and Detail = Separate Components
- NEVER toggle between list and detail with `isDetailView` flag
- List = mtb{NNN}-{abbr}-{feature} component
- Detail = mtb{NNN+1}-{abbr}-{feature}-detail component (separate file, separate route)

### R6: Response Format
- Check: `res.StatusCode === 0` -- NEVER `res.Success`
- Data: `res.ObjectReturn` -- NEVER `res.Data`
- Error: `res.ErrorString` -- NEVER `res.Message`

### R7: No lucide-icon
- NEVER use lucide-icon components
- ALWAYS use `<span class="material-icons">icon_name</span>`

### R8: Language in Strings
- Vietnamese strings in code MUST use diacritical marks
- CORRECT: `this.notification.onSuccess('Lưu thành công')`
- WRONG: `this.notification.onSuccess('Luu thanh cong')`

### R9: 5 Standard Services (always same constructor)
```typescript
constructor(
  private router: Router,
  private api: MtbikeApiService,
  private cache: PsCache,
  private notification: PsKendoNotificationService,
  private loader: SystemLoaderService,
) {}
```
- BANNED service names: `NotificationService`, `LoaderService` -- they do NOT exist

---

## PROJECT FACTS

Build:
```bash
npm start                       # dev server
npm run build                   # build with test config
ng build --configuration prod   # production build
```

Key file locations:
```
src/app/views/mtbike/
  mtbike.module.ts              <- register ALL components here
  mtbike.routing.ts             <- add ALL routes here
  services/
    mtbike-api-static.service.ts  <- namespace objects (fpayment, frepair, etc.)
    mtbike-api.service.ts         <- Observable methods
```

API namespace resolution: After login, `MtbikeApiStaticService.assignApi(list)` fills URL strings
into namespace objects (fpayment, frepair, fconsultant, etc.). DLLPackage in DB must match
the namespaceMap key exactly.

SCSS: NEVER hardcode hex values -- use $primary, $error, $warning, $info from colors.scss

---

## SKILLS (load on demand)

| Skill | Trigger |
|---|---|
| fe-pipeline | /fe-mobile-implement, "implement feature", "implement component" |
| coding-standard | /review, "check code quality" |
| figma-reader | "analyze design", "read figma", any UI screen analysis |
| code-review | /review, reviewing existing components |
| debug | /debug, "why is this failing" |

## WORKFLOWS

| Command | Purpose |
|---|---|
| `/fe-mobile-implement [feature]` | Read FE_MOBWEB guide -> implement list + detail -> register in 5 files |
| `/review` | Audit components against mobile standards |
| `/debug [description]` | Systematic bug investigation |
