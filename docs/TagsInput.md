# TagsInput

A component that allows users to enter multiple tags as a list.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string[]` | - | Current tags. |
| `defaultValue` | `string[]` | - | Initial tags. |

## CMS Configuration

```yaml
- label: TagsInput
  name: tags-input
  widget: object
  fields:
    - { label: Default Value, name: defaultValue, widget: list, required: false }
```

## Hydration

Tier-2: Hydrates when `value`, `defaultValue`, `onValueChange`, or input state is present.
