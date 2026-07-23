import { loadDocsConfig } from "./configs";
import { TRANSLATED_LOCALES } from "./i18n";
import {
	markdownToHtml,
	parseFrontmatter,
	stripMarkdown,
} from "../utils/markdown";
import { buildHaystack, type SearchIndexEntry } from "../utils/search";

// Default-locale posts live at content/posts/<slug>.md; translations at
// content/posts/<locale>/<slug>.md — same `multiple_folders` convention as
// docs/components (see app/lib/docs.ts's parseContentPath), matching what
// Sveltia CMS actually writes for this collection (public/admin/config.yml's
// `posts` collection sets `i18n: true` with no `structure` override, so it
// inherits the global `i18n.structure: multiple_folders`).
const postFiles = import.meta.glob(
	["/content/posts/*.md", "/content/posts/*/*.md"],
	{ query: "?raw", import: "default" },
);

/** Splits a glob-discovered post path into its base slug and locale. */
function parsePostPath(path: string): { slug: string; locale: string } {
	const match = path.match(/^\/content\/posts\/(?:([^/]+)\/)?(.+)\.md$/);
	if (!match) {
		throw new Error(`Unexpected post content path: ${path}`);
	}
	const [, maybeLocale, slug] = match as unknown as [
		string,
		string | undefined,
		string,
	];
	if (maybeLocale && (TRANSLATED_LOCALES as readonly string[]).includes(maybeLocale)) {
		return { slug, locale: maybeLocale };
	}
	return { slug, locale: "en" };
}

/** Resolves the best available file for `slug`/`locale`, falling back to the
 * default-locale file when no translation exists. */
function resolvePostPath(slug: string, locale: string): string | undefined {
	if (locale !== "en") {
		const localisedPath = `/content/posts/${locale}/${slug}.md`;
		if (postFiles[localisedPath]) return localisedPath;
	}
	const basePath = `/content/posts/${slug}.md`;
	if (postFiles[basePath]) return basePath;
	return undefined;
}

/** True when `slug` has an actual translation file for `locale` (as opposed
 * to `resolvePostPath` having to fall back to the default-locale file). */
function hasTranslation(slug: string, locale: string): boolean {
	return locale !== "en" && postFiles[`/content/posts/${locale}/${slug}.md`] !== undefined;
}

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	description: string;
	tags: string[];
	draft: boolean;
	author?: string;
	readTime?: string;
	cover?: string;
}

export interface LoadedPosts {
	/** All non-draft posts (drafts included outside production), newest first */
	posts: BlogPost[];
	/** One search-index entry per post, same filtering as `posts` */
	searchEntries: SearchIndexEntry[];
	/** Unique tags across all posts, sorted */
	tags: string[];
}

export interface PostDetail extends BlogPost {
	/** Post body rendered to HTML */
	html: string;
	/** Up to 3 published posts sharing a tag with this one */
	relatedPosts: BlogPost[];
}

export async function loadPosts(locale = "en"): Promise<LoadedPosts> {
	const posts: BlogPost[] = [];
	const searchEntries: SearchIndexEntry[] = [];
	const allTags = new Set<string>();

	const config = await loadDocsConfig(locale);
	const excludeUntranslatedFromSearch =
		config.blog?.excludeUntranslatedFromSearch ?? false;

	// Get all unique base slugs
	const uniqueSlugs = new Set<string>();
	for (const path of Object.keys(postFiles)) {
		uniqueSlugs.add(parsePostPath(path).slug);
	}

	for (const slug of uniqueSlugs) {
		try {
			const targetPath = resolvePostPath(slug, locale);
			const loader = targetPath ? postFiles[targetPath] : undefined;
			if (!loader) continue;

			// The post still counts for the visible listing (with its English
			// fallback) even when excluded from search — this option only trims
			// noisy mixed-language search results, it doesn't hide content.
			const skipSearchEntry =
				excludeUntranslatedFromSearch && !hasTranslation(slug, locale);

			const markdown = await (loader as () => Promise<string>)();
			const { data, content } = parseFrontmatter(markdown);

			// Skip drafts in production
			if (data.draft === true && process.env["NODE_ENV"] === "production") {
				continue;
			}

			const postTags = Array.isArray(data.tags) ? data.tags : [];
			const title = data.title || "Untitled";
			const description = data.description || "";

			for (const tag of postTags) {
				allTags.add(tag);
			}

			posts.push({
				slug,
				title,
				date: data.date || "",
				description,
				tags: postTags,
				draft: data.draft === true,
				author: data.author || "Artefact Team",
				readTime: data.readTime || "5 min read",
				cover: data.cover,
			});

			if (!skipSearchEntry) {
				searchEntries.push({
					key: slug,
					href: locale !== "en" ? `/blog/${locale}/${slug}` : `/blog/${slug}`,
					title,
					description,
					tags: postTags,
					haystack: buildHaystack([
						title,
						description,
						postTags,
						stripMarkdown(content).slice(0, 5000),
					]),
				});
			}
		} catch (error) {
			console.error(`Error loading slug ${slug}:`, error);
		}
	}

	// Sort posts by date (newest first); keep the index in the same order
	posts.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return dateB - dateA;
	});
	const order = new Map(posts.map((post, index) => [post.slug, index]));
	searchEntries.sort(
		(a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0),
	);

	return { posts, searchEntries, tags: Array.from(allTags).sort() };
}

/**
 * Loads a single post by slug, rendered to HTML, with related posts attached.
 * Returns undefined if the slug doesn't exist, or (in production) if it's a draft.
 */
export async function loadPostBySlug(
	slug: string,
	locale = "en",
): Promise<PostDetail | undefined> {
	const targetPath = resolvePostPath(slug, locale);
	const loader = targetPath ? postFiles[targetPath] : undefined;
	if (!loader) {
		return undefined;
	}

	const markdown = await (loader as () => Promise<string>)();
	const { data, content } = parseFrontmatter(markdown);
	const isDraft = data.draft === true;

	if (isDraft && process.env["NODE_ENV"] === "production") {
		return undefined;
	}

	const tags = Array.isArray(data.tags) ? data.tags : [];
	const post: BlogPost = {
		slug,
		title: data.title || "Untitled",
		date: data.date || "",
		description: data.description || "",
		tags,
		draft: isDraft,
		author: data.author || "Artefact Team",
		readTime: data.readTime || "5 min read",
		cover: data.cover,
	};

	const { posts: allPosts } = await loadPosts(locale);
	const relatedPosts = allPosts
		.filter(
			(other) =>
				other.slug !== slug && other.tags.some((tag) => tags.includes(tag)),
		)
		.slice(0, 3);

	return { ...post, html: markdownToHtml(content), relatedPosts };
}

/**
 * Loads all posts by a given author, newest first.
 * Returns an empty array if no posts match (including if the author doesn't exist).
 */
export async function loadPostsByAuthor(
	author: string,
	locale = "en",
): Promise<BlogPost[]> {
	const { posts } = await loadPosts(locale);
	return posts.filter(
		(post) =>
			(post.author || "Artefact Team").toLowerCase() === author.toLowerCase(),
	);
}
