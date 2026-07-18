import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { BlogLayout } from "../../../components/blog-layout";
import { loadPosts } from "../../../lib/posts";

export default createRoute(
	// Use ssgParams middleware to tell SSG which params to generate
	ssgParams(async () => {
		const { posts } = await loadPosts();
		const authors = new Set<string>();
		for (const post of posts) {
			authors.add(post.author || "Artefact Team");
		}
		return Array.from(authors).map((author) => ({ author }));
	}),

	// Actual route handler
	async (c) => {
		const authorParam = decodeURIComponent(c.req.param("author") ?? "");

		const { posts } = await loadPosts();
		const blogPosts = posts.filter(
			(post) =>
				(post.author || "Artefact Team").toLowerCase() ===
				authorParam.toLowerCase(),
		);

		const authorName = blogPosts[0]?.author || authorParam;

		return c.render(
			<BlogLayout
				documentTitle={`Posts by ${authorName} - Artefact Blog`}
				eyebrow="✍️ Author Archive"
				iconTitle="Author"
				icon={
					<>
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</>
				}
				heading={authorName}
				description={
					<>
						Showing {blogPosts.length} article
						{blogPosts.length !== 1 ? "s" : ""} written by {authorName}
					</>
				}
				emptyDescription={
					<>
						No posts found by "<strong>{authorName}</strong>". Try browsing all
						articles.
					</>
				}
				posts={blogPosts}
			/>,
		);
	},
);
