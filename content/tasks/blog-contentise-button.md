---
title: Blog Contentise — migrate Button from blog/[slug].tsx to content blocks
project: blog-website
status: Draft
priority: Medium
assignee: Mia Chen
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, button]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate every `Button` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json`, so `Button` disappears from the route's imports.

## Usage sites (blog/[slug].tsx)

| Line | Usage | Target |
|---|---|---|
| 396-417 | **Share button**: `Button variant="outline" size="sm"` with `onClick` → `navigator.share` / `navigator.clipboard.writeText(postUrl)`, `ShareIcon`, label "分享"/"Share" | New **bound `postShare` block** (client island) — listed in the parent task |
| 535-546 | **Back to All Posts**: `Button variant="solid" size="lg"` with `ArrowLeftIcon`, "返回所有文章"/"Back to All Posts", wrapped in `<a href={localiseLink("/blog")}>` | `link` block styled with the button recipe (see below) |

## Bindings/API work

- **`postShare` block (new):** a client island mounted by a bound block type. Owns the `navigator.share`/clipboard logic and the `postUrl` (from the page context — the resolver/context must provide the absolute post URL). Label ("Share"/"分享") is a block prop from the locale content. Add to registry + `public/admin/config.yml` (guarded by `cms-registry-schema-drift-ci`).
- **Back-to-all as a `link` block:** the `button` block (registry :342) renders a bare `Button` with no `href` — it can't navigate. Options: (a) extend the `link` block with a `variant`/`size` that applies the button recipe classes (Anchor styled as a solid button), or (b) give the `button` block an optional `href` that wraps in an anchor. Recommend (a) — it also serves the docs/PMS "button-looking link" cases. Flag in the PR.
- **Icons:** `ShareIcon`/`ArrowLeftIcon` — rendered inside the bindings (postShare island / link styling), not as content children (the icon-in-JSON escape hatch exists but is for authored SVG, not UI chrome icons).

## What's deleted from TSX

The share button JSX (moves into the `postShare` island) and the back-to-all button; the `Button` import.

## Acceptance

- `Button` no longer imported in `blog/[slug].tsx`.
- Share still works: `navigator.share` when available, clipboard fallback otherwise, correct post URL.
- Back-to-all navigates to the localized `/blog` with identical styling.
- Visual regression: share + back buttons unchanged.
