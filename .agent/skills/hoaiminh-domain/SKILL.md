---
name: hoaiminh-domain
description: REDIRECT -- Domain knowledge lives in BA workspace. Mobile-specific patterns in local instructions.md and mobile-design skill. Read BA_ROOT from GEMINI.md.
version: 2.0.0
---

# Hoai Minh Domain Knowledge -- Mobile Redirect

> **MOVED:** Domain files live in BA workspace. BA_ROOT is defined in GEMINI.md.

## How to Find BA Workspace

Read `BA_ROOT` from this workspace's `GEMINI.md` WORKSPACE_MAP section.
Then access: `{BA_ROOT}/.agent/projects/hoaiminh/`

## Local Mobile-Specific Files (stay local -- read FIRST):

`
src/app/instructions.md                (MASTER coding guide for mobile project)
.agent/skills/mobile-design/SKILL.md   (Angular mobile patterns: OnPush, IntersectionObserver)
`

## Selective Reading Rule

| Task | Read From |
|------|-----------|
| Mobile component patterns | `skills/mobile-design/SKILL.md` (LOCAL) |
| All mobile coding rules | `src/app/instructions.md` (LOCAL) |
| FE API/DTO standards | `{BA_ROOT}/.agent/projects/hoaiminh/standards/fe-standards.md` |
| Sale/Consultant features | `{BA_ROOT}/.agent/projects/hoaiminh/domain/03-sales-flow.md` |
| Service/Maintenance features | `{BA_ROOT}/.agent/projects/hoaiminh/domain/04-service-flow.md` |
| Unknown terms | `{BA_ROOT}/.agent/projects/hoaiminh/domain/01-glossary.md` |
| DB field names | `{BA_ROOT}/.agent/projects/hoaiminh/domain/06-database-schema.md` |

> **DO NOT** read BA domain files unless directly relevant to current task.
> **ALWAYS** read local `instructions.md` + `mobile-design/SKILL.md` before any mobile work.