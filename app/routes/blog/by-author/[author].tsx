import { css } from "design-system/css";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import {
	Avatar,
	Badge,
	Button,
	Card,
	Heading,
	Search,
	Stack,
	Text,
} from "../../../components/ui";
import { loadPosts, loadPostsByAuthor } from "../../../lib/posts";

export default createRoute(
	ssgParams(async () => {
		const { posts } = await loadPosts();
		const authors = new Set(
			posts.map((post) => post.author || "Artefact Team"),
		);
		return Array.from(authors).map((author) => ({ author }));
	}),

	async (c) => {
		const authorFilter = c.req.param("author") ?? "";
		const blogPosts = await loadPostsByAuthor(authorFilter);

		return c.render(
			<div
				class={css({
					py: { base: "8", md: "12" },
					px: { base: "4", md: "6", lg: "8" },
					maxWidth: "7xl",
					mx: "auto",
				})}
			>
				<title>Posts by {authorFilter} - Artefact Blog</title>

				{/* Decorative background element */}
				<div
					class={css({
						position: "fixed",
						top: "0",
						left: "0",
						right: "0",
						height: "500px",
						bgGradient: "to-b",
						gradientFrom: "purple.3",
						gradientTo: "transparent",
						opacity: "0.5",
						pointerEvents: "none",
						zIndex: "-1",
					})}
				/>

				{/* Header Section */}
				<header
					class={css({ textAlign: "center", mb: "12", position: "relative" })}
				>
					{/* Back Button */}
					<div class={css({ mb: "6", textAlign: "left" })}>
						<a href="/blog" style={{ textDecoration: "none" }}>
							<Button
								variant="plain"
								colorPalette="blue"
								class={css({
									px: "4",
									_hover: { bg: "blue.3" },
								})}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									style={{ marginRight: "8px" }}
								>
									<title>Back</title>
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								All Posts
							</Button>
						</a>
					</div>

					{/* Author Avatar */}
					<Stack
						gap="0"
						align="center"
						justify="center"
						class={css({
							w: "20",
							h: "20",
							mx: "auto",
							mb: "6",
						})}
					>
						<Avatar
							size="2xl"
							variant="solid"
							colorPalette="purple"
							name={authorFilter}
						/>
					</Stack>

					<Badge
						variant="subtle"
						colorPalette="purple"
						class={css({
							mb: "4",
							px: "4",
							py: "1.5",
							borderRadius: "full",
							fontSize: "sm",
							fontWeight: "medium",
						})}
					>
						✍️ By Author
					</Badge>

					<Heading
						as="h1"
						size={{ base: "3xl", md: "4xl", lg: "5xl" }}
						class={css({
							fontWeight: "extrabold",
							mb: "4",
							letterSpacing: "tight",
							lineHeight: "tight",
						})}
					>
						{authorFilter}
					</Heading>

					<Text
						size={{ base: "md", md: "lg" }}
						class={css({
							color: "fg.muted",
							maxWidth: "2xl",
							mx: "auto",
							lineHeight: "relaxed",
						})}
					>
						{blogPosts.length} article{blogPosts.length !== 1 ? "s" : ""} by{" "}
						{authorFilter}
					</Text>
				</header>

				{/* Search (island) — global autocomplete over /api/posts/search.json */}
				<section class={css({ mb: "8", maxWidth: "xl", mx: "auto" })}>
					<Search
						placeholder="Search all articles..."
						itemLabel="articles"
						showCount={false}
						syncUrl={false}
					/>
				</section>

				{/* Empty State */}
				{blogPosts.length === 0 && (
					<div
						class={css({
							textAlign: "center",
							py: "24",
							px: "4",
						})}
					>
						<Stack
							gap="0"
							align="center"
							justify="center"
							class={css({
								w: "28",
								h: "28",
								mx: "auto",
								mb: "8",
								bgGradient: "to-r",
								gradientFrom: "purple.3",
								gradientTo: "pink.3",
								borderRadius: "full",
								animation: "pulse",
								shadow: "lg",
							})}
						>
							<svg
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								class={css({ color: "fg.muted" })}
							>
								<title>Search</title>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.3-4.3" />
							</svg>
						</Stack>
						<Heading
							as="h3"
							size="2xl"
							class={css({
								mb: "4",
								fontWeight: "bold",
								color: "fg.subtle",
							})}
						>
							No articles found
						</Heading>
						<Text
							class={css({
								color: "fg.muted",
								maxWidth: "md",
								mx: "auto",
								lineHeight: "relaxed",
								fontSize: "lg",
							})}
						>
							No posts found by "<strong>{authorFilter}</strong>". Check back
							later for new content.
						</Text>
						<div class={css({ mt: "8" })}>
							<a href="/blog" style={{ textDecoration: "none" }}>
								<Button variant="solid" colorPalette="blue" size="lg">
									Browse All Posts
								</Button>
							</a>
						</div>
					</div>
				)}

				{/* Posts Grid */}
				<div
					class={css({
						display: "grid",
						gridTemplateColumns: {
							base: "1fr",
							md: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						},
						gap: "8",
					})}
				>
					{blogPosts.map((post, index) => (
						<Card
							key={post.slug}
							variant="outline"
							class={css({
								transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
								_hover: {
									transform: "translateY(-8px)",
									shadow: "2xl",
									borderColor: "purple.7",
								},
								overflow: "hidden",
								position: "relative",
								animation: "fade-in-up",
								animationDelay: `${index * 0.1}s`,
								animationFillMode: "both",
								bg: "bg",
								rounded: "xl",
								borderWidth: "1px",
								borderColor: "border",
							})}
							image={
								post.cover ? (
									<div
										class={css({
											w: "full",
											h: "52",
											overflow: "hidden",
											position: "relative",
										})}
									>
										<img
											src={post.cover}
											alt={post.title}
											class={css({
												w: "full",
												h: "full",
												objectFit: "cover",
												transition:
													"transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
												_cardRootHover: {
													transform: "scale(1.1)",
												},
											})}
										/>
										<div
											class={css({
												position: "absolute",
												bottom: "0",
												left: "0",
												right: "0",
												h: "60%",
												bgGradient: "to-t",
												gradientFrom: "gray.a9",
												gradientTo: "transparent",
												pointerEvents: "none",
											})}
										/>
									</div>
								) : undefined
							}
							title={
								<a
									href={`/blog/${post.slug}`}
									class={css({
										color: "fg",
										textDecoration: "none",
										transition: "color 0.2s",
										_hover: { color: "blue.10" },
									})}
								>
									{post.title}
								</a>
							}
							description={post.description}
							headerClass={css({ p: "7", pb: "0" })}
							bodyClass={css({ p: "7", pt: "4" })}
							footerClass={css({ p: "7", pt: "0" })}
							footer={
								<Stack
									gap="0"
									align="center"
									justify="space-between"
									class={css({
										pt: "5",
										borderTopWidth: "1px",
										borderColor: "border.subtle",
										width: "full",
									})}
								>
									<Stack gap="3" align="center">
										{/* Author Avatar */}
										<Avatar
											size="md"
											variant="solid"
											colorPalette="purple"
											name={post.author}
											class={css({ shadow: "sm" })}
										/>
										<div>
											<Text
												size="sm"
												class={css({
													fontWeight: "semibold",
													lineHeight: "tight",
													display: "block",
													color: "fg",
												})}
											>
												{post.author}
											</Text>
											<Stack gap="2" align="center" class={css({ mt: "0.5" })}>
												<Text size="xs" class={css({ color: "fg.muted" })}>
													{new Date(post.date).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</Text>
												<Text size="xs" class={css({ color: "fg.muted" })}>
													· {post.readTime}
												</Text>
											</Stack>
										</div>
									</Stack>

									{/* Read More Button */}
									<a
										href={`/blog/${post.slug}`}
										class={css({
											textDecoration: "none",
											display: "inline-flex",
											alignItems: "center",
											gap: "1.5",
											transition: "all 0.2s",
										})}
									>
										<Button
											variant="plain"
											size="sm"
											colorPalette="blue"
											class={css({
												px: "3",
												_hover: {
													bg: "blue.3",
													transform: "translateX(2px)",
												},
											})}
										>
											Read more
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<title>Arrow</title>
												<path d="M5 12h14M12 5l7 7-7 7" />
											</svg>
										</Button>
									</a>
								</Stack>
							}
						>
							<div>
								{post.draft && (
									<div
										class={css({
											position: "absolute",
											top: "4",
											right: "4",
											zIndex: "10",
										})}
									>
										<Badge
											variant="solid"
											colorPalette="orange"
											size="sm"
											class={css({
												borderRadius: "full",
												px: "3",
												py: "1",
											})}
										>
											Draft
										</Badge>
									</div>
								)}

								{/* Tags */}
								{post.tags.length > 0 && (
									<Stack gap="2" wrap="wrap" class={css({ mb: "4" })}>
										{post.tags.slice(0, 3).map((tag) => (
											<Badge
												key={tag}
												variant="subtle"
												colorPalette="blue"
												size="sm"
												class={css({
													borderRadius: "full",
													px: "3",
													py: "1",
													fontSize: "xs",
													fontWeight: "medium",
													transition: "all 0.2s",
													_hover: {
														bg: "blue.4",
													},
												})}
											>
												{tag}
											</Badge>
										))}
										{post.tags.length > 3 && (
											<Badge
												variant="subtle"
												colorPalette="gray"
												size="sm"
												class={css({
													borderRadius: "full",
													px: "3",
													py: "1",
													fontSize: "xs",
													fontWeight: "medium",
												})}
											>
												+{post.tags.length - 3}
											</Badge>
										)}
									</Stack>
								)}
							</div>
						</Card>
					))}
				</div>

				{/* Footer with back button */}
				{blogPosts.length > 0 && (
					<div class={css({ mt: "16", textAlign: "center" })}>
						<a href="/blog" style={{ textDecoration: "none" }}>
							<Button
								variant="outline"
								colorPalette="blue"
								size="lg"
								class={css({
									px: "8",
									py: "3",
									_hover: {
										bg: "blue.3",
										transform: "translateY(-2px)",
										shadow: "md",
									},
									transition: "all 0.2s",
								})}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									style={{ marginRight: "8px" }}
								>
									<title>Back</title>
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								Back to All Posts
							</Button>
						</a>
					</div>
				)}
			</div>,
		);
	},
);
