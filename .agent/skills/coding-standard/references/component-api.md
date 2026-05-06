# Component API — ps-* Wrappers

> Reference for `coding-standard` skill. Loaded when you need component Input/Output details.

## ps-kendo-button
```html
<!-- Solid primary -->
<ps-kendo-button [theme]="'primary'" (onClick)="doAction()">
    <span class="text">Button Text</span>
</ps-kendo-button>

<!-- Outline -->
<ps-kendo-button [theme]="'primary-outline'" (onClick)="doAction()">
    <span class="text">Outline</span>
</ps-kendo-button>

<!-- Icon only -->
<ps-kendo-button (onClick)="goBack()">
    <span class="material-icons">arrow_back</span>
</ps-kendo-button>

<!-- Available themes: 'primary' | 'primary-outline' | 'error' | 'error-outline' |
     'warning' | 'warning-outline' | 'info' | 'info-outline' | 'secondary' -->
```

## ps-kendo-dropdown-list
```html
<ps-kendo-dropdown-list
    [label]="'Label'"
    [data]="dropdownData"
    [textField]="'Name'"
    [valueField]="'Code'"
    [valuePrimitive]="true"
    [(ngModel)]="selectedValue"
    (valueChange)="onChange($event)">
</ps-kendo-dropdown-list>
```

## ps-kendo-textbox
```html
<ps-kendo-textbox [label]="'Label'" [(ngModel)]="value"></ps-kendo-textbox>
```

## ps-kendo-numeric-textbox
```html
<ps-kendo-numeric-textbox [label]="'Amount'" [(ngModel)]="amount" [format]="'n0'">
</ps-kendo-numeric-textbox>
```

## ps-kendo-datepicker
```html
<ps-kendo-datepicker [label]="'Date'" [(ngModel)]="date"></ps-kendo-datepicker>
```

## ps-dialog-confirm
```html
<ps-dialog-confirm [open]="showDialog" [theme]="'primary'">
    <div class="main-title"><div>Confirm Title</div></div>
    <div class="sub-title">Are you sure?</div>
    <div class="dialog-actions">
        <ps-kendo-button (onClick)="cancel()"><span class="text">Cancel</span></ps-kendo-button>
        <ps-kendo-button [theme]="'primary'" (onClick)="confirm()"><span class="text">OK</span></ps-kendo-button>
    </div>
</ps-dialog-confirm>
```

## ps-filter-status / ps-filter-status1
```html
<!-- ps-filter-status1 requires API data — MUST call GetListStatus() in ngOnInit -->
<ps-filter-status1 [data]="liststatus" [valueField]="'TypeOfStatus'" [field]="'StatusID'"
                   [label]="'Tình trạng'" (changedValue)="statusFilterChange($event)">
</ps-filter-status1>
```

## ps-filter-textbox
```html
<ps-filter-textbox [placeholder]="'Search...'" (valueChange)="onSearch($event)">
</ps-filter-textbox>
```

## ps-filter-button
```html
<!-- Contains 3 built-in buttons: reload, clear, reset -->
<ps-filter-button (reload)="onReload()" (clear)="onClear()"></ps-filter-button>
```

## Icons

### Material Symbols (layout/navigation)
```html
<span class="material-icons">arrow_back</span>
<span class="material-icons">search</span>
<span class="material-icons">close</span>
<span class="material-icons">add</span>
<span class="material-icons">delete</span>
<span class="material-icons">edit</span>
<span class="material-icons">check</span>
<span class="material-icons">more_vert</span>
```

### Lucide Angular (action/feature)
```html
<lucide-icon name="plus" [size]="20"></lucide-icon>
<lucide-icon name="trash-2" [size]="18"></lucide-icon>
```
