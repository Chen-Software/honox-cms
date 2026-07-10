# RadioGroup

A set of checkable buttons where only one can be checked at a time.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Group label. |
| `items` | `RadioGroupItem[]` | - | Array of items with `label` and `value`. |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout orientation. |

## CMS Configuration

```yaml
- label: RadioGroup
  name: radio-group
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
