---
name: mobile-components-api
description: Mandatory Component usage, API patterns, and State passing for FE Mobile.
---

# 1. COMPONENT USAGE CHEAT SHEET
- **Button:** `<ps-kendo-button [theme]="'primary'" (onClick)="doAction()"><span class="text">Text</span></ps-kendo-button>`
- **Dropdown:** `<ps-kendo-dropdown-list [label]="'Label'" [data]="data" [textField]="'Name'" [valueField]="'Code'" [valuePrimitive]="true" [(ngModel)]="val"></ps-kendo-dropdown-list>`
- **Textbox:** `<ps-kendo-textbox [label]="'Label'" [(ngModel)]="val"></ps-kendo-textbox>`
- **Dialog:** `<ps-dialog-confirm [open]="showDialog" [theme]="'primary'">...content...</ps-dialog-confirm>`
- **Status Filter:** `<ps-filter-status [data]="statusList" (change)="onStatusChange($event)"></ps-filter-status>`

# 2. ICONS
Use `material-icons` only. Do NOT use `lucide-icon` (banned — RULE-MOB-02).

# 3. API CALLING PATTERN (CORRECT)
```typescript
import { MtbikeApiService } from '../../services/mtbike-api.service';
constructor(private api: MtbikeApiService) {}

// NEVER use this.http directly!
const sub = this.api.GetListSALMaster(filter).subscribe((res) => {
    if (res.StatusCode === 0) { this.listData = res.ObjectReturn; }
});
this.arrUnsubscribe.push(sub);
```

# 4. SCREEN-TO-SCREEN DATA PASSING
Use `PsCache` (localStorage wrapper):
```typescript
// Sending
this.cache.setItem(KeyLocalStorageEnum.SAL_ORDER_MASTER, item);
this.router.navigate(['/mtbike/consultant/detail']);

// Receiving
const cached = this.cache.getItem(KeyLocalStorageEnum.SAL_ORDER_MASTER);
if (cached) { this.orderMaster = this.cache.parseValue(cached); }
```

# 5. STATUS PIPE PATTERN
```html
<div class="status" [innerHTML]="{ Active: item.Status === StatusEnum.NEW ? 'consultant' : undefined, Progress: item.Status, ProgressName: item.StatusName } | SALOrderMasterStatusRetail"></div>
```
CSS output: `.pipe-class { padding: 4px 8px; border-radius: 8px; font-weight: 700; font-size: 10px; border: 1px solid; text-align: center; }`

# 6. PERMISSION PATTERN
```typescript
import { FunctionPermissionDTO } from 'src/app/models/dtos/function-permission.dto';
// FunctionPermissionDTO.master, .creator, .approver, .viewer
<ps-kendo-button [disabled]="FunctionPermissionDTO.approver">...</ps-kendo-button>
```
