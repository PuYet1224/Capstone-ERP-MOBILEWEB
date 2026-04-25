---
name: figma-reader
description: |
  Figma MCP live reader for Angular + Kendo UI frontend implementation.
  Triggered AUTOMATICALLY on EVERY UI task — no user command needed.
  Reads live Figma Desktop data via MCP bridge → maps to SCSS variables + Kendo components.
  Design source priority: 1) Figma MCP (live) 2) {PROJECT_PIPELINE}\designs\ PNG fallback 3) STOP.
  CRITICAL: Only reads BODY content — ALWAYS skips sidebar and header nodes.
  CRITICAL: Components like ps-filter-status1 REQUIRE API data loading — never leave them empty.
triggers:
  - "implement"
  - "code"
  - "write"
  - "build UI"
  - "fix UI"
  - "update screen"
  - "redesign"
---

# Figma Reader Skill — Figma MCP Only (BODY CONTENT ONLY)

> 🔴 **AUTO-TRIGGER:** This skill MUST run BEFORE any UI coding task.
> 🔴 **DESIGN SOURCE:** Priority: 1) Figma MCP live → 2) `{PROJECT_PIPELINE}\designs\` PNG fallback → 3) STOP.
> 🔴 **BODY ONLY:** NEVER implement sidebar, header, or footer. They are handled by the layout system.

---

## ⚡ PHASE 0 — CONNECTION CHECK

```
1. Call figma_status IMMEDIATELY
   ├── CONNECTED → Run PHASE 1 (Figma Live Read)
   └── NOT CONNECTED → Try PHASE 1B (Design Archive Fallback)
       ├── Scan {PROJECT_PIPELINE}\designs\ for relevant PNG files
       │   ├── FOUND → Read images, declare source: "[From design archive — not live Figma]"
       │   └── NOT FOUND → STOP. Tell user:
       │       "❌ No design source available. Connect Figma or add PNGs to designs/ folder."
       └── ALWAYS declare data source transparently (P0 rule)
```

---

## 📖 PHASE 1 — FIGMA LIVE READ (When connected)

### Step 1.1: Read the currently selected frame
```
figma_read → operation: "get_selection" → depth: 6, detail: "compact"
```
→ Gets the full frame tree including sidebar, header, body sections

### 🔴 Step 1.2: FILTER — Find BODY content node ONLY

> **THIS IS THE MOST CRITICAL STEP.** The frame will contain sidebar, header, and body.
> You MUST identify and isolate the BODY content node before proceeding.

**How to identify the BODY content node:**
1. Look at the top-level children of the selected frame
2. **SKIP** any node that matches these patterns:
   - Name contains: "Sidebar", "Nav", "Navigation", "Menu", "Side"
   - Name contains: "Header", "Top bar", "Navbar", "App bar"
   - Name contains: "Footer", "Bottom bar"
   - Node is positioned at x=0 with narrow width (sidebar)
   - Node is positioned at y=0 with small height (header)
3. **SELECT** the node that represents the main content area:
   - Usually the LARGEST node by area
   - Usually positioned to the RIGHT of the sidebar
   - Usually positioned BELOW the header
   - Name often contains: "Content", "Body", "Main", "Page", or the feature name

**After identifying the body node:** Use its `nodeId` for ALL subsequent calls.

### Step 1.3: Scan ONLY the body node
```
figma_read → operation: "get_css" → nodeId: <BODY_NODE_ID>
```
→ Gets padding, gap, width, border-radius, font-size for body ONLY

### Step 1.4: Get detailed design for body sections
```
figma_read → operation: "scan_design" → nodeId: <BODY_NODE_ID>  (if supported)
  OR
figma_read → operation: "get_design" → nodeId: <BODY_NODE_ID> → depth: 6
```
→ Gets all text, colors, components WITHIN the body section only

### Step 1.5 (optional): Check color variable names
```
figma_read → operation: "get_node_detail" → nodeId: <node_id>
```
→ Gets fillStyle.name, boundVariables for design token identification

---

## 🔴🔴🔴 CRITICAL: WHAT TO SKIP vs WHAT TO CODE

```
❌ ABSOLUTELY NEVER CODE THESE (layout system handles them):
   ├── Sidebar navigation (left panel with menu items)
   ├── Top header / navbar (logo, user avatar, notifications)
   ├── Page footer / copyright
   └── ANY navigation component

   If you see these in the Figma data → IGNORE THEM COMPLETELY.
   Do NOT create HTML/CSS for them.
   Do NOT reference them in your component.
   They ALREADY EXIST in the layout system.

✅ ONLY CODE THE BODY CONTENT:
   ├── ps-toolbar-top (action buttons at top of content area)
   ├── ps-filter-bar (search/filter controls)
   ├── ps-kendo-grid (data tables/lists)
   ├── Form sections (input fields, dropdowns)
   ├── Status badges
   ├── Financial summaries
   ├── Signature / QR code areas
   └── Dialogs / modals
```

> 🔴 **SELF-CHECK:** Before writing ANY HTML, ask yourself:
> "Am I coding sidebar or header?" → If YES → STOP. Delete that code.
> "Am I coding only the body content?" → If YES → Continue.

---

## 🗺️ Capstone Color Mapping (MANDATORY)

> 🔴 NEVER use raw hex values in SCSS. Always map to $variable.

| Figma HEX | Capstone SCSS Variable |
|---|---|
| `#126433` or equivalent | `$primary` |
| `#e5322b` or equivalent | `$error` |
| `#CD9000` or equivalent | `$warning` |
| `#0074FF` or equivalent | `$info` |
| `#979B9B` or equivalent | `$border` |
| `#4dbd74` or equivalent | `$green` |
| `#ff9200` or equivalent | `$orange` |
| `#f5f5f5` or equivalent | `$gray-100` |
| `#ffffff` | `$white` |

---

## 🔧 Capstone Component Mapping (MANDATORY)

| Figma element | Angular/Kendo component |
|---|---|
| Single-line text input | `<ps-kendo-textbox>` |
| Number input | `<ps-kendo-numeric-textbox>` |
| Dropdown / Select | `<ps-kendo-dropdown-list>` |
| Date picker | `<kendo-datepicker>` |
| Textarea | `<kendo-textarea>` |
| Checkbox | `<input kendoCheckBox>` |
| Data table / Grid | `<ps-kendo-grid>` + `<kendo-grid-column>` |
| Tabs | `<kendo-tabstrip>` |
| Button (primary) | `<ps-kendo-button theme="success">` |
| Button (danger) | `<ps-kendo-button theme="error">` |
| Dialog confirm | `<ps-dialog-confirm>` |
| Status badge | `<span class="status-badge">` + SCSS |
| Toolbar actions | `<ps-toolbar-top>` |
| Search filter | `<ps-filter-textbox>` |
| Status filter | `<ps-filter-status1>` |
| Filter buttons | `<ps-filter-button>` |

### 🔴 FILTER BAR is a COMPOSITE standard component

> **The filter bar is NOT a "design it yourself" area.** It is a FIXED layout
> defined globally in `styles.scss`. You ONLY place standard components inside it.
> **DO NOT override `.ps-filter-bar` CSS** — it already has `display: flex`, `gap: 24px`,
> `height: 70px`, `border-bottom`, and `overflow-x: auto` from the global stylesheet.

> The ONLY children allowed inside `.ps-filter-bar`:
> ```
> <div class="ps-filter-bar">
>   1. <ps-filter-textbox>     ← search box (ALWAYS first, ALWAYS present)
>   2. <ps-kendo-dropdown-list> ← dropdown filters (0 or more, for entity-specific filters)
>   3. <ps-filter-status1>      ← status multi-select (if Figma shows status filter)
>   4. <ps-filter-button>       ← reload/clear/reset (ALWAYS last, 3 buttons built-in)
> </div>
> ```

### 🔴🔴🔴 FILTER BAR DECISION TREE (When Figma shows filter elements)

> **Use this EXACT decision tree for every element you see in the Figma filter area:**
>
> ```
> Figma shows "search / text input" in filter area?
>   → YES → Use <ps-filter-textbox>. NEVER <input>, <kendo-textbox>, or custom search.
>
> Figma shows "status filter / tình trạng / trạng thái" dropdown or multi-select?
>   → YES → Use <ps-filter-status1>. NEVER <kendo-multiselect>, <kendo-dropdownlist>,
>           or any custom dropdown for status filtering.
>   → MUST call GetListStatus() API to load data (see API DATA section below).
>
> Figma shows "other dropdown filter" (e.g., warehouse, employee, category)?
>   → YES → Use <ps-kendo-dropdown-list> with [label]. Place it between
>           ps-filter-textbox and ps-filter-status1.
>
> Figma shows "date range / date picker" in filter area?
>   → YES → Use <ps-kendo-dropdown-list> with date presets (e.g., "Hôm nay",
>           "7 ngày", "30 ngày") OR if Figma EXPLICITLY shows 2 separate
>           date picker inputs, use <kendo-datepicker> wrapped in a div.
>   → NEVER invent a custom date range component with labels and separators.
>
> Figma shows "reload / reset / clear buttons" in filter area?
>   → ALWAYS → Use <ps-filter-button>. It already contains 3 buttons built-in.
>   → NEVER add custom reload/clear/reset buttons.
>
> Figma shows "toggle switch / checkbox" in filter area?
>   → NEVER build a custom toggle. Use <ps-filter-status1> instead.
>
> Figma shows ANY other filter element not listed above?
>   → STOP. Ask the user which standard component to use.
>   → NEVER invent a new filter component.
> ```

### 🔴 FILTER BAR CSS RULES (CRITICAL)

> ```scss
> // ✅ CORRECT — Only override the search textbox min-width in component SCSS:
> .ps-filter-bar {
>   ps-filter-textbox {
>     .filter-textbox {
>       ps-kendo-textbox {
>         .kendo-textbox {
>           min-width: 340px; // Adjust based on placeholder length
>         }
>       }
>     }
>   }
>
>   ps-kendo-dropdown-list {
>     min-width: 200px; // Optional: ensure dropdowns don't collapse
>   }
> }
>
> // 🔴 BANNED — NEVER override these in component SCSS:
> // .ps-filter-bar { display: flex; }           ← already in global styles.scss
> // .ps-filter-bar { flex-wrap: wrap; }          ← breaks the 70px fixed height
> // .ps-filter-bar { row-gap: 12px; }            ← breaks the standard spacing
> // .ps-filter-bar { align-items: center; }      ← already in global styles.scss
> // .ps-filter-bar { gap: 10px; }                ← global uses gap: 24px
> ```

### 🔴🔴🔴 COMMON FILTER BAR MISTAKES (MUST AVOID)

> These are REAL mistakes AI agents have made. Each one breaks the UI:
>
> | # | What AI did wrong | What it should have done |
> |---|---|---|
> | 1 | Built custom `<kendo-datepicker>` with "Từ ngày" / "Đến ngày" labels and `-` separator | Use `<ps-kendo-dropdown-list>` with date presets, or omit if not needed |
> | 2 | Built custom `<kendo-multiselect>` or `<kendo-dropdownlist>` for status with "~1 trạng thái được chọn" | Use `<ps-filter-status1>` — it's a built-in multi-select component |
> | 3 | Added custom `<ps-kendo-dropdown-list>` for "Nhân viên thu ngân" with custom `.filter-cashier` wrapper | Use bare `<ps-kendo-dropdown-list>` directly inside `.ps-filter-bar` — no wrapper div needed |
> | 4 | Added custom toggle switch for "Kết thúc" filter | Use `<ps-filter-status1>` — statuses are checkboxes in this component |
> | 5 | Override `.ps-filter-bar` CSS with `display: flex; flex-wrap: wrap; row-gap: 12px;` | **NEVER override** — `.ps-filter-bar` is globally styled in `styles.scss` |
> | 6 | Set `min-width: 160px` on search, placeholder "Tra cứu theo tên, sdt, Kh..." gets cut off | Set `min-width: 340px+` — account for built-in "Lọc" button (~60px) |
> | 7 | Added `<kendo-label>` above dropdown filters in the filter bar | **NEVER** add `<kendo-label>` in filter bar — use `[label]` input on the dropdown component |
> | 8 | Left `ps-filter-status1` with `[data]="[]"` (empty array, no API call) | **MUST** call `GetListStatus(LSStatusTypeDataEnum.XXX)` in `ngOnInit()` |

### 🔴 SEARCH TEXTBOX sizing rule

> `<ps-filter-textbox>` internally contains a text input + a "Lọc" (filter) button.
> The button takes ~60px, so the **visible input area** is `min-width - 60px`.
> If your placeholder is long, the text will be CUT OFF unless you increase min-width.
>
> **Rule:** `min-width` = `(number of placeholder characters × 7px) + 80px`
> - Short placeholder (< 20 chars): `min-width: 270px` (default)
> - Medium placeholder (20-40 chars): `min-width: 340px`
> - Long placeholder (40+ chars): `min-width: 420px`
>
> Set this in component SCSS:
> ```scss
> .ps-filter-bar {
>   ps-filter-textbox {
>     .filter-textbox {
>       ps-kendo-textbox {
>         .kendo-textbox {
>           min-width: 340px; // Adjust based on placeholder length
>         }
>       }
>     }
>   }
> }
> ```

### 🔴🔴🔴 ps-filter-status1 REQUIRES API DATA (CRITICAL)

> `<ps-filter-status1>` will show **EMPTY checkboxes with no labels** if you don't load data.
> You MUST call the status API in `ngOnInit()` to populate it.
>
> **Required TS pattern:**
> ```typescript
> // 1. Import
> import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
> import { LSStatusCusDTO } from 'src/app/models/dtos/e-dtos/ls-status.dto';
>
> // 2. Declare property
> public liststatus: LSStatusCusDTO[] = [];
>
> // 3. Call in ngOnInit
> ngOnInit() {
>   this.getliststatus();  // ← MUST call this
>   this.getlist(this.filter);
> }
>
> // 4. Implement the method
> private getliststatus() {
>   const sub = this.coreapi.GetListStatus(LSStatusTypeDataEnum.YourEntity).subscribe((res) => {
>     if (res.StatusCode == 0) {
>       this.liststatus = res.ObjectReturn;
>       // Optional: set default active statuses
>       this.liststatus.forEach(item => {
>         item.IsActive = [YourStatusEnum.STATUS_A, YourStatusEnum.STATUS_B].includes(item.TypeOfStatus);
>       });
>     }
>   });
>   this.arrUnsubscribe.push(sub);
> }
> ```
>
> **Required HTML:**
> ```html
> <ps-filter-status1 [data]="liststatus" [valueField]="'TypeOfStatus'" [field]="'StatusID'"
>                    [label]="'Tình trạng'" (changedValue)="statusFilterChange($event)">
> </ps-filter-status1>
> ```
>
> **BEFORE using `LSStatusTypeDataEnum.YourEntity`:**
> 1. Open `src/app/models/enums/e-type/ls-status-type-data.enum.ts`
> 2. Check if your entity type exists (e.g., `SALReceipt = 22`)
> 3. If it does NOT exist → the BE must register it in `tbl_LSStatus` first
> 4. If it exists → use it directly
>
> 🔴 **If you skip this step, the dropdown will render with empty checkboxes and no status names.**

### 🔴 STATUS BADGE color rules (from Figma standard)

| Status Visual | Badge Style | SCSS |
|---|---|---|
| Outline text (e.g. "Tạo mới") | border + text color, transparent bg | `border: 1px solid $border; color: $gray-700;` |
| Filled yellow (e.g. "Đang xử lý") | solid bg, white text | `background: $warning; color: $white;` |
| Filled green (e.g. "Hoàn tất") | solid bg, white text | `background: $primary; color: $white;` |
| Filled red (e.g. "Hủy giao dịch") | solid bg, white text | `background: $error; color: $white;` |

> 🔴 NEVER swap border vs background. If Figma shows outline → use outline. If filled → use filled.

### 🔴 GRID ACTION COLUMN rules

> When Figma shows "..." action menu on grid rows, use the **built-in** `ps-kendo-grid` action column:
> ```
> [hasColumnAction]="true"
> [actionColumnData]="actionColumn"
> (actionSelected)="onActionClick($event)"
> ```
> **NEVER** build a custom action dropdown — it gets cut off by grid overflow.

---

## 📐 Layout Mapping

| Figma layout | Actual SCSS |
|---|---|
| Auto layout row | `display: flex; flex-direction: row; gap: Xpx;` |
| Auto layout column | `display: flex; flex-direction: column; gap: Xpx;` |
| 3-column equal grid | `display: grid; grid-template-columns: repeat(3, 1fr);` |
| Card container | `border: 1px solid $border; border-radius: 8px; padding: 16px;` |

---

## ✅ PHASE 2 — VERIFICATION (After coding is complete)

```
figma_read → operation: "screenshot" → nodeId: <BODY_NODE_ID>
```
Compare Figma screenshot of BODY vs rendered code → adjust if mismatched.

---

## 🔁 Full Workflow Summary

```
User: "Implement screen X"
     ↓
[AUTO] figma_status
     ├── Connected:
     │   ├── get_selection → full frame tree
     │   ├── FILTER → find BODY node (skip sidebar/header/footer)
     │   ├── get_css/get_design on BODY node ONLY
     │   ├── map colors → $variables
     │   ├── map components → HM wrappers
     │   ├── code BODY ONLY
     │   └── screenshot verify BODY
     └── Not connected:
         ├── Scan {PROJECT_PIPELINE}\designs\ for PNGs
         │   ├── Found → Read images as design reference
         │   │   └── Declare: "[From design archive — not live Figma]"
         │   └── Not found → STOP. Ask user for design source.
         └── NEVER silently switch sources (P0 transparency rule)
```
