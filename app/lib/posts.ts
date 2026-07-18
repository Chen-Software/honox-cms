import {
	markdownToHtml,
	parseFrontmatter,
	stripMarkdown,
} from "../utils/markdown";
import { buildHaystack, type SearchIndexEntry } from "../utils/search";

// Use Vite's import.meta.glob to import all markdown files at build time
const postFiles = import.meta.glob("/content/posts/*.md", {
	query: "?raw",
	import: "default",
});

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

export async function loadPosts(): Promise<LoadedPosts> {
	const posts: BlogPost[] = [];
	const searchEntries: SearchIndexEntry[] = [];
	const allTags = new Set<string>();

	for (const [path, loader] of Object.entries(postFiles)) {
		try {
			const markdown = await (loader as () => Promise<string>)();
			const { data, content } = parseFrontmatter(markdown);

			// Skip drafts in production
			if (data.draft === true && process.env["NODE_ENV"] === "production") {
				continue;
			}

			const slug = path.replace("/content/posts/", "").replace(".md", "");
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

			searchEntries.push({
				key: slug,
				href: `/blog/${slug}`,
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
		} catch (error) {
			console.error(`Error loading ${path}:`, error);
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
): Promise<PostDetail | undefined> {
	const loader = postFiles[`/content/posts/${slug}.md`];
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

	const { posts: allPosts } = await loadPosts();
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
export async function loadPostsByAuthor(author: string): Promise<BlogPost[]> {
	const { posts } = await loadPosts();
	return posts.filter(
		(post) =>
			(post.author || "Artefact Team").toLowerCase() === author.toLowerCase(),
	);
}
