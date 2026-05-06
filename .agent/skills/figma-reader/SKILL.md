---
name: figma-reader
description: >
  Figma MCP live reader for Angular + Kendo UI frontend implementation.
  Use when implementing any UI screen — reads Figma design and maps to Angular components.
  Triggered automatically on UI tasks: implement, code, build UI, fix UI, update screen.
  Design source priority: 1) Figma MCP live 2) pipeline design images 3) STOP.
  Only reads BODY content — always skips sidebar, header, and footer nodes.
---

# Figma Reader — Body Content Only

> **Auto-trigger** on every UI coding task.
> **BODY ONLY:** Never implement sidebar, header, or footer — they're handled by the layout system.

---

## Phase 0 — Connection Check

```
1. Call figma_status
   ├── CONNECTED → Phase 1 (live read)
   └── NOT CONNECTED → Scan {PROJECT_PIPELINE}\designs\ for PNGs
       ├── FOUND → Declare: "[From design archive — not live Figma]"
       └── NOT FOUND → STOP. Ask user for design source.
```

---

## Phase 1 — Read Figma (Body Node Only)

1. `figma_read → get_selection → depth: 6, detail: "compact"`
2. **FILTER:** Find the BODY content node — skip sidebar/header/footer
   - Skip nodes named: Sidebar, Nav, Header, Footer, Top bar, Bottom bar
   - Select the LARGEST node, usually positioned right of sidebar, below header
3. `figma_read → get_css → nodeId: <BODY_NODE_ID>`
4. `figma_read → get_design → nodeId: <BODY_NODE_ID> → depth: 6`

---

## Phase 2 — Map to Code

**Color mapping:** Read `src/assets/scss/_colors.scss` for variable names.
Never use raw hex — map every Figma color to a `$variable`.

**Component mapping:** See [references/component-mapping.md](references/component-mapping.md)
for the Figma element → Angular component lookup table.

**Filter bar rules:** See [references/filter-bar-rules.md](references/filter-bar-rules.md)
for the decision tree when implementing filter bars.

---

## Phase 3 — Verify

```
figma_read → screenshot → nodeId: <BODY_NODE_ID>
```
Compare Figma screenshot vs rendered code → adjust if mismatched.

---

## What to Skip vs Code

```
❌ NEVER CODE: sidebar, header, navbar, footer, navigation — layout system handles these
✅ ONLY CODE: cards, forms, lists, status badges, dialogs, filter bars — body content
```
