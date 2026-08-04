---
title: Blog Contentise — migrate Badge from blog/[slug].tsx to content blocks
project: blog-website
status: Draft
priority: Medium
assignee: Mia Chen
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, badge]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Badge` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as `badge` blocks, so `Badge` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Notes |
|---|---|---|
| 234-244 | Tag pills: `Badge variant="subtle"` per `post.tags` (rounded, `fontSize: sm`, `fontWeight: medium`) | rendered inside the tags `Stack` (Stack subtask); one badge per tag |
| 262-272 | Draft badge: `Badge variant="solid" colorPalette="orange"` inside the H1 (`ml: 4`, `fontSize: md`) | **conditional** — only when `post.draft === true` |

## Target block

The `badge` block type **already exists** (registry `page-registry.tsx:354`). Tags row in the template:

```json
{ "blockType": "stack", "direction": "horizontal", "wrap": true, "gap": "2",
  "children": [ { "blockType": "badge", "variant": "subtle", "text": "{{post.tags}}" } ] }
```

## Bindings/API work

- **Tag iteration:** `post.tags` is an array — the template needs an `each`-style expansion over `{{post.tags}}` inside the stack (extend `interpolateBlock` to expand array-valued fields, or emit the tag list via the `posts`/`postMeta` resolver as pre-rendered badge blocks).
- **Conditional draft badge:** `post.draft` is a boolean. The badge block has no `hidden`/condition field today — add one (e.g. `hidden: "{{post.draft}}"` with inversion, or a `when: "{{post.draft}}"` prop) OR have the resolver emit the draft badge block only when `draft` is true. Flag the chosen mechanism in the PR — this is the first conditional block, and the pattern will be reused by the docs `docMeta` and PMS work.
- **Inline placement:** the draft badge sits *inside* the title `Heading` (`ml: 4`) — decide whether the `heading` block supports badge children (preferred) or the badge renders as a sibling row (visual parity check needed).

## What's deleted from TSX

The tag-pill map and the draft badge; the `Badge` import.

## Acceptance

- `Badge` no longer imported in `blog/[slug].tsx`; tags and the draft badge render from `badge` blocks.
- Draft badge appears exactly when `post.draft` is true (conditional verified both ways).
- Visual regression: tag pills and draft badge unchanged.
