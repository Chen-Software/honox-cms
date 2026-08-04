---
title: Blog Contentise — migrate Text from blog/[slug].tsx to content blocks
project: blog-website
status: Draft
priority: Medium
assignee: Priya Nair
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, text]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Text` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as `text` blocks, so `Text` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Binding |
|---|---|---|
| 277-290 | Description: `Text size={{ base: "lg", md: "xl" }}` italic, `display: block` | `content={{post.description}}` |
| 333-342 | Author name: `Text size="sm" fontWeight="semibold"` | `content={{post.author \|\| "Artefact Team"}}` (resolver emits `authorLabel`) |
| 352-366 | Date: `Text size="sm"` | **formatted** — from the `postMeta` binding (`toLocaleDateString` locale-aware), not the template |
| 374-382 | ReadTime: `Text size="sm"` | formatted — from `postMeta` |
| 490-516 | Related post date + title: two `Text`s per card | from the `relatedPosts` binding |

## Target block

The `text` block type **already exists** (registry `page-registry.tsx:400`; used everywhere in `content/pages/*.json` with `content` + `style`).

## Bindings/API work

- **`{{post.*}}` interpolation** for description/author (shared page-context seam, `app/lib/pages.ts`).
- **⚠️ Responsive size limitation (same as Heading):** `size={{ base: "lg", md: "xl" }}` is a responsive recipe object this repo's staticCss can't generate (documented at `app/routes/docs/[doc].tsx:611-616`). Use a **flat size** (`lg`) or a static recipe variant; verify against current output.
- **Formatted values come from the binding, not the template:** date (`zh-CN`/`en-US` `toLocaleDateString`) and readTime must be emitted pre-formatted by `postMeta`/`relatedPosts` — `text` blocks can't format. The template renders whatever string the resolver provides.
- **Author fallback:** resolver emits `authorLabel` (`post.author || "Artefact Team"`) so the template avoids `||` logic — same contract as the Avatar/Anchor subtasks.

## What's deleted from TSX

The six `<Text>` elements and the `Text` import.

## Acceptance

- `Text` no longer imported in `blog/[slug].tsx`; description, author, date, readTime, and related-post texts render from `text` blocks with bound/formatted content.
- Dates format per locale (zh-CN vs en-US) identically to today; readTime unchanged.
- Visual regression: description block and meta row unchanged.
