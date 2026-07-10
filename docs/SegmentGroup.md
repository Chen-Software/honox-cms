# SegmentGroup

A group of radio-like buttons that look like a single segmented control.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Group label. |
| `items` | `SegmentGroupItem[]` | - | Array of items with `label` and `value`. |

## CMS Configuration

```yaml
- label: SegmentGroup
  name: segment-group
  widget: object
  fields:
    - { label: Label, name: label, widget: string, required: false }
    - label: Items
      name: items
      widget: list
      fields:
        - { label: Label, name: label, widget: string }
        - { label: Value, name: value, widget: string }
```

## Hydration

Tier-2: Hydrates when `value`, `defaultValue`, or `onValueChange` is provided.
