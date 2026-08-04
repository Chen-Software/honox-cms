import type { ComponentBlock } from "../components/block-types";

/**
 * Typed shape of the `configs` singleton at `content/configs.json`, plus the
 * loader that reads it. The singleton drives the docs sidenav's grouping and
 * ordering and the blog header copy, so none of it is hardcoded to any one
 * collection.
 */

/** One sidenav group: collects every doc matching `section` and/or `category`. */
export interface DocsNavGroupConfig {
	label: string;
	section?: string;
	category?: string;
}

/** A plain link rendered at the bottom of the docs sidenav (e.g. the GitHub repo). */
export interface DocsNavLinkConfig {
	label: string;
	href: string;
}

/** Metadata for one content/<folder> collection: how it's labeled in the
 * sidenav/nav filters, and which CMS collection its "Edit" link should point
 * at. Both fall back to the raw folder name when omitted, so a new
 * content/<folder> collection works with zero config changes. */
export interface DocsCollectionConfig {
	folder: string;
	label?: string;
	cmsCollection?: string;
}

/** Site copy for the /blog section (configs singleton's `blog` field).
 * `title`/`description` moved to CMS page-builder content instead — see
 * content/pages/blog.json (mirrors `home` below for the homepage). Only the
 * bespoke newsletter widget's copy is still config-driven, since it isn't
 * page-builder content. */
export interface BlogSiteConfig {
	newsletterHeading?: string;
	newsletterDescription?: string;
	/** When true, this locale's search index (app/lib/posts.ts's `loadPosts`)
	 * omits any post that has no translation for this locale, instead of
	 * falling back to its English entry. Off by default, since most locales
	 * won't have every post translated — turn it on per-locale (this field is
	 * read from that locale's own configs.<locale>.json, so it need not match
	 * across locales) only once that locale's translation coverage is
	 * actually complete, or search will just return fewer results. */
	excludeUntranslatedFromSearch?: boolean;
	/** Shows the author byline on post cards (/blog listing) and the article
	 * page. Defaults to true when omitted. */
	showAuthor?: boolean;
	/** Shows the "X min read" byline on post cards and the article page.
	 * Defaults to true when omitted. */
	showReadTime?: boolean;
}

/** /docs section behavior (configs singleton's `docs` field) — not page
 * chrome copy (see `docsUi` below), just rendering toggles. */
export interface DocsSiteConfig {
	/** Shows a doc's hydration-tier badge (Tier 1/2/3) next to its category
	 * badge on the doc page. Defaults to true when omitted — turn off to hide
	 * this implementation detail from readers who don't need it. */
	showHydrationTierBadge?: boolean;
}

/** Project/task board behavior (configs singleton's `pms` field) — not
 * translated content, so every field is a matching key duplicated across all
 * locale files (i18n: duplicate in config.yml), same as `docOrder` above.
 *
 * `statusColors`/`priorityColors`/`projectStatusColors` are status/priority →
 * accent color maps, edited via the CMS's `keyvalue` widget — free-text keys
 * and values there, unlike the constrained `select` this was before. A key
 * that doesn't match one of the tasks/projects collections' real
 * status/priority values (task_statuses/task_priorities/project_statuses in
 * public/admin/config.yml) is simply ignored by mergeColorOverrides rather
 * than erroring, and any status/priority missing from the map keeps its
 * built-in default color (see app/lib/tasks.ts, app/lib/projects.ts). */
export interface PmsSiteConfig {
	statusColors?: Record<string, string>;
	priorityColors?: Record<string, string>;
	projectStatusColors?: Record<string, string>;
	/** Whether a task with subtasks starts expanded on the /tasks table and
	 * the project board. Defaults to true when omitted. */
	subtasksExpandedByDefault?: boolean;
}

/** One entry in the `hydrationTiers` list: the numeric `tier` is a matching
 * key (duplicated across every locale file) while `label` is the translated,
 * locale-specific badge text for a doc's `hydration` value. */
export interface HydrationTierConfig {
	tier: number;
	label: string;
}

/** Page-chrome copy for the docs header Edit/Admin buttons and mobile menu
 * toggle — not part of translated doc content, so it lives on the configs
 * singleton instead. Every field is fully translated per locale (not a
 * matching key). (The search box's placeholder/item-label copy lives on its
 * own `headerItems` search block instead — see `headerItems` below.) */
export interface DocsUiConfig {
	edit?: string;
	admin?: string;
	menu?: string;
	/** Label prefix for the previous/next doc pager at the bottom of a doc
	 * page (see `app/routes/docs/[doc].tsx`'s `DocPager`). */
	previous?: string;
	next?: string;
}

/** A plain link rendered in the home page footer (e.g. HonoX Docs). */
export interface HomeFooterLinkConfig {
	label: string;
	href: string;
	/** Anchor colorPalette prop; falls back to "slate" when omitted. */
	colorPalette?: string;
}

/** Home page chrome copy: brand name, <title> fallback, and footer content —
 * not part of any collection's content, so it lives on the configs singleton
 * instead. Every field is fully translated per locale.
 * The header itself (brand lockup, nav links, Explore Hub button) is CMS page-
 * builder content instead — see headerBrand/headerNav/headerActions on the
 * `pages` collection's `index` entry (content/pages/index.json). */
export interface HomeSiteConfig {
	brandName?: string;
	titleFallback?: string;
	footerCopyright?: string;
	footerLinks?: HomeFooterLinkConfig[];
}

/** Shape of the `DocsConfig` singleton (content/configs.json) — drives
 * collection labeling plus the docs sidenav's grouping/ordering, so none of
 * it is hardcoded to any one collection. */
export interface DocsConfig {
	collections?: DocsCollectionConfig[];
	groups: DocsNavGroupConfig[];
	/** Label for docs that don't match any group above. Defaults to "Other". */
	fallbackLabel?: string;
	/** Explicit sidenav order within each group, by doc slug (filename without
	 * extension). Docs not listed here keep the default alphabetical order,
	 * appended after the ones listed. Matching key — keep in English/identical
	 * across locale files, like `section`/`category` above. */
	docOrder?: string[];
	/** External links shown at the bottom of the sidenav, e.g. the GitHub repo. */
	links?: DocsNavLinkConfig[];
	/** The docs desktop header row, top to bottom: one `stack` block —
	 * brand lockup, search box, and nav cluster (links/dropdown/popover/
	 * Admin link) as its three children — rendered via `<PageRenderer>` in
	 * `app/routes/docs/*.tsx`. This is a fully self-contained tree (NOT
	 * built from `headerItems` below), so its nav links/dropdown/popover
	 * are hand-duplicated from `headerItems` rather than shared — a
	 * deliberate choice (over threading `headerItems` into a placeholder
	 * slot here) so this stays one plain, directly-editable content tree.
	 * The nav cluster's `anchor` block with `href: "/admin"` is the one part
	 * `app/routes/docs/[doc].tsx` patches at render time (see
	 * `withDocEditLink` there) — swapped for an Edit deep-link on an
	 * individual doc page. Its `variant`/`class` combine the plain anchor
	 * variant with the `button` recipe's own (stable, unhashed —
	 * `panda.config.ts` has no `hash: true`) generated class names
	 * (`button button--variant_outline button--size_sm`), same visual
	 * result as code calling `button({variant:"outline", size:"sm"})`.
	 * The nav cluster also sets `hideBelowMd: true` (see page-registry.tsx's
	 * `stack` renderer) so it collapses below `md`, matching Layout's
	 * built-in `mobileNav` disclosure taking over at that breakpoint (that
	 * disclosure's own content is still built from `headerItems` below, via
	 * `HeaderActions`). Sizing that block-style.ts's validated fields don't
	 * cover (flex-shrink/flex/margin auto) is a literal `style` string per
	 * child — plain inline CSS, no Panda involvement, so it works for any
	 * value without needing a build-time-visible `css()` call. */
	header?: ComponentBlock[];
	/** Header nav items shown on the /blog page's own (simpler, 2-slot)
	 * header, and in the docs mobile disclosure (`HeaderActions`, via
	 * `app/routes/docs/*.tsx`'s `mobileNavActions`) — a restricted "leaf"
	 * block list (Button/Badge/Link/Icon, no containers), rendered via
	 * page-registry's `renderBlocks` so the CMS can offer richer items than
	 * a plain link (e.g. a badge, an icon, or a button with a custom
	 * onClick), not just {label, href}. Any `anchor` block's `href` is one
	 * canonical relative path shared across every locale file (i18n:
	 * duplicate in config.yml) — renderBlocks must be called with
	 * `{ locale }` as its second argument so page-registry's `anchor`
	 * renderer localises it at render time; see `by-tag/[tag].tsx` for the
	 * call-site pattern. The docs desktop header instead sources its nav
	 * cluster from `header` above (hand-duplicated, not shared — see
	 * there) — the `dropdown`/`popover` language-switcher/appearance items
	 * here (also duplicated into `header`'s nav cluster) aren't exposed as
	 * addable types in config.yml, same fixed-singleton reasoning as
	 * `header`. */
	headerItems?: ComponentBlock[];
	/** Site copy for the /blog section. */
	blog?: BlogSiteConfig;
	/** Translated badge labels for a doc's numeric `hydration` tier. Falls back
	 * to "Tier N" when a tier is missing. */
	hydrationTiers?: HydrationTierConfig[];
	/** Docs search box + header Edit/Admin button copy. */
	docsUi?: DocsUiConfig;
	/** /docs section rendering toggles (not page-chrome copy — see `docsUi`). */
	docs?: DocsSiteConfig;
	/** Home page brand/chrome copy and footer links. */
	home?: HomeSiteConfig;
	/** Project/task board behavior — status/priority accent color overrides
	 * and default subtask expansion. */
	pms?: PmsSiteConfig;
}

const EMPTY_DOCS_CONFIG: DocsConfig = { groups: [] };

/** Fallback for any `docsUi` field missing from the loaded config (e.g. a
 * locale file predating the field, or a fresh checkout with no CMS edits yet). */
export const DEFAULT_DOCS_UI: Required<DocsUiConfig> = {
	edit: "Edit",
	admin: "Admin",
	menu: "Menu",
	previous: "Previous",
	next: "Next",
};

// Singleton i18n uses the `{{locale}}` file-path placeholder (see the
// `configs` entry in public/admin/config.yml), not the `structure` option —
// that only applies to folder-based entry collections. Resolves to
// content/configs.json (en, default) and content/configs.zh.json /
// content/configs.es.json (translations).
const docsConfigModule = (
	typeof import.meta.glob === "function"
		? import.meta.glob(["/content/configs.json", "/content/configs.*.json"], {
				import: "default",
			})
		: {}
) as Record<string, () => Promise<DocsConfig>>;

/** Loads the DocsConfig singleton that drives the docs sidenav's grouping.
 * Falls back to the English default if the requested locale has no
 * translated configs.<locale>.json yet. */
export async function loadDocsConfig(locale = "en"): Promise<DocsConfig> {
	const path =
		locale === "en"
			? "/content/configs.json"
			: `/content/configs.${locale}.json`;
	const loader =
		docsConfigModule[path] ?? docsConfigModule["/content/configs.json"];
	if (!loader) return EMPTY_DOCS_CONFIG;
	return loader();
}
