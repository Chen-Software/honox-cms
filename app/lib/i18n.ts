/**
 * Shared i18n utilities for route locale detection and link localization.
 *
 * Route structure: /<collection>/<locale?>/<item>
 *   e.g. /docs/fr/AbsoluteCenter, /blog/zh/my-post, /pages/es/about
 * The default locale (en) has no locale segment: /docs/AbsoluteCenter.
 *
 * Language homepages remain at /<locale> (e.g. /fr, /zh).
 */

/** All supported locales, with the default first. */
export const ALL_LOCALES = ["en", "zh", "es", "pt", "fr", "de"] as const;

/** Translated-content locale codes (excludes the default "en"). */
export const TRANSLATED_LOCALES = ["zh", "es", "pt", "fr", "de"] as const;

/** Human-readable names for the language switcher dropdown. */
export const LOCALE_NAMES: Record<string, string> = {
	en: "English",
	zh: "中文",
	es: "Español",
	pt: "Português",
	fr: "Français",
	de: "Deutsch",
};

/** Route collections that support locale-scoped sub-paths. */
const COLLECTIONS = ["docs", "blog", "pages"] as const;

/**
 * Search box strings for blog pages (index, by-author, by-tag). `placeholder`
 * is used on the blog index (searches all articles in context); `placeholderAll`
 * is used on filtered views (by-author/by-tag) where the box explicitly
 * searches beyond the current filter.
 */
export const BLOG_SEARCH_STRINGS: Record<
	string,
	{ placeholder: string; placeholderAll: string; itemLabel: string }
> = {
	en: {
		placeholder: "Search articles...",
		placeholderAll: "Search all articles...",
		itemLabel: "articles",
	},
	zh: {
		placeholder: "搜索文章...",
		placeholderAll: "搜索所有文章...",
		itemLabel: "文章",
	},
	es: {
		placeholder: "Buscar artículos...",
		placeholderAll: "Buscar todos los artículos...",
		itemLabel: "artículos",
	},
	pt: {
		placeholder: "Buscar artigos...",
		placeholderAll: "Buscar todos os artigos...",
		itemLabel: "artigos",
	},
	fr: {
		placeholder: "Rechercher des articles...",
		placeholderAll: "Rechercher tous les articles...",
		itemLabel: "articles",
	},
	de: {
		placeholder: "Artikel suchen...",
		placeholderAll: "Alle Artikel suchen...",
		itemLabel: "Artikel",
	},
};

export function isLocale(value: string | undefined): value is string {
	return !!value && (TRANSLATED_LOCALES as readonly string[]).includes(value);
}

/**
 * Detects the locale from a request path.
 *
 * Handles both patterns:
 *   /<collection>/<locale>/<...>  →  locale is the 2nd segment
 *   /<locale>                    →  locale is the 1st segment (language homepage)
 * Returns "en" when no locale is found.
 */
export function detectLocale(path: string): string {
	const segments = path.split("/").filter(Boolean);
	// Old format: /<locale>/<collection>/...
	if (
		segments.length >= 2 &&
		isLocale(segments[0]) &&
		(COLLECTIONS as readonly string[]).includes(segments[1]!)
	) {
		return segments[0];
	}
	// Collection route: /<collection>/<locale?>/...
	if (
		segments.length >= 1 &&
		(COLLECTIONS as readonly string[]).includes(segments[0]!)
	) {
		if (isLocale(segments[1])) return segments[1];
		return "en";
	}
	// Root route: /<locale?>
	if (isLocale(segments[0])) return segments[0];
	return "en";
}

/**
 * Prefixes a bare in-app href with the current locale, inserting the locale
 * after the collection segment for collection routes.
 *
 *   /docs/Button   → /docs/fr/Button   (locale = "fr")
 *   /blog          → /blog/fr
 *   /              → /fr
 *
 * No-op for the default locale, external hrefs, or already-localized paths.
 */
export function localiseHref(href: string, locale: string): string {
	if (locale === "en" || !href.startsWith("/")) return href;

	const segments = href.split("/").filter(Boolean);

	// Already localized in the old format? Let's convert it to the new format!
	if (
		segments.length >= 2 &&
		isLocale(segments[0]) &&
		(COLLECTIONS as readonly string[]).includes(segments[1]!)
	) {
		const lang = segments[0];
		const collection = segments[1]!;
		const rest = segments.slice(2).join("/");
		return rest ? `/${collection}/${lang}/${rest}` : `/${collection}/${lang}`;
	}

	// Already localized? Don't double-prefix.
	if (isLocale(segments[0])) return href; // e.g. /fr (homepage)
	if (isLocale(segments[1])) return href; // e.g. /docs/fr/...

	// Collection route: insert locale after the collection segment.
	if (
		segments.length >= 1 &&
		(COLLECTIONS as readonly string[]).includes(segments[0]!)
	) {
		const collection = segments[0]!;
		const rest = segments.slice(1).join("/");
		return rest
			? `/${collection}/${locale}/${rest}`
			: `/${collection}/${locale}`;
	}

	// Non-collection path (e.g. homepage "/"): prefix with locale.
	return `/${locale}${href}`;
}

/**
 * Strips the locale segment from a path, returning the bare (default-locale)
 * path. Handles both collection routes and the language homepage.
 *
 *   /docs/fr/AbsoluteCenter  → /docs/AbsoluteCenter  (locale = "fr")
 *   /blog/fr                 → /blog
 *   /fr                      → /
 */
export function stripLocale(path: string, locale: string): string {
	if (locale === "en") return path;
	const segments = path.split("/").filter(Boolean);

	// Old format: /<locale>/<collection>/<...>
	if (
		segments.length >= 2 &&
		segments[0] === locale &&
		(COLLECTIONS as readonly string[]).includes(segments[1]!)
	) {
		const collection = segments[1]!;
		const rest = segments.slice(2).join("/");
		return rest ? `/${collection}/${rest}` : `/${collection}`;
	}

	// Collection route: /<collection>/<locale>/<...>
	if (
		segments.length >= 2 &&
		(COLLECTIONS as readonly string[]).includes(segments[0]!) &&
		segments[1] === locale
	) {
		const collection = segments[0]!;
		const rest = segments.slice(2).join("/");
		return rest ? `/${collection}/${rest}` : `/${collection}`;
	}

	// Root route: /<locale>/<...>
	if (segments.length >= 1 && segments[0] === locale) {
		const rest = segments.slice(1).join("/");
		return rest ? `/${rest}` : "/";
	}

	return path;
}

/**
 * Builds the URL for the same page in a different locale.
 *
 *   /docs/fr/AbsoluteCenter, fr → en : /docs/AbsoluteCenter
 *   /docs/AbsoluteCenter,  en → fr : /docs/fr/AbsoluteCenter
 *   /fr,                   fr → en : /
 *   /,                     en → fr : /fr
 */
export function localeToggleUrl(
	currentPath: string,
	currentLocale: string,
	targetLocale: string,
): string {
	const bare = stripLocale(currentPath, currentLocale);
	if (targetLocale === "en") return bare;
	return localiseHref(bare, targetLocale);
}
