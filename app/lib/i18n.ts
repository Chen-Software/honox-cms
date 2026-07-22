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
export const ALL_LOCALES = ["en", "zh", "es", "pt", "fr"] as const;

/** Translated-content locale codes (excludes the default "en"). */
export const TRANSLATED_LOCALES = ["zh", "es", "pt", "fr"] as const;

/** Human-readable names for the language switcher dropdown. */
export const LOCALE_NAMES: Record<string, string> = {
	en: "English",
	zh: "中文",
	es: "Español",
	pt: "Português",
	fr: "Français",
};

/** Route collections that support locale-scoped sub-paths. */
const COLLECTIONS = ["docs", "blog", "pages"] as const;

function isLocale(value: string | undefined): value is string {
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
	// Collection route: /<collection>/<locale?>/...
	if (segments.length >= 1 && (COLLECTIONS as readonly string[]).includes(segments[0]!)) {
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

	// Already localized? Don't double-prefix.
	if (isLocale(segments[0])) return href; // e.g. /fr/docs/...
	if (isLocale(segments[1])) return href; // e.g. /docs/fr/...

	// Collection route: insert locale after the collection segment.
	if (segments.length >= 1 && (COLLECTIONS as readonly string[]).includes(segments[0]!)) {
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
