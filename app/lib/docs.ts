import type { FC } from "hono/jsx";
import { markdownToHtml, parseFrontmatter } from "../utils/markdown";
import { buildHaystack, type SearchIndexEntry } from "../utils/search";
import { type DocsConfig, loadDocsConfig } from "./configs";

// Docs content lives under content/<collection>/*.{md,mdx} for the default
// locale (en), and content/<collection>/<locale>/*.{md,mdx} for translations
// — matching the CMS's `structure: multiple_folders` (public/admin/config.yml)
// with `omit_default_locale_from_file_path: true`. Any folder becomes a
// collection automatically (see DocsConfig in ./configs for labeling).
// Plain .md is parsed with the same hand-rolled pipeline as blog posts; .mdx
// is compiled to a real component (via @mdx-js/rollup, configured in
// vite.config.ts) so pages can embed live, actually-rendered examples.
// content/posts is excluded (any locale depth): blog posts have their own
// loader/route (app/lib/posts.ts).
const markdownModules = import.meta.glob(
	["/content/*/*.md", "/content/*/*/*.md", "!/content/posts/**"],
	{ query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

interface MdxFrontmatter {
	title?: string;
	hydration?: number;
	category?: string;
}
type MdxModule = () => Promise<{
	default: FC;
	frontmatter?: MdxFrontmatter;
}>;
const mdxModules = import.meta.glob([
	"/content/*/*.mdx",
	"/content/*/*/*.mdx",
]) as Record<string, MdxModule>;

// Translated-content locale codes — must track public/admin/config.yml's
// i18n.locales (minus the default) and the app/routes/<locale> dirs.
export const LOCALES = ["zh", "es", "pt", "fr", "de"] as const;

export interface DocSummary {
	slug: string;
	title: string;
	/** Folder name under content/ this doc came from, e.g. "docs", "components". */
	collection: string;
	/** Display label for `collection` — DocsConfig.collections[].label, or the
	 * capitalised folder name if no config entry exists for it. */
	section: string;
	/** Fine-grained grouping, set only if present in frontmatter (e.g. "Layout", "Forms"). */
	category?: string;
	/** Hydration tier (1/2/3) per app/components/ui/island-utils.ts, set only if present in frontmatter. */
	hydration?: number;
}

export interface DocDetail extends DocSummary {
	/** Set for markdown docs, rendered via dangerouslySetInnerHTML. */
	html?: string;
	/** Set for MDX docs, rendered as JSX. */
	Component?: FC;
}

function capitalise(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function sectionLabel(folder: string, config: DocsConfig): string {
	const entry = config.collections?.find((c) => c.folder === folder);
	return entry?.label ?? capitalise(folder);
}

/**
 * Splits a content module path into its parts. Matches both the default
 * locale, `/content/<folder>/<slug>.<ext>` (locale "en"), and a translation,
 * `/content/<folder>/<locale>/<slug>.<ext>` (locale from LOCALES).
 */
function parseContentPath(path: string): {
	folder: string;
	slug: string;
	locale: string;
} {
	const match = path.match(
		/^\/content\/([^/]+)\/(?:([^/]+)\/)?(.+)\.(?:md|mdx)$/,
	);
	if (!match) {
		throw new Error(`Unexpected docs content path: ${path}`);
	}
	const [, folder, second, slug] = match as unknown as [
		string,
		string,
		string | undefined,
		string,
	];
	if (second && (LOCALES as readonly string[]).includes(second)) {
		return { folder, slug, locale: second };
	}
	return { folder, slug, locale: "en" };
}

async function summarizeMarkdownDoc(
	path: string,
	loader: () => Promise<string>,
	config: DocsConfig,
): Promise<DocSummary> {
	const { folder, slug } = parseContentPath(path);
	const raw = await loader();
	const { data } = parseFrontmatter(raw);
	return {
		slug,
		title: (data.title as string) || slug,
		collection: folder,
		section: sectionLabel(folder, config),
	};
}

async function summarizeMdxDoc(
	path: string,
	loader: MdxModule,
	config: DocsConfig,
): Promise<DocSummary> {
	const { folder, slug } = parseContentPath(path);
	const mod = await loader();
	return {
		slug,
		title: mod.frontmatter?.title || slug,
		collection: folder,
		section: sectionLabel(folder, config),
		category: mod.frontmatter?.category,
		hydration: mod.frontmatter?.hydration,
	};
}

export async function loadDocs(locale = "en"): Promise<DocSummary[]> {
	const config = await loadDocsConfig(locale);

	// Collect unique keys for mdx and markdown modules
	// Map from `${folder}:${slug}` to the best available path. Pass 1: exact
	// locale match. Pass 2 (non-en only): fill in English for anything not
	// yet translated, so an untranslated doc still renders instead of 404ing.
	const mdxPaths = new Map<string, string>();
	for (const path of Object.keys(mdxModules)) {
		const { folder, slug, locale: pathLocale } = parseContentPath(path);
		if (pathLocale === locale) {
			mdxPaths.set(`${folder}:${slug}`, path);
		}
	}
	if (locale !== "en") {
		for (const path of Object.keys(mdxModules)) {
			const { folder, slug, locale: pathLocale } = parseContentPath(path);
			const key = `${folder}:${slug}`;
			if (pathLocale === "en" && !mdxPaths.has(key)) {
				mdxPaths.set(key, path);
			}
		}
	}

	const markdownPaths = new Map<string, string>();
	for (const path of Object.keys(markdownModules)) {
		const { folder, slug, locale: pathLocale } = parseContentPath(path);
		if (pathLocale === locale) {
			markdownPaths.set(`${folder}:${slug}`, path);
		}
	}
	if (locale !== "en") {
		for (const path of Object.keys(markdownModules)) {
			const { folder, slug, locale: pathLocale } = parseContentPath(path);
			const key = `${folder}:${slug}`;
			if (pathLocale === "en" && !markdownPaths.has(key)) {
				markdownPaths.set(key, path);
			}
		}
	}

	const docs = await Promise.all([
		...Array.from(markdownPaths.values()).map((path) =>
			summarizeMarkdownDoc(path, markdownModules[path]!, config),
		),
		...Array.from(mdxPaths.values()).map((path) =>
			summarizeMdxDoc(path, mdxModules[path]!, config),
		),
	]);

	docs.sort((a, b) => a.slug.localeCompare(b.slug));
	return docs;
}

/**
 * Search index entries for every doc, keyed on title/section/category.
 * Markdown bodies are real text (stripped to a haystack like blog posts);
 * MDX bodies are compiled JSX, so those are scoped to name/category.
 */
export async function loadDocsSearchIndex(
	locale = "en",
): Promise<SearchIndexEntry[]> {
	const docs = await loadDocs(locale);
	return docs.map((doc) => ({
		key: doc.slug,
		href: locale !== "en" ? `/docs/${locale}/${doc.slug}` : `/docs/${doc.slug}`,
		title: doc.title,
		tags: [doc.section, doc.category].filter((tag): tag is string =>
			Boolean(tag),
		),
		haystack: buildHaystack([doc.title, doc.slug, doc.section, doc.category]),
	}));
}

/**
 * Loads a single doc by slug — checks MDX collections first (the common
 * case for component-style docs with live demos), then markdown collections.
 * Returns undefined if the slug exists in neither. Exactly one of
 * `.html` / `.Component` is set on the result, depending on which module
 * matched.
 */
export async function loadDocBySlug(
	slug: string,
	locale = "en",
): Promise<DocDetail | undefined> {
	const config = await loadDocsConfig(locale);

	// First search MDX modules
	let mdxPath: string | undefined;
	if (locale !== "en") {
		mdxPath =
			Object.keys(mdxModules).find((path) => {
				const parsed = parseContentPath(path);
				return parsed.slug === slug && parsed.locale === locale;
			}) ||
			Object.keys(mdxModules).find((path) => {
				const parsed = parseContentPath(path);
				return parsed.slug === slug && parsed.locale === "en";
			});
	} else {
		mdxPath = Object.keys(mdxModules).find((path) => {
			const parsed = parseContentPath(path);
			return parsed.slug === slug && parsed.locale === "en";
		});
	}

	if (mdxPath) {
		const loader = mdxModules[mdxPath]!;
		const parsed = parseContentPath(mdxPath);
		const mod = await loader();
		return {
			slug,
			title: mod.frontmatter?.title || slug,
			collection: parsed.folder,
			section: sectionLabel(parsed.folder, config),
			category: mod.frontmatter?.category,
			hydration: mod.frontmatter?.hydration,
			Component: mod.default,
		};
	}

	// Then search markdown modules
	let markdownPath: string | undefined;
	if (locale !== "en") {
		markdownPath =
			Object.keys(markdownModules).find((path) => {
				const parsed = parseContentPath(path);
				return parsed.slug === slug && parsed.locale === locale;
			}) ||
			Object.keys(markdownModules).find((path) => {
				const parsed = parseContentPath(path);
				return parsed.slug === slug && parsed.locale === "en";
			});
	} else {
		markdownPath = Object.keys(markdownModules).find((path) => {
			const parsed = parseContentPath(path);
			return parsed.slug === slug && parsed.locale === "en";
		});
	}

	if (markdownPath) {
		const loader = markdownModules[markdownPath]!;
		const parsed = parseContentPath(markdownPath);
		const raw = await loader();
		const { data, content } = parseFrontmatter(raw);
		return {
			slug,
			title: (data.title as string) || slug,
			collection: parsed.folder,
			section: sectionLabel(parsed.folder, config),
			html: markdownToHtml(content),
		};
	}

	return undefined;
}
