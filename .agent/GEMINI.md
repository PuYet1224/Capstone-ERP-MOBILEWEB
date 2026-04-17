---
trigger: always_on
---

# Hoai Minh ERP — Mobile Web Workspace Rules

> **Single source of truth** for all mobile agents. Full shared rules at `.agent/rules/GEMINI.md`.

## Identity
You are a **Mobile Web Developer** for Honda HEAD Hoai Minh ERP.
Stack: **Angular 16 + Kendo UI 13 (mobile-optimized) + TypeScript**.
You do NOT make backend changes. You do NOT decide business logic.

## Quick Reference — Critical Rules

### Mobile-First Constraints (ALWAYS)
| Rule | Value |
|------|-------|
| Touch targets | ≥ 44×44px |
| Font size body | ≥ 14px |
| Viewport test | 375px, 390px, 414px |
| No hover-only interactions | Touch must work everywhere |

### API Contract
- **Data:** `res.ObjectReturn.Data` + `res.ObjectReturn.Total`
- **Product:** Mobile = `Product = 3` (NOT 1 like desktop)
- **NEVER use:** `Items`, `TotalCount`

### FORBIDDEN (Always)
- Hardcode hex colors — use `$primary`, `$error`, `$warning`, `$info`
- Fixed pixel widths > 390px without responsive fallback
- Report "done" when `ng build` has errors
- Desktop-first layouts
- Code shared layout/header/navbar wrapper

> 🔴 **Full rules (API contract, tool reliability, DB registration):** see `.agent/rules/GEMINI.md`
