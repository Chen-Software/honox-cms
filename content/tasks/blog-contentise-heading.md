---
title: Blog Contentise — migrate Heading from blog/[slug].tsx to content blocks
project: blog-website
status: Draft
priority: Medium
assignee: Mia Chen
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, heading]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Heading` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as `heading` blocks, so `Heading` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Notes |
|---|---|---|
| 116-125 | Brand `Heading as="span"` (header) | header shell work — see parent task |
| 250-274 | Post title: `Heading as="h1" size={{ base: "2xl", md: "3xl", lg: "4xl" }}` + draft badge (`ml: 4`) | **bound**: `text={{post.title}}` (or `{{post.title \|\| "Untitled"}}`); draft badge integration per the Badge subtask |
| 447-463 | "Related Posts": `Heading as="h2" size="lg"` + `ChevronRightIcon` | label from locale content ("相关文章"/"Related Posts"); icon folded into the `relatedPosts` binding |

## Target block

The `heading` block type **already exists** (registry `page-registry.tsx:390`; used across `content/pages/*.json` with `as`/`text`/`size`).

## Bindings/API work

- **`{{post.title}}` interpolation** from the page context (shared seam, `app/lib/pages.ts`).
- **⚠️ Responsive size is a known staticCss limitation:** `size={{ base: "2xl", md: "3xl", lg: "4xl" }}` passes a responsive object to the `Heading` recipe, but this repo's staticCss can't generate responsive recipe-variant classes (no `jsx: [...]` mapping — documented at `app/routes/docs/[doc].tsx:611-616`). The `heading` block must use a **flat size** (`3xl`) or the recipe gains a static responsive variant. Verify the rendered title matches current output; flag the size decision in the PR.
- **Fallback:** `{{post.title || "Untitled"}}` — the resolver should emit a non-empty `title` (fallback applied server-side), so the template doesn't need `||` logic.

## What's deleted from TSX

The brand/title/related headings and the `Heading` import (brand moves to the header shell work).

## Acceptance

- `Heading` no longer imported in `blog/[slug].tsx`; title + related heading render from `heading` blocks with bound text.
- Title hierarchy preserved (h1 title, h2 related); size renders correctly at all breakpoints (per the flat-size decision).
- Visual regression: title block (incl. draft badge placement) and related-posts heading unchanged.
