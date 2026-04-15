---
name: design-reference
description: Figma design image handling for mobile web UI implementation. Reads from shared C:\ai-pipeline\designs\{feature}\mobile\. Manages export specs (375-414px viewport), touch targets, Ionic/Angular mobile components, and cleanup.
---

# Design Reference Skill — Mobile Web (Ionic + Angular)

> **Platform:** Mobile Web (375px - 414px viewport)  
> **Framework:** Angular + Ionic (hoặc custom mobile components)  
> **Purpose:** AI đọc ảnh Figma từ shared pipeline → phân tích → implement UI mobile pixel-perfect.

---

## 1. Image Storage (Shared Pipeline)

**Path cố định:**
```
C:\ai-pipeline\designs\{feature-name}\mobile\
```

**Cấu trúc:**
```
C:\ai.pipeline\
├── requirement\                ← SRS files
├── guides\                     ← FE_guide.md + BE_guide.md
└── designs\                    ← Figma exports (SHARED)
    └── {feature-name}\
        ├── desktop\            ← (FE Desktop đọc folder này)
        └── mobile\             ← ẢNH CHO MOBILE
            ├── overview.png
            ├── list_default.png
            ├── list_scroll.png
            ├── detail_view.png
            ├── detail_edit.png
            ├── bottom_sheet.png
            ├── state_empty.png
            ├── state_loading.png
            └── component_{name}.png
```

> ✅ **Không nằm trong source code** → không cần gitignore, không rác repo.  
> ✅ **Shared** → designer export 1 lần, tất cả dev dùng chung.

---

## 2. Export Specs (Từ Figma)

| Thuộc tính | Mobile Web |
|------------|------------|
| **Format** | PNG |
| **Scale** | @2x (bắt buộc) |
| **Frame width Figma** | 375px hoặc 414px (logical) → export ra 750px hoặc 828px |
| **Max file size** | 3MB / ảnh (mobile nhẹ hơn) |
| **Background** | Bao gồm (không transparent) |
| **Status bar** | Bao gồm nếu design có |
| **Bottom nav** | Bao gồm nếu có |

### Naming Convention

```
{screen}_{state}.png
```

| Prefix | Ví dụ |
|--------|-------|
| `list_` | `list_default.png`, `list_pull_refresh.png` |
| `detail_` | `detail_view.png`, `detail_edit.png` |
| `bottom_sheet_` | `bottom_sheet_actions.png`, `bottom_sheet_filter.png` |
| `state_` | `state_empty.png`, `state_loading.png`, `state_error.png` |
| `component_` | `component_card.png`, `component_fab.png` |

### Bắt buộc export

- ✅ `overview.png` — full screen (header + content + bottom nav)
- ✅ Mỗi trạng thái chính (default, empty, loading skeleton)
- ✅ Bottom sheets / action sheets nếu có

### Không nên export

- ❌ Ảnh có annotation/redline
- ❌ Ảnh < 1x resolution
- ❌ File > 3MB
- ❌ Prototype animation / gesture frames

---

## 3. AI Analysis Protocol (Mobile-specific)

### 3.1. Khi nào đọc ảnh

**Trigger:** Khi chạy `/fe-mobile-implement`:

```
Step 0: Scan C:\ai-pipeline\designs\ → tìm folder có subfolder mobile\
  → Nếu có ảnh → ĐỌC TẤT CẢ ảnh TRƯỚC khi code
  → Nếu không có → thông báo: "Không tìm thấy design. Tiếp tục từ guide text."
```

### 3.2. Extract từ ảnh (MANDATORY)

```
1. LAYOUT (Mobile)
   - Header: height (~56px), back button, title, action buttons
   - Content: scroll direction, padding (thường 16px horizontal)
   - Bottom navigation: height (~56px), tab count, icons
   - Safe areas: top (status bar ~44px iOS), bottom (home indicator ~34px)
   - Card/list item: height, padding, spacing between items

2. TOUCH TARGETS (Mobile-critical)
   - Minimum tap target: 44×44px (iOS) / 48×48dp (Android)
   - Button heights: ≥ 44px
   - List item heights: ≥ 48px
   - Icon button size: ≥ 40×40px 
   - Spacing giữa tap targets: ≥ 8px

3. MOBILE COMPONENTS
   - ion-header / ion-toolbar
   - ion-content (scroll behavior)
   - ion-list / ion-item (dividers, detail arrows)
   - ion-card (shadow, border-radius thường 12px-16px)
   - ion-fab (floating action button)
   - ion-action-sheet / ion-modal (bottom sheet style)
   - ion-refresher (pull-to-refresh)
   - ion-infinite-scroll
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
   - Pull-to-refresh indicator
   - Infinite scroll loading
   - Swipe actions (nếu có)
   - FAB position (bottom-right)
   - Bottom sheet height (half/full screen)
   - Toast position (bottom, above nav)
```

### 3.3. Cross-reference

```
Ảnh Figma       = VISUAL TRUTH (layout, touch targets, spacing, mobile patterns)
FEMobile_guide  = LOGIC TRUTH (business rules, API, behavior, data binding)

Conflict:
  - Layout/Visual → ưu tiên ảnh Figma
  - Business logic → ưu tiên guide
  - Unclear → HỎI USER
```

---

## 4. Cleanup

Sau khi implement xong và user confirm OK:

```
/clean-designs              → xóa toàn bộ C:\ai.pipeline\designs\
/clean-designs {feature}    → xóa C:\ai.pipeline\designs\{feature}\ cụ thể
```

Sau khi `/fe-mobile-implement` hoàn tất, AI PHẢI nhắc:

```
🧹 Design references còn trong C:\ai.pipeline\designs\{feature}\.
   Chạy /clean-designs {feature} để dọn dẹp khi đã review xong.
```

---

## 5. Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Không tìm thấy ảnh | Kiểm tra `C:\ai.pipeline\designs\{feature}\mobile\` |
| Ảnh quá mờ | Re-export @2x từ Figma |
| File quá nặng (>3MB) | Giảm scale hoặc crop whitespace |
| AI code sai layout | Yêu cầu AI `view_file` lại ảnh trước khi sửa |
