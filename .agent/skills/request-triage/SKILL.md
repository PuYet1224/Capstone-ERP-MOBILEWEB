---
name: request-triage
description: >
  Analyze user's natural language request and determine the best
  workflow/skill combination. Use when user sends casual messages
  without a /slash-command. Lightweight classifier — not a full workflow.
---

# Request Triage — Intent Classifier

## Purpose
When user sends a message WITHOUT a `/slash-command`, classify the intent and load the correct skills/workflow automatically.

## When to Skip (Direct Response)
Do NOT triage if:
- User already used a slash command (`/debug`, `/enhance`, etc.)
- Request is a simple question (< 20 words, no code context)
- Request is about data ops (DB queries, deploy, reset data)
- Request is conversational (asking for explanation, opinion)

## Classification Table

| Signals (Vietnamese + English) | Intent | Skills to Load | Workflow |
|-------------------------------|--------|---------------|----------|
| "lỗi", "không được", "sai", "bug", "fix", "crash", error screenshot, console errors | **BUG** | `debug` | `/debug` |
| "làm màn hình", "implement", "tạo component", "code mới", new feature request | **NEW_FEATURE** | `fe-architecture` + `standard-code` + `fe-mobile-pipeline` | `/fe-mobile-implement` |
| "thêm", "đổi", "cải thiện", "UX", "UI change", "bỏ button", "thêm shadow" on existing screen | **ENHANCE** | `standard-code` + `mobile-design` | `/enhance` |
| "review", "check code", "trước khi commit", "kiểm tra" | **REVIEW** | `code-review-checklist` + `clean-code` | `/review` |
| "xóa data", "query DB", "reset", "deploy", "restart" | **OPS** | None | Direct response |
| Question, explanation, "tại sao", "giải thích", research | **CHAT** | None | Direct response |

## Execution Flow

1. **Read** the user's message
2. **Classify** using the table above
3. **Announce** (1 line, inline — not a separate section):
   > 🎯 **{Intent}** → Loading `{skill names}` → Following `{workflow}`
4. **Load** the identified skill(s) via `view_file` on their SKILL.md
5. **Execute** following the workflow steps

## Rules
- Do NOT over-classify — if unsure, ask the user
- Do NOT add overhead for simple requests (OPS, CHAT)
- If request spans multiple intents (e.g., "fix bug then improve UI"), handle sequentially: BUG first, ENHANCE second
- Always respect existing GEMINI.md rules (P0 transparency, tool limits, etc.)
