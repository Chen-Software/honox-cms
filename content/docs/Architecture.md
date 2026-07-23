---
title: Architecture
---

This project is built on [**HonoX**](https://github.com/honojs/honox), a meta-framework on top of [Hono](https://hono.dev) that adds file-based routing, server/client islands, and static-site generation. Styling is [PandaCSS](https://panda-css.com) (type-safe, zero-runtime CSS-in-JS), content is authored through [Sveltia CMS](https://sveltiacms.app) (`/admin/`), and the whole site is pre-rendered to static HTML.

| Layer | Tool |
| --- | --- |
| Framework | [HonoX](https://honox.dev) |
| Routing | File-based, under `app/routes/` |
| Styling | [PandaCSS](https://panda-css.com) → `design-system/` |
| Content | Markdown / MDX / JSON under `content/` |
| CMS | [Sveltia CMS](https://sveltiacms.app), Git-backed, at `/admin/` |
| SSG | [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) |
| Deploy | Cloudflare Pages (`wrangler.jsonc`) or Vercel (`vercel.json`) |

***

## The Build: Two Vite Passes, One Static Site

`bun run build` runs `vite build --mode client && vite build` — two separate passes over the same `vite.config.ts`, switched by `mode`:

- **`--mode client`** builds `app/client.ts` (`createClient()` from `honox/client`) with `jsxImportSource: "hono/jsx/dom"`. This is the browser bundle: it hydrates islands and nothing else.
- **The default (server) pass** builds `app/server.ts` (`createApp()` from `honox/server`) with `jsxImportSource: "hono/jsx"` (the SSR JSX runtime), then hands the whole app to the [`ssg()`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) plugin, which crawls every route and writes pre-rendered HTML into `dist/`.

### SSG Routing and Localized URL Fixes

To prevent 404 routing errors on static file hosts after route compilation, a custom `fixSsgRoutingPlugin` in `vite.config.ts` recursively processes all `.html` files in the build output (`dist/`). It renames and moves localized index/homepage files (e.g. `zh.html`, `docs/fr.html`) into nested clean paths (`zh/index.html`, `docs/fr/index.html`) if a matching directory exists or if the name corresponds to a supported locale. This ensures that `/zh` and other localized endpoints resolve cleanly as directory indexes on any static host.

### Test Environment Resolution

To run unit tests for Hono JSX components in Bun, `bunfig.toml` is specifically configured with:

```toml
[jsx]
runtime = "classic"
pragma = "h"
fragment = "Fragment"
importSource = "hono/jsx"
```

This ensures standard Hono runtime resolution and avoids missing JSX dev runtime errors during test execution.

The `mdx()` plugin is scoped to `include: /\.mdx$/` only — plain `.md` (blog posts, most docs) is deliberately left alone so `app/utils/markdown.ts`'s `?raw` imports aren't corrupted by the MDX transform.

***

## File-Based Routing

Routes live under `app/routes/`, registered in `app/server.ts` via `import.meta.glob` over `**/*.{ts,tsx,md,mdx}`, excluding HonoX's private-file conventions (`_*`, `-*`, `$*`) and test files. A route file exports handlers (`GET`, `POST`, …) or a default component; `[slug].tsx` / `[[slug]].tsx` give dynamic/optional segments, matching HonoX's own routing conventions.

### Custom Static API Routes

In HonoX, custom static API routes (e.g., `app/routes/api/posts.json.ts`) that export a standard route returning `c.json(...)` are automatically compiled into static JSON files (e.g., `dist/api/posts.json`) by the `@hono/vite-ssg` plugin during the SSG build. There is no need for dynamic parameter configurations for these static endpoints.

### Pre-Rendering Dynamic Routes via ssgParams

Any dynamic route (such as `/blog/by-author/[author].tsx`) requires implementing and exporting the `ssgParams` middleware in the route definition to declare all potential parameter values for pre-rendering at build time.

### Locale Routing and Legacy Redirects

Routes for translatable collections (`docs`, `blog`, `pages`) follow `/​<collection>/<locale?>/<item>`, with the default locale (`en`) taking no segment:

```plain
/docs/AbsoluteCenter        (en)
/docs/fr/AbsoluteCenter     (fr)
/blog/my-post               (en)
/blog/zh/my-post            (zh)
```

Locale-agnostic **language homepages** live at the bare locale segment (`/fr`, `/zh`, …). All of this is centralized in `app/lib/i18n.ts` (`detectLocale`, `localiseHref`, `stripLocale`, `localeToggleUrl`) — no route file hand-rolls locale logic. A legacy route shape, `/<locale>/<collection>/<item>`, is 301-redirected to the current shape by middleware in `app/server.ts`, so old bookmarks/links keep working.

Supported locales are declared once, in `ALL_LOCALES` / `TRANSLATED_LOCALES` (`app/lib/i18n.ts`) — this list must stay in sync with `public/admin/config.yml`'s `i18n.locales` and the mirrored `app/routes/<locale>/` route directories.

#### Two ways to localize a route, and why both exist

- **Directory-per-locale re-export** (`/`, `/blog`, `/blog/:slug`, `/docs`, `/docs/:doc`, …): a real static directory per locale (`app/routes/blog/zh/index.tsx`) containing a one-line `export { default } from "../index"`. This only works because the locale segment is a **literal, static** path component — required here specifically because a *dynamic* `blog/[lang]/index.tsx` would match the exact same shape (`/blog/:something`) as the already-existing `blog/[slug].tsx` (an individual post), and Hono's router does not prefer the static-looking route over the dynamic one just because it "looks" more specific — the two would genuinely collide. `blog/[slug].tsx` works around this collision with an explicit `isLocale(slug)` guard that calls `next()` to defer to the locale-specific file when the "slug" param is actually a locale code.
- **Dynamic `[lang]` segment** (`/blog/:lang/by-tag/:tag`, `/blog/:lang/by-author/:author`, `/api/posts/:lang/search.json`): a single file (`app/routes/blog/[lang]/by-tag/[tag].tsx`) handling every locale, because nothing else registers a route at that specific, one-level-deeper path shape — so there's no ambiguity to guard against. This needs its own `ssgParams` (not a re-export of the base route's), since the base route's `ssgParams` only enumerates `{tag}`/`{author}`, and SSG needs the full `{lang, tag}` cross product to pre-render every combination; the actual per-request handler is still reused directly (`createRoute`'s `createHandlers` returns a typed tuple, so `[, handler] = require("../../by-tag/[tag]")` pulls it out without duplicating any logic).

Picking the wrong one for a new route either silently fails to build (missing `lang` in ssgParams → that locale's static page never gets generated) or silently shadows an existing route (a dynamic segment colliding with a static one at the same depth) — when adding a new locale-scoped route, check whether anything else already claims that exact path shape before choosing.

***

## Component Architecture

The codebase maintains two parallel trees under `app/`:

- **`app/components/ui/`** — the public component API (\~100 components).
- **`app/islands/`** — the client-hydrated counterparts, one per interactive component, built into the client bundle and mounted by `honox/client`.

### Zero-Hook Server Safety

To ensure flawless static site generation, **all client-side reactive hooks (`useEffect`, `useRef`, `useState` from `hono/jsx`) are strictly restricted to the `/islands/` directory**. Files under the `/components/ui/` directory remain entirely hook-free and server-side static/SSR safe. Static wrappers (like `Dialog` and `Drawer` in `components/ui/`) that forward references use a static plain object fallback (`{ current: null }`) instead of `useRef` to avoid executing client hooks on the server.

### Safe Cross-Island Style Resolution

Multi-part components like `HoverCard` that render children across HonoX island boundaries must implement a safe fallback style resolution (e.g., `context?.styles || recipe()`) in their primitive sub-components to ensure class names are fully populated in both pre-rendered SSR/SSG and hydrated client-side states.

### Overlay Positioning & Interaction Hacks

- **Correct Positioning:** The `Popover` and `HoverCard` root component wrappers utilize inline styles `position: 'relative'` and `display: 'inline-block'` (for both static and interactive/island implementations). This prevents them from taking up block-level inline space and correctly positions their absolute overlay content relative to the trigger.
- **Focus Management:** In `app/components/ui/popover-primitive.tsx`, the `InteractivePopoverRoot` utilizes an `isFirstRender` ref to ensure that `closePopover` does not focus the trigger element on the initial render/mount when the popover is closed, preventing unexpected auto-focus on page load.
- **Pointer Events Pass-Through:** To prevent invalid HTML nesting of anchor tags (`<a>`) inside large clickable parent elements (like card or carousel slides), the overlay text container is structured with `pointer-events: none` and `pointer-events: auto` is applied to targeted nested `<Anchor>` or `<a>` elements.

### Advanced Component Mechanics

- **Interactive Menu Component (`app/islands/menu.tsx`):** Handles window scroll and resize events by dynamically recalculating and repositioning the dropdown container (via `updatePosition()`), ensuring it remains anchored to its trigger. It supports controlled open state (`open` and `onOpenChange`), placements mapped from both classic and kebab-case configurations with boundary collision detection, and customizable trigger actions with hover enter/leave timers.
- **Simplified Menu API (`app/components/ui/menu.tsx`):** Recursively renders cascading submenus when encountering a menu item of type `"submenu"`, displaying a chevron icon and leveraging nested compound `Menu` primitives. It exposes `Menu.Arrow`, `Menu.ArrowTip`, and `Menu.TriggerItem` as compound subcomponents.
- **VDOM Node Reference Checks:** To correctly check the VDOM node reference of a child component (like `MenuTriggerItem` inside `Trigger`) in Hono JSX, the code checks both `child.tag` and `child.type` as classic JSX function nodes are mapped to `tag` instead of `type` under classic JSX compilation.
- **DatePicker:** Supports granular views using the `picker` prop (`"date" | "month" | "year"`), seamlessly mapping sizes and variants to Panda CSS token configurations. It supports deep custom semantic styling via `classNames` and `styles` props onto specific inner elements (e.g., label, control, input, positioner, clearTrigger).
- **Tabs Component:** Ported entirely to Hono/JSX. The static SSR layout primitives are defined in `app/components/ui/tabs-primitive.tsx`, while the eagerly interactive client-side island wrapper `app/islands/tabs.tsx` handles active state, indicator tracking via a `ResizeObserver`, and standard ARIA/keyboard navigation rules. It maps Ant Design-style properties (`activeKey`, `defaultActiveKey`, `onChange`, `onTabClick`, sizes, and types) to the underlying primitives.
- **Select Component:** Dynamically maps traditional framework inputs like `size="small"`/`"medium"`/`"large"` and `variant="outlined"`/`"flushed"` to standard Panda CSS scales (`sm`/`md`/`lg` and `outline`/`underlined`) before calculating slot classes to ensure seamless cross-framework compatibility. It has been refined to support client-side search/filtering inside dropdown lists using the `showSearch` prop, as well as rendering selected items as interactive, dismissible Tags in multiple-selection mode (customizable via `tagRender`).
- **PinField Component:** Implemented with a static SSR primitive (`app/components/ui/pin-field-primitive.tsx`) and an interactive island (`app/islands/pin-field.tsx`). It normalizes `value` and `defaultValue` to support both string and array types, defaults `selectOnFocus` to `true`, supports `autoSubmit` form execution, sanitizes paste characters by removing spaces and hyphens, and handles RTL keyboard navigation.
- **Grid Layout System:** Provides a high-performance 24-column flexbox container via `Row` and `Col` components, mapping responsive breakout settings (like `xs`, `sm`, `md`, `lg`, `xl`, `xxl`) to standard Panda CSS breakpoints. Row maps static, array-based, and responsive gutters into Panda CSS spacing shorthand outputs (`cg` and `rg`), while Col converts responsive props and breakpoint objects into matching design system classes dynamically.
- **Flattened Grid Layout:** Flat `Grid` and `GridItem` layout components in `app/components/ui/grid.tsx` are based on Panda CSS's native layout patterns, supporting 2D control via `columns` and `rows`. These patterns are registered in `staticCss.patterns` inside `panda.config.ts` (`grid` and `gridItem`) and bound recursively in Sveltia CMS `config.yml` under `pages` to simplify multi-column layouts without nested Row/Col elements. Responsive breakpoints support JSON-stringified responsive objects (e.g., `"columns": "{\"base\": 1, \"md\": 3}"`).
- **Layout Grid Recipes:** Layout grid recipes for `row` and `col` are programmatically compiled into static, discrete variants (spans, offsets, orders 0 to 24) and registered in `panda.config.ts` static CSS to support static page layout nesting inside Sveltia CMS and PageRenderer without dynamic JavaScript hydration.
- **Centralized SVG Icon Directory:** The codebase utilizes individual, reusable SVG icon components located in `app/icons/*` (e.g. `CloseIcon`, `ChevronDownIcon`, `CheckIcon`, etc.) that accept `JSX.IntrinsicElements["svg"]` to forward attributes like `width`, `height`, and custom styles. Hardcoded inline SVGs across UI components and routes have been refactored to import from this central icons directory to promote code reusability and prevent duplication.

***

## Content Pipelines & i18n

Everything under `content/` is discovered at build time with Vite's `import.meta.glob` and pre-rendered by SSG.

### CMS Collection Partitioning

The repository partitions documentation content into two distinct CMS collections defined in `public/admin/config.yml`:

- `"docs"`: Guides located under `/content/docs/` as `.md` files.
- `"components"`: Component references located under `/content/components/` as `.mdx` files.

Sveltia CMS admin edit page links are built using the format `/admin/#/collections/[docs|components]/entries/[slug]`.

### Hydration Classification Model

The repository uses a three-tier hydration classification model, configured via Sveltia CMS frontmatter and documented in [Hydration](/docs/Hydration):

- **'Eagerly Interactive' (Tier-1):** Hydrates eagerly as a client island by default.
- **'Smart Adaptive' (Tier-2):** Hydrates conditionally based on behavior signals.
- **'Zero-JS Static' (Tier-3):** Purely static components with no JS hydration.

### i18n and Adding a New Translation Locale

Sveltia CMS is configured for internationalization (i18n) under `public/admin/config.yml` supporting locales `en`, `zh`, `es`, `pt`, `fr`, and `de`, with English (`en`) as the default. It uses the `multiple_folders` structure with `omit_default_locale_from_file_path: true`, keeping default locale files in original root paths and placing translations under locale subfolders — `content/<collection>/<locale>/<slug>.<ext>` — for every collection: docs, components, pages, **and posts**. (Configs is the one exception, since it's a singleton file rather than a folder collection: translations there use a `content/configs.<locale>.json` suffix instead.)

`pages` (`content/pages/*.json`) follows this same subfolder convention — `content/pages/<locale>/<slug>.json` — loaded by `app/lib/pages.ts`'s `loadPage(slug, locale)`, which falls back to the default-locale file when a translation doesn't exist. This backs both `/pages/<locale>/<slug>` and the locale-aware homepage (`app/routes/index.tsx` loading `content/pages/<locale>/index.json`). The homepage's header (brand lockup, nav links, header actions) is itself CMS page-builder content — `headerBrand`/`headerNav`/`headerActions` arrays on that same JSON file, rendered through `<PageRenderer>` inside a hardcoded `<header>` shell — and `content/pages/blog.json` carries the identical three fields for `/blog`'s header.

`posts` (`content/posts/*.md`) follows the identical convention — `content/posts/<locale>/<slug>.md` — via `app/lib/posts.ts`'s `parsePostPath`/`resolvePostPath`, with the same default-locale fallback. Each locale gets its own search index at `/api/posts/:lang/search.json` (`app/routes/api/posts/[lang]/search.json.ts`); a locale whose `content/configs.<locale>.json` sets `blog.excludeUntranslatedFromSearch: true` drops any post lacking a real translation from *that locale's search results only* (the post still appears, English-titled, in the ordinary blog listing/tag/author pages — this only trims mixed-language search noise once a locale's translation coverage is actually complete).

To add a new translation locale to the repository, follow this step-by-step workflow:

1. **CMS Configuration:** Add the locale code (e.g. `fr` or `de`) to the `i18n.locales` section of `public/admin/config.yml`.
2. **Translation Keys:** Create a matching config file under `content/configs.<locale>.json` with the localized translation keys.
3. **Language Switcher Registration:** Register the locale code and its human-readable name in `ALL_LOCALES` and `LOCALE_NAMES` inside `app/components/language-switcher.tsx`.
4. **Docs Loader Array:** Add the locale code to the `LOCALES` array inside `app/lib/docs.ts`.
5. **Route Re-export:** Re-export the standard routes by creating a directory `app/routes/<locale>/` matching the root route files structure. This also covers `app/lib/posts.ts`'s `parsePostPath`, which validates the locale segment in a translated post's path against `TRANSLATED_LOCALES` (`app/lib/i18n.ts`) — a locale missing from that list is silently treated as a plain (non-locale) folder and its posts get skipped.
6. **Translations:** Provide translations for the markdown/MDX docs, component references, page layouts, and blog posts under `content/docs/<locale>/*.md`, `content/components/<locale>/*.mdx`, `content/pages/<locale>/*.json`, and `content/posts/<locale>/*.md` respectively — only for the specific docs/components/pages/posts that actually need translating, since each loader falls back to the default-locale file otherwise.

Note `by-tag`/`by-author`/search routes one level under `/blog/` use a different technique than step 5's directory-per-locale re-export — see "Locale Routing and Legacy Redirects" above for why.

***

## Styling

[PandaCSS](https://panda-css.com) generates all CSS ahead of time — there is no runtime style engine. `panda.config.ts` extends the base theme from `app/theme/`, scans `app/**/*.{js,jsx,ts,tsx}` for style usage, and writes the generated system (recipes, tokens, patterns, JSX helpers) into `design-system/`, which components import from via the `design-system` Vite alias.

### Slot Recipe Designs & Multi-part Components

Theme recipes for multi-part components (e.g., `RadioGroup`, `SegmentGroup`, `Tabs`, `ToggleGroup`, `Select`, `Avatar`, `Pagination`, `HoverCard`) must explicitly define their `slots` as an array of strings within `defineSlotRecipe` instead of importing from `@ark-ui/react/anatomy` or `@ark-ui/anatomy` to eliminate React dependencies in the styling layer.

Multi-part components using `defineSlotRecipe` must be registered in `slotRecipes` in `app/theme/recipes/index.ts` and explicitly included in `staticCss.recipes` within `panda.config.ts` (e.g., `radioGroup: ['*']`, `select: ['*']`, `tabs: ['*']`) to ensure all variants like `size` are correctly generated for Hono islands.

### Custom Recipe Naming Conflicts

Naming a custom recipe `stack` conflicts with Panda CSS's built-in layout patterns, triggering a warning during `codegen`, though the recipe remains functional.

### Token Colors vs Semantic Tokens

In the project's PandaCSS design system:

- **Tokens (`tokens.colors`):** Pure static colors (such as black and white) are defined as raw values under `app/theme/tokens/colors.ts`.
- **Semantic Tokens (`semanticTokens.colors`):** Conditional or adaptive scale palettes (such as slate/gray, blue, red, etc.) are declared here to enable automatic light and dark mode variables compilation.

### Explicit Semantic Token Usage Guidelines

In the Panda CSS config and custom styles, **avoid using generic color tokens like `bg` and `fg`** (which compile to transparent/invalid CSS). Instead, use explicit semantic tokens like `gray.surface.bg`, `fg.default`, and `gray.outline.border` to preserve proper theme states.
Additionally, when styling popup overlays, dropdown lists, or autocomplete components (like `app/islands/search.tsx`), use the semantic background token `gray.surface.bg` to guarantee a solid background across light/dark modes and avoid text overlapping.

***

## CMS

[Sveltia CMS](https://sveltiacms.app) runs entirely client-side at `/admin/`, configured by `public/admin/config.yml`. `app/server.ts` serves that directory's static files (config, HTML, assets) directly from `public/admin/` rather than through normal routing, so the CMS UI works identically in dev and once deployed. It's Git-backed: edits made in the CMS UI commit directly to content files under `content/`, which the next build picks up like any other change.

***

## Development Tooling & Integrity

### Node & Bun Commands

To set up the development environment, install dependencies, and run PandaCSS code generation:

```bash
bun install
```

To run the local development server (Vite on port 5173 by default):

```bash
bun run dev
```

To build the static site distribution output (`dist/`):

```bash
bun run build
```

### Proactive Unit Testing

To run the codebase unit tests:

```bash
bun test unit
```

_Note: Always run unit tests using `bun test unit` to bypass potential missing-dependency failures from integration tests that rely on external, heavy packages like `@playwright/test`._

### Biome Linter & Code Quality

The repository utilizes **Biome** for code linting and formatting. To ensure `bun run check` and `bun run fix` execute successfully with exit code 0, restrictive and highly noisy rules that generate false-positives on standard dynamic component attributes are explicitly turned `off` in `biome.json`. These rules include:

- `useExportsLast`
- `useAriaPropsSupportedByRole`
- `noLabelWithoutControl`
- `useSemanticElements`
- `noNoninteractiveElementToInteractiveRole`

### Restricting React-Oriented CLIs

Running React-oriented CLI commands (such as `@park-ui/cli`) directly in this repository will overwrite custom Hono/JSX implementations and slot recipes with React-specific models, breaking the HonoX SSG/island model. Always verify existing codebase files before running external component installer scripts.

***

## Deployment

The build output (`dist/`) is a fully static site — no server process is required at request time. Two targets are configured out of the box:

- **Cloudflare Pages** (`wrangler.jsonc`) — `assets.directory` points at `dist/`; `bun run deploy` builds then runs `wrangler pages deploy ./dist`.
- **Vercel** (`vercel.json`) — same build command, `outputDirectory: "dist"`, `cleanUrls: true` (so Vercel's own clean-URL rewriting complements `fixSsgRoutingPlugin`'s directory-index fixups).

`bun run preview` (`wrangler dev`) serves the built `dist/` locally through Cloudflare's local runtime, distinct from `bun run dev` (`vite`), which runs the live HonoX dev server with HMR.
