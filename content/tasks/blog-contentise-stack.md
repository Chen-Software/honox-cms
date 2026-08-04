---
title: Blog Contentise — migrate Stack from blog/[slug].tsx to content blocks
project: blog-website
status: Draft
priority: Medium
assignee: Diego Ramos
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, stack]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Stack` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as `stack` blocks, so `Stack` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Notes |
|---|---|---|
| 232 | Tags `Stack gap="2" wrap="wrap"` | hosts the tag `badge` blocks (Badge subtask) |
| 293-302 | Post meta row: `Stack gap="6" align="center" wrap="wrap"` + bottom border | hosts author/date/readTime groups |
| 305 | Author `Stack gap="3" align="center"` | `avatar` + author `text` (Anchor/Avatar/Text subtasks) |
| 350 | Date `Stack gap="2" align="center"` | `CalendarIcon` + date `text` |
| 372 | ReadTime `Stack gap="2" align="center"` | `ClockIcon` + readTime `text` |
| 395 | Share `Stack gap="0" justify="flex-end"` | hosts the `postShare` block (Button subtask) |

## Target block

The `stack` block type **already exists** (registry `page-registry.tsx:309`; widely used in `content/pages/*.json` with `direction`/`gap`/`align`/`wrap` props).

## Bindings/API work

- **Meta row composition:** the author/date/readTime groups are a `stack` of bound blocks. The date and readTime **formatted strings** (`toLocaleDateString` with `zh-CN`/`en-US`, `readTime`) are locale-aware — the `postMeta` binding (parent task) must emit them as pre-formatted values the `text` blocks can render; the template should not do date math.
- **Icons in meta:** `CalendarIcon`/`ClockIcon` are UI-chrome icons, not authored SVG. Either fold them into the `postMeta` binding's output or (if an `icon` block type is registered) render them as children. Decide in the PR; don't use the raw-SVG escape hatch for them.
- **Wrap/border props:** the meta row's `borderBottom` styling must survive migration — either a `stack` block style (token-mapped preset, per `cms-static-css-presets`) or a `postMeta` block that owns the row entirely. Recommend `postMeta` owning the full meta row (it also solves the icon/formatting questions in one place).

## What's deleted from TSX

The six `<Stack>` elements and the `Stack` import.

## Acceptance

- `Stack` no longer imported in `blog/[slug].tsx`; tags, meta row, and share row render from `stack` blocks.
- Meta row layout (gap, wrap, border) and author/date/readTime grouping identical.
- Visual regression: meta row unchanged at all breakpoints.
