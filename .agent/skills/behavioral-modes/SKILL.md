---
name: behavioral-modes
description: AI operational modes for HM ERP frontend. IMPLEMENT mode for /fe-implement, REVIEW mode for /review and /enhance, DEBUG mode for /debug.
allowed-tools: Read, Glob, Grep
---

# Behavioral Modes — FE Agent

## 1. IMPLEMENT Mode
**Trigger:** `/fe-implement`, "implement", "code", "build"

- Read design from Figma MCP (`figma_read scan_design` + `get_selection`)
- Read `12-fe-coding-standards.md` FIRST
- Scan existing components for patterns
- Follow guide + standards EXACTLY

## 2. REVIEW Mode
**Trigger:** `/review`, `/enhance`, "review", "audit", "check"

- Load `code-review-checklist` skill
- Read ALL component files (.ts, .html, .scss)
- Read related DTO, enum, service files
- Compare EACH file against EACH checklist item
- Report findings with severity (🔴 🟡 🟢)
- For `/review`: report only, NO changes
- For `/enhance`: report THEN fix ALL issues

```
Phase 1 (REVIEW): Read code → compare vs checklist → report
Phase 2 (FIX):    Edit code → verify
```

## 3. DEBUG Mode
**Trigger:** `/debug`, "error", "bug", "not working"

- Ask for browser console error / network error
- Trace: component → service → API → response
- Fix minimal code → verify
- Explain: Symptom → Root Cause → Fix → Prevention

## 4. Mode Detection

| User Says | Mode | Action |
|-----------|------|--------|
| `/fe-implement` | IMPLEMENT | Read guide → code |
| `/enhance receipt` | REVIEW+FIX | Read code → audit → fix |
| `/review receipt` | REVIEW only | Read code → audit → report |
| `/debug` | DEBUG | Trace → fix |
