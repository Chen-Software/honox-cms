---
title: Building Accessible UI Components
date: 2026-06-10
description: Best practices for creating accessible, keyboard-navigable components that work for everyone. WCAG 2.1 AA compliance made practical.
tags:
  - accessibility
  - ui
  - best-practices
draft: false
cover: https://picsum.photos/seed/building-accessible-ui-components/1200/675
---

# Building Accessible UI Components

Accessibility is not _optional_—it's essential for creating inclusive web applications.

## Why Accessibility Matters

- **15%+ of the global population** has some form of disability
- **Legal requirements**: WCAG 2.1 AA compliance
- **Better UX for everyone**: Accessibility features help all users

## Key Principles

### 1. Semantic HTML

Always use the correct HTML elements:

```html
<!-- Good -->
<button>Click me</button>

<!-- Bad -->
<div onclick="handleClick()">Click me</div>
```

### 2. ARIA Attributes

When HTML isn't enough, use ARIA:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
</div>
```

### 3. Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

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
      Custom Button
    </div>
  );
}
```

### 4. Focus Management

Manage focus for modals and dynamic content:

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

## Testing Accessibility

Use these tools:

- **axe DevTools**: Browser extension
- **Lighthouse**: Built into Chrome DevTools
- **NVDA/JAWS**: Screen readers for testing

## Conclusion

Building accessible components from the start is easier than retrofitting accessibility later. Make it a habit!
