# Filter Bar Rules (CRITICAL)

> Reference file for `figma-reader` skill. Loaded on-demand when implementing filter bars.

## FILTER BAR is a COMPOSITE standard component

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

## DECISION TREE (When Figma shows filter elements)

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

## FILTER BAR CSS RULES (CRITICAL)

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

## COMMON FILTER BAR MISTAKES (MUST AVOID)

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

## SEARCH TEXTBOX sizing rule

> `<ps-filter-textbox>` internally contains a text input + a "Lọc" (filter) button.
> The button takes ~60px, so the **visible input area** is `min-width - 60px`.
> If your placeholder is long, the text will be CUT OFF unless you increase min-width.
>
> **Rule:** `min-width` = `(number of placeholder characters × 7px) + 80px`
> - Short placeholder (< 20 chars): `min-width: 270px` (default)
> - Medium placeholder (20-40 chars): `min-width: 340px`
> - Long placeholder (40+ chars): `min-width: 420px`

## ps-filter-status1 REQUIRES API DATA (CRITICAL)

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
