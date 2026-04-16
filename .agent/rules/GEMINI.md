---
trigger: always_on
---

# GEMINI.md - Hoài Minh ERP Mobile Web (Angular/Ionic)

> Shared rules for ALL agents working on this Mobile workspace.

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
