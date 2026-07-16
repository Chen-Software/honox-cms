---
title: "Design Tokens with PandaCSS"
date: "2026-06-22"
description: "A deep dive into using PandaCSS design tokens to create consistent, maintainable design systems. Learn how to leverage the power of type-safe CSS-in-JS."
tags: ["design", "pandacss", "css"]
draft: false
cover: https://picsum.photos/seed/design-tokens-with-pandacss/1200/675
---

# Design Tokens with PandaCSS

PandaCSS is a modern CSS-in-JS library that provides type-safe styling with zero runtime overhead.

## Why Design Tokens?

Design tokens are the visual design atoms of your design system:
- Colors
- Typography
- Spacing
- Shadows
- Border radius

## Setting Up PandaCSS

Install PandaCSS in your HonoX project:

```bash
npm install -D @pandacss/dev
```

## Creating Design Tokens

Define your tokens in `panda.config.ts`:

```typescript
export default defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: "#3b82f6" },
        secondary: { value: "#8b5cf6" },
      },
      spacing: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "1.5rem" },
      },
    },
  },
});
```

## Using Tokens

```tsx
import { css } from "design-system/css";

function Button() {
  return (
    <button
      class={css({
        bg: "primary",
        color: "white",
        px: "md",
        py: "sm",
        borderRadius: "lg",
      })}
    >
      Click me
    </button>
  );
}
```

## Conclusion

Design tokens with PandaCSS create a consistent, maintainable design system that scales with your project.
