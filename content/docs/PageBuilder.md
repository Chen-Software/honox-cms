---
title: CMS Page Builder
---

## Introduction

The [Sveltia CMS](https://sveltiacms.app/en/docs/intro) based dynamic Page Builder allows non-technical editors to create complex, recursively nested pages entirely through the CMS user interface (`/admin/`).

Page layouts are saved as JSON files in `content/pages/*.json` and are compiled on demand or statically pre-generated (via Hono SSG) at `/pages/[slug]`. The homepage (`/`) is itself a Page Builder page — `app/routes/index.tsx` renders `content/pages/index.json` through the same `<PageRenderer />` pipeline. Even the header is page-builder content: `headerBrand`, `headerNav`, and `headerActions` are ordinary block arrays on that same JSON file, rendered through `<PageRenderer>` inside a hardcoded `<header>` shell (the border/blur/sticky styling stays in code; only the brand lockup, nav links, and header buttons are CMS-editable). `content/pages/blog.json` carries the identical three fields for `/blog`'s header. Only the footer (and, for `/blog`, the post carousel/search/newsletter widgets) stay outside the Page Builder, since those need live post data or bespoke styling the generic block system doesn't support.

***

## Supported Components

The Page Builder supports a rich palette of over 40 layout, typography, decorative, and interactive components.

### 1. Structure & Layout

* **Stack**: Groups children vertically or horizontally with controllable alignment, justification, and gap spacing.
* **Grid**: Responsive CSS Grid layout — fixed column/row counts or auto-fit by minimum child width.
* **Group**: Aligns elements like buttons closely together (supports `attached` and `grow` properties).
* **Fieldset**: Organizes related form components under a styled container with `legend`, `helperText`, and `errorText`.
* **AbsoluteCenter**: Centers a single nested block within its parent along one or both axes.
* **Splitter**: Resizable panels separated by drag handles. Always renders static in the Page Builder (panel content can't cross the island hydration boundary).
* **Breadcrumb**: Navigation trail of linked items with a customizable separator.

### 2. Typography & Content

* **Heading**: Styled headers of levels `h1` through `h6` and various responsive text sizes.
* **Text**: Paragraph-level text with adjustable sizes.

### 3. Display & Presentational

* **Alert**: Renders warning/success/error/info alerts with standard statuses and icons.
* **Badge**: Colored metadata labels with custom color palettes and styles.
* **Card**: A rich container supporting nested blocks, headers, footers, and top/bottom/left/right image positions. Defaults to a subtle drop shadow and clips its own content to its rounded corners — see "Advanced Escape Hatches" below for the fields that override both.
* **Progress**: Renders linear or circular progress indicators.
* **Skeleton**: Highly customisable placeholder skeletons (supports circle and multi-line text shapes).
* **Loader** / **Spinner**: Loading indicators, with optional accompanying text.
* **Table**: Static tabular data with configurable columns and a JSON-encoded row array.
* **Icon**: Raw inline SVG markup with size/color controls.

### 4. Interactive & Overlays

* **Button**: Primary clickable targets supporting custom palettes, sizes, and styling variants.
* **Field** / **Textarea**: Labeled single/multi-line text inputs. Both take an advanced "Validator" field — a raw JS function expression (e.g. `(value) => value.length >= 3 || "Must be at least 3 characters"`), reconstructed client-side via `new Function`; same trust model as Button's Custom onClick below.
* **Checkbox**: Tick boxes for Boolean input with accessible aria bindings.
* **Combobox**: Dropdowns with clear actions and items lists.
* **Collapsible**: Disclosure containers that show/hide nested component trees.
* **Popover**: Floating descriptive content anchored to standard text triggers.
* **Tooltip**: Contextual hint text anchored to a trigger button on hover/focus.
* **HoverCard**: Richer hover-triggered content than a Tooltip, with an optional title/description.
* **Dialog**: Fully focus-trapped modal boxes with custom Confirm/Cancel buttons, an optional list of extra Footer buttons alongside them, and a custom children list.
* **Drawer**: Responsive side panels sliding in from the page edge, with the same Confirm/Cancel + extra Footer buttons as Dialog, and a custom children list.
* **Dropdown** (block type `menu`): Action menus with custom checkable, selectable, separator, and nested-submenu options (one level of `items` nesting, since Sveltia's list widget can't self-reference).
* **Toast**: Renders the global toast host (`Toast.Toaster`). Has no configurable fields itself — pair it with a `Button` whose advanced "Custom onClick" field dispatches a `park-ui:toast:create` `CustomEvent`; see the homepage's "Clipboard & Toast" card for a working example.

### 5. Advanced & Data

* **Select**: Custom single/multi-select dropdown, form-submittable.
* **DatePicker**: Single/multiple/range date selection with a popup calendar.
* **TagsField**: Free-form list of string tags.
* **RadioGroup** / **RadioCardGroup**: Custom radio lists with accessible single-select logic.
* **SegmentGroup**: Sliding segmented controls for tabbed selection.
* **Slider**: Range slider components.
* **Switch**: Toggle switches.
* **Editable**: Inline click-to-edit text.
* **ColorPicker**: Saturation/hue/alpha color picker with hex/RGBA/HSLA input.
* **FileUpload**: Drag-and-drop or click-to-browse file selection.
* **Carousel**: Auto-playing or manual image slideshow.
* **PaginatedTable**: Interactive dynamic table components with paging support.
* **Pagination**: Interactive page controllers.

***

## Architecture

### 1. CMS Schema Definitions (`public/admin/config.yml`)

We utilise advanced **YAML Anchors and Aliases** (`&` and `*`) to work around YAML's inability to express true recursion.

* **Base field anchors** (`&button_fields`, `&checkbox_fields`, etc.) are declared once and reused everywhere that component type can appear, so a schema change only needs editing in one place.
* **`&root_components`** — the top-level block types (Stack, Grid, Card, Layout, …) offered for the page's `content` field.
* **`&nestable_components`** — what a root-level container's children may contain: containers again, one level down.
* **`&leaf_components`** — the innermost level, where containers can only hold non-container "leaf" components (Button, Badge, Text, …), so the nesting bottoms out.
* This unrolls editor-buildable nesting to **\~4 levels deep**, which is a constraint of the CMS _editing UI_ only — see the note below.

### 2. Layout Renderer (`app/components/page-renderer.tsx` + `app/components/page-registry.tsx`)

`PageRenderer` is a thin public entry point; the actual block → component mapping and recursive rendering logic live in `page-registry.tsx`.

* A `registry` object maps each block's `type` string (`"stack"`, `"button"`, `"card"`, …) to a renderer function that returns real JSX from `app/components/ui/`.
* `resolveType()` first runs the type through a `TYPE_ALIASES` table (e.g. `"link"` → `anchor`, `"hover-card"` → `hoverCard`, `"menu"` → `dropdown`), so CMS content and component names can drift slightly without breaking.
* `propsOf()` (`app/components/block-types.ts`) strips the `type` meta-key off every block before its fields are spread onto the component, so it never leaks as a stray DOM attribute.
* Container renderers (Stack, Grid, Card, Dialog, Drawer, Collapsible, …) destructure their own `children` array and call `renderChildren()`, which maps over it and recursively invokes the block renderer again.

**Note:** the YAML schema's \~4-level nesting cap only limits what the CMS form lets a non-technical editor _build_. `renderChildren`'s recursion has no depth limit — a hand-edited or programmatically generated `content/pages/*.json` file can nest far deeper than the CMS UI allows, and it will still render correctly.

### 3. Advanced Escape Hatches

A handful of fields exist purely so a non-technical editor can reproduce behaviour that would otherwise need real code. All are deliberately unsanitised — treat CMS write access the same as code-commit access:

* **Button → "Custom onClick"**: a raw inline JS string, forwarded verbatim as the DOM `onclick` attribute. Works without client hydration (see `content/components/Toast.mdx`) — used for things like smooth-scrolling to an anchor or dispatching a `park-ui:toast:create` `CustomEvent` to show a toast.
* **Heading → "Anchor ID"**: sets a DOM `id` on the heading, so a Button's "Custom onClick" can `document.getElementById(...)` scroll to it.
* **Field / Textarea → "Validator"**: a raw JS function expression string. `app/components/page-registry.tsx` passes it straight through to the component, which sends it across the island-hydration boundary as `validatorSource` (functions themselves don't survive JSON serialization) and reconstructs it client-side via `new Function`.
* **Card → "Overflow"**: overrides Card's default `overflow: hidden` (which exists to clip the image slot to the border radius) — set to `visible` when a card contains a Popover/Dropdown/Select/DatePicker/ColorPicker/HoverCard, whose floating overlay would otherwise get cut off at the card's edge.
* **Card → "Box Shadow"**: same validated token pipeline as Stack/Grid/Layout's Box Shadow field (`none`/`2xs`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`) — Card already defaults to a subtle `sm` shadow, so this is only needed to raise or remove it on a specific card.
* **Dialog / Drawer → "Footer"**: a list of extra blocks (typically Buttons) rendered in the footer alongside the dedicated Confirm/Cancel buttons — e.g. a "Reload Table" button with a Custom onClick that dispatches a refresh event, or an "Email Us Instead" button that navigates to a `mailto:` link.

***

## Content Build Pipelines

Page Builder layouts are one of three content types under `content/`, each discovered with Vite's `import.meta.glob` and rendered by its own route. All three are static-generated the same way: a route's `ssgParams` middleware enumerates every file in its collection at build time, and `bun run build` (via `@hono/vite-ssg`) crawls those params to pre-render one static HTML file per slug into `dist/`.

### 1. JSON page layouts (`content/pages/*.json`)

* Loaded through `app/lib/pages.ts` (`loadPage`, `listPageSlugs`), used by both `app/routes/index.tsx` (the homepage) and `app/routes/pages/[slug].tsx`.
* Each file is parsed as plain JSON — no markdown involved — and its `content` array is handed directly to `<PageRenderer />` (see Architecture above), which recursively compiles it into the matching UI components.
* This is the only pipeline of the three with no separate parse/compile step: the JSON _is_ the render tree.
* **i18n:** translations live under `content/pages/<locale>/<slug>.json` (e.g. `content/pages/zh/index.json`), same `multiple_folders` convention as docs/components. `loadPage(slug, locale)` falls back to the default-locale file when no translation exists, so a page only needs a translated file for the locales it actually has content for.

### 2. Plain markdown (`content/posts/*.md`, `content/docs/*.md`)

* Loaded with `import.meta.glob(..., { query: "?raw", import: "default" })`, which hands back the raw markdown source as a string rather than a compiled module.
* Parsed at request/build time by `app/utils/markdown.ts`, a `remark`/`rehype` pipeline (`remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-stringify`): `parseFrontmatter()` splits the YAML frontmatter block from the body, and `markdownToHtml()` turns the body into an HTML string.
* The resulting string is injected via `dangerouslySetInnerHTML` (see `app/lib/posts.ts` and `app/lib/docs.ts`) — there's no JSX involved, so this pipeline can't embed live components.
* Blog posts also run their body through `stripMarkdown()` to build a plain-text search haystack for `/api/*/search.json`.

### 3. MDX docs (`content/docs/*.mdx`)

* Compiled ahead of time by the `@mdx-js/rollup` Vite plugin (configured in `vite.config.ts`, restricted to `.mdx` so it never intercepts the raw `.md` imports above), using `remark-frontmatter` + `remark-mdx-frontmatter` + `remark-gfm`.
* Each `.mdx` file becomes a real, importable component (plus a separate `frontmatter` export), loaded in `app/lib/docs.ts` via a plain (non-`?raw`) `import.meta.glob`.
* Because the output is a component rather than an HTML string, `.mdx` docs can embed actually-rendered, interactive examples (e.g. a live `<Button>` demo) directly in the prose — the tradeoff for that is the build-time compile step plain `.md` doesn't need.

`app/lib/docs.ts` loads both `.md` and `.mdx` collections side by side and merges them into one sidenav, so which pipeline a given doc uses is an implementation detail invisible to readers — pick `.md` for plain prose and `.mdx` only when a page needs a live component embedded in it.

***

## Example JSON Structure

Here is a sample layout file representing a complex dashboard page (`content/pages/dashboard.json`):

```json
{
  "title": "Interactive Dashboard",
  "content": [
    {
      "type": "heading",
      "text": "Dashboard Analytics",
      "as": "h1",
      "size": "3xl"
    },
    {
      "type": "stack",
      "direction": "vertical",
      "gap": "6",
      "children": [
        {
          "type": "card",
          "title": "Welcome User!",
          "description": "Here is your system status.",
          "variant": "outline",
          "children": [
            {
              "type": "alert",
              "status": "success",
              "title": "All Systems Operational",
              "variant": "surface"
            }
          ]
        },
        {
          "type": "fieldset",
          "legend": "User Preferences",
          "children": [
            {
              "type": "switch",
              "defaultChecked": true,
              "text": "Enable Push Notifications"
            },
            {
              "type": "checkbox",
              "text": "Subscribe to Newsletter"
            }
          ]
        }
      ]
    }
  ]
}
```
