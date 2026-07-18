---
title: Hydration
---

# Hydration

This project use **@hono/ssg** for Static Site Generation of pages, emitting **static HTML** by default, and only
components that genuinely need client-side interactivity are "promoted" to islands (client JS
snippets). This is the full reference for that system — see [UI Components Architecture](/docs/Architecture) for the project-level overview.

## The Core Predicate

`app/components/ui/island-utils.ts`:

```ts
/**
 * Decide whether a component should hydrate as a client-side island.
 *
 * @param interactive - the component's `interactive` prop (boolean | undefined)
 * @param hasSignal   - whether the component carries a "behaviour signal": an event
 *                      handler (onClick / onValueChange …) or a controlled/default
 *                      state (value / checked / open …) that only makes sense with JS.
 *
 * Semantics:
 *  - interactive === false → never hydrate (explicit opt-out)
 *  - interactive === true  → always hydrate (explicit opt-in)
 *  - interactive omitted    → hydrate iff hasSignal is true
 */
export function shouldHydrate(interactive: unknown, hasSignal: boolean): boolean {
	return interactive !== false && Boolean(interactive || hasSignal);
}
```

### Truth table

| `interactive` | `hasSignal` | Result | Meaning |
| --- | --- | --- | --- |
| `false` | any | `false` | Explicitly forbidden to hydrate (pure static) |
| `true` | any | `true` | Explicitly forced to hydrate |
| `undefined` | `true` | `true` | Smart-detect: signal present → hydrate |
| `undefined` | `false` | `false` | Smart-detect: no signal → static |

***

## The 3-Tier Model

### Tier-1 — Auto-interactive

> **Core rule: `shouldHydrate(interactive, true)`**

These components _are_ interaction — their entire value depends on client JS
(overlays, modals, drag handles, expand/collapse). They hydrate
unless the caller explicitly passes `interactive={false}`.

Applies to:

- Overlay / popover families (tooltip, hover-card, popover, menu)
- Modals / drawers / drag (dialog, drawer, splitter)
- Expand / collapse (collapsible)
- Pure client singletons (toast)

### Tier-2 — Smart auto-detect

> **Core rule: `shouldHydrate(interactive, hasSignal)`**

These components are _static by default, interactive only when a signal is present_.
They are **controlled/uncontrolled form controls or selectable groups**: hydration only
matters when state (`value` / `checked` / `defaultValue`) or a handler
(`onChange` / `onClick` …) is supplied; otherwise static markup is enough.

Applies to:

- Form controls (button, checkbox, switch, textarea, field, slider, combobox, radio-group)
- Selectable groups (segment-group, toggle-group)
- Tables with row clicks (table)
- Avatar with a `src` (the async image load / error lifecycle is a client-only cue)
- Pagination / tags-input (state + handlers; a `type="link"` pagination that supplies
  `getPageUrl` is pure navigation and stays static)

### Tier-3 — Presentational

> **Never mounts an island**

Pure typographic / decorative components with no client behaviour. They **must not declare**
**an `interactive` prop** (historically `badge` / `heading` / `text` / `fieldset` mistakenly
declared it and leaked the attribute onto the DOM — now removed).

Applies to:

- Typography (text, heading, badge)
- Layout (group, absolute-center, fieldset)
- Status indicators (alert, breadcrumb, loader, skeleton, spinner, progress)
- Graphics (icon)

***

## Full Component Classification

> Status legend: `✅` conforms to the convention; `⚠️` diverges from the convention and
> needs migration (see Section 7). After the latest cleanup pass, **all components are `✅`**.

### Tier-1 (auto-interactive)

| Component | Rule | Trigger | Status |
| --- | --- | --- | --- |
| `dialog` | `shouldHydrate(interactive, true)` | Always hydrates unless `interactive={false}` | ✅ `dialog.tsx` |
| `drawer` | `shouldHydrate(interactive, true)` | Always hydrates unless `interactive={false}` | ✅ `drawer.tsx` |
| `splitter` | `shouldHydrate(interactive, true)` | Always hydrates unless `interactive={false}` | ✅ `splitter.tsx` |
| `tooltip` | `shouldHydrate(interactive, true)` | Always hydrates | ✅ `tooltip.tsx` |
| `hover-card` | `shouldHydrate(interactive, true)` | Always hydrates | ✅ `hover-card.tsx` |
| `popover` | `shouldHydrate(interactive, true)` | Always hydrates | ✅ `popover.tsx` |
| `menu` | `shouldHydrate(interactive, true)` | Always hydrates | ✅ `menu.tsx` |
| `select` | `shouldHydrate(interactive, true)` | Always hydrates — opening the dropdown and selecting an item require JS; there is no static fallback (the native `<select>` is visually hidden and exists only for form submission) | ✅ `select.tsx` (Tier-1) |
| `collapsible` | `shouldHydrate(interactive, true)` | Always hydrates (expand/collapse needs JS) | ✅ `collapsible.tsx` (Tier-1) |
| `toast` | Always island (client singleton) | No prop, always an island | ✅ `toast.tsx` |

### Tier-2 (smart auto-detect)

| Component | Behaviour signal (`hasSignal` is true when…) | Status |
| --- | --- | --- |
| `button` | `onClick` / `onPointerDown` / `onSubmit` | ✅ `button.tsx` |
| `card` | `onClick` / `onPointerDown` | ✅ `card.tsx` |
| `table` | any `row.onClick` | ✅ `table.tsx` |
| `segment-group` | `value` / `defaultValue` / `onValueChange` | ✅ `segment-group.tsx` |
| `toggle-group` | `value` / `defaultValue` / `onValueChange` | ✅ `toggle-group.tsx` |
| `slider` | `value` / `defaultValue` / `onChange` / `onDraggingChange` | ✅ `slider.tsx` |
| `checkbox` | `checked` / `defaultChecked` / `onCheckedChange` | ✅ `checkbox.tsx` |
| `switch` | `checked` / `defaultChecked` / `onCheckedChange` | ✅ `switch.tsx` |
| `textarea` | `value` / `defaultValue` / `onValueChange` / `validator` / `minLength` | ✅ `textarea.tsx` |
| `field` | `value` / `defaultValue` / `onValueChange` / `validator` / `minLength` | ✅ `field.tsx` |
| `combobox` | `open` / `inputValue` / `onToggle` / `onInputChange` / `onItemSelect` | ✅ `combobox.tsx` |
| `radio-group` | `value` / `defaultValue` / `onValueChange` | ✅ `radio-group.tsx` |
| `avatar` | `src` (async image load / error lifecycle) | ✅ `avatar.tsx` (Tier-2) |
| `pagination` | `onPageChange`, or non-link `page` / `defaultPage` / `pageSize` / `defaultPageSize` | ✅ `pagination.tsx` |
| `tags-input` | `onValueChange` / `onInputValueChange` / `value` / `inputValue` / `defaultValue` / `defaultInputValue` | ✅ `tags-input.tsx` |
| `paginated-table` | Always island (manages internal pagination state) | ✅ `paginated-table.tsx` (Tier-2 logic) |
| `date-picker` | `value` / `defaultValue` / `focusedValue` / `open` / `defaultOpen` / `onValueChange` / `onOpenChange` / (keyboard/click/typing events) | ✅ `date-picker.tsx` |
| `color-picker` | `value` / `defaultValue` / `format` / `defaultFormat` / `open` / `defaultOpen` / `onValueChange` / `onFormatChange` / `onOpenChange` / (pointer/keyboard/input events) | ✅ `color-picker.tsx` |

### Tier-3 (presentational)

| Component | Notes | Status |
| --- | --- | --- |
| `text` | Typographic text | ✅ |
| `heading` | Heading | ✅ |
| `badge` | Badge | ✅ (dead `interactive` prop removed) |
| `fieldset` | Form fieldset | ✅ (dead `interactive` prop removed) |
| `alert` | Alert box | ✅ |
| `breadcrumb` | Breadcrumb | ✅ |
| `group` | Layout grouping | ✅ |
| `absolute-center` | Centering layout | ✅ |
| `loader` | Loading indicator | ✅ |
| `skeleton` | Skeleton screen | ✅ |
| `spinner` | Spinner indicator | ✅ |
| `progress` | Progress bar (value-driven, static by default) | ✅ |
| `icon` | SVG icon wrapper (size/color only, no client state) | ✅ `icon.tsx` |

***

## Trigger Conditions per Tier

### Tier-1 conditions

- The component's core interaction (opening an overlay, dragging a splitter, expand/collapse,
  modal focus-trap) **cannot be expressed in pure HTML**, so `hasSignal`
  defaults to `true`.
- The only legal opt-out is `interactive={false}` (e.g. force-disabling an overlay inside a
  purely static document).
- `toast` is special: it is a global client singleton (`toaster.create(...)`), and does not
  expose an `interactive` prop.

### Tier-2 conditions

Each component's `hasSignal` is a boolean OR over "is this prop defined?":

```typescript
// Typical pattern (segment-group shown)
const hasSignal =
	rest.value !== undefined ||
	rest.defaultValue !== undefined ||
	rest.onValueChange !== undefined;
if (shouldHydrate(interactive, hasSignal)) return <SegmentGroupIsland {...rest} />;
return <Root {...rest}>{/* static structure */}</Root>;
```

Decision principles:

1. **Controlled state** (`value` / `checked` / `open` / `inputValue`) → needs JS to stay in sync.
2. **Uncontrolled initial value** (`defaultValue` / `defaultChecked`) → needs JS to hold internal state.
3. **Event handlers** (`onChange` / `onClick` / `onValueChange` / `onItemSelect` …) → needs JS to respond.
4. **Validation / constraints** (`validator` / `minLength`) → needs JS to execute.
5. **Async / client-only cues** — `src` on `avatar` (implies a load/error lifecycle),
   or any prop whose only purpose is a client-side effect (media, intersection, lazy
   loading). These cannot resolve without JS, so they count as a signal.
6. Any one of the above being present makes `hasSignal` true, which triggers hydration;
   if all are absent, the component renders as pure static markup.

> **`avatar` is special among Tier-2 components:** its signal is the async-load cue `src`.
> When `src` is present the image needs client-side load/error handling, so
> `shouldHydrate(interactive, Boolean(src))` hydrates it; an `avatar` with no `src` (e.g. a
> initials fallback) stays static. An explicit `interactive={false}` suppresses hydration even
> when `src` exists (consistent with the library-wide "`false` wins" semantics).

> **`pagination` link-mode exception:** a `type="link"` pagination that supplies `getPageUrl`
> is pure navigation (each page is an anchor), so it stays static unless an explicit
> `onPageChange` handler is supplied. Only in button mode (or with `onPageChange`) do the
> `page` / `defaultPage` / `pageSize` / `defaultPageSize` props count as signals.

### Tier-3 conditions

- The component holds no client state and responds to no events.
- It does not declare an `interactive` prop. (Historically `badge` / `heading` / `text` /
  `fieldset` wrongly declared it and leaked `interactive="true"` onto the DOM; that has
  been removed in cleanup.)

***

## Decision Checklist for New Components

Walk the list in order; stop at the first match:

1. **Does its existence depend entirely on client JS?**
   Overlay / modal / drag / expand-collapse → **Tier-1**, use
   `shouldHydrate(interactive, true)`.
2. **Is it a form control or a visually-selectable component that may be controlled or**
\*\*   uncontrolled?\*\*
   button / checkbox / switch / slider / combobox / row-click table … → **Tier-2**,
   define `hasSignal` (state + handlers) then call `shouldHydrate(interactive, hasSignal)`.
3. **Is it purely typographic / layout / decorative?**
   text / heading / alert / group / progress … → **Tier-3**, no `interactive` prop, no island.

**Hard implementation requirements:**

- No component may write a bare `if (interactive) { … }` branch; always go through `shouldHydrate`.
- `interactive` is only a "knob": `true` forces, `false` forbids, `undefined` defers to `hasSignal`.
- Every Tier-1 / Tier-2 component should add a `# Hydration` section to its
  `content/components/<Component>.mdx` and cross-reference this file, and set
  its frontmatter `hydration-tier` to match.

***

## Historical Cleanup Log (already fixed)

The following divergences were resolved during convention rollout; kept here for traceability:

| # | Component | Original divergence | Fix |
| --- | --- | --- | --- |
| 1 | `splitter` / `dialog` / `drawer` | Hardcoded `interactive = true` + `if (interactive)`, bypassing `shouldHydrate` | Switched to `shouldHydrate(interactive, true)`, restoring the `interactive={false}` opt-out |
| 2 | `radio-group` | `interactive ? Island : Root`, forcing callers to pass `interactive` | Switched to `shouldHydrate(interactive, hasSignal)`, signals `value` / `defaultValue` / `onValueChange` |

| 3 | `avatar` | Ad-hoc \`if (rest.src |  | interactive)\` | Switched to `shouldHydrate(interactive, Boolean(rest.src))`, unified entry point |

| 4 | `badge` / `heading` / `text` / `fieldset` | Dead `interactive` prop declared, leaked onto the DOM via `restProps` (`interactive="true"`) | Removed the `interactive` prop declaration |
| 5 | `collapsible` | Tier not documented explicitly | Added a `# Hydration` section to `docs/Collapsible.md`, marking it Tier-1 |
| 6 | `tags-input` | Bare `if (isInteractive)` branch, no `interactive` prop, no `shouldHydrate`, and `defaultValue` / `defaultInputValue` omitted from the signal set (an uncontrolled tags-input rendered static) | Switched to `shouldHydrate(interactive, hasSignal)`, added the `interactive` knob, extended the signal set to include `defaultValue` / `defaultInputValue` |
| 7 | `pagination` / `avatar` | Missing from the tier tables (`pagination` absent entirely; `avatar` mis-classified as Tier-1) and `pagination` over-hydrated in link mode | Added `pagination` + `tags-input` to Tier-2; moved `avatar` to Tier-2 (load-cue signal); gated `pagination` link-mode so pure-navigation stays static |

> Note: item 4 was a real bug — `badge` / `heading` / `text` / `fieldset` would render
> `interactive` as an invalid HTML attribute on the DOM; it was prioritised for repair.

***

## Related Documentation

- [UI Components Architecture](/docs/Architecture) — the project-level overview
- `app/components/ui/island-utils.ts` — the single decision entry point
- `content/components/<Component>.mdx` (each Tier-1 / Tier-2 component) — its
  own `# Hydration` section, plus `hydration-tier`/`category` frontmatter
