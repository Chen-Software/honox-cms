---
title: Architecture
---

# Architecture

This project is built on **HonoX + SSG** (static site generation). Pages emit **static HTML**
by default; only components that genuinely need client-side interactivity are "promoted"
to islands (client JS snippets).

> Every component's hydration behaviour funnels through the `shouldHydrate` predicate
> in `app/components/ui/island-utils.ts`. Any decision about _when to render static HTML_
> versus _when to mount a client-side island_ is resolved here — see
> [Hydration](/docs/Hydration) for the full tier model, decision rules, and per-component
> classification.

1. **Zero redundant JS** — components with no interaction need never ship a hydration script.
2. **Zero silent breakage** — components that _do_ need interaction should hydrate automatically,
   even if the caller forgets to pass `interactive`.
3. **Single source of truth** — every "should this hydrate?" decision goes through one shared
   `shouldHydrate` function, eliminating per-component ad-hoc `if (interactive)` branches.

***

## Related Documentation

- [Hydration](/docs/Hydration) — the 3-tier hydration model, decision checklist, and full
  per-component classification
- `app/components/ui/island-utils.ts` — the single decision entry point
- `content/components/<Component>.mdx` (each Tier-1 / Tier-2 component) — its
  own `# Hydration` section, plus `hydration-tier`/`category` frontmatter
