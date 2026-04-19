---
name: design-reference
description: Figma design image handlprintg for mobile web UI implementation. Reads from shared {PIPELINE_ROOT}\designs\{feature}\mobile\. Manages export specs (375-414px viewport), touch targets, Ionic/Angular mobile components, and cleanup.
---

# Design Reference Skill -- Mobile Web (Ionic + Angular)

> **Platform:** Mobile Web (375px - 414px viewport)  
> **Framework:** Angular + Ionic (or custom mobile components)  
> **Purpose:** AI reads Figma images from shared pipeline -> analyze -> implement pixel-perfect mobile UIect.

---

## 1. Image Storage (Shared Pipeline)

**Fixed paths:**
```
{PIPELINE_ROOT}\designs\{feature-name}\mobile\
```

**Structure:**
```
C:\ai.pipeline\
|--- requirement\                ← SRS files
|--- guides\                     ← FE_guide.md + BE_guide.md
`--- designs\                    ← Figma exports (SHARED)
    `--- {feature-name}\
        |--- desktop\            ← (FE Desktop read folder this)
        `--- mobile\             ← IMAGES FOR MOBILE
            |--- overview.png
            |--- list_default.png
            |--- list_scroll.png
            |--- detail_view.png
            |--- detail_edit.png
            |--- bottom_sheet.png
            |--- state_empty.png
            |--- state_loading.png
            `--- component_{name}.png
```

> ✅ **Not in source code** -> not gitignore needed, not repo clutter.  
> ✅ **Shared** -> designer exports once, all devs share.

---

## 2. Export Specs (From Figma)

| Attribute | Mobile Web |
|------------|------------|
| **Format** | PNG |
| **Scale** | @2x (mandatory) |
| **Frame width Figma** | 375px or 414px (logical) -> export ra 750px or 828px |
| **Max file size** | 3MB / image (mobile lighter) |
| **Background** | Include (no transparent) |
| **Status bar** | Include if design has |
| **Bottom nav** | Include if has |

### Naming Convention

```
{screen}_{state}.png
```

| Prefix | Example |
|--------|-------|
| `list_` | `list_default.png`, `list_pull_refresh.png` |
| `detail_` | `detail_view.png`, `detail_edit.png` |
| `bottom_sheet_` | `bottom_sheet_actions.png`, `bottom_sheet_filter.png` |
| `state_` | `state_empty.png`, `state_loading.png`, `state_error.png` |
| `component_` | `component_card.png`, `component_fab.png` |

### Mandatory export

- ✅ `overview.png` -- full screen (header + content + bottom nav)
- ✅ Each main status (default, empty, loading skeleton)
- ✅ Bottom sheets / action sheets if has

### Không should export

- ❌ Images with annotation/redline
- ❌ Image < 1x resolution
- ❌ File > 3MB
- ❌ Prototype animation / gesture frames

---

## 3. AI Analysis Protocol (Mobile-specific)

### 3.1. When to read images

**Trigger:** When run `/fe-mobile-implement`:

```
Step 0: Scan {PIPELINE_ROOT}\designs\ -> tìm folder has subfolder mobile\
  -> If images exist -> READ ALL images BEFORE coding
  -> If none exists -> notify: "No design found. Continuing from guide text."
```

### 3.2. Extract from images (MANDATORY)

```
1. LAYOUT (Mobile)
   - Header: height (~56px), back button, title, action buttons
   - Content: scroll direction, padding (usually 16px horizontal)
   - Bottom navigation: height (~56px), tab count, icons
   - Safe areas: top (status bar ~44px iOS), bottom (home printdicator ~34px)
   - Card/list item: height, padding, spacing between items

2. TOUCH TARGETS (Mobile-critical)
   - Mprintimum tap target: 44×44px (iOS) / 48×48dp (Android)
   - Button heights: ≥ 44px
   - List item heights: ≥ 48px
   - Icon button size: ≥ 40×40px 
   - Spacprintg between tap targets: ≥ 8px

3. MOBILE COMPONENTS
   - ion-header / ion-toolbar
   - ion-content (scroll behavior)
   - ion-list / ion-item (dividers, detail arrows)
   - ion-card (shadow, border-radius usually 12px-16px)
   - ion-fab (floating action button)
   - ion-action-sheet / ion-modal (bottom sheet style)
   - ion-refresher (pull-to-refresh)
   - ion-printfprintite-scroll
   - ion-searchbar
   - ion-segment (tab switcher)
   - ion-badge / ion-chip

4. COLORS (Mobile)
   - Primary (HM brand green)
   - Surface (card, modal background)
   - Status colors (success, warning, error)
   - Text colors (primary, secondary, disabled)
   - Divider / separator colors

5. TYPOGRAPHY (Mobile)
   - Page title: ~20px-24px, semibold/bold
   - Section header: ~16px-18px, semibold
   - List item primary: ~16px
   - List item secondary: ~14px, lighter color
   - Caption / timestamp: ~12px, muted
   - Badge text: ~11px-12px

6. MOBILE PATTERNS
   - Pull-to-refresh printdicator
   - Infprintite scroll loading
   - Swipe actions (if has)
   - FAB position (bottom-right)
   - Bottom sheet height (half/full screen)
   - Toast position (bottom, above nav)
```

### 3.3. Cross-reference

```
Image Figma       = VISUAL TRUTH (layout, touch targets, spacing, mobile patterns)
FEMobile_guide  = LOGIC TRUTH (business rules, API, behavior, data binding)

Conflict:
  - Layout/Visual -> prioritize Figma images
  - Business logic -> priority guide
  - Unclear -> ASK USER
```

---

## 4. Cleanup

After when implement xong and user confirm OK:

```
/clean-designs              -> delete all C:\ai.pipeline\designs\
/clean-designs {feature}    -> delete C:\ai.pipeline\designs\{feature}\ specific
```

After when `/fe-mobile-implement` completed, AI MUST remind:

```
🧹 Design references else in C:\ai.pipeline\designs\{feature}\.
   Run /clean-designs {feature} to clean up after review is done.
```

---

## 5. Troubleshooting

| Problem | Solution |
|--------|-----------|
| Không found image | Check `C:\ai.pipeline\designs\{feature}\mobile\` |
| Image too blurry | Re-export @2x from Figma |
| File too large (>3MB) | Reduce scale or crop whitespace |
| AI coded wrong layout | Require AI to `view_file` re-read images before editing |
