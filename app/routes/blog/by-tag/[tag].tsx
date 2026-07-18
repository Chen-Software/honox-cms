import { css } from "design-system/css";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { BlogLayout } from "../../../components/blog-layout";
import { Badge, Stack, Text } from "../../../components/ui";
import { loadPosts } from "../../../lib/posts";

export default createRoute(
	// Use ssgParams middleware to tell SSG which params to generate
	ssgParams(async () => {
		const { tags } = await loadPosts();
		return tags.map((tag) => ({ tag }));
	}),

	// Actual route handler
	async (c) => {
		const tagFilter = c.req.param("tag") ?? "";

		const { posts, tags } = await loadPosts();
		const blogPosts = posts.filter((post) => post.tags.includes(tagFilter));

		return c.render(
			<BlogLayout
				documentTitle={`Posts tagged: ${tagFilter} - Artefact Blog`}
				eyebrow="🏷️ Tagged Posts"
				iconTitle="Tag"
				icon={
					<>
						<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
						<line x1="7" y1="7" x2="7.01" y2="7" />
					</>
				}
				heading={tagFilter}
				description={
					<>
						Showing {blogPosts.length} article
						{blogPosts.length !== 1 ? "s" : ""} tagged with "{tagFilter}"
					</>
				}
				emptyDescription={
					<>
						No posts found with tag "<strong>{tagFilter}</strong>". Try browsing
						all tags or check back later.
					</>
				}
				posts={blogPosts}
				filters={
					tags.length > 0 && (
						<section class={css({ mb: "10" })}>
							<Text
								size="sm"
								class={css({
									color: "fg.muted",
									mb: "4",
									fontWeight: "semibold",
									letterSpacing: "wide",
									textTransform: "uppercase",
								})}
							>
								Filter by tag
							</Text>
							<Stack gap="3" align="center" wrap="wrap">
								<a href="/blog" style={{ textDecoration: "none" }}>
									<Badge
										variant="subtle"
										colorPalette="gray"
										class={css({
											px: "4",
											py: "2",
											borderRadius: "full",
											fontSize: "sm",
											cursor: "pointer",
											transition: "all 0.2s",
											_hover: {
												bg: "gray.3",
												transform: "translateY(-1px)",
											},
											_active: {
												transform: "translateY(0)",
											},
										})}
									>
										All Tags
									</Badge>
								</a>
								{tags.map((tag) => (
									<a
										key={tag}
										href={`/blog/by-tag/${tag}`}
										style={{ textDecoration: "none" }}
									>
										<Badge
											variant={tag === tagFilter ? "solid" : "subtle"}
											colorPalette={tag === tagFilter ? "blue" : "gray"}
											class={css({
												px: "4",
												py: "2",
												borderRadius: "full",
												fontSize: "sm",
												cursor: "pointer",
												transition: "all 0.2s",
												_hover: {
													bg: tag === tagFilter ? "blue.10" : "blue.3",
													transform: "translateY(-1px)",
													shadow: "sm",
												},
												_active: {
													transform: "translateY(0)",
												},
											})}
										>
											{tag === tagFilter && (
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													style={{
														marginRight: "6px",
														verticalAlign: "middle",
													}}
												>
													<title>Selected</title>
													<polyline points="20 6 9 17 4 12" />
												</svg>
											)}
											{tag}
										</Badge>
									</a>
								))}
							</Stack>
						</section>
					)
				}
			/>,
		);
	},
);
