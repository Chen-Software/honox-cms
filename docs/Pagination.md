# Pagination

A component for navigating through multiple pages of content.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | - | Total number of items. |
| `pageSize` | `number` | `10` | Number of items per page. |
| `defaultPage` | `number` | `1` | The initial page to show. |
| `type` | `'button' \| 'link'` | `'button'` | Whether to use buttons or links for navigation. |
| `interactive` | `boolean` | `true` | Whether to enable client-side interactivity. |

## CMS Configuration

```yaml
- label: Pagination
  name: pagination
  widget: object
  fields:
    - { label: Count, name: count, widget: number }
    - { label: Page Size, name: pageSize, widget: number, default: 10 }
    - { label: Default Page, name: defaultPage, widget: number, default: 1 }
    - label: Type
      name: type
      widget: select
      options: [button, link]
      default: button
```

## Hydration

Tier-2: Hydrates when `onPageChange` is provided or when not in link mode with `getPageUrl`.
