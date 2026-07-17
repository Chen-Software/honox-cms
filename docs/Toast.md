# Toast

# Introduction

A transient notification used to provide feedback about an action. Toasts are created imperatively through the `toaster` API. Mount a single `<Toast.Toaster />` to render them.

Built-in behavior:

- **Type-colored accent** — `success` / `error` / `warning` / `info` / `loading` each get a distinct left-border accent and tinted indicator icon.
- **Enter/exit animation** — toasts slide + fade in on mount and play a matching exit animation before being removed from the DOM, direction-aware for top- vs bottom-anchored placements.
- **Pause on hover/focus** — moving the pointer over (or tabbing into) any toast in the viewport pauses every active auto-dismiss timer; leaving the viewport resumes them with their remaining time intact.
- **Swipe-to-dismiss** — pointer/touch drag past a threshold dismisses a toast, in the direction appropriate for the toaster's `placement` (e.g. swipe right for `bottom-end`, left for `bottom-start`, up for `top`).
- **Keyboard dismiss** — a focused toast closes on <kbd>Escape</kbd>, independent of whether it renders a visible close button.
- **Accessible by default** — each toast is `role="status"` (`role="alert"` for `type: "error"`) with a matching `aria-live`, so screen readers announce it without a separate hidden announcer.

> A live, runnable version of every example below is in `app/routes/index.tsx` — the **Toast Component Examples** section. The docs examples are kept in sync with that file.

# Usage

## Mount the Toaster

Place `<Toast.Toaster />` once near your app root (this matches `app/routes/index.tsx`):

```tsx
import { Toast } from "../components/ui";

export default function App() {
  return (
    <>
      {/* ...your application... */}
      <Toast.Toaster />
    </>
  );
}
```

## Show a toast (client components / islands)

From a hydrated client component or island, call `Toast.toaster.*`:

```tsx
import { Toast, Button } from "../components/ui";

export default function MyPage() {
  return (
    <Button
      onClick={() =>
        Toast.toaster.success("Saved!", { description: "Your changes are live." })
      }
    >
      Save
    </Button>
  );
}
```

## Show a toast (SSG-safe)

The home-page demo triggers toasts by dispatching the underlying `park-ui:toast:create` CustomEvent directly. This works **without client hydration**, which is why the static `onclick` attribute is used instead of a JSX `onClick` handler. The following block is reproduced from `app/routes/index.tsx`:

```tsx
<Toast.Toaster />
<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
  <Button
    variant="outline"
    onclick="window.dispatchEvent(new CustomEvent('park-ui:toast:create', { detail: { id: Math.random().toString(36).substring(2, 9), title: 'Success', description: 'Action completed successfully', closable: true, type: 'success' } }))"
  >
    Show Success Toast
  </Button>
  <Button
    variant="outline"
    onclick="window.dispatchEvent(new CustomEvent('park-ui:toast:create', { detail: { id: Math.random().toString(36).substring(2, 9), title: 'Error', description: 'An error occurred', closable: true, type: 'error' } }))"
  >
    Show Error Toast
  </Button>
  <Button
    variant="outline"
    onclick="window.dispatchEvent(new CustomEvent('park-ui:toast:create', { detail: { id: Math.random().toString(36).substring(2, 9), title: 'Loading', description: 'Please wait...', type: 'loading' } }))"
  >
    Show Loading Toast
  </Button>
</div>
```

> Note: Toast content is created **imperatively** — `title` and `description` accept strings only, so a toast's body cannot be authored as JSX. The `Toaster` renders it internally from the private primitives.

# API

`Toast.toaster` (or any instance returned by `createToaster`) provides the following helpers:

| Method | Signature |
| :--- | :--- |
| `create` | `(options: Omit<ToastOptions, "id">) => string` |
| `success` | `(title: string, options?: Partial<ToastOptions>) => string` |
| `error` | `(title: string, options?: Partial<ToastOptions>) => string` |
| `warning` | `(title: string, options?: Partial<ToastOptions>) => string` |
| `info` | `(title: string, options?: Partial<ToastOptions>) => string` |
| `loading` | `(title: string, options?: Partial<ToastOptions>) => string` |
| `promise` | `(promise: Promise<T>, options: PromiseOptions<T>) => Promise<T>` — shows a `loading` toast, then swaps it to `success`/`error` when the promise settles. |
| `update` | `(id: string, options: Partial<ToastOptions>) => void` |
| `dismiss` | `(id?: string) => void` — dismisses one toast, or all toasts if `id` is omitted. |
| `pause` | `() => void` — freezes every active auto-dismiss timer, preserving remaining time. |
| `resume` | `() => void` — continues timers frozen by `pause`. |
| `subscribe` | `(callback: (toasts: ToastOptions[]) => void) => () => void` |
| `getToasts` / `getCount` | Snapshot accessors. |

`Toast.Toaster` (and the module-level `toaster`/`createToaster`) automatically call `pause`/`resume` in response to pointer hover and focus inside the toaster viewport — you generally don't need to call them yourself.

## createToaster(config)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placement` | `"top-start" \| "top" \| "top-end" \| "bottom-start" \| "bottom" \| "bottom-end"` | `"bottom-end"` | Screen corner/edge the viewport anchors to. Also determines the default swipe-to-dismiss direction and the enter/exit slide direction. |
| `overlap` | `boolean` | `false` | Reserved for stacked/overlapping layout. |
| `max` | `number` | `24` | Maximum toasts kept at once; oldest is evicted first. |
| `duration` | `number` | `5000` | Default auto-dismiss duration in ms for toasts that don't specify their own. |
| `gap` | `number` | `16` | Reserved for spacing between stacked toasts. |
| `removeDelay` | `number` | `200` | Upper-bound (ms) the Toaster waits for a toast's exit animation before force-removing it, in case `animationend` never fires (e.g. reduced-motion). |

## ToastOptions

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The toast title. |
| `description` | `string` | The toast description. |
| `type` | `"info" \| "success" \| "warning" \| "error" \| "loading"` | Intent/style of the toast — drives the accent color, indicator icon, and accessible role/`aria-live` (`error` → `role="alert"`/`assertive`, everything else → `role="status"`/`polite`). |
| `duration` | `number` | Auto-dismiss duration in milliseconds. `0` or `Infinity` disables auto-dismiss. |
| `closable` | `boolean` | Whether a visible close button is rendered. The toast can still be dismissed via <kbd>Escape</kbd> or swipe regardless of this flag. |
| `action` | `{ label: string; onClick: () => void }` | Optional action button. |

