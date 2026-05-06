# Gotchas — Common Mistakes to Avoid

> Reference for `coding-standard` skill. Loaded when debugging or reviewing code.

## Mobile-Specific Bugs

| Bug | Why it happens | Fix |
|-----|---------------|-----|
| API returns 404 | `tbl_SYSFunction.Product` is 1 (desktop), not 3 (mobile) | Fix DB: `UPDATE tbl_SYSFunction SET Product = 3` |
| Data loads but UI frozen | Missing `cdr.markForCheck()` after async call (OnPush) | Add `this.cdr.markForCheck()` after data assignment |
| Memory leak on navigate | `IntersectionObserver` or subscription not cleaned up | Call `observer.disconnect()` and unsubscribe in `ngOnDestroy` |
| Success toast on every scroll | `onSuccess()` called on GetList API | Only use `onSuccess()` for Create/Update/Delete |
| Scroll janky on iOS | Missing smooth scroll CSS | Add `-webkit-overflow-scrolling: touch` |
| Click delay on touch | Using `(click)` instead of touch events | Use `(touchstart)` for faster response when needed |

## Filter Bar Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Custom `<kendo-multiselect>` for status | Use `<ps-filter-status1>` — it's built-in |
| `<ps-filter-status1>` with `[data]="[]"` | MUST call `GetListStatus()` API in `ngOnInit()` |
| Custom reload/clear buttons | Use `<ps-filter-button>` — has 3 buttons built-in |
| Override `.ps-filter-bar` CSS (display, gap, flex-wrap) | NEVER override — globally styled in `styles.scss` |
| `<kendo-label>` above dropdown in filter bar | Use `[label]` input property on the dropdown instead |

## DTO & Enum Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Creating .dto.ts inside component folder | Create in `src/app/models/dtos/e-dtos/` |
| Creating enum inside component folder | Create in `src/app/models/enums/e-status/` or `e-type/` |
| Inline interfaces in component .ts | Create proper DTO class with defaults |
| Magic numbers in template (`*ngIf="item.Status !== 1"`) | Use enum: `*ngIf="item.Status !== StatusEnum.NEW"` |

## API Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| `this.http.post('/api/...')` | Use `MtbikeApiService` methods |
| Missing error handler in `.subscribe()` | Always handle both success and error callbacks |
| Subscription not tracked | Push to `arrUnsubscribe` array |
| `res.ObjectReturn.Items` | Mobile BE returns `res.ObjectReturn` directly (array) |
