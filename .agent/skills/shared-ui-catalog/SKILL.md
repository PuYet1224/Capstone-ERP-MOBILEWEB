---
name: shared-ui-catalog
description: Catalog of all ps-* shared UI wrapper components in the project. Contains Input/Output API for each component. MUST read before using any ps-* component in generated code.
---

# Shared UI Component Catalog

> These are custom wrappers around Kendo UI components.
> Use these INSTEAD of raw Kendo when available.

---

## ps-header-back
**Selector:** `<ps-header-back>`
**Purpose:** Top header with back button (navigates to /menu)
**Inputs:** None
**Module:** PsLayoutModule

---

## ps-header-main
**Selector:** `<ps-header-main>`
**Purpose:** Main header with app branding
**Module:** PsLayoutModule

---

## ps-footer-action
**Selector:** `<ps-footer-action>`
**Purpose:** Bottom action bar container. Put buttons inside via content projection.
**Inputs:** None
**Usage:**
```html
<ps-footer-action>
  <ps-kendo-button title="Luu" theme="primary" (onClick)="save()"></ps-kendo-button>
</ps-footer-action>
```
**Module:** PsLayoutModule

---

## ps-kendo-button
**Selector:** `<ps-kendo-button>`
**Purpose:** Styled button with touch feedback
**Inputs:**
  - title: string (button text)
  - icon: string (icon name)
  - disabled: boolean
  - theme: 'primary' | 'primary-outline' | 'error' | 'error-outline' | 'warning' | 'warning-outline' | 'info' | 'info-outline' | 'secondary' | ''
**Outputs:**
  - (onClick): EventEmitter
**Module:** PsButtonModule

---

## ps-kendo-dropdown-list
**Selector:** `<ps-kendo-dropdown-list>`
**Purpose:** Dropdown with filtering, supports ngModel (ControlValueAccessor)
**Inputs:**
  - label: string
  - data: any[]
  - textField: string (field name for display)
  - valueField: string (field name for value)
  - disabled: boolean
  - filterable: boolean (default false)
  - valuePrimitive: boolean (default false)
**Outputs:**
  - (valueChange): EventEmitter
  - (selectChange): EventEmitter
**Module:** PSDropdownModule

---

## ps-kendo-autocomplete
**Selector:** `<ps-kendo-autocomplete>`
**Purpose:** Autocomplete search input
**Module:** PSDropdownModule

---

## ps-kendo-multiselect
**Selector:** `<ps-kendo-multiselect>`
**Purpose:** Multi-select dropdown
**Module:** PSDropdownModule

---

## ps-filter-status
**Selector:** `<ps-filter-status>`
**Purpose:** Status filter chips (for list screens)
**Module:** PSDropdownModule

---

## ps-kendo-textbox
**Selector:** `<ps-kendo-textbox>`
**Purpose:** Text input wrapper
**Module:** PSInputModule

---

## ps-kendo-numeric-textbox
**Selector:** `<ps-kendo-numeric-textbox>`
**Purpose:** Numeric input wrapper
**Module:** PSInputModule

---

## ps-kendo-datepicker
**Selector:** `<ps-kendo-datepicker>`
**Purpose:** Date picker wrapper
**Module:** PSInputModule

---

## ps-kendo-checkbox
**Selector:** `<ps-kendo-checkbox>`
**Purpose:** Checkbox wrapper
**Module:** PSInputModule

---

## ps-kendo-textarea
**Selector:** `<ps-kendo-textarea>`
**Purpose:** Textarea wrapper
**Module:** PSInputModule

---

## ps-dialog-confirm
**Selector:** `<ps-dialog-confirm>`
**Purpose:** Confirmation dialog overlay
**Inputs:**
  - theme: 'primary' | 'error' | 'warning' | 'info' | ''
  - open: boolean
**Module:** PSDialogModule

---

## ps-dialog-confirm-signature
**Selector:** `<ps-dialog-confirm-signature>`
**Purpose:** Dialog with signature pad
**Module:** PSDialogModule

---

## ps-barcode-scan
**Selector:** `<ps-barcode-scan>`
**Purpose:** Camera barcode scanner
**Module:** PsBarcodeModule

---

## Standard Screen Layout Pattern

Every screen should follow this structure:
```html
<ps-header-back></ps-header-back>

<div class="content-area">
  <!-- Screen content here -->
</div>

<ps-footer-action>
  <ps-kendo-button title="Action" theme="primary" (onClick)="doAction()">
  </ps-kendo-button>
</ps-footer-action>
```
