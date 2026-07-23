---
title: 服务端组件与孤岛架构
date: 2026-06-15
description: 理解用于构建高性能 Web 应用程序的孤岛架构模式，最大限度减少客户端 JavaScript。非常适合现代 Web 开发。
author: ''
readTime: ''
tags:
  - architecture
  - performance
  - islands
draft: false
---

# 服务端组件与孤岛架构

孤岛架构是一种通过最小化客户端 JavaScript 来构建高性能 Web 应用程序的现代方法。

## 什么是孤岛架构？

孤岛架构包括：

- 用于静态内容的服务端渲染 HTML
- 用于动态组件的独立交互式"孤岛"
- 发送到客户端的最少 JavaScript

## 优势

1. **更好的性能**：需要下载和解析的 JavaScript 更少
2. **更快的初始加载**：HTML 可以立即渲染
3. **对 SEO 友好**：完整的服务端渲染
4. **渐进式增强**：无需 JavaScript 即可运行

## 在 HonoX 中实现

在 `app/islands/Counter.tsx` 中创建一个孤岛组件：

```tsx
import { createIsland } from "honox/island";

export default createIsland({
  Component: function Counter() {
    const [count, setCount] = createSignal(0);
    
    return (
      <div>
        <p>计数：{count()}</p>
        <button onClick={() => setCount(count() + 1)}>
          增加
        </button>
      </div>
    );
  },
});
```

在您的路由中使用它：

```tsx
import Counter from "../islands/Counter";

export default createRoute((c) => {
  return c.render(
    <div>
      <h1>我的页面</h1>
      <p>这是静态内容。</p>
      <Counter client:load />
    </div>
  );
});
```

## 最佳实践

- 保持孤岛组件小而专注
- 仅在必要时使用 `client:load`
- 优先为静态内容使用服务端渲染
- 对非关键交互使用 `client:idle`

## 结论

孤岛架构在交互性和性能之间提供了极佳的平衡。
