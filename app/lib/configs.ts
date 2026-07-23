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
}

/** One entry in the `hydrationTiers` list: the numeric `tier` is a matching
 * key (duplicated across every locale file) while `label` is the translated,
 * locale-specific badge text for a doc's `hydration` value. */
export interface HydrationTierConfig {
	tier: number;
	label: string;
}

/** Page-chrome copy for the docs search box and header Edit/Admin buttons —
 * not part of translated doc content, so it lives on the configs singleton
 * instead. Every field is fully translated per locale (not a matching key). */
export interface DocsUiConfig {
	searchPlaceholder?: string;
	searchItemLabel?: string;
	edit?: string;
	admin?: string;
	menu?: string;
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
	/** Plain links shown in the header nav (e.g. Blog, Home), before the
	 * per-doc Edit link and the GitHub icon. */
	headerLinks?: DocsNavLinkConfig[];
	/** Site copy for the /blog section. */
	blog?: BlogSiteConfig;
	/** Translated badge labels for a doc's numeric `hydration` tier. Falls back
	 * to "Tier N" when a tier is missing. */
	hydrationTiers?: HydrationTierConfig[];
	/** Docs search box + header Edit/Admin button copy. */
	docsUi?: DocsUiConfig;
	/** Home page brand/chrome copy and footer links. */
	home?: HomeSiteConfig;
}

const EMPTY_DOCS_CONFIG: DocsConfig = { groups: [] };

/** Fallback for any `docsUi` field missing from the loaded config (e.g. a
 * locale file predating the field, or a fresh checkout with no CMS edits yet). */
export const DEFAULT_DOCS_UI: Required<DocsUiConfig> = {
	searchPlaceholder: "Search docs...",
	searchItemLabel: "docs",
	edit: "Edit",
	admin: "Admin",
	menu: "Menu",
};

// Singleton i18n uses the `{{locale}}` file-path placeholder (see the
// `configs` entry in public/admin/config.yml), not the `structure` option —
// that only applies to folder-based entry collections. Resolves to
// content/configs.json (en, default) and content/configs.zh.json /
// content/configs.es.json (translations).
const docsConfigModule = import.meta.glob(
	["/content/configs.json", "/content/configs.*.json"],
	{ import: "default" },
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
