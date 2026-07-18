import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { loadPosts, loadPostsByAuthor } from "../../../../lib/posts";

// GET /api/posts/by-author/:author.json — all posts by a given author,
// newest first. Returns an empty array if no posts match.
export default createRoute(
	// Generate params for all unique authors in the posts collection.
	ssgParams(async () => {
		const { posts } = await loadPosts();
		const authors = new Set(
			posts.map((post) => post.author || "Artefact Team"),
		);
		return Array.from(authors).map((author) => ({
			"author.json": `${author}.json`,
		}));
	}),

	async (c) => {
		const author = c.req.param("author.json").replace(/\.json$/, "");
		const posts = await loadPostsByAuthor(author);

		return c.json({
			generated: new Date().toISOString(),
			author,
			total: posts.length,
			posts,
		});
	},
);
