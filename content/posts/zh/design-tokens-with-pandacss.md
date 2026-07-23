---
title: 使用 PandaCSS 的设计令牌
date: 2026-06-22
description: 深入探讨如何使用 PandaCSS 设计令牌来创建一致、可维护的设计系统。学习如何发挥类型安全 CSS-in-JS 的强大能力。
cover: https://picsum.photos/seed/design-tokens-with-pandacss/1200/675
author: ''
readTime: ''
tags:
  - design
  - pandacss
  - css
draft: false
---

# 使用 PandaCSS 的设计令牌

PandaCSS 是一个现代的 CSS-in-JS 库，提供类型安全的样式设计，且零运行时开销。

## 为什么需要设计令牌？

设计令牌是您设计系统的视觉设计原子：

- 颜色
- 字体排印
- 间距
- 阴影
- 边框圆角

## 设置 PandaCSS

在您的 HonoX 项目中安装 PandaCSS：

```bash
npm install -D @pandacss/dev
```

## 创建设计令牌

在 `panda.config.ts` 中定义您的令牌：

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

## 使用令牌

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
      点击我
    </button>
  );
}
```

## 结论

使用 PandaCSS 的设计令牌可以创建一个一致、可维护的设计系统，并随着项目的发展而扩展。
