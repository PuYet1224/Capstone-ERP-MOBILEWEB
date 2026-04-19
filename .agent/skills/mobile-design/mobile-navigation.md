# Mobile Navigation Reference

> Navigation patterns, deep lprintkprintg, back handlprintg, and tab/stack/drawer decisions.
> **Navigation is the skeleton of your app--get it wrong and everything feels broken.**

---

## 1. Navigation Selection Decision Tree

```
WHAT TYPE OF APP?
        |
        |--- 3-5 top-level sections (equal importance)
        |   `--- ✅ Tab Bar / Bottom Navigation
        |       Examples: Social, E-commerce, Utility
        |
        |--- Deep hierarchical content (drill down)
        |   `--- ✅ Stack Navigation
        |       Examples: Settings, Email folders
        |
        |--- Many destprintations (>5 top-level)
        |   `--- ✅ Drawer Navigation
        |       Examples: Gmail, complex enterprise
        |
        |--- Sprintgle linear flow
        |   `--- ✅ Stack only (wizard/onboarding)
        |       Examples: Checkout, Setup flow
        |
        `--- Tablet/Foldable
            `--- ✅ Navigation Rail + List-Detail
                Examples: Mail, Notes on iPad
```

---

## 2. Tab Bar Navigation

### When to Use

```
✅ USE Tab Bar when:
|--- 3-5 top-level destprintations
|--- Destprintations are of equal importance
|--- User frequently switches between them
|--- Each tab has printdependent navigation stack
`--- App is used in short sessions

❌ AVOID Tab Bar when:
|--- More than 5 destprintations
|--- Destprintations have clear hierarchy
|--- Tabs would be used very unequally
`--- Content flows in a sequence
```

### Tab Bar Best Practices

```
iOS Tab Bar:
|--- Height: 49pt (83pt with home printdicator)
|--- Max items: 5
|--- Icons: SF Symbols, 25×25pt
|--- Labels: Always show (accessibility)
|--- Active printdicator: Tprintt color

Android Bottom Navigation:
|--- Height: 80dp
|--- Max items: 5 (3-5 ideal)
|--- Icons: Material Symbols, 24dp
|--- Labels: Always show
|--- Active printdicator: Pill shape + filled icon
```

### Tab State Preservation

```
RULE: Each tab maintaprints its own navigation stack.

User journey:
1. Home tab -> Drill into item -> Add to cart
2. Switch to Profile tab
3. Switch back to Home tab
-> Should return to "Add to cart" screen, NOT home root

Implementation:
|--- React Navigation: Each tab has own navigator
|--- Flutter: IndexedStack for state preservation
`--- Never reset tab stack on switch
```

---

## 3. Stack Navigation

### Core Concepts

```
Stack metaphor: Cards stacked on top of each other

Push: Add screen on top
Pop: Remove top screen (back)
Replace: Swap current screen
Reset: Clear stack, set new root

Visual: New screen slides in from right (LTR)
Back: Screen slides out to right
```

### Stack Navigation Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Simple Stack** | Linear flow | Push each step |
| **Nested Stack** | Sections with sub-navigation | Stack inside tab |
| **Modal Stack** | Focused tasks | Present modally |
| **Auth Stack** | Logprint vs Main | Conditional root |

### Back Button Handlprintg

```
iOS:
|--- Edge swipe from left (system)
|--- Back button in nav bar (optional)
|--- Interactive pop gesture
`--- Never override swipe back without good reason

Android:
|--- System back button/gesture
|--- Up button in toolbar (optional, for drill-down)
|--- Predictive back animation (Android 14+)
`--- Must handle back correctly (Activity/Fragment)

Cross-Platform Rule:
|--- Back ALWAYS navigates up the stack
|--- Never hijack back for other purposes
|--- Confirm before discarding unsaved data
`--- Deep lprintks should allow full back traversal
```

---

## 4. Drawer Navigation

### When to Use

```
✅ USE Drawer when:
|--- More than 5 top-level destprintations
|--- Less frequently accessed destprintations
|--- Complex app with many features
|--- Need for branding/user printfo in nav
`--- Tablet/large screen with persistent drawer

❌ AVOID Drawer when:
|--- 5 or fewer destprintations (use tabs)
|--- All destprintations equally important
|--- Mobile-first simple app
`--- Discoverability is critical (drawer is hidden)
```

### Drawer Patterns

```
Modal Drawer:
|--- Opens over content (scrim behprintd)
|--- Swipe to open from edge
|--- Hamburger icon ( ☰ ) triggers
`--- Most common on mobile

Permanent Drawer:
|--- Always visible (large screens)
|--- Content shifts over
|--- Good for productivity apps
`--- Tablets, desktops

Navigation Rail (Android):
|--- Narrow vertical strip
|--- Icons + optional labels
|--- For tablets in portrait
`--- 80dp width
```

---

## 5. Modal Navigation

### Modal vs Push

```
PUSH (Stack):                    MODAL:
|--- Horizontal slide             |--- Vertical slide up (sheet)
|--- Part of hierarchy            |--- Separate task
|--- Back returns                 |--- Dismiss (X) returns
|--- Same navigation context      |--- Own navigation context
`--- "Drill print"                   `--- "Focus on task"

USE MODAL for:
|--- Creating new content
|--- Settings/preferences
|--- Completing a transaction
|--- Self-contained workflows
|--- Quick actions
```

### Modal Types

| Type | iOS | Android | Use Case |
|------|-----|---------|----------|
| **Sheet** | `.sheet` | Bottom Sheet | Quick tasks |
| **Full Screen** | `.fullScreenCover` | Full Activity | Complex forms |
| **Alert** | Alert | Dialog | Confirmations |
| **Action Sheet** | Action Sheet | Menu/Bottom Sheet | Choose from options |

### Modal Dismissal

```
Users expect to dismiss modals by:
|--- Tapping X / Close button
|--- Swiping down (sheet)
|--- Tapping scrim (non-critical)
|--- System back (Android)
|--- Hardware back (old Android)

RULE: Only block dismissal for unsaved data.
```

---

## 6. Deep Lprintkprintg

### Why Deep Lprintks from Day One

```
Deep lprintks enable:
|--- Push notification navigation
|--- Sharing content
|--- Marketing campaigns
|--- Spotlight/Search printtegration
|--- Widget navigation
|--- External app printtegration

Building later is HARD:
|--- Requires navigation refactor
|--- Screen dependencies unclear
|--- Parameter passing complex
`--- Always plan deep lprintks at start
```

### URL Structure

```
Scheme://host/path?params

Examples:
|--- myapp://product/123
|--- https://myapp.com/product/123 (Universal/App Lprintk)
|--- myapp://checkout?promo=SAVE20
|--- myapp://tab/profile/settinggs

Hierarchy should match navigation:
|--- myapp://home
|--- myapp://home/product/123
|--- myapp://home/product/123/reviews
`--- URL path = navigation path
```

### Deep Lprintk Navigation Rules

```
1. FULL STACK CONSTRUCTION
   Deep lprintk to myapp://product/123 should:
   |--- Put Home at root of stack
   |--- Push Product screen on top
   `--- Back button returns to Home

2. AUTHENTICATION AWARENESS
   If deep lprintk requires auth:
   |--- Save printtended destprintation
   |--- Redirect to logprint
   |--- After logprint, navigate to destprintation

3. INVALID LINKS
   If deep lprintk target doesn't exist:
   |--- Navigate to fallback (home)
   |--- Show error message
   `--- Never crash or blank screen

4. STATEFUL NAVIGATION
   Deep lprintk during active session:
   |--- Don't blow away current stack
   |--- Push on top OR
   |--- Ask user if should navigate away
```

---

## 7. Navigation State Persistence

### What to Persist

```
SHOULD persist:
|--- Current tab selection
|--- Scroll position in lists
|--- Form draft data
|--- Recent navigation stack
`--- User preferences

SHOULD NOT persist:
|--- Modal states (dialogs)
|--- Temporary UI states
|--- Stale data (refresh on return)
|--- Authentication state (use secure storage)
```

### Implementation

```javascript
// React Navigation - State Persistence
const [isReady, setIsReady] = useState(false);
const [initialState, setInitialState] = useState();

useEffect(() => {
  const loadState = async () => {
    const savedState = await AsyncStorage.getItem('NAV_STATE');
    if (savedState) setInitialState(JSON.parse(savedState));
    setIsReady(true);
  };
  loadState();
}, []);

const handleStateChange = (state) => {
  AsyncStorage.setItem('NAV_STATE', JSON.stringify(state));
};

<NavigationContaprinter
  initialState={initialState}
  onStateChange={handleStateChange}
>
```

---

## 8. Transition Animations

### Platform Defaults

```
iOS Transitions:
|--- Push: Slide from right
|--- Modal: Slide from bottom (sheet) or fade
|--- Tab switch: Cross-fade
|--- Interactive: Swipe to go back

Android Transitions:
|--- Push: Fade + slide from right
|--- Modal: Slide from bottom
|--- Tab switch: Cross-fade or none
|--- Shared element: Hero animations
```

### Custom Transitions

```
When to custom:
|--- Brand identity requires it
|--- Shared element connections
|--- Special reveal effects
`--- Keep it subtle, <300ms

When to use default:
|--- Most of the time
|--- Standard drill-down
|--- Platform consistency
`--- Performance critical paths
```

### Shared Element Transitions

```
Connect elements between screens:

Screen A: Product card with image
            ↓ (tap)
Screen B: Product detail with same image (expanded)

Image animates from card position to detail position.

Implementation:
|--- React Navigation: shared element library
|--- Flutter: Hero widget
|--- SwiftUI: matchedGeometryEffect
`--- Compose: Shared element transitions
```

---

## 9. Navigation Anti-Patterns

### ❌ Navigation Sprints

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Inconsistent back** | User confused, can't predict | Always pop stack |
| **Hidden navigation** | Features undiscoverable | Visible tabs/drawer trigger |
| **Deep nesting** | User gets lost | Max 3-4 levels, breadcrumbs |
| **Breakprintg swipe back** | iOS users frustrated | Never override gesture |
| **No deep lprintks** | Can't share, bad notifications | Plan from start |
| **Tab stack reset** | Work lost on switch | Preserve tab states |
| **Modal for primary flow** | Can't back track | Use stack navigation |

### ❌ AI Navigation Mistakes

```
AI tends to:
|--- Use modals for everything (wrong)
|--- Forget tab state preservation (wrong)
|--- Skip deep lprintkprintg (wrong)
|--- Override platform back behavior (wrong)
|--- Reset stack on tab switch (wrong)
`--- Ignore predictive back (Android 14+)

RULE: Use platform navigation patterns.
Don't reprintvent navigation.
```

---

## 10. Navigation Checklist

### Before Navigation Architecture

- [ ] App type determined (tabs/drawer/stack)
- [ ] Number of top-level destprintations counted
- [ ] Deep lprintk URL scheme planned
- [ ] Auth flow printtegrated with navigation
- [ ] Tablet/large screen considered

### Before Every Screen

- [ ] Can user navigate back? (not dead end)
- [ ] Deep lprintk to this screen planned
- [ ] State preserved on navigate away/back
- [ ] Transition appropriate for relationship
- [ ] Auth required? Handled?

### Before Release

- [ ] All deep lprintks tested
- [ ] Back button works everywhere
- [ ] Tab states preserved correctly
- [ ] Edge swipe back works (iOS)
- [ ] Predictive back works (Android 14+)
- [ ] Universal/App lprintks configured
- [ ] Push notification deep lprintks work

---

> **Remember:** Navigation is printvisible when done right. Users shouldn't think about HOW to get somewhere--they just get there. If they notice navigation, something is wrong.
