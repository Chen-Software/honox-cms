import { css } from "design-system/css";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import {
	Anchor,
	Avatar,
	Badge,
	Button,
	Heading,
	Stack,
	Text,
} from "../../components/ui";
import { ArrowLeftIcon } from "../../icons/arrow-left";
import { CalendarIcon } from "../../icons/calendar";
import { ChevronRightIcon } from "../../icons/chevron-right";
import { ClockIcon } from "../../icons/clock";
import { EditIcon } from "../../icons/edit";
import { ShareIcon } from "../../icons/share";
import { detectLocale, localiseHref } from "../../lib/i18n";
import { loadPostBySlug, loadPosts } from "../../lib/posts";
import { markdownContentClass } from "../../utils/markdown-content-style";

export default createRoute(
	// Use ssgParams middleware to tell SSG which params to generate
	ssgParams(async () => {
		const { posts } = await loadPosts();
		return posts.map((post) => ({ slug: post.slug }));
	}),

	// Actual route handler
	async (c) => {
		const slug = c.req.param("slug");
		const currentPath = c.req.path;
		const currentLocale = detectLocale(currentPath);

		const post = await loadPostBySlug(slug, currentLocale);

		if (!post) {
			return c.notFound();
		}

		try {
			const htmlContent = post.html;
			const relatedPosts = post.relatedPosts;
			const postUrl = `${c.req.url}`;

			const localiseLink = (href: string) => localiseHref(href, currentLocale);

			return c.render(
				<div
					class={css({
						minHeight: "100vh",
						bg: "bg.subtle",
					})}
				>
					<title>
						{post.title || "Untitled"} -{" "}
						{currentLocale === "zh" ? "博客" : "Blog"}
					</title>

					{/* Article Content */}
					<section
						class={css({
							maxWidth: "4xl",
							mx: "auto",
							px: { base: "4", md: "6", lg: "8" },
							py: { base: "8", md: "12" },
						})}
					>
						<Stack
							direction="horizontal"
							justify="space-between"
							align="center"
							class={css({ mb: "8" })}
						>
							{/* Back Button */}
							<a
								href={localiseLink("/blog")}
								class={css({
									display: "inline-flex",
									alignItems: "center",
									gap: "2",
									color: "fg.muted",
									textDecoration: "none",
									fontSize: "sm",
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
								<ArrowLeftIcon width="20" height="20" />
								{currentLocale === "zh" ? "返回博客" : "Back to Blog"}
							</a>

							{/* Edit Button */}
							<a
								href={`/admin/#/collections/posts/entries/${slug}`}
								class={css({
									display: "inline-flex",
									alignItems: "center",
									gap: "2",
									color: "fg.muted",
									textDecoration: "none",
									fontSize: "sm",
									px: "4",
									py: "2",
									borderRadius: "lg",
									transition: "all 0.2s",
									_hover: {
										bg: "bg.subtle",
										color: "fg",
										transform: "translateY(-1px)",
									},
								})}
							>
								<EditIcon width="18" height="18" />
								{currentLocale === "zh" ? "编辑文章" : "Edit Post"}
							</a>
						</Stack>

						<div
							class={css({
								bg: "bg",
								borderRadius: "2xl",
								shadow: "lg",
								overflow: "hidden",
							})}
						>
							{/* Cover Image (full width, no card padding) */}
							{post.cover && (
								<div
									class={css({
										overflow: "hidden",
									})}
								>
									<img
										src={post.cover}
										alt={post.title || "Post cover"}
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
								{Array.isArray(post.tags) && post.tags.length > 0 && (
									<Stack gap="2" wrap="wrap" class={css({ mb: "4" })}>
										{post.tags.map((tag: string) => (
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
									{post.title || "Untitled"}
									{post.draft === true && (
										<Badge
											variant="solid"
											colorPalette="orange"
											class={css({
												ml: "4",
												fontSize: "md",
												verticalAlign: "middle",
											})}
										>
											{currentLocale === "zh" ? "草稿" : "Draft"}
										</Badge>
									)}
								</Heading>

								{/* Description */}
								{post.description && (
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
										{post.description}
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
										<Anchor
											href={localiseLink(
												`/blog/by-author/${post.author || "Artefact Team"}`,
											)}
											class={css({
												display: "inline-flex",
												alignItems: "center",
												textDecoration: "none",
											})}
										>
											<Avatar
												size="md"
												variant="solid"
												colorPalette="blue"
												name={post.author || "Artefact Team"}
											/>
										</Anchor>
										<div>
											<Anchor
												href={localiseLink(
													`/blog/by-author/${post.author || "Artefact Team"}`,
												)}
												class={css({
													textDecoration: "none",
													color: "fg",
													_hover: { color: "blue.10" },
												})}
											>
												<Text
													size="sm"
													class={css({
														color: "inherit",
														fontWeight: "semibold",
														display: "block",
													})}
												>
													{post.author || "Artefact Team"}
												</Text>
											</Anchor>
										</div>
									</Stack>

									{/* Date */}
									{post.date && (
										<Stack gap="2" align="center">
											<CalendarIcon width="18" height="18" />
											<Text
												size="sm"
												class={css({
													color: "fg.muted",
												})}
											>
												{new Date(post.date).toLocaleDateString(
													currentLocale === "zh" ? "zh-CN" : "en-US",
													{
														year: "numeric",
														month: "long",
														day: "numeric",
													},
												)}
											</Text>
										</Stack>
									)}

									{/* Read Time */}
									{post.readTime ? (
										<Stack gap="2" align="center">
											<ClockIcon width="18" height="18" />
											<Text
												size="sm"
												class={css({
													color: "fg.muted",
												})}
											>
												{post.readTime}
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
													title: post.title || "Blog Post",
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
										<ShareIcon width="16" height="16" />
										{currentLocale === "zh" ? "分享" : "Share"}
									</Button>
								</Stack>

								{/* Markdown Content */}
								<div
									class={markdownContentClass}
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
									<ChevronRightIcon
										width="24"
										height="24"
										class={css({ color: "blue.9" })}
									/>
									{currentLocale === "zh" ? "相关文章" : "Related Posts"}
								</Heading>

								<div
									class={css({
										display: "grid",
										gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
										gap: "4",
									})}
								>
									{relatedPosts.map((relatedPost) => (
										<a
											href={localiseLink(`/blog/${relatedPost.slug}`)}
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
												{new Date(relatedPost.date).toLocaleDateString(
													currentLocale === "zh" ? "zh-CN" : "en-US",
													{
														month: "short",
														day: "numeric",
														year: "numeric",
													},
												)}
											</Text>
											<Text
												size="md"
												class={css({
													color: "fg",
													fontWeight: "semibold",
													lineHeight: "tight",
												})}
											>
												{relatedPost.title}
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
						<a href={localiseLink("/blog")} style={{ textDecoration: "none" }}>
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
								<ArrowLeftIcon width="20" height="20" />
								{currentLocale === "zh" ? "返回所有文章" : "Back to All Posts"}
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
