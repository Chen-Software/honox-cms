---
title: 构建无障碍 UI 组件
date: 2026-06-10
description: 创建无障碍、可通过键盘导航的组件的最佳实践，使其适用于每一个人。让 WCAG 2.1 AA 合规变得切实可行。
cover: https://picsum.photos/seed/building-accessible-ui-components/1200/675
author: ''
readTime: ''
tags:
  - accessibility
  - ui
  - best-practices
draft: false
---

# 构建无障碍 UI 组件

无障碍性不是 _可选项_ —— 它对于创建包容性的 Web 应用程序至关重要。

## 为什么无障碍性很重要

- **全球超过 15% 的人口**患有某种形式的残疾
- **法律要求**：符合 WCAG 2.1 AA 标准
- **对所有人都更好的体验**：无障碍功能对所有用户都有帮助

## 关键原则

### 1. 语义化 HTML

始终使用正确的 HTML 元素：

```html
<!-- 推荐 -->
<button>点击我</button>

<!-- 不推荐 -->
<div onclick="handleClick()">点击我</div>
```

### 2. ARIA 属性

当 HTML 不够用时，使用 ARIA：

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">确认操作</h2>
  <p id="dialog-description">您确定吗？</p>
</div>
```

### 3. 键盘导航

确保所有交互元素都可以通过键盘访问：

```tsx
function CustomButton() {
  return (
    <div
      tabindex="0"
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      onClick={handleClick}
    >
      自定义按钮
    </div>
  );
}
```

### 4. 焦点管理

为模态框和动态内容管理焦点：

```tsx
import { useEffect, useRef } from "react";

function Modal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} tabindex="-1">
      {/* Modal content */}
    </div>
  );
}
```

## 测试无障碍性

使用这些工具：

- **axe DevTools**：浏览器扩展
- **Lighthouse**：内置于 Chrome DevTools
- **NVDA/JAWS**：用于测试的屏幕阅读器

## 结论

从一开始就构建无障碍组件，比事后补救无障碍性更容易。养成这个习惯吧！
