---
description: FE reads FEMobile_Guide.md and implements mobile web code.
---

# /fe-implement - Frontend Mobile Implementation

## Input
- `.ai-pipeline/{section}/FEMobile_Guide.md`

## Steps

### 1. Read FEMobile_Guide.md
Identify: components, routes, API endpoints, mobile UX requirements.

### 2. Create Mobile Components
- Mobile-first layout
- Touch-friendly interactions
- Bottom navigation

### 3. Integrate APIs
- Match endpoints from guide
- Optimize for slow networks
- Cache where possible

### 4. Handle UI States
- Loading: skeleton loaders (prominent on mobile)
- Error: full-screen error with retry
- Empty: centered message
- Success: toast notification

### 5. Verify
- Build must pass
- Test mobile viewports
