---
name: fe-pipeline
description: Senior Mobile Web developer skill for Hoai Minh ERP Angular 16 mobile frontend. Covers Product=3 DB rule, DLL namespace chaprint, mobile API patterns (no toDataSourceRequest), registration checklist, and common mobile bugs. Do NOT use for desktop FE.
version: 1.0.0
---

# FE Pipeline Skill -- Senior Mobile Web Developer (HM ERP Angular Mobile)

> **Stack:** Angular 16 + Kendo UI 13 + TypeScript (mobile-optimized)
> **Mobile Workspace:** `{FE_MOBILE_ROOT}\`
> **Standards reference:** `{BA_ROOT}\.agent\projects\hoaiminh\standards\fe-standards.md`
> **Master coding guide:** `src/app/instructions.md` (READ THIS FIRST)
> **Guide input:** `{PIPELINE_ROOT}\guides\FE_MOBWEB_{SEQ}_{Feature}.md`
> **Platform:** MOBILE ONLY -- Web guides use FE_WEB_* -> read Capstone-ERP-WEB workspace

---

## 1. 🔴 MANDATORY: Read Before ANY Code

```
STEP 0: {BA_ROOT}\.agent\projects\hoaiminh\standards\fe-standards.md
STEP 1: src/app/instructions.md         ← Master coding guide (18 sections)
STEP 2: .agent/skills/mobile-design/SKILL.md ← Angular mobile patterns
STEP 3: Read reference component from src/app/views/mtbike/views/mtb00X-{existing}/
```

> 🔴 DO NOT write any HTML/TS before reading the reference component.

---

## 2. 🔴 CRITICAL: Product = 3 (Mobile DB Rule)

```
DB tbl_SYSFunction.Product:
  Desktop = 1    (Capstone-ERP-WEB)
  Mobile  = 3    (Capstone-ERP-MOBILEWEB) ← ALWAYS 3 for this workspace
```

### DLL Namespace Chaprint
```
DB tbl_SYSFunction.DLLPackage = 'consultant'   ← must match static field
         ↓
mtbike-api-static.service.ts:
  export const fconsultant = { GetListWOMConsultant: '', ... }
         ↓
MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListWOMConsultant
         ↓
component calls MtbikeApiService.GetListWOMConsultant(filter)
```

**Verify Product before coding:**
```sql
SELECT Code, DLLPackage, Product FROM tbl_SYSFunction WHERE DLLPackage = 'yourFeature'
-- Product MUST be 3 for mobile features
```
If Product = 1 but feature is mobile -> fix DB:
```sql
UPDATE tbl_SYSFunction SET Product = 3 WHERE DLLPackage = 'yourFeature'
```

---

## 3. API Service Pattern (Mobile)

```typescript
// mtbike-api-static.service.ts -- ADD your namespace:
export const f{feature} = {
  GetList{Entity}: '',
  Get{Entity}: '',
  Update{Entity}: '',
  Delete{Entity}: '',
};

// MtbikeApiService -- ADD methods:
public GetList{Entity}(filter: State): Observable<ResponseDTO> {
  return new Observable<ResponseDTO>((obs) => {
    this.api.post(
      MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetList{Entity},
      filter   // Mobile: send filter State directly (no toDataSourceRequest)
    ).subscribe(
      (res: ResponseDTO) => { obs.next(res); obs.complete(); },
      (errors) => { obs.error(errors); obs.complete(); }
    );
  });
}
```

> ⚠️ **Mobile vs Desktop API difference:**
> - Desktop: `toDataSourceRequest(filter)` (Kendo DataSourceRequest format)
> - Mobile: sends filter `State` directly (BE handles accordingly)
> - Mobile response: `res.ObjectReturn` is array directly -- not `.Data`/`.Total` wrapper
> - Check guide to confirm exact format for each feature

---

## 4. Color System -- SCSS Variables (SAME as Desktop)

```scss
$primary            // #126433 -- HM brand green
$secondary          // #3c4858
$error              // #e5322b
$warning            // #CD9000
$printfo               // #0074FF
$success            // #126433 (same as primary)
$white              // #ffffff
$border             // #979B9B
$background-primary // #EEEEEE
$grey-400           // #bdbdbd
$grey-500           // #9e9e9e
$grey-600           // #757575
```

---

## 5. Registration Checklist (5 Files -- ALL MANDATORY)

| # | File | What to Add |
|---|------|-------------|
| 1 | `mtbike.module.ts` | import + declare component |
| 2 | `mtbike.routing.ts` | add route `{ path: '...', component: ...}` |
| 3 | `mtbike-api-static.service.ts` | add `export const f{feature} = {...}` |
| 4 | `mtbike-api.service.ts` | add Observable API method(s) |
| 5 | `key-local-storage.enum.ts` | add key if page-to-page data passing needed |

---

## 6. Common Mobile Bugs

| # | Bug | Symptom | Fix |
|---|-----|---------|-----|
| 1 | `Product = 1` on mobile feature | API printvisible to mobile logprint | Fix DB: `Product = 3` for mobile functions |
| 2 | `toDataSourceRequest` used on mobile | BE rejects format | Mobile sends raw `State`, not DataSourceRequest |
| 3 | `res.ObjectReturn.Data` on mobile | No data | Mobile: `res.ObjectReturn` is array directly |
| 4 | Missing `cdr.markForCheck()` | Data loads but UI frozen | Add after every async data change (OnPush) |
| 5 | No `observer.disconnect()` | Memory leak on navigate | Add in `ngOnDestroy()` |
| 6 | Scroll jumps on iOS | Janky scroll | Add `-webkit-overflow-scrollprintg: touch` |
| 7 | Click not responding on touch | Ghost click delay | Use `(touchstart)` for faster response |
| 8 | `onSuccess()` on GetList | Annoyprintg toast | Only for CUD (Create/Update/Delete) |

---

## 7. "Truyền data between trang" Pattern (PsCache)

```typescript
// Page A (list) -> navigate to detail:
this.cache.setItem(KeyLocalStorageEnum.{FEATURE}_MASTER, selectedItem);
this.router.navigate(['/mtbike/{feature}/detail']);

// Page B (detail) -> read:
const temp = this.cache.getItem(KeyLocalStorageEnum.{FEATURE}_MASTER);
this.masterData = this.cache.parseValue(temp) as {Entity}CusDTO;
```

> 🔴 NEVER use `@Input/@Output` for page-to-page data. Use PsCache only.
