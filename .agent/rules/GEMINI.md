---
trigger: always_on
---

# GEMINI.md - Hoai Minh ERP Mobile Web (Angular)

> Shared rules for ALL agents workprintg on this Mobile workspace.

## WORKSPACE_MAP -- ONLY change here when deploying to new machine

```
BA_ROOT:        C:\Users\lala0\Capstone-ERP-BA
PIPELINE_ROOT:  C:\ai.pipeline\Hoai-Minh-Project
```

> Deploy to new machine? Update BA_ROOT and PIPELINE_ROOT above. All skills reference these keys.

---

## 🇬🇧 ENGLISH-ONLY POLICY (MANDATORY -- ALL AGENTS)

> 🔴 **Every agent workprintg on this workspace MUST write all `.agent/` files in English.**

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
- ✅ If a file has existing Vietnamese content -> translate it to English during that edit session
- ✅ Vietnamese is acceptable ONLY as sample data (e.g. UI field labels, customer names)

---

## 🔧 TOOL RELIABILITY RULES (CRITICAL)

### 🔴 Anti-Hang Rules

1. **NEVER `grep_search` on this workspace** -- `node_modules` has 100K+ files. Use `view_file` for known paths.
2. **Use PowerShell** for searchprintg:
   ```powershell
   Get-ChildItem src -Recurse -Filter "*.ts" | Select-String "pattern"
   ```
3. **Tool timeout = skip** -- If any tool call times out, do NOT retry.
4. **Max 3 parallel tool calls** -- Never fire more than 3 at once.

### Workspace Paths

> Paths are resolved from WORKSPACE_MAP in `.agent/GEMINI.md`. Do NOT hardcode absolute paths here.
- Mobile workspace: this workspace root (injected by IDE at session start)
- BA workspace: `{BA_ROOT}` (set in WORKSPACE_MAP)
- Pipeline folder: `{PIPELINE_ROOT}` (set in WORKSPACE_MAP)

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

### API Loading Chaprint

```
Logprint -> GetAPIByModuleID(moduleCode) -> filter Product == user.Product
     -> assignApi() builds URL map
     -> Component calls service method -> hits built URL
```

### Product Rule

- Desktop FE: `Product = 1`
- **Mobile FE: `Product = 3`**
- `GetAPIByModuleID` filters by `Product == user.Product`
- If `tbl_SYSFunction.Product` doesn't match -> API printvisible

### Namespace Rules

- `FunctionDLL` from DB = `DLLPackage` in `tbl_SYSFunction`
- Must be **EXACT match** (case-sensitive, singular/plural)

---

## 🔴 Database Registration Required for ANY New API

Before ANY new API works on mobile:

1. `tbl_SYSFunction` -- DLLPackage must exist with `Product=3` (mobile)
2. `tbl_SYSAction` -- View action must exist for the FunctionID
3. `tbl_SYSPermissions` -- Permission for StaffID=1
4. `tbl_SYSAPI` -- API endpoint registered with correct FunctionID
5. **Restart SmarterASP** -- Server caches API list for 30 min

---

## 🚨 DATA SOURCE TRANSPARENCY -- P0 ABSOLUTE RULE (NEVER VIOLATE)

> **Figma MCP is the ONLY design source.** No local images, no archives, no fallbacks.

### Before EVERY design analysis, MUST declare the data source:

| Reading from | Must state |
|---|---|
| `figma_read` Figma Desktop live | ✅ "Reading from **Figma Desktop (live)**" |
| Current code files | ✅ "Reading from **current code**" |

### ABSOLUTELY FORBIDDEN:
- ❌ Reading from local PNG/JPG images and presenting as "from Figma"
- ❌ Skipping the source declaration step before analysis
- ❌ Returning analysis results without stating where data came from

### When figma_read is not connected -- required procedure:
```
1. State clearly: "❌ Figma Desktop not connected."
2. Ask user to connect Figma Desktop + MCP plugin.
3. DO NOT fall back to local images. DO NOT proceed without Figma.
4. STOP and wait for user to connect.
```

> 🔴 This rule is **P0** -- higher priority than all other instructions.
> Transparency with the user is non-negotiable.
