---
trigger: always_on
---

# GEMINI.md - Capstone ERP Mobile Web (Angular)

> Rules for all agents working on the Mobile workspace.
> **Purpose:** Implement mobile web components for Capstone ERP.
> **Tech stack:** Angular 16, Kendo UI 13, TypeScript, mobile browser (NOT React Native, NOT Flutter).

---

## ENGLISH-ONLY POLICY (MANDATORY -- ALL AGENTS)

> Every agent working on this workspace MUST write all `.agent/` files in English.

| Applies To | Rule |
|------------|------|
| **Skills** (`.agent/skills/**/*.md`) | Write and edit in English only |
| **Workflows** (`.agent/workflows/*.md`) | Write and edit in English only |
| **Rules** (`.agent/rules/*.md`) | Write and edit in English only |
| **GEMINI.md files** | Write and edit in English only |
| **AI responses** | English preferred; Vietnamese allowed ONLY when the user writes in Vietnamese |

**When creating or editing any `.agent/` file:**
- NEVER write instructions, comments, section headers, or labels in Vietnamese
- NEVER mix Vietnamese and English in the same skill/workflow file
- If a file has existing Vietnamese content -> translate it to English during that edit session
- Vietnamese is acceptable ONLY as sample data (e.g. UI field labels, customer names)

---

## TOOL RELIABILITY RULES (CRITICAL)

### Anti-Hang Rules

1. **NEVER `grep_search` on this workspace** -- `node_modules` has 100K+ files. Use `view_file` for known paths.
2. **Use PowerShell** for searching:
   ```powershell
   Get-ChildItem src -Recurse -Filter "*.ts" | Select-String "pattern"
   ```
3. **Tool timeout = skip** -- If any tool call times out, do NOT retry.
4. **Max 3 parallel tool calls** -- Never fire more than 3 at once.

### WORKSPACE_MAP -- Change here when deploying to new machine

```
MOBILE_ROOT:        C:\Users\lala0\Capstone-ERP-MOBILEWEB
BA_ROOT:            C:\Users\lala0\Capstone-ERP-BA
PIPELINE_ROOT:      C:\ai.pipeline
PROJECT_PIPELINE:   {PIPELINE_ROOT}\Capstone-ERP-Project
```

> Deploy to new machine? Update MOBILE_ROOT, BA_ROOT and PIPELINE_ROOT above.

---

## BE/FE API Contract (MUST FOLLOW)

### Response Format Convention

**ALL BE list handlers return:**
```json
{
  "StatusCode": 0,
  "ObjectReturn": {
    "Total": 100,
    "Data": [...]
  }
}
```

**FE reads:** `res.ObjectReturn.Data` + `res.ObjectReturn.Total`

### API Loading Chain

```
Login -> GetAPIByModuleID(moduleCode) -> filter Product == user.Product
     -> assignApi() builds URL map
     -> Component calls service method -> hits built URL
```

### Product Rule

- Desktop FE: `Product = 1`
- **Mobile FE: `Product = 3`**
- `GetAPIByModuleID` filters by `Product == user.Product`
- If `tbl_SYSFunction.Product` doesn't match -> API invisible

### Namespace Rules

- `FunctionDLL` from DB = `DLLPackage` in `tbl_SYSFunction`
- Must be **EXACT match** (case-sensitive, singular/plural)

---

## Database Registration Required for ANY New API

Before ANY new API works on mobile:

1. `tbl_SYSFunction` -- DLLPackage must exist with `Product=3` (mobile)
2. `tbl_SYSAction` -- View action must exist for the FunctionID
3. `tbl_SYSPermissions` -- Permission for StaffID=1
4. `tbl_SYSAPI` -- API endpoint registered with correct FunctionID
5. **Restart Server / App Pool** -- Server caches API list for 30 min

---

## DATA SOURCE TRANSPARENCY -- P0 ABSOLUTE RULE (NEVER VIOLATE)

> **Why this rule exists:** AI previously read local PNG files but presented findings as if reading from live Figma. This is misleading and strictly prohibited.

### Before EVERY design analysis, MUST declare the data source:

| Reading from | Must state |
|---|---|
| `figma_read` Figma Desktop live | "Reading from **Figma Desktop (live)**" |
| `{PROJECT_PIPELINE}\designs\{feature}\*.png` | "Reading from **pipeline design images**" |
| `{PIPELINE_ROOT}\designs\*.png` | "Reading from **pipeline images**" |
| Current code files | "Reading from **current code**" |

### ABSOLUTELY FORBIDDEN:
- `figma_read` fails -> silently reading local files without informing the user
- Analyzing archive images but saying "per Figma" or "from Figma"
- Skipping the source declaration step before analysis
- Returning analysis results without stating where data came from

### When figma_read fails -- required procedure:
```
1. State clearly: "figma_read failed -- Figma Desktop not connected."
2. Scan {PROJECT_PIPELINE}\designs\{feature}\ for PNG images.
3. If images FOUND -> auto-proceed, declare: "[Reading from pipeline design images - not live Figma]"
4. If NO images found -> state: "No design images available. Using FE guide text only."
5. NEVER say "from Figma" when reading local images.
```

> This rule is **P0** -- higher priority than all other instructions.
> Transparency with the user is non-negotiable.