---
title: Blog Contentise — migrate Avatar from blog/[slug].tsx to a content block
project: blog-website
status: Draft
priority: Medium
assignee: Priya Nair
dueDate: 2026-09-15
tags: [blog, content-extraction, cms, page-builder, bindings, avatar]
---

Part of `blog-page-contentisation` (the `/blog/[slug]` half). Migrate the `Avatar` usage in `app/routes/blog/[slug].tsx` into `content/pages/blog/[slug].json` as an `avatar` block, so `Avatar` disappears from the route's imports.

## Usage site (blog/[slug].tsx)

- **:316-320** — `<Avatar size="md" variant="solid" name={post.author || "Artefact Team"} />`, nested inside the author `link` (Anchor subtask) in the post meta row.

## Target block

The `avatar` block type **already exists** in the registry (`page-registry.tsx:1108`: `avatar: (b) => <Avatar {...propsOf(b)} />`). Template JSON:

```json
{ "blockType": "link", "href": "/blog/by-author/{{post.author}}",
  "children": [ { "blockType": "avatar", "size": "md", "variant": "solid", "name": "{{post.author}}" } ] }
```

## Bindings/API work

- **`{{post.author}}` interpolation** with `"Artefact Team"` fallback (empty `author` today — see `blog-author-readtime-metadata`). Shared `{{post.*}}` page-context seam in `app/lib/pages.ts` (land with the Anchor subtask).
- **Fallback path:** if the resolver emits `authorLabel` (non-empty), use it for both `name` and the link href — verify the template prefers `authorLabel` when present.

## What's deleted from TSX

The `<Avatar>` element and the `Avatar` import.

## Acceptance

- `Avatar` no longer imported in `blog/[slug].tsx`; the meta-row avatar renders from the `avatar` block with the bound name.
- Initials/fallback rendering identical (solid variant, md size); avatar still links to the author archive.
- Visual regression: author row unchanged.
