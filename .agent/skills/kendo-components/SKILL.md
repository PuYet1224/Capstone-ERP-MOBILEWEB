---
name: kendo-components
description: Kendo UI v13 component reference for Angular 16. Maps all Kendo components with Standalone imports, APIs, and usage examples. Read when generating UI code.
---

# Kendo UI v13 Component Reference

> All components support Standalone import via utility arrays.

## Standalone Import Arrays

| Component | Standalone Import | Old NgModule |
|---|---|---|
| Grid | KENDO_GRID | GridModule |
| Button | KENDO_BUTTON | ButtonsModule |
| DropDownList | KENDO_DROPDOWNS | DropDownsModule |
| TextBox | KENDO_TEXTBOX | InputsModule |
| NumericTextBox | KENDO_NUMERICTEXTBOX | InputsModule |
| DatePicker | KENDO_DATEPICKER | DateInputsModule |
| Dialog | KENDO_DIALOG | DialogModule |
| Chart | KENDO_CHARTS | ChartModule |
| Notification | KENDO_NOTIFICATION | NotificationModule |
| Label | KENDO_LABEL | LabelModule |
| ScrollView | KENDO_SCROLLVIEW | ScrollViewModule |

## Icons: Use lucide-angular, NOT Kendo icons.

## Shared Wrappers (ps-* components)

| Wrapper | Wraps | Usage |
|---|---|---|
| ps-header | Header + back navigation | Every screen top |
| ps-footer | Action buttons bar | Screen bottom |
| ps-dropdown | kendo-dropdownlist | Filter dropdowns |
| ps-input | kendo-textbox | Form inputs |
| ps-dialog | kendo-dialog | Confirmation popups |
| ps-button | kendoButton | Action buttons |
