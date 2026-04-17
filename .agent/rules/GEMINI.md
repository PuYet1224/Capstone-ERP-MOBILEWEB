---
trigger: always_on
---

# GEMINI.md - Hoai Minh ERP Mobile Web (Angular)

> Shared rules for ALL agents working on this Mobile workspace.

---

## 🇬🇧 ENGLISH-ONLY POLICY (MANDATORY — ALL AGENTS)

> 🔴 **Every agent working on this workspace MUST write all `.agent/` files in English.**

| Applies To | Rule |
|------------|------|
| **Skills** (`.agent/skills/**/*.md`) | Write and edit in English only |
| **Workflows** (`.agent/workflows/*.md`) | Write and edit in English only |
| **Rules** (`.agent/rules/*.md`) | Write and edit in English only |
| **GEMINI.md files** | Write and edit in English only |
| **AI responses** | English preferred; Vietnamese allowed ONLY when the user writes in Vietnamese |

**When creating or editing any `.agent/` file:**
- ❌ NEVER write instructions, comments, section headers, or labels in Vietnamese
- ❌ NEVER mix Vietnamese and English in the same skill/workflow file
- ✅ If a file has existing Vietnamese content → translate it to English during that edit session
- ✅ Vietnamese is acceptable ONLY as sample data (e.g. UI field labels, customer names)

---

## 🔧 TOOL RELIABILITY RULES (CRITICAL)

### 🔴 Anti-Hang Rules

1. **NEVER `grep_search` on this workspace** — `node_modules` has 100K+ files. Use `view_file` for known paths.
2. **Use PowerShell** for searching:
   ```powershell
   Get-ChildItem src -Recurse -Filter "*.ts" | Select-String "pattern"
   ```
3. **Tool timeout = skip** — If any tool call times out, do NOT retry.
4. **Max 3 parallel tool calls** — Never fire more than 3 at once.

### Workspace Paths

- Mobile workspace: `C:\Users\lala0\Capstone-ERP-MOBILEWEB`
- BE workspace: `C:\Users\lala0\Capstone-ERP-API-VSA`
- FE Desktop workspace: `C:\Users\lala0\Capstone-ERP-WEB`

---

## 🔴 BE/FE API Contract (MUST FOLLOW)

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
Login → GetAPIByModuleID(moduleCode) → filter Product == user.Product
     → assignApi() builds URL map
     → Component calls service method → hits built URL
```

### Product Rule

- Desktop FE: `Product = 1`
- **Mobile FE: `Product = 3`**
- `GetAPIByModuleID` filters by `Product == user.Product`
- If `tbl_SYSFunction.Product` doesn't match → API invisible

### Namespace Rules

- `FunctionDLL` from DB = `DLLPackage` in `tbl_SYSFunction`
- Must be **EXACT match** (case-sensitive, singular/plural)

---

## 🔴 Database Registration Required for ANY New API

Before ANY new API works on mobile:

1. `tbl_SYSFunction` — DLLPackage must exist with `Product=3` (mobile)
2. `tbl_SYSAction` — View action must exist for the FunctionID
3. `tbl_SYSPermissions` — Permission for StaffID=1
4. `tbl_SYSAPI` — API endpoint registered with correct FunctionID
5. **Restart SmarterASP** — Server caches API list for 30 min

---

## 🚨 DATA SOURCE TRANSPARENCY — P0 ABSOLUTE RULE (NEVER VIOLATE)

> **Why this rule exists:** AI previously read PNG files from `.design-archive` locally but presented findings as if reading directly from live Figma. This is misleading and strictly prohibited.

### Before EVERY design analysis, MUST declare the data source:

| Reading from | Must state |
|---|---|
| `figma_read` Figma Desktop live | ✅ "Reading from **Figma Desktop (live)**" |
| `.design-archive/*.png` | ✅ "Reading from **archived images** at `.design-archive/`" |
| `C:\ai.pipeline\designs\*.png` | ✅ "Reading from **pipeline images**" |
| Current code files | ✅ "Reading from **current code**" |

### ABSOLUTELY FORBIDDEN:
- ❌ `figma_read` fails → silently reading local files without informing the user
- ❌ Analyzing archive images but saying "per Figma" or "from Figma"
- ❌ Skipping the source declaration step before analysis
- ❌ Returning analysis results without stating where data came from

### When figma_read fails — required procedure:
```
1. State clearly: "figma_read failed — Figma Desktop not connected."
2. Ask user: "Use images from .design-archive as fallback?"
3. ONLY use local images AFTER user confirms.
4. Always label: "[Analysis from archive image — not live Figma]"
```

> 🔴 This rule is **P0** — higher priority than all other instructions.
> Transparency with the user is non-negotiable.
