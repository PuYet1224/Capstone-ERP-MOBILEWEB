---
skill: figma-reader
role: FE-MOBILE
version: 1.0
trigger: "'analyze design', 'read figma', 'what does screen look like', 'UI', 'screen'"
---

# Figma Reader Skill (Mobile Web)

## Purpose

Extract UI structure, colors, spacing, and component mapping from Figma mobile frames.
Focused on mobile viewport (375px width).

## Hard Rules

- RULE-FG-01: ALWAYS declare data source before any design analysis
- RULE-FG-02: NEVER say "from Figma" when reading local images
- RULE-FG-03: NEVER output raw hex colors -- map to SCSS variable

## Steps

### Phase 0 -- Connection Check
- Action: Call `figma_status`.
  - Connected -> proceed to Phase 1
  - Not connected -> scan pipeline images (Phase 2)
- Gate: Source declared before analysis.

### Phase 1 -- Figma Live Read
- State: "Reading from Figma Desktop (live)"
- Action:
  1. `figma_read operation: "get_selection" depth: 6` -- get mobile frame
  2. Focus on mobile viewport (375px width frames)
  3. `figma_read operation: "get_css" nodeId: <nodeId>`
  4. `figma_read operation: "get_design" nodeId: <nodeId> depth: 6`

### Phase 2 -- Pipeline Images Fallback
- State: "Reading from pipeline design images"
- Action: Scan `{PROJECT_PIPELINE}\designs\{feature}\mobile\` for PNG files.
  If found -> read and analyze.
  If not found -> state: "No design images available. Using FE guide text only."

---

## Design-to-Code Mapping (Mobile)

| Figma Element | Angular Component |
|---|---|
| Figma color hex | SCSS variable ($primary, $error, $warning, etc.) |
| Auto Layout vertical | `display: flex; flex-direction: column` |
| Header bar | `<ps-header-back>` (56px fixed top) |
| Footer bar | `<ps-footer-action>` (fixed bottom) |
| Button | `<ps-kendo-button>` |
| Text input | `<ps-kendo-textbox>` |
| Dropdown | `<ps-kendo-dropdown-list>` |
| Card list | `.card` divs inside `.body-list` (scrollable) |
| Dialog | `<ps-dialog-confirm>` |
| Status chip | Status pipe (e.g., SALOrderMasterStatusRetail) |

## Mobile Extraction Checklist

- [ ] Card layout: flat list or grouped by status?
- [ ] Card content: which fields shown? label-value pairs?
- [ ] Status badges: how many variants? what colors?
- [ ] Amount format: Vietnamese dot separator (e.g., 252.282.000d)?
- [ ] Touch targets: all buttons/links >= 44px?
- [ ] Expand/collapse: do cards expand to show children?
- [ ] Footer actions: which buttons? what order?
