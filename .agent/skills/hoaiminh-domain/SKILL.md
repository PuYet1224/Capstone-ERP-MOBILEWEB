---
name: hoaiminh-domain
description: REDIRECT — Domain knowledge has moved to BA workspace. Mobile-specific coding standards are in local instructions.md.
version: 2.0.0
---

# Hoai Minh Domain Knowledge — Mobile Redirect

> **⚠️ Domain files have moved to BA workspace.**

## Read from BA Workspace:

```
{BA_ROOT}\.agent\projects\hoaiminh\
├── domain/                          ← Business flows
│   ├── 01-glossary.md               ← Glossary
│   ├── 03-sales-flow.md             ← Sales flow
│   ├── 04-service-flow.md           ← Service flow (important for Mobile!)
│   ├── 06-database-schema.md        ← DB schema — API response fields
│   └── 07-business-rules.md         ← Business rules = LAW
├── standards/
│   ├── fe-standards.md              ← FE standards (Observable, DTO, enum naming)
│   └── be-standards.md              ← BE standards (do not read for FE)
└── memory/                          ← Feature memory (past implementations)
```

## Local Mobile-Specific File:

```
src/app/instructions.md              ← MASTER coding guide for Mobile project ← READ THIS FIRST
.agent/skills/mobile-design/SKILL.md ← Angular mobile patterns (OnPush, IntersectionObserver)
```

## Selective Reading

| Task | Read |
|------|------|
| Mobile component pattern | `skills/mobile-design/SKILL.md` (LOCAL) |
| All mobile coding rules | `src/app/instructions.md` (LOCAL) |
| FE API/DTO standards | `standards/fe-standards.md` (BA workspace) |
| Sale/Consultant features | `domain/03-sales-flow.md` (BA workspace) |
| Service/Maintenance features | `domain/04-service-flow.md` (BA workspace) |
| Unknown terms | `domain/01-glossary.md` (BA workspace) |
| DB field names | `domain/06-database-schema.md` (BA workspace) |

> **DO NOT** read BA domain files unless directly relevant to current task.
> **ALWAYS** read local `instructions.md` + `mobile-design/SKILL.md` before mobile work.
