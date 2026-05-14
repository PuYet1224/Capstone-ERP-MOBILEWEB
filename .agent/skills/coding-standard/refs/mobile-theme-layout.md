---
name: mobile-theme-layout
description: Mandatory Design Tokens, Colors, Sizes, and Screen Layout Templates for FE Mobile.
---

# 1. COLORS (from _colors.scss)
| Variable | Usage |
|---|---|
| `$primary` | `#126433` - Main brand green. Buttons, links |
| `$secondary` | `#3c4858` - Default text color |
| `$success` | `#126433` - Success notifications |
| `$error` | `#e5322b` - Red. Errors, delete, required fields |
| `$warning` | `#CD9000` - Yellow-gold. Transfer, pending |
| `$info` | `#0074FF` - Blue. Info notifications |
| `$white` | `#ffffff` - Card backgrounds |
| `$border` | `#979B9B` - Input borders, divider lines |
| `$background-primary` | `#EEEEEE` - Page background |

**NEVER DO THIS:** `color: red;` or `color: #126433;`. **ALWAYS use SCSS variables.**

# 2. TYPOGRAPHY & SIZES
- **Body:** 13px (`$font-size-base`). **Small:** 11px. **Heading:** 16px.
- **Header:** 56px fixed top.
- **Footer:** 40px min, fixed bottom.
- **Button:** 32px (normal), 36px (footer), 48px (large).
- **Cards/Buttons Radius:** 8px.

# 3. SCREEN LAYOUT TEMPLATE
Every screen MUST follow this 3-part layout:
```html
<div class="page">
    <!-- PART 1: HEADER (56px) -->
    <ps-header-back><ng-container header-right><div class="header-title">Title</div></ng-container></ps-header-back>

    <!-- PART 2: BODY (scrollable) -->
    <div class="body-list" #bodyList>...cards here...</div>

    <!-- PART 3: FOOTER (fixed bottom) -->
    <ps-footer-action>
        <ps-kendo-button (onClick)="goBack()"><span class="material-icons">arrow_back</span></ps-kendo-button>
        <ps-kendo-button [theme]="'primary'" (onClick)="onAction()"><span class="text">Action</span></ps-kendo-button>
    </ps-footer-action>
</div>
```

**SCSS Template:**
```scss
@import 'src/assets/scss/colors';
::ng-deep {
    my-screen {
        .page {
            display: flex; flex-direction: column; height: 100dvh; background-color: $background-primary;
            .body-list { flex: 1; overflow-y: auto; padding: $spacing-sm; display: flex; flex-direction: column; gap: $spacing-sm; }
            .card { background: $white; border-radius: 8px; padding: $spacing-sm; box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; }
        }
    }
}
```
