---
title: Blog Contentise — migrate Anchor from blog/[slug].tsx to a content block
project: blog-website
status: Draft
priority: Medium
assignee: Diego Ramos
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, anchor]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Anchor` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as `anchor` CMS blocks, so `Anchor` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Target block |
|---|---|---|
| 111-126 | Brand link in the header (`href={localiseLink("/")}`, `Heading as="span"` child) | `link` block (registry :109, alias `"anchor"`) — header shell work, see parent task |
| 306-310 | Author avatar href → `/blog/by-author/${post.author \|\| "Artefact Team"}` | `link` block wrapping the `avatar` block; href bound |
| 323-331 | Author name link → `/blog/by-author/...` | `link` block, `text` child |

(Raw `<a>` elements — back link :168, related-post cards :473, footer :534 — are not the `Anchor` component; they're covered by the `link`-block migration of back/related/footer chrome, not this subtask.)

## Bindings/API work

- **href binding:** the author links need `/blog/by-author/{{post.author}}` with a fallback to `"Artefact Team"` when `post.author` is empty. Requires `{{post.*}}` interpolation from the page context (extend `interpolateBlock`/`resolveBlockDataSources` in `app/lib/pages.ts` to accept a `post` extra alongside `item`) — shared seam, land it here first since every bound block needs it.
- **Fallback:** author may be `""` today (see `blog-author-readtime-metadata`) — the binding must fall back to `"Artefact Team"` (or the resolver emits a non-empty `authorLabel`), matching current behavior.
- **Locale:** `href` must stay locale-aware (current `localiseLink`). The `link` block already receives the `locale` extra via `renderBlocks` — verify it localises hrefs (see the existing locale-toggle logic at page-registry.tsx:448) and reuse; do not re-add per-block localise calls.

## What's deleted from TSX

The three `<Anchor>` usages and the `Anchor` import (plus `localiseLink` for these three sites).

## Acceptance

- `Anchor` no longer imported in `blog/[slug].tsx`; author + brand links render from `link` blocks in the template with bound hrefs.
- Hover/active behavior identical; hrefs locale-correct (`/blog/de/by-author/...`).
- Visual regression: author link row (avatar + name) unchanged.
