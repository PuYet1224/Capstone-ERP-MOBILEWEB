# Component & Color Mapping

> Reference file for `figma-reader` skill. Loaded on-demand.

## Capstone Color Mapping (MANDATORY)

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

## Component Mapping (MANDATORY)

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

---

## STATUS BADGE color rules (from Figma standard)

| Status Visual | Badge Style | SCSS |
|---|---|---|
| Outline text (e.g. "Tạo mới") | border + text color, transparent bg | `border: 1px solid $border; color: $gray-700;` |
| Filled yellow (e.g. "Đang xử lý") | solid bg, white text | `background: $warning; color: $white;` |
| Filled green (e.g. "Hoàn tất") | solid bg, white text | `background: $primary; color: $white;` |
| Filled red (e.g. "Hủy giao dịch") | solid bg, white text | `background: $error; color: $white;` |

> 🔴 NEVER swap border vs background. If Figma shows outline → use outline. If filled → use filled.

---

## GRID ACTION COLUMN rules

> When Figma shows "..." action menu on grid rows, use the **built-in** `ps-kendo-grid` action column:
> ```
> [hasColumnAction]="true"
> [actionColumnData]="actionColumn"
> (actionSelected)="onActionClick($event)"
> ```
> **NEVER** build a custom action dropdown — it gets cut off by grid overflow.

---

## Layout Mapping

| Figma layout | Actual SCSS |
|---|---|
| Auto layout row | `display: flex; flex-direction: row; gap: Xpx;` |
| Auto layout column | `display: flex; flex-direction: column; gap: Xpx;` |
| 3-column equal grid | `display: grid; grid-template-columns: repeat(3, 1fr);` |
| Card container | `border: 1px solid $border; border-radius: 8px; padding: 16px;` |
