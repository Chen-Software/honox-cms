import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { css } from "styled-system/css";
import {
	Avatar,
	Badge,
	Button,
	Heading,
	Stack,
	Text,
} from "../../components/ui";
import { markdownToHtml, parseFrontmatter } from "../../utils/markdown";

// Use Vite's import.meta.glob to import all markdown files at build time
const posts = import.meta.glob("/content/posts/*.md", {
	query: "?raw",
	import: "default",
});

export default createRoute(
	// Use ssgParams middleware to tell SSG which params to generate
	ssgParams(async () => {
		const posts = import.meta.glob("/content/posts/*.md", {
			query: "?raw",
			import: "default",
		});

		const slugs: { slug: string }[] = [];

		for (const path of Object.keys(posts)) {
			const slug = path.replace("/content/posts/", "").replace(".md", "");
			slugs.push({ slug });
		}

		return slugs;
	}),

	// Actual route handler
	async (c) => {
		const slug = c.req.param("slug");
		const postPath = `/content/posts/${slug}.md`;

		// Find the post with matching slug
		const loader = posts[postPath];

		if (!loader) {
			return c.notFound();
		}

		try {
			const markdown = await (loader as () => Promise<string>)();
			const { data, content } = parseFrontmatter(markdown);
			const htmlContent = markdownToHtml(content);

			// Get all posts for reading time calculation and related posts
			const allPosts: Array<{
				slug: string;
				title: string;
				date: string;
				tags: string[];
			}> = [];
			for (const [path, postLoader] of Object.entries(posts)) {
				try {
					const postMarkdown = await (postLoader as () => Promise<string>)();
					const { data: postData } = parseFrontmatter(postMarkdown);
					const postSlug = path
						.replace("/content/posts/", "")
						.replace(".md", "");
					if (postSlug !== slug && !postData.draft) {
						allPosts.push({
							slug: postSlug,
							title: postData.title || "Untitled",
							date: postData.date || "",
							tags: Array.isArray(postData.tags) ? postData.tags : [],
						});
					}
				} catch (_error) {
					// Ignore errors
				}
			}

			// Find related posts (same tags)
			const currentTags = Array.isArray(data.tags) ? data.tags : [];
			const relatedPosts = allPosts
				.filter((post) => post.tags.some((tag) => currentTags.includes(tag)))
				.slice(0, 3);

			const postUrl = `${c.req.url}`;

			return c.render(
				<div
					class={css({
						minHeight: "100vh",
						bg: "bg.subtle",
					})}
				>
					<title>{data.title || "Untitled"} - Blog</title>

					{/* Article Content */}
					<section
						class={css({
							maxWidth: "4xl",
							mx: "auto",
							px: { base: "4", md: "6", lg: "8" },
							py: { base: "8", md: "12" },
						})}
					>
						{/* Back Button */}
						<a
							href="/blog"
							class={css({
								display: "inline-flex",
								alignItems: "center",
								gap: "2",
								color: "fg.muted",
								textDecoration: "none",
								fontSize: "sm",
								mb: "8",
								px: "4",
								py: "2",
								borderRadius: "lg",
								transition: "all 0.2s",
								_hover: {
									bg: "bg.subtle",
									color: "fg",
									transform: "translateX(-4px)",
								},
							})}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<title>Back</title>
								<path d="M19 12H5M12 19l-7-7 7-7" />
							</svg>
							Back to Blog
						</a>

						<div
							class={css({
								bg: "bg",
								borderRadius: "2xl",
								shadow: "lg",
								overflow: "hidden",
							})}
						>
							{/* Cover Image (full width, no card padding) */}
							{data.cover && (
								<div
									class={css({
										overflow: "hidden",
									})}
								>
									<img
										src={data.cover}
										alt={data.title || "Post cover"}
										class={css({
											width: "full",
											height: { base: "200px", md: "350px" },
											objectFit: "cover",
											display: "block",
										})}
									/>
								</div>
							)}

							{/* Post Header (inside card, with padding) */}
							<div
								class={css({
									px: { base: "6", md: "10", lg: "12" },
									pt: { base: "8", md: "10" },
									pb: "6",
								})}
							>
								{/* Tags */}
								{Array.isArray(data.tags) && data.tags.length > 0 && (
									<Stack gap="2" wrap="wrap" class={css({ mb: "4" })}>
										{data.tags.map((tag: string) => (
											<Badge
												key={tag}
												variant="subtle"
												colorPalette="blue"
												class={css({
													borderRadius: "full",
													fontSize: "sm",
													fontWeight: "medium",
												})}
											>
												{tag}
											</Badge>
										))}
									</Stack>
								)}

								{/* Title */}
								<Heading
									as="h1"
									size={{ base: "2xl", md: "3xl", lg: "4xl" }}
									class={css({
										fontWeight: "bold",
										lineHeight: "tight",
										mb: "4",
										color: "fg",
									})}
								>
									{data.title || "Untitled"}
									{data.draft === true && (
										<Badge
											variant="solid"
											colorPalette="orange"
											class={css({
												ml: "4",
												fontSize: "md",
												verticalAlign: "middle",
											})}
										>
											Draft
										</Badge>
									)}
								</Heading>

								{/* Description */}
								{data.description && (
									<Text
										size={{ base: "lg", md: "xl" }}
										class={css({
											color: "fg.muted",
											lineHeight: "relaxed",
											display: "block",
											fontStyle: "italic",
											mb: "6",
										})}
									>
										{data.description}
									</Text>
								)}

								{/* Meta Information */}
								<Stack
									gap="6"
									align="center"
									wrap="wrap"
									class={css({
										pb: "6",
										borderBottomWidth: "1px",
										borderColor: "border.subtle",
									})}
								>
									{/* Author */}
									<Stack gap="3" align="center">
										<Avatar
											size="md"
											variant="solid"
											colorPalette="blue"
											name={data.author || "Artefact Team"}
										/>
										<div>
											<Text
												size="sm"
												class={css({
													color: "fg",
													fontWeight: "semibold",
													display: "block",
												})}
											>
												{data.author || "Artefact Team"}
											</Text>
										</div>
									</Stack>

									{/* Date */}
									{data.date && (
										<Stack gap="2" align="center">
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<title>Date</title>
												<rect
													x="3"
													y="4"
													width="18"
													height="18"
													rx="2"
													ry="2"
												/>
												<line x1="16" y1="2" x2="16" y2="6" />
												<line x1="8" y1="2" x2="8" y2="6" />
												<line x1="3" y1="10" x2="21" y2="10" />
											</svg>
											<Text
												size="sm"
												class={css({
													color: "fg.muted",
												})}
											>
												{new Date(data.date).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</Text>
										</Stack>
									)}

									{/* Read Time */}
									{data.readTime ? (
										<Stack gap="2" align="center">
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<title>Read Time</title>
												<circle cx="12" cy="12" r="10" />
												<polyline points="12 6 12 12 16 14" />
											</svg>
											<Text
												size="sm"
												class={css({
													color: "fg.muted",
												})}
											>
												{data.readTime}
											</Text>
										</Stack>
									) : null}
								</Stack>
							</div>

							{/* Share & Markdown Content */}
							<div
								class={css({
									px: { base: "6", md: "10", lg: "12" },
									pb: { base: "8", md: "10" },
								})}
							>
								{/* Share Button */}
								<Stack gap="0" justify="flex-end" class={css({ mb: "8" })}>
									<Button
										variant="outline"
										size="sm"
										colorPalette="blue"
										onClick={() => {
											if (navigator.share) {
												navigator.share({
													title: data.title || "Blog Post",
													url: postUrl,
												});
											} else {
												navigator.clipboard.writeText(postUrl);
											}
										}}
										class={css({
											display: "inline-flex",
											alignItems: "center",
											gap: "2",
										})}
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<title>Share</title>
											<circle cx="18" cy="5" r="3" />
											<circle cx="6" cy="12" r="3" />
											<circle cx="18" cy="19" r="3" />
											<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
											<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
										</svg>
										Share
									</Button>
								</Stack>

								{/* Markdown Content */}
								<div
									class={css({
										// Typography styles for markdown content
										"& h1": {
											fontSize: "2xl",
											fontWeight: "bold",
											mt: "8",
											mb: "4",
											color: "fg",
											lineHeight: "tight",
										},
										"& h2": {
											fontSize: "xl",
											fontWeight: "semibold",
											mt: "6",
											mb: "3",
											color: "fg",
											lineHeight: "tight",
											paddingBottom: "2",
											borderBottomWidth: "2px",
											borderColor: "border.subtle",
										},
										"& h3": {
											fontSize: "lg",
											fontWeight: "semibold",
											mt: "5",
											mb: "2",
											color: "fg",
										},
										"& p": {
											lineHeight: "relaxed",
											mb: "4",
											color: "fg.muted",
											fontSize: "md",
										},
										"& a": {
											color: "blue.10",
											textDecoration: "none",
											_hover: {
												textDecoration: "underline",
												color: "blue.11",
											},
										},
										"& strong": {
											fontWeight: "semibold",
											color: "fg",
										},
										"& em": {
											fontStyle: "italic",
										},
										"& code": {
											bg: "gray.3",
											color: "red.10",
											px: "1.5",
											py: "0.5",
											borderRadius: "md",
											fontSize: "sm",
											fontFamily: "mono",
										},
										"& pre": {
											bg: "gray.11",
											color: "gray.3",
											p: "6",
											borderRadius: "xl",
											overflowX: "auto",
											mb: "6",
											shadow: "lg",
											"& code": {
												bg: "transparent",
												color: "inherit",
												p: "0",
											},
										},
										"& ul, & ol": {
											pl: "6",
											mb: "4",
											"& li": {
												lineHeight: "relaxed",
												mb: "2",
												color: "fg.muted",
												"&::marker": {
													color: "blue.9",
												},
											},
										},
										"& blockquote": {
											borderLeftWidth: "4px",
											borderLeftColor: "blue.9",
											pl: "6",
											py: "2",
											my: "6",
											bg: "blue.3",
											borderRadius: "sm",
											"& p": {
												color: "fg.subtle",
												fontStyle: "italic",
											},
										},
										"& img": {
											borderRadius: "xl",
											shadow: "md",
											my: "8",
											maxWidth: "full",
											height: "auto",
										},
										"& hr": {
											border: "none",
											borderTopWidth: "2px",
											borderColor: "border.subtle",
											my: "10",
										},
										"& table": {
											width: "full",
											mb: "6",
											borderCollapse: "collapse",
											"& th, & td": {
												borderWidth: "1px",
												borderColor: "border",
												px: "4",
												py: "3",
												textAlign: "left",
											},
											"& th": {
												bg: "bg.subtle",
												fontWeight: "semibold",
											},
											"& tr:hover": {
												bg: "bg.subtle",
											},
										},
									})}
									dangerouslySetInnerHTML={{ __html: htmlContent }}
								/>
							</div>
						</div>
					</section>

					{/* Related Posts */}
					{relatedPosts.length > 0 && (
						<section
							class={css({
								maxWidth: "4xl",
								mx: "auto",
								px: { base: "4", md: "6", lg: "8" },
								pb: { base: "12", md: "16" },
							})}
						>
							<div
								class={css({
									bg: "bg",
									borderRadius: "2xl",
									shadow: "md",
									p: { base: "6", md: "8" },
								})}
							>
								<Heading
									as="h2"
									size="lg"
									class={css({
										mb: "6",
										display: "flex",
										alignItems: "center",
										gap: "3",
									})}
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class={css({ color: "blue.9" })}
									>
										<title>Related</title>
										<path d="M9 18l6-6-6-6" />
									</svg>
									Related Posts
								</Heading>

								<div
									class={css({
										display: "grid",
										gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
										gap: "4",
									})}
								>
									{relatedPosts.map((post) => (
										<a
											href={`/blog/${post.slug}`}
											class={css({
												textDecoration: "none",
												display: "block",
												p: "5",
												borderRadius: "xl",
												borderWidth: "1px",
												borderColor: "border",
												transition: "all 0.2s",
												_hover: {
													borderColor: "blue.4",
													shadow: "md",
													transform: "translateY(-2px)",
												},
											})}
										>
											<Text
												size="sm"
												class={css({
													color: "fg.muted",
													mb: "2",
													display: "block",
												})}
											>
												{new Date(post.date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</Text>
											<Text
												size="md"
												class={css({
													color: "fg",
													fontWeight: "semibold",
													lineHeight: "tight",
												})}
											>
												{post.title}
											</Text>
										</a>
									))}
								</div>
							</div>
						</section>
					)}

					{/* Footer with Back to Blog */}
					<section
						class={css({
							maxWidth: "4xl",
							mx: "auto",
							px: { base: "4", md: "6", lg: "8" },
							pb: { base: "8", md: "12" },
							textAlign: "center",
						})}
					>
						<a href="/blog" style={{ textDecoration: "none" }}>
							<Button
								variant="solid"
								colorPalette="blue"
								size="lg"
								class={css({
									display: "inline-flex",
									alignItems: "center",
									gap: "2",
								})}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<title>Back</title>
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								Back to All Posts
							</Button>
						</a>
					</section>
				</div>,
			);
		} catch (error) {
			console.error(`Error loading post ${slug}:`, error);
			return c.notFound();
		}
	},
);
