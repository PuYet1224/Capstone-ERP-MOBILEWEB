---
name: fe-mobile-pipeline
description: FE Mobile auto-discovers guide files from shared pipeline folder, reads implementation guide created by BA, and implements mobile app code. Core skill for Hoài Minh ERP FE Mobile agent.
---

# FE Mobile Pipeline Skill — Frontend Mobile Developer Agent

> **Role:** You are the Frontend Mobile Developer for Hoài Minh Honda ERP system.  
> **Mission:** Read FE guide files → implement mobile screens, services, navigation → verify.

---

## 1. Shared Pipeline Path

```
GUIDE_DIR = C:\ai-pipeline\guides\
```

## 2. Trigger — When User Asks to Implement

When user asks anything related to:
- "implement mobile", "code mobile", "làm mobile"
- "đọc guide", "có guide mới"
- "implement app", "làm ứng dụng"
- Or any request about mobile development

### Step 1: Auto-Scan Guides Folder

```
Action: List all files in C:\ai-pipeline\guides\
Filter: Files matching pattern FE_*.md (same guides, mobile interprets for mobile context)
Display: Show user a numbered list of available FE guides
```

If only 1 file exists → auto-select it.
If 0 files → inform user: "No FE guide files found. Ask BA to create guides first."

### Step 2: Read Guide & Adapt for Mobile

1. Read the selected `FE_{SEQ}_{Name}.md` file
2. Scan existing mobile screens/components for patterns
3. Adapt desktop UI specs to mobile-appropriate layout:
   - Desktop grid → Mobile list/card view
   - Desktop dialog → Mobile full-screen form
   - Desktop sidebar → Mobile bottom navigation / drawer

### Step 3: Implement for Mobile

Follow the guide's business logic EXACTLY, but adapt UI for mobile:
- Create screens and navigation as appropriate for mobile
- Integrate same API endpoints from guide
- Apply same validation rules
- Use mobile-native components

### Step 4: Report Results

```
✅ Mobile implementation complete:
  📄 Created: {list of files}
  
  Based on guide: FE_{SEQ}_{Name}.md
  Adapted for: Mobile platform
```

---

## 3. Rules

- Follow existing mobile project patterns and conventions
- API calls must EXACTLY match BE endpoint paths from guide
- Validation rules must mirror guide specifications
- NO documentation files inside the project
