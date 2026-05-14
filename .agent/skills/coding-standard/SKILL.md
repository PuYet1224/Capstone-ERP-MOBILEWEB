---
skill: coding-standard
role: FE-MOBILE
version: 1.0
trigger: "Pattern lookup, 'how to write', 'what component', component structure questions"
---

# FE Mobile Coding Standards

## Purpose

Authoritative reference for mobile web patterns. Load before building any screen.
Do NOT invent patterns -- read refs and copy.

## Hard Rules

- RULE-STD-01: NEVER hardcode hex colors -- use SCSS variables only
- RULE-STD-02: NEVER use `this.http` -- always use injected `MtbikeApiService`
- RULE-STD-03: Flexbox mandatory for layout -- never fixed heights for scrollable body
- RULE-STD-04: Vietnamese text in UI labels is OK -- but .agent/ files must be English

## References

1. **Theme and Layout** (`refs/mobile-theme-layout.md`)
   - Colors, typography, spacing
   - Mandatory 3-part screen layout (Header / Body / Footer)

2. **Components and API** (`refs/mobile-components-api.md`)
   - How to use Kendo wrappers (ps-*)
   - API calling patterns
   - PsCache for data passing between screens
   - Status Pipes

3. **Clean Code Rules** (`refs/clean-code.md`)
   - TypeScript conventions, naming, function rules
   - Anti-patterns to avoid
