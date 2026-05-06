---
description: FE reads FEMobile_Guide.md, reads Figma mobile frames via MCP, and implements mobile web code. Usage /fe-mobile-implement
skills:
  - coding-standard
  - figma-reader
---

# /fe-mobile-implement — Frontend Mobile Web Implementation

## STEP 0: Design Reference Check (BEFORE anything else)
1. Scan `C:\ai.pipeline\designs\` for feature folders that have a `mobile\` subfolder
2. If found → list all PNG files inside `C:\ai.pipeline\designs\{feature}\mobile\`
3. Read ALL images using `view_file` — analyze layout, colors, touch targets, mobile components
4. Follow `design-reference` skill protocol for detailed extraction
5. Keep analysis in memory — use it throughout implementation
6. If no designs found → inform user: "Không tìm thấy design reference. Tiếp tục từ guide text."

## STEP 1: Read SRS / Guide
- Scan `C:\ai.pipeline\Capstone-ERP-Project\requirements\` for `FE_MOBWEB_*.md` files (SRS)
- Scan `C:\ai.pipeline\Capstone-ERP-Project\guides\` for `FEMobile_*.md` files
- Read the selected SRS/guide — THIS IS YOUR SOURCE OF TRUTH
- Identify: components, routes, API endpoints, mobile UX requirements, and business rules

## STEP 2: Create Mobile Components
- Mobile-first layout (375px - 414px viewport)
- Touch-friendly interactions (min tap target 44×44px)
- Bottom navigation (if applicable)
- Safe area padding (top: status bar, bottom: home indicator)
- If design reference exists → match pixel-perfect with Figma images

## STEP 3: Integrate APIs
- Match endpoints from guide
- Optimize for slow networks (loading states, skeleton loaders)
- Cache where possible
- Pull-to-refresh for list screens
- Infinite scroll for long lists

## STEP 4: Handle UI States
- **Loading:** skeleton loaders (prominent on mobile, match Figma if available)
- **Error:** full-screen error with retry button
- **Empty:** centered message with illustration
- **Success:** toast notification (bottom, above nav)

## STEP 5: Verify
- Build must pass (`ng build` or `npm run build`)
- Test mobile viewports (375px, 414px)
- Verify touch targets ≥ 44px
- Check scroll behavior

## STEP 6: Review & Cleanup
```
✅ Mobile FE implementation complete:
   📄 Created: {list of files}
   🔨 Build: Succeeded

🔍 BƯỚC TIẾP THEO BẮT BUỘC:
   Hãy nhắc user chạy lệnh: /review
   Để AI tự động kiểm tra lại code vừa viết xem có sót cleanup / format không.

🧹 Design references còn trong .figma-ref/{feature}/.
   Chạy /clean-designs {feature} để dọn dẹp.
```

## BANNED
- DO NOT create any .txt, .log, .md files in project root
- DO NOT invent component tags — read reference components first
- DO NOT use desktop patterns (sidebar, hover-only interactions)
- DO NOT ignore touch target minimums (44×44px)
