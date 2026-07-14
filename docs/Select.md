# Select

# Introduction

A dropdown control for picking one or more options from a list — an accessible, styleable alternative to the native `<select>` element.

When to reach for something else:

- With fewer than ~5 options, a `RadioGroup` is usually clearer.
- If the user should be able to type to filter the options, use `Combobox`.

The component renders a visually hidden native `<select>` alongside the custom UI, so a `name` prop makes it participate in regular form submission with no extra wiring.

# Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `items` | `SelectItem[]` | The options to display in the list. |
| `label` | `Child` | Label rendered above the trigger and associated with it. |
| `placeholder` | `string` | Text shown in the trigger while nothing is selected. |
| `allowClear` | `boolean` | Shows a clear button once a selection exists. |
| `multiple` | `boolean` | Allows selecting several options; the list stays open while toggling. |
| `defaultValue` | `string[]` | Initial selection (uncontrolled). Alias of `selectedValues`. |
| `selectedValues` | `string[]` | Initial selection (same as `defaultValue`). |
| `deselectable` | `boolean` | In single mode, clicking the selected option again clears it. |
| `name` | `string` | Name of the hidden native `<select>`, for form submission. |
| `disabled` | `boolean` | Disables the whole control. |
| `invalid` | `boolean` | Marks the control invalid (`aria-invalid`, error border). |
| `readOnly` | `boolean` | Selection is visible but the list cannot be opened. |
| `required` | `boolean` | Marks the control required (`aria-required`, hidden select `required`). |
| `open` | `boolean` | Controlled open state of the dropdown. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | Size of the trigger and list. Defaults to `md`. |
| `variant` | `"outline" \| "surface"` | Visual variant of the trigger. Defaults to `outline`. |
| `interactive` | `boolean` | Overrides the hydration decision (see below). |
| `onValueChange` | `(values: string[]) => void` | Called with the full selection whenever it changes (select, deselect, clear). |
| `onItemSelect` | `(value: string) => void` | Called with the value of the option that was interacted with. |
| `onClear` | `() => void` | Called when the clear button empties the selection. |
| `onOpenChange` | `(open: boolean) => void` | Called when the dropdown opens or closes. |

> Callback props only work when the Select is composed from client-side code (inside another island). Props serialized from a server-rendered route must be plain data.

## SelectItem

| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The display text for the option. Also used for typeahead matching. |
| `value` | `string` | The unique value for the option. |
| `disabled` | `boolean` | Whether the option can be selected. |

# Keyboard Interaction

The trigger is a `role="combobox"` button; focus stays on it while the highlighted option is reported through `aria-activedescendant`.

| Key | Behavior |
| :--- | :--- |
| `Enter` / `Space` | Open the list; when open, select the highlighted option. |
| `ArrowDown` / `ArrowUp` | Open the list, or move the highlight (wraps, skips disabled options). |
| `Home` / `End` | Highlight the first / last enabled option. |
| `Escape` | Close the list. |
| `Tab` | Close the list and move focus on. |
| Printable characters | Typeahead: jumps to the first option whose label matches the typed prefix. When the list is closed (single mode), the match is selected directly, like a native `<select>`. |

Opening the list highlights the currently selected option (or the first enabled one), and keyboard navigation keeps the highlighted option scrolled into view.

# Hydration

**Tier 1 — auto-interactive.** Opening the dropdown and selecting an option require client JS, and there is no static fallback (the native `<select>` is visually hidden and exists only for form submission), so `Select` hydrates by default. Pass `interactive={false}` to force a purely static render.

| `interactive` prop | Result |
| :--- | :--- |
| omitted | Hydrates as an island |
| `true` | Hydrates as an island |
| `false` | Static — no client JS |

All interactivity decisions in the library route through the shared `shouldHydrate()` helper in `app/components/ui/island-utils.ts`.

# Usage

```tsx
import { Select } from "../components/ui";

const items = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Svelte", value: "svelte", disabled: true },
  { label: "Vue", value: "vue" },
  { label: "Hono", value: "hono" },
];

export default function MyPage() {
  return (
    <Select
      items={items}
      label="Framework"
      placeholder="Select a framework"
      allowClear
    />
  );
}
```

## Multiple selection

The list stays open while options are toggled, and the trigger shows the selected labels joined with commas.

```tsx
<Select
  multiple
  items={items}
  label="Frameworks"
  placeholder="Select frameworks"
  defaultValue={["hono"]}
/>
```

## In a form

The hidden native `<select>` carries the selection, so a plain form post works:

```tsx
<form method="post" action="/frameworks">
  <Select name="framework" items={items} label="Framework" required />
  <Button type="submit">Save</Button>
</form>
```

## Sizes and variants

```tsx
<Select items={items} size="sm" placeholder="Small" />
<Select items={items} size="lg" variant="surface" placeholder="Large surface" />
<Select items={items} invalid placeholder="Invalid state" />
```

