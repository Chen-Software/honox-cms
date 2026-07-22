---
title: Getting Started
---

This guide walks through installing the project, running it locally, and understanding the handful of commands you'll use day-to-day. For a tour of how the pieces fit together, see [Architecture](/docs/Architecture).

## Prerequisites

* [Bun](https://bun.sh) — the project's package manager and JS/TS runtime. Install it with:

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git, for cloning the repository and for the CMS's git-backed content commits.

***

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` also triggers the `prepare` script (`panda codegen`), which generates the [PandaCSS](https://panda-css.com) design system into `design-system/` — the recipes, tokens, and JSX helpers that UI components import from. If you ever see type errors pointing at a missing `design-system` module, re-run it directly:

```bash
bun panda codegen
```

***

## Running the Dev Server

```bash
bun run dev
```

This starts Vite's dev server (`http://localhost:5173` by default) with HMR. It runs the live HonoX server — routes, islands, and styles all rebuild on save.

To edit content through the CMS UI instead of hand-editing files under `content/`, open `/admin/` while the dev server is running.

***

## Building & Previewing

```bash
bun run build
```

This runs two Vite passes over the same config — one for the client hydration bundle, one for the server-rendered pages — then [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) crawls every route and pre-renders it to static HTML in `dist/`. See [Architecture](/docs/Architecture) for the full breakdown.

To serve that static output locally through Cloudflare's local runtime (closer to production than `bun run dev`):

```bash
bun run preview
```

***

## Testing & Linting

Run unit tests:

```bash
bun test unit
```

Lint and auto-fix with [Biome](https://biomejs.dev):

```bash
bun run check
```

***

## Deploying

```bash
bun run deploy
```

Builds the site and deploys `dist/` to Cloudflare Pages via `wrangler`. A Vercel target (`vercel.json`) is also configured out of the box if you'd rather deploy there — either way, the output is a fully static site with no server process required at request time.

***

## Next Steps

* [Architecture](/docs/Architecture) — how routing, styling, content, and the build pipeline fit together.
* [Hydration](/docs/Hydration) — the three-tier model for deciding whether a component ships JS to the client.
* [CMS Page Builder](/docs/PageBuilder) — building pages visually through Sveltia CMS.
