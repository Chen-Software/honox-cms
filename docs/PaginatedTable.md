# PaginatedTable

A high-level component that combines a Table with Pagination, managing state internally.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | - | Table title. |
| `pageSize` | `number` | `10` | Items per page. |

## CMS Configuration

```yaml
- label: PaginatedTable
  name: paginated-table
  widget: object
  fields:
    - { label: Title, name: title, widget: string, required: false }
    - { label: Page Size, name: pageSize, widget: number, default: 10 }
```

## Hydration

Tier-2: Always hydrates as an island to manage internal pagination state.
