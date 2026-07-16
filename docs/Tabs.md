# Tabs

# Introduction

A set of layered sections of content shown one at a time, with a selectable tab list. Tabs
ships four visual variants (`line`, `subtle`, `enclosed`, `card`), horizontal or vertical
orientation, and optional closable/editable tabs for managing an open-ended set of views
(browser-tab-style "add" and "close" controls).

# Props

## Tabs

| Prop | Type | Description |
| :--- | :--- | :--- |
| `items` | `TabsItem[]` | The tabs to render (used when no `children` are provided). |
| `variant` | `"line" \| "subtle" \| "enclosed" \| "card"` | Visual style. Default: `"line"`. `"card"` draws each tab as its own bordered box and hides the sliding indicator. |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | Preset tab size. Default: `"md"`. |
| `colorPalette` | `"gray" \| "blue" \| "green" \| "red" \| "orange" \| "cyan" \| "amber" \| "purple"` | Accent color for the selected tab / indicator. Default: `"gray"`. |
| `orientation` | `"horizontal" \| "vertical"` | Tab list direction. Default: `"horizontal"`. |
| `centered` | `boolean` | Center the tab list instead of left-aligning it. |
| `fitted` | `boolean` | Stretch tabs to share the available width equally. |
| `activationMode` | `"automatic" \| "manual"` | Whether arrow-key navigation selects immediately (`"automatic"`) or only moves focus until `Enter`/`Space` (`"manual"`). Default: `"automatic"`. |
| `indicator` | `boolean` | Whether to show the active indicator. Default: `true`. Ignored (always hidden) for `variant="card"`. |
| `value` | `string` | The selected tab's value (controlled). |
| `defaultValue` | `string` | The initially selected tab's value (uncontrolled). |
| `onValueChange` | `(value: string) => void` | Called when the selected tab changes. |
| `closable` | `boolean` | Give every tab a close button. A `TabsItem.closable` override wins over this default. |
| `editable` | `boolean` | Shorthand for `closable` plus a trailing "add tab" trigger. |
| `onTabClose` | `(value: string) => void` | Called after a tab is closed. |
| `onTabAdd` | `() => TabsItem \| void` | Called when the "add tab" trigger is clicked. Return a `TabsItem` to control what gets appended and selected; return nothing to accept an auto-generated blank tab. |
| `addAriaLabel` | `string` | Accessible label for the "add tab" trigger. Default: `"Add tab"`. |
| `extra` | `JSX.Element \| { start?: JSX.Element; end?: JSX.Element }` | Content rendered alongside the tab list — a single node (rendered after the list) or a `{ start, end }` split. |
| `interactive` | `boolean` | Force or forbid client-side hydration; omit to auto-detect (see **Hydration** below). |
| `class` | `string` | Custom CSS classes for the root element. |

Additional tab-state props not listed above (e.g. `id`) are forwarded to the underlying tabs
primitive.

### TabsItem

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | Unique identifier for the tab. |
| `label` | `string \| JSX.Element` | The tab label. |
| `content` | `string \| JSX.Element` | The panel content shown when active. |
| `disabled` | `boolean` | Whether the tab is disabled. |
| `icon` | `JSX.Element` | Icon rendered before the label. |
| `closable` | `boolean` | Overrides the top-level `closable`/`editable` default for this one tab. |

# Usage

## Basic Tabs

```tsx
import { Tabs } from "../components/ui";

export default function MyPage() {
  return (
    <Tabs
      items={[
        { value: "tab1", label: "Tab 1", content: "Content for tab 1" },
        { value: "tab2", label: "Tab 2", content: "Content for tab 2" },
      ]}
    />
  );
}
```

## Card Variant, Icons, and Color

```tsx
import { Tabs } from "../components/ui";

export default function MyPage() {
  return (
    <Tabs
      variant="card"
      colorPalette="blue"
      defaultValue="overview"
      items={[
        { value: "overview", label: "Overview", icon: <OverviewIcon />, content: <Overview /> },
        { value: "activity", label: "Activity", icon: <ActivityIcon />, content: <Activity /> },
      ]}
    />
  );
}
```

## Editable Tabs (Add & Close)

Closing or adding a tab mutates the tab set itself, so it's only available through the
`items` prop — see **Hydration** below for why the composable JSX form can't support it.

```tsx
import { Tabs } from "../components/ui";

export default function MyPage() {
  let nextId = 3;

  return (
    <Tabs
      editable
      defaultValue="tab1"
      items={[
        { value: "tab1", label: "Tab 1", content: "First view" },
        { value: "tab2", label: "Tab 2", content: "Second view" },
      ]}
      onTabAdd={() => ({
        value: `tab${nextId}`,
        label: `Tab ${nextId++}`,
        content: "A freshly added view",
      })}
      onTabClose={(value) => console.log("closed:", value)}
    />
  );
}
```

## Extra Content and Centering

```tsx
import { Button, Tabs } from "../components/ui";

export default function MyPage() {
  return (
    <Tabs
      centered
      items={[
        { value: "daily", label: "Daily", content: "Daily report" },
        { value: "weekly", label: "Weekly", content: "Weekly report" },
      ]}
      extra={<Button size="sm" variant="outline">Export</Button>}
    />
  );
}
```
# Hydration

Tabs is classified as **Tier-2 (smart auto-detect)** — see `docs/ARCHITECTURE.md` for the
full model.

- It hydrates as a client island when any of `value`, `defaultValue`, `onValueChange`,
  `closable`, `editable`, `onTabClose`, or `onTabAdd` is supplied — selecting a tab, closing
  one, or adding one all need JS. With none of these present, Tabs renders static markup and
  ships no client JS.
- Pass `interactive={true}` / `interactive={false}` to force or forbid hydration outright;
  this is implemented via the shared `shouldHydrate(interactive, hasSignal)` predicate in
  `app/components/ui/island-utils.ts`.
- **`items` vs. composable children:** when hydrated, the island keeps its own reactive copy
  of `items` (seeded from the prop) so `editable`/`closable` can mutate the tab set on the
  fly. The composable `TabsList`/`TabsTrigger`/`TabsContent` form is a pre-built, static
  subtree instead — hono/jsx never re-invokes those components on a state change, so
  selecting a tab is applied by syncing DOM attributes directly rather than through a
  re-render. That sync works for switching tabs, but there's no set of tabs to mutate, so
  `editable`/`closable` only take effect through the `items` prop.
