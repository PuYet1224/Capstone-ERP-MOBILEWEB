---
name: fe-architecture
description: Angular 16 + Kendo v13 Vertical Slice Architecture standard. MANDATORY for ALL FE code generation. Defines folder structure, component patterns, dependency rules, and code templates. Read BEFORE writing ANY Angular code.
---

# FE Architecture Standard — Capstone ERP Mobile

> **Version:** 2.0 (2026)
> **Pattern:** Vertical Slice Architecture
> **Stack:** Angular 16 + Kendo v13 + Standalone + Signals

---

## MANDATORY RULES (NEVER VIOLATE)

### Rule 1: Standalone ONLY
- ALL components MUST have `standalone: true`
- NEVER create NgModule (no `@NgModule`)
- Import Kendo via utility arrays: `KENDO_GRID`, `KENDO_BUTTON`, `KENDO_DROPDOWNS`

### Rule 2: OnPush ALWAYS
- EVERY component MUST have `changeDetection: ChangeDetectionStrategy.OnPush`
- No exceptions. Zero.

### Rule 3: Signals for State
- Use `signal()` for mutable state
- Use `computed()` for derived state
- NEVER use `BehaviorSubject` for UI state
- Keep RxJS ONLY for HTTP calls (Observable from HttpClient)

### Rule 4: inject() ONLY
- Use `inject()` function, NEVER constructor injection
- `private service = inject(MyService);`

### Rule 5: takeUntilDestroyed ALWAYS
- EVERY `.subscribe()` MUST pipe through `takeUntilDestroyed(this.destroyRef)`
- `private destroyRef = inject(DestroyRef);`
- NEVER use `arrUnsubscribe` or manual subscription management

### Rule 6: File Size Limit
- Component: MAX 80 lines
- Store: MAX 60 lines
- Service: MAX 100 lines
- If exceeding limit: SPLIT into smaller units

### Rule 7: Feature Self-Contained
- EVERY feature folder MUST contain: component.ts, .html, .scss, .store.ts, .service.ts, .model.ts, .routes.ts
- Feature MUST NOT import from another feature
- Shared code goes to `shared/`

---

## FOLDER STRUCTURE

```
src/app/
├── core/                          # Singleton services (1 instance)
│   ├── api/
│   │   ├── api.service.ts         # HTTP wrapper (< 30 lines)
│   │   └── api-url.config.ts      # URL registry
│   ├── auth/
│   │   ├── auth.guard.ts          # Functional guard
│   │   └── auth.interceptor.ts    # Functional interceptor
│   ├── config/
│   │   └── app-config.service.ts
│   └── loader/
│       └── loader.service.ts
│
├── shared/                        # Reusable, stateless
│   ├── ui/                        # Kendo wrappers (all Standalone)
│   ├── pipes/                     # Standalone pipes
│   ├── models/                    # Shared DTOs + Enums
│   └── utils/                     # Pure functions
│
├── features/                      # Business domains (Vertical Slices)
│   ├── dashboard/
│   ├── consultant/
│   ├── collection/
│   ├── payment/
│   ├── repair/
│   └── system/
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## DEPENDENCY RULES

```
Feature  → Shared   ✅ OK
Feature  → Core     ✅ OK
Feature  → Feature  ❌ FORBIDDEN
Shared   → Core     ✅ OK
Shared   → Feature  ❌ FORBIDDEN
Core     → Feature  ❌ FORBIDDEN
```

---

## CODE TEMPLATES

### Template: Feature Component
```typescript
import { Component, inject, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// imports...

@Component({
  standalone: true,
  imports: [/* Kendo + Shared components */],
  providers: [/* FeatureStore */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './<name>.component.html',
  styleUrls: ['./<name>.component.scss']
})
export class <Name>Component implements OnInit {
  protected store = inject(<Name>Store);
  private service = inject(<Name>Service);
  private destroyRef = inject(DestroyRef);

  ngOnInit() { this.load(); }

  private load() {
    this.store.loading.set(true);
    this.service.getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.StatusCode === 0) this.store.data.set(res.ObjectReturn);
          this.store.loading.set(false);
        },
        error: () => this.store.loading.set(false)
      });
  }
}
```

### Template: Feature Store
```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable()
export class <Name>Store {
  readonly data = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selected = signal<any | null>(null);

  readonly total = computed(() => this.data().length);
}
```

### Template: Feature Service
```typescript
import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ApiUrl } from '../../core/api/api-url.config';
import { ResponseDTO } from '../../shared/models/response.dto';

@Injectable({ providedIn: 'root' })
export class <Name>Service {
  private api = inject(ApiService);

  getList(params?: any) {
    return this.api.post<ResponseDTO>(ApiUrl.<Endpoint>, params);
  }

  getDetail(code: number) {
    return this.api.post<ResponseDTO>(ApiUrl.<DetailEndpoint>, code);
  }

  save(data: any) {
    return this.api.post<ResponseDTO>(ApiUrl.<SaveEndpoint>, data);
  }
}
```

### Template: Feature Routes
```typescript
import { Routes } from '@angular/router';

export const <NAME>_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/<name>-list.component').then(m => m.<Name>ListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/<name>-detail.component').then(m => m.<Name>DetailComponent)
  }
];
```

---

## API SERVICE PATTERN

### CORRECT (< 30 lines):
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  post<T = ResponseDTO>(url: string, body?: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }
}
```

### WRONG (anti-pattern — NEVER do this):
```typescript
// ❌ NEVER wrap Observable in new Observable
GetList() {
  return new Observable(obs => {
    this.api.post(url).subscribe(res => { obs.next(res); obs.complete(); });
  });
}
```

---

## NAMING CONVENTIONS

| Item | Pattern | Example |
|---|---|---|
| Feature folder | kebab-case, business name | `consultant/`, `payment/` |
| Component | `<feature>-<action>.component.ts` | `consultant-list.component.ts` |
| Store | `<feature>.store.ts` | `consultant.store.ts` |
| Service | `<feature>.service.ts` | `consultant.service.ts` |
| Model | `<feature>.model.ts` | `consultant.model.ts` |
| Routes | `<feature>.routes.ts` | `consultant.routes.ts` |
| Shared UI | `ps-<name>.component.ts` | `ps-grid.component.ts` |
| Pipe | `<name>.pipe.ts` | `currency-vnd.pipe.ts` |
