---
name: request-triage
description: >
  Classify user intent and route to the correct skill/workflow combination.
  Use when the user sends a casual message without a /slash-command.
  Lightweight classifier — reads message, determines intent, loads appropriate skills.
  Do NOT use when user already specified a slash command.
---

# Request Triage — Intent Classifier

## When to Skip
- User already used a slash command (`/debug`, `/enhance`, etc.)
- Simple question (< 20 words, no code context)
- Data ops (DB queries, deploy, reset) or conversational

## Classification

| Signals | Intent | Skill | Workflow |
|---------|--------|-------|----------|
| "lỗi", "bug", "fix", "crash", "không được", error screenshot | **BUG** | `debug` | `/debug` |
| "implement", "tạo component", "code mới", "làm màn hình" | **NEW_FEATURE** | `coding-standard` + `figma-reader` | `/fe-mobile-implement` |
| "thêm", "đổi", "cải thiện", "UX", "bỏ button", existing screen changes | **ENHANCE** | `coding-standard` | `/enhance` |
| "review", "check code", "trước khi commit", "kiểm tra" | **REVIEW** | `code-review` | `/review` |
| "xóa data", "query DB", "deploy", "restart" | **OPS** | None | Direct response |
| Question, "tại sao", "giải thích", research | **CHAT** | None | Direct response |

## Flow

1. Read the message
2. Classify using table above
3. Announce: `🎯 {Intent} → Loading {skills} → Following {workflow}`
4. Load skill(s) via `view_file`
5. Execute workflow

> If unsure, ask the user. If multiple intents, handle sequentially (BUG first).
