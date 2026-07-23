# HonoX + PandaCSS + Sveltia CMS Starter

Full-stack [HonoX](https://github.com/honojs/honox) starter with type-safe CSS-in-JS ([PandaCSS](https://panda-css.com/)), and a Git-backed CMS ([Sveltia CMS](https://sveltiacms.app/)).

Live demo: [https://honox.chen.so](https://honox.chen.so), [https://honox-ts.vercel.app](https://honox-ts.vercel.app)

---

## What's Inside

| Feature | Details |
|---|---|
| **Framework** | [HonoX](https://honox.dev) — meta-framework on Hono |
| **Styling** | [PandaCSS](https://panda-css.com) — type-safe, zero-runtime CSS-in-JS |
| **CMS** | [Sveltia CMS](https://sveltiacms.app) — Git-backed, runs at `/admin/` |
| **Blog** | Markdown posts in `content/posts/`, rendered at `/blog` |
| **API** | Read-only JSON REST API for posts at `/api/posts/*` |
| **SSG** | Static site generation via `@hono/vite-ssg` |
| **Deploy** | Cloudflare Pages (`wrangler.jsonc`) |

---

## Architecture

### Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/routes/index.tsx` | Homepage — Page Builder-driven (`content/pages/index.json`), locale-aware |
| `/blog` (+ `/blog/:locale`) | `app/routes/blog/index.tsx` (+ `blog/<locale>/index.tsx` re-exports) | Post list with tag filtering |
| `/blog/by-tag/:tag` (+ `/blog/:locale/by-tag/:tag`) | `app/routes/blog/by-tag/[tag].tsx` (+ `blog/[lang]/by-tag/[tag].tsx`) | Tag-filtered post list (static) |
| `/blog/by-author/:author` (+ `/blog/:locale/by-author/:author`) | `app/routes/blog/by-author/[author].tsx` (+ `blog/[lang]/by-author/[author].tsx`) | Author-filtered post list (static) |
| `/blog/:slug` (+ `/blog/:locale/:slug`) | `app/routes/blog/[slug].tsx` (+ `blog/<locale>/[slug].tsx` re-exports) | Individual post |
| `/admin/` | `public/admin/index.html` | Sveltia CMS UI |
| `/pages/:slug` (+ `/pages/:locale/:slug`) | `app/routes/pages/[slug].tsx` | Dynamic CMS-built pages |
| `/api/posts/index.json` | `app/routes/api/posts/index.json.ts` | Post collection (JSON) |
| `/api/posts/:slug.json` | `app/routes/api/posts/[slug].json.ts` | Single post detail (JSON) |
| `/api/posts/search.json` | `app/routes/api/posts/search.json.ts` | Search index (JSON), English only |
| `/api/posts/:lang/search.json` | `app/routes/api/posts/[lang]/search.json.ts` | Locale-scoped search index (JSON) |
| `/api/posts/by-author/:author.json` | `app/routes/api/posts/by-author/[author].json.ts` | Posts by author (JSON) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for UI components architecture details.

---

## Blog, Pages & CMS

### How it works

#### Blog Posts
1. **Write** — Markdown files in `content/posts/*.md` with YAML frontmatter.
2. **Manage** — Visit `/admin/` to edit posts.
3. **Build** — `bun run build` generates static HTML for post list and individual posts.
4. **Translate** — Add `content/posts/<locale>/<slug>.md` for a translated post (same convention as pages/docs); `loadPosts()`/`loadPostBySlug()` fall back to the English file for anything not translated. Each locale gets its own search index at `/api/posts/:lang/search.json`; set `blog.excludeUntranslatedFromSearch: true` in that locale's `content/configs.<locale>.json` once every post is actually translated, to stop search falling back to English-titled results for that locale.

#### Dynamic Pages
1. **Design** — Create pages in `content/pages/*.json` using the CMS UI. This includes the homepage itself (`content/pages/index.json`).
2. **Components** — Choose from 25+ UI components (Stack, Card, Dialog, etc.).
3. **Nesting** — Build complex layouts with recursive nesting (e.g., a Card inside a Stack inside another Stack).
4. **Render** — The `PageRenderer` component (`app/components/page-renderer.tsx`) maps JSON data to themed UI components, loaded via `app/lib/pages.ts`.
5. **Translate** — Add `content/pages/<locale>/<slug>.json` for a translated page; `loadPage()` falls back to the default-locale file for anything not translated.

---

## Posts API

A read-only JSON REST API over the same `content/posts/*.md` files that back `/blog`, prerendered by SSG like every other route. Because the site deploys as static files with no live server at request time, every endpoint's URL includes a literal `.json` suffix — that's the exact filename the build writes to `dist/`, so the same path works identically in dev (`bun run dev`) and once deployed.

| Endpoint | Description |
|---|---|
| `GET /api/posts/index.json` | All published posts (drafts excluded in production), newest first. Shape: `{ generated, total, tags, posts: BlogPost[] }`. |
| `GET /api/posts/:slug.json` | One post's full detail: frontmatter fields + rendered `html` + up to 3 `relatedPosts` sharing a tag. `404` with `{ "error": "Not found" }` for a missing or (in production) draft slug. |
| `GET /api/posts/search.json` | The English-only search index the `Search` island fetches by default. Shape: `{ generated, entries: SearchIndexEntry[] }`. |
| `GET /api/posts/:lang/search.json` | Same shape, scoped to one locale's translated posts (falling back to the English entry per-post unless that locale sets `blog.excludeUntranslatedFromSearch: true`). The `Search` island resolves this URL itself from its `locale` prop — see `localiseSearchSrc` in `app/islands/search.tsx`. |
| `GET /api/posts/by-author/:author.json` | All posts by a given author, newest first. Shape: `{ generated, author, total, posts: BlogPost[] }`. Returns empty array if no posts match. |

Implementation: `app/lib/posts.ts` (`loadPosts`, `loadPostBySlug`, `loadPostsByAuthor`) backs all routes. `app/routes/api/posts/_404.tsx` scopes a JSON not-found handler to this namespace so API errors don't fall back to the site's HTML 404 page.

---

## Sveltia Page Builder

This starter contains an advanced layout builder inside the Sveltia CMS `pages` collection. Users can construct complex, responsive, dynamic pages directly from the CMS UI.

### Recursively Nestable Components

We support a full collection of over **25+ rich presentational and interactive components**:

* **Layout & Structure:** `Stack` (Direction/Align/Justify/Gap), `Group` (Grow/Attached), `Fieldset` (Legend/Helper/Error)
* **Text & Typography:** `Heading` (Level/Size), `Text` (Content/Size)
* **UI Elements:** `Button` (Variant/Palette/Size), `Badge` (Variant/Palette/Size), `Alert` (Status/Variant), `Card` (Variant/Size/Clickable)
* **Form & Controls:** `Checkbox`, `Combobox` (Items list/Clear trigger), `Field`, `RadioGroup`, `SegmentGroup`, `Slider`, `Switch`
* **Feedback & Loaders:** `Progress` (Linear/Circular), `Skeleton` (NoOfLines/Circle), `Spinner`, `Toast` (global toast host, paired with a Button's raw onClick)
* **Overlays & Dialogs:** `Collapsible` (Trigger/Open), `Popover` (ShowArrow/Closable), `Dialog` (Cancel/Confirm/Closable), `Drawer` (Cancel/Confirm/Closable), `Dropdown` (Nestable item action list)
* **Tables & Data:** `PaginatedTable`, `Pagination`

### Multi-Level Nested Recursion

Components like `Stack`, `Fieldset`, `Group`, `HoverCard`, `Popover`, `Collapsible`, `Dialog`, and `Drawer` fully support **recursive children nesting**. Through carefully designed YAML anchors and references in Sveltia CMS `public/admin/config.yml` and a smart layout compiler inside `app/components/page-renderer.tsx`, users can nest components (e.g. Buttons/Skeletons inside a Card inside a Collapsible inside a Stack) to build sophisticated dashboard layouts.

---

## CMS Setup

Sveltia CMS is configured in `public/admin/config.yml`. You can use it **locally** or with a **Git backend**:
- **GitHub:** `name: github`
- **GitLab:** `name: gitlab`
- **Bitbucket:** `name: bitbucket`
- **Azure:** `name: azure`

See [Sveltia CMS docs](https://sveltiacms.app/en/docs/backends) for details.

---

## Local Development

### Prerequisites
- Bun 1.0+
- Node.js 18+ (for PandaCSS)

### Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server with HMR (`http://localhost:5173`) |
| `bun run build` | Client + server build + SSG |
| `bun run start --static` | Serve `dist/` statically (no SSR) |
| `bun run deploy` | Deploy to Cloudflare Pages |

---

## Project Structure

````
app/
  components/page-renderer.tsx # Dynamic Page layout compiler
  components/ui/    # Public component API
  islands/          # Client-side interactive islands
  routes/           # File-based routing
    blog/index.tsx               # Post list (blog/<locale>/index.tsx re-exports it)
    blog/[slug].tsx               # Individual post (blog/<locale>/[slug].tsx re-exports it)
    blog/by-tag/[tag].tsx        # Tag-filtered post list
    blog/[lang]/by-tag/[tag].tsx # Same, locale-prefixed — a dynamic `[lang]`
                                  #   segment, not per-locale re-exports, since
                                  #   nothing else claims this deeper path shape
    blog/by-author/[author].tsx  # Author-filtered post list
    blog/[lang]/by-author/[author].tsx # Same, locale-prefixed
    pages/[slug].tsx             # Page builder SSG route
    api/posts/                   # Read-only posts REST API
      index.json.ts              # GET /api/posts/index.json — collection
      [slug].json.ts             # GET /api/posts/:slug.json — single post
      search.json.ts             # GET /api/posts/search.json — English-only search index
      [lang]/search.json.ts      # GET /api/posts/:lang/search.json — locale-scoped index
      by-author/[author].json.ts # GET /api/posts/by-author/:author.json
      _404.tsx                   # JSON 404s scoped to /api/posts/*
  lib/posts.ts      # Post loading/parsing shared by blog pages + API, locale-aware
  lib/pages.ts      # Page builder JSON loading, locale-aware (used by / and /pages/:slug)
utils/
  markdown.ts        # Frontmatter parser + MD→HTML
content/posts/       # Blog post markdown files
content/posts/<locale>/ # Translated posts, e.g. content/posts/zh/getting-started-with-honox.md
content/pages/       # Page builder JSON layouts (index.json is the homepage, blog.json is /blog's header)
content/pages/<locale>/ # Translated page layouts, e.g. content/pages/zh/index.json
public/admin/        # Sveltia CMS static files
  config.yml          # CMS configuration
  index.html          # CMS UI
````
