---
title: [Blog] Contentise /blog, /blog/[slug] and the archives via CMS bindings (remove route chrome)
project: blog-website
status: In Progress
priority: Medium
assignee: Mia Chen
dueDate: 2026-09-30
tags: [blog, content-extraction, cms, page-builder, bindings]
---

## Why

The blog surface is the largest hand-written page set on the site — ~2,000 lines across `app/routes/blog/index.tsx` (~980), `blog/[slug].tsx` (~557), `blog/by-tag/[tag].tsx` and `blog/by-author/[author].tsx`. The routes hand-render the shell, the featured carousel, the search + tag-browse UI, the post-card grid, the newsletter section, the article chrome (meta, share, body mount), related posts, and the archive pages. Goal (same as `docs-page-contentisation.md`): express the **entire** page set as `content/pages/blog.json` + `content/pages/blog/[slug].json` + archive templates using CMS bindings/APIs, and remove as much TSX as possible — the routes become thin data-binders importing **zero** `components/ui` components.

This is the "blog" test case for the same bindings end-state in `pms-i18n.md` and `docs-page-contentisation.md` — and the hardest one, because of the interactive chrome (carousel, share, search, popovers).

## What's already CMS (grounded)

- **Header** on all four routes: `config.headerItems` (CMS singleton) via `renderBlocks` + `AuthStatus`. The brand name comes from `config.home?.brandName`.
- **Landing hero** already comes from `loadPage("blog", locale)` → `<PageRenderer>` (index.tsx:154) — but `content/pages/blog.json` is just `{ title, content: [one text block] }`. Locale variants exist (`content/pages/<locale>/blog.json`).
- **Search strings** already localized via `BLOG_SEARCH_STRINGS` (`app/lib/i18n.ts`); `/api/posts/search.json` endpoint exists; posts are per-locale (`content/posts/<locale>/*.md`); locale-prefixed blog routes exist (`app/routes/[locale]/blog/*`).
- Blog config (`content/configs.json` `blog.*`): `showAuthor`, `showReadTime`, `newsletterHeading/Description`, `home.brandName` — CMS-editable.
- **The `layout` block type exists** (page-registry.tsx:1218) — same shell-as-content option as the docs task.

## What's still hardcoded (the removal list)

| Hardcoded in the route | CMS binding to replace it |
|---|---|
| Featured-posts hero carousel (index.tsx:156-381) | New bound block `featuredPosts` (carousel over `dataSource: "featuredPosts"`; own gradient overlay/badges/triggers; interactive bits stay islands inside the block) |
| Search box (index.tsx:386-399) | **No new block needed** — the existing `search` block type (`page-registry.tsx:1058`, `app/components/ui/search.tsx`) already accepts every prop used here (`src`, `placeholder`, `itemLabel`, `emptyStateId`, `debounceMs`, `maxSuggestions`, `syncUrl`); just emit a `search` content block with `src: /api/posts/search.json` + per-locale placeholder/itemLabel. `initialQuery` can be omitted — the island re-syncs it from `window.location.search` on mount |
| Tag-browse popover (index.tsx:401-490) | **No new block type** — the existing `popover` block (`page-registry.tsx:~909`) with a body composed of a static "All" `anchor` + `each`/`dataSource: "tags"` (new generic data source, `DataSourceItem`-shaped: `{label, value, href: /blog/by-tag/<tag>}`) + one `anchor` per tag as the template. Labels "Browse tags"/"All"/"Filter by Tag" become block props per locale. Required a small fix: `each`'s registry renderer didn't forward `locale`/`currentPath` to its expanded children (only `stack` did) — needed a matching fix so the templated `anchor`s get locale-prefixed hrefs; verified safe against the only existing `each` usage (`content/pages/tasks.json`) |
| Search empty state (index.tsx:492-538) | Content blocks (heading/text) — keep the `id="blog-search-empty"` contract; defaults `hidden: true` in content (the server-side `matchedSlugs`/`hidden` logic it used to depend on is dead code in production — this is a static SSG build with no Worker, so it always evaluated to "show everything" at build time anyway; real filtering is 100% the `Search` island client-side) |
| Post-card grid (index.tsx:540-810) | **Decided: bound `postGrid` block** (not `each`+template — the card has too many conditionals/slices — cover-or-not, `tags.slice(0,3)`+"+N" overflow, draft badge, author/readTime visibility flags — for the flat `{{item.foo}}` interpolation `each` supports). Bespoke escape hatch mirroring the existing `table`+`customRenderer` pattern (`app/lib/data-sources.ts`'s `customTableDataResolvers` today has only a `tasks` entry) — a new `blogBlockDataResolvers` resolver shapes full `BlogPost[]` + config flags, resolved by `app/lib/pages.ts`'s `resolveBlockDataSources`, same as `table.customRenderer` is today |
| Newsletter section (index.tsx:812-977) | See boundaries — NOT contentised as-is (the form submits nowhere); pairs with `blog-newsletter-capture`. Still moves into static content blocks (existing primitives only: `stack`/`heading`/`text`/`badge`/`icon`) — inert, not a bound block |
| Article chrome: back link, cover, tags, title + draft badge, description (`[slug].tsx:158-~330`) | `anchor` block (back link) + new bound `postHeader` block (cover/tags/title/draft-badge/description together, matching the current DOM grouping) |
| Meta row: author/date/readTime (`[slug].tsx:~330-385`) | New bound `postMeta` block — separate from `postHeader` for reordering flexibility; `showAuthor`/`showReadTime` come from `config.blog` via `renderBlocks` extras (route already loads config), not fetched inside the renderer |
| Share button (`[slug].tsx:394-418`) | New bound `postShare` block — a real island (`app/islands/post-share.tsx`), since today's version is a server-rendered `onClick` closure over `post`/`postUrl`, which can't survive as JSON. Takes only `title` (from the `post` render-extra); reads `window.location.href` client-side at click time instead of needing a URL threaded through content at all |
| Markdown body mount (`post.html` + `markdownContentClass`, `[slug].tsx:420-425`) | New bound `postBody` block, reading `post.html` from the `post` render-extra (no new data source) |
| Related posts (`[slug].tsx:429-522`) | New bound `relatedPosts` block reading `post.relatedPosts` directly — **no new data source needed**, `loadPostBySlug` already computes this server-side (up to 3 posts sharing a tag) before `renderBlocks` is ever called |
| Back-to-all footer (`[slug].tsx:524-548`) | `link` block (exists) |
| Archive pages (by-tag/by-author): header, title, pills, post list, pagination | One archive template (`content/pages/blog/by-tag/[tag].json` / `by-author/[author].json`) + `each`/`posts`-filtered grid + existing `pagination` recipe; tag/author pills via `dataSources.tags`/`authors` |
| Header shell + brand (all routes) | Top-level `layout` block (header/sider/content) + existing brand/link blocks |

## Component inventory — the routes must stop importing `components/ui`

End-state (this phase, `/blog` + `/blog/[slug]` only): both routes import **zero** UI components and **zero** icons — only loader/data helpers + the render primitive. Every component imported today has a binding replacement: `Carousel` → new bound `featuredPosts`; `Search` → existing `search` block (no new type needed); `Popover`/`Button`/`FilterIcon` → existing `popover` block + `each`/`dataSource: "tags"` (no new block type, just a new data source); `Card`/`Avatar`/`Badge`/`ArrowRightIcon` → new bound `postGrid`; `Heading`/`Text`/`Stack`/`Anchor` → existing content blocks; `MailIcon`/newsletter form → static content blocks now, `newsletterForm` bound block later (see boundaries); `CalendarIcon`/`ClockIcon` → new bound `postMeta`; `ShareIcon` → new bound `postShare` (real island); `ArrowLeftIcon` → existing `anchor` block; `ChevronRightIcon` → new bound `relatedPosts`; `AuthStatus` → stays hand-rolled in the route (header not converted this phase — see Design); `markdownContentClass` div → new bound `postBody`; cover/tags/title/draft-badge/description → new bound `postHeader`. The `currentLocale === "zh" ? "X" : "Y"` literals (Latest/Browse tags/No articles/Read more/Draft/Back to Blog/Share/Related Posts/Back to All Posts) become **block props** in each locale's JSON.

Target import list for each route: `createRoute`, `ssgParams` (dynamic routes), `loadPosts` / `loadPostBySlug`, `loadPage`, `detectLocale` / `isLocale` / `localiseHref`, `renderBlocks` (or `PageRenderer`), `c.notFound()` — nothing from `../../components/ui`, no icons, no `markdown-content-style`.

## Design

1. **`content/pages/blog.json`** (landing): top-level `layout` block → `header` (config.headerItems + brand), `content` = hero blocks + `featuredPosts` + existing `search` block (`src: /api/posts/search.json`) + `tagBrowse` + empty-state blocks + `each`/`posts` grid. Locale variants in sync.
2. **`content/pages/blog/[slug].json`** (detail): a **data-driven template** resolved per slug — NOT per-post files (hundreds of posts). Content = back `link` + `postMeta` + `postBody` + `postShare` + `relatedPosts` + footer `link`, with post fields bound from the page context.
3. **Archive templates** `content/pages/blog/by-tag/[tag].json` / `by-author/[author].json`: title/hero blocks + `each`/`posts`-filtered grid + `pagination` — resolved per tag/author. Second-phase if the landing/detail land first.
4. **New bound block types** (registry `page-registry.tsx` **and** `public/admin/config.yml`): `featuredPosts`, `tagBrowse`, `postMeta`, `postBody`, `postShare`, `relatedPosts`, optionally `postGrid` + `newsletterForm` (later). Search does **not** need a new type — the existing `search` block (`page-registry.tsx:1058`, already registered in `config.yml`) covers it field-for-field; only the per-locale `placeholder`/`itemLabel` need to move into content. Land with `cms-registry-schema-drift-ci` — note `each` is *currently* registered in `page-registry.tsx` but missing from `config.yml`, a live drift instance that CI check should also catch.
5. **New data sources** (`app/lib/data-sources.ts`): `posts` (rich `DataSourceItem`: cover/description/author/date/readTime/tags/draft for the card template), `featuredPosts` (posts with cover, sliced 5), `tags`, `authors`, `relatedPosts` (needs the current-post context). `DataSourceContext` gains `locale` (and a `post`/`currentSlug` field for related).
6. **API seam — per-request page context:** extend the `renderBlocks` extras (currently `locale`/`currentPath`) with `post` so `postMeta`/`postBody`/`postShare`/`relatedPosts` resolve the current post without per-block props — same seam as the docs/PMS plans.
7. **Routes shrink to thin loaders:** `blog/index.tsx` → `loadPosts` + `loadPage("blog", locale)` + render; `blog/[slug].tsx` → `ssgParams` + `loadPostBySlug` + `loadPage(postTemplate, locale)` + bind post + `renderBlocks` (keeping `isLocale` guard, 404); archives → `ssgParams` over tags/authors + same pattern.
8. **i18n rides along:** posts already per-locale; `BLOG_SEARCH_STRINGS` moves into content props; the `currentLocale === "zh"` ternaries disappear into per-locale block props; date formatting stays locale-aware inside the bound blocks.

## Honest boundaries — what cannot be removed (flag in the PR)

- **The route file stays** — thin loader (~30-50 lines). The goal is removing *chrome*, not the loader.
- **Per-post Edit deep-link** (AuthStatus href at `[slug].tsx:151-153`) — the CMS can't know which post the reader is on. Same as the docs `withDocEditHref`; stays server-side or an `authStatus` binding resolution.
- **The markdown body** (`post.html` from the remark/rehype pipeline, `app/utils/markdown.ts`): authored content stays; only its mount becomes a block.
- **The newsletter form is broken** (submits nowhere — see `blog-newsletter-capture`). Don't contentise the broken form: leave the section as content blocks now, and add a proper bound `newsletterForm` block when the capture feature ships. Flagged so contentisation doesn't accidentally bless the current no-op form.
- **Client-only features** (share button, carousel controls, search-as-you-type) remain islands — but mounted *by* bound blocks, so the route still has zero component imports.

## Acceptance criteria

- `/blog`, `/blog/[slug]`, and the archives render from `content/pages/blog.json` + templates + bound blocks — routes contain **no visible chrome literals** and **no `currentLocale === "zh" ? …` ternaries**.
- **The four route files import zero `../../components/ui` components and zero icons** — only loader/data helpers + render primitive.
- Rendered HTML matches current output (visual regression over all posts + every locale): carousel, grid, meta, share, related, archives, pagination identical.
- Carousel/search/tag-browse/share still function (interactive bits intact inside bound blocks).
- Locale detection/prefix, `localiseHref`, 404s, `ssgParams` output unchanged.
- New block types present in both registry and `config.yml` (CI guard passes); `posts`/`featuredPosts`/`tags`/`relatedPosts` resolvers resolve under SSG.
- Measurable line reduction across the four routes.

## Decisions to settle in the PR

- **Per-post template vs. per-post files** (`content/pages/blog/[slug].json` as a resolved template — recommended — vs. a file per post).
- **Card grid**: `each` + card template vs. a dedicated `postGrid` bound block (the card is heavy — cover gradient, draft badge, tag pills, read-more; likely `postGrid`).
- **Carousel**: dedicated `featuredPosts` bound block (recommended — bespoke overlay/triggers) vs. reusing an existing `carousel` block if one is registered.
- **Newsletter**: content blocks now + `newsletterForm` bound block when `blog-newsletter-capture` ships, vs. a bound block with a placeholder.
- **Archives scope**: include by-tag/by-author in this task or a fast-follow.

## Notes / dependencies

- Files: the four blog routes (thin out), `content/pages/blog.json` + `<locale>/blog.json` (layout + bound blocks), `content/pages/blog/[slug].json` (new template), archive templates, `app/lib/data-sources.ts` (4-5 resolvers + `locale`/`post` in context), `app/components/page-registry.tsx` + `public/admin/config.yml` (new block types), `app/lib/pages.ts` (page-context extras), `app/utils/markdown.ts` / `markdown-content-style.ts` (unchanged).
- Pairs with: `blog-newsletter-capture` (newsletter form), `blog-author-readtime-metadata` (meta display), `blog-draft-preview-banner` (draft badge/banner), `pms-i18n.md` bindings section (page-context seam; its "bound `searchBox` block" row has the same fix — should reuse the existing `search` block too), `docs-page-contentisation.md` (same pattern, `postBody` mirrors `docBody` — **note: as of 2026-08-04 this sibling task is itself still Draft/unimplemented, so there is no landed reference implementation to copy from; the blog task is breaking new ground, not following a paved path**), `cms-registry-schema-drift-ci`, `cms-datasource-showcase` (`each`/`dataSource` grid), `cms-static-css-presets` (no raw `style` strings in new content — note `content/pages/blog.json`'s current single text block already uses a raw `style` string, fix when it's replaced).
- Mia Chen owns Blog Website; she also carries `blog-newsletter-capture`, `blog-replace-placeholder-covers`, `blog-draft-preview-banner` — this is the biggest single task on her plate; consider sequencing it after the landing/detail split lands or rebalancing.
