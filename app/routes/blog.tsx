import { createRoute } from "honox/factory";
import { css } from "styled-system/css";
import {
	Avatar,
	Badge,
	Button,
	Card,
	Drawer,
	Heading,
	Search,
	Stack,
	Text,
} from "../components/ui";
import { loadPosts } from "../lib/posts";
import { filterEntries } from "../utils/search";

export default createRoute(async (c) => {
	const { posts: blogPosts, searchEntries, tags } = await loadPosts();

	// Get URL parameters for searching
	const url = new URL(c.req.url);
	const searchQuery = url.searchParams.get("q") || "";

	// Server-side filtering for the no-JS ?q= fallback. All posts are still
	// rendered (non-matches hidden) so the Search island can broaden results
	// client-side without a round-trip.
	const matchedSlugs = new Set(
		filterEntries(searchEntries, searchQuery).map((entry) => entry.key),
	);

	return c.render(
		<div
			class={css({
				py: { base: "8", md: "12" },
				px: { base: "4", md: "6", lg: "8" },
				maxWidth: "7xl",
				mx: "auto",
			})}
		>
			<title>Blog - Artefact</title>

			{/* Decorative background element */}
			<div
				class={css({
					position: "fixed",
					top: "0",
					left: "0",
					right: "0",
					height: "500px",
					bgGradient: "to-b",
					gradientFrom: "blue.3",
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
				{/* Decorative dots pattern */}
				<div
					class={css({
						position: "absolute",
						top: "-40px",
						left: "50%",
						transform: "translateX(-50%)",
						width: "200px",
						height: "200px",
						opacity: "0.1",
						backgroundImage:
							"radial-gradient(circle, blue.9 1px, transparent 1px)",
						backgroundSize: "20px 20px",
						pointerEvents: "none",
					})}
				/>

				<Badge
					variant="subtle"
					colorPalette="blue"
					class={css({
						mb: "4",
						px: "4",
						py: "1.5",
						borderRadius: "full",
						fontSize: "sm",
						fontWeight: "medium",
					})}
				>
					✍️ Latest Articles
				</Badge>

				<Heading
					as="h1"
					size={{ base: "3xl", md: "4xl", lg: "5xl" }}
					class={css({
						fontWeight: "extrabold",
						mb: "4",
						letterSpacing: "tight",
						lineHeight: "tight",
						bgGradient: "to-r",
						gradientFrom: "blue.10",
						gradientTo: "purple.10",
						bgClip: "text",
					})}
				>
					Blog
				</Heading>

				<Text
					size={{ base: "md", md: "lg" }}
					class={css({
						color: "fg.muted",
						maxWidth: "2xl",
						mx: "auto",
						lineHeight: "relaxed",
						fontSize: { base: "md", md: "lg" },
					})}
				>
					Thoughts on web development, design systems, and building better
					developer experiences. Stay updated with the latest trends and best
					practices.
				</Text>

				{/* Stats row */}
				<Stack
					gap={{ base: "6", md: "10" }}
					justify="center"
					wrap="wrap"
					class={css({ mt: "8" })}
				>
					<div class={css({ textAlign: "center" })}>
						<Text
							size="2xl"
							class={css({
								fontWeight: "bold",
								color: "blue.10",
								display: "block",
								lineHeight: "tight",
							})}
						>
							{blogPosts.length}
						</Text>
						<Text size="sm" class={css({ color: "fg.muted" })}>
							Articles
						</Text>
					</div>
					<div
						class={css({
							w: "1px",
							h: "auto",
							bg: "border",
							display: { base: "none", sm: "block" },
						})}
					/>
					<div class={css({ textAlign: "center" })}>
						<Text
							size="2xl"
							class={css({
								fontWeight: "bold",
								color: "purple.10",
								display: "block",
								lineHeight: "tight",
							})}
						>
							{tags.length}
						</Text>
						<Text size="sm" class={css({ color: "fg.muted" })}>
							Categories
						</Text>
					</div>
				</Stack>
			</header>

			{/* Search + Tag Browse */}
			<section class={css({ mb: "8" })}>
				<Stack gap="4" align="flex-start" justify="space-between" wrap="wrap">
					{/* Instant Search (island) — lazily fetches /search-index.json */}
					<div class={css({ flex: "1", minWidth: "260px" })}>
						<Search
							src="/search-index.json"
							action="/blog"
							initialQuery={searchQuery}
							placeholder="Search articles..."
							itemLabel="articles"
							total={blogPosts.length}
							filterAttribute="data-post-slug"
							emptyStateId="blog-search-empty"
						/>
					</div>

					{/* Tag Browse Button */}
					<Drawer
						interactive
						trigger={
							<Button
								variant="outline"
								class={css({
									display: "flex",
									alignItems: "center",
									gap: "2",
									px: "4",
									py: "2",
									borderRadius: "lg",
									transition: "all 0.2s",
									_hover: {
										borderColor: "blue.7",
										bg: "blue.3",
									},
								})}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<title>Filter</title>
									<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
								</svg>
								Browse tags
							</Button>
						}
						title="Browse by Tag"
						description="Jump to a tag archive"
						body={
							<div>
								{/* Tag Filter Section */}
								<div>
									<Text
										size="sm"
										class={css({
											fontWeight: "semibold",
											mb: "3",
											display: "block",
											color: "fg",
										})}
									>
										Filter by Tag
									</Text>
									<Stack direction="column" gap="1">
										{["All", ...tags].map((tag) => {
											const href = tag === "All" ? "/blog" : `/blog/tag/${tag}`;

											return (
												<a
													href={href}
													class={css({
														width: "full",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														px: "4",
														py: "2.5",
														borderRadius: "md",
														textDecoration: "none",
														fontSize: "sm",
														fontWeight: "normal",
														transition: "all 0.2s",
														bg: "transparent",
														color: "fg.muted",
														_hover: {
															bg: "gray.subtle.bg",
															color: "fg",
														},
													})}
												>
													<span>{tag}</span>
												</a>
											);
										})}
									</Stack>
								</div>
							</div>
						}
					/>
				</Stack>
			</section>

			{/* Empty state — visibility is toggled by the blog-search island */}
			<div
				id="blog-search-empty"
				hidden={matchedSlugs.size !== 0}
				class={css({
					textAlign: "center",
					py: "20",
					px: "4",
				})}
			>
				<Stack
					gap="0"
					align="center"
					justify="center"
					class={css({
						w: "24",
						h: "24",
						mx: "auto",
						mb: "6",
						bg: "gray.subtle.bg",
						borderRadius: "full",
						animation: "pulse",
					})}
				>
					<svg
						width="40"
						height="40"
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
				<Heading as="h3" size="xl" class={css({ mb: "3" })}>
					No articles found
				</Heading>
				<Text
					class={css({
						color: "fg.muted",
						maxWidth: "md",
						mx: "auto",
						lineHeight: "relaxed",
					})}
				>
					Try adjusting your search or filter to find what you're looking for.
				</Text>
			</div>

			<div
				class={css({
					display: "grid",
					gridTemplateColumns: {
						base: "1fr",
						md: "repeat(2, 1fr)",
						lg: "repeat(3, 1fr)",
					},
					gap: "6",
				})}
			>
				{blogPosts.map((post, index) => (
					<div
						key={post.slug}
						data-post-slug={post.slug}
						hidden={!matchedSlugs.has(post.slug)}
					>
						<Card
							variant="outline"
							class={css({
								transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
								_hover: {
									transform: "translateY(-4px)",
									shadow: "lg",
									borderColor: "blue.4",
								},
								overflow: "hidden",
								position: "relative",
								animation: "fade-in-up",
								animationDelay: `${index * 0.1}s`,
								animationFillMode: "both",
							})}
							image={
								post.cover ? (
									<div
										class={css({
											w: "full",
											h: "48",
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
												transition: "transform 0.3s",
												_cardRootHover: {
													transform: "scale(1.05)",
												},
											})}
										/>
										<div
											class={css({
												position: "absolute",
												bottom: "0",
												left: "0",
												right: "0",
												h: "50%",
												bgGradient: "to-t",
												gradientFrom: "gray.a1",
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
							headerClass={css({ p: "6", pb: "0" })}
							bodyClass={css({ p: "6", pt: "3" })}
							footerClass={css({ p: "6", pt: "0" })}
							footer={
								<Stack
									gap="0"
									align="center"
									justify="space-between"
									class={css({
										pt: "4",
										borderTopWidth: "1px",
										borderColor: "border.subtle",
										width: "full",
									})}
								>
									<Stack gap="2.5" align="center">
										{/* Author Avatar */}
										<Avatar
											size="sm"
											variant="solid"
											colorPalette="blue"
											name={post.author}
										/>
										<div>
											<Text
												size="sm"
												class={css({
													fontWeight: "medium",
													lineHeight: "tight",
													display: "block",
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
											gap: "1",
											transition: "all 0.2s",
										})}
									>
										<Button
											variant="plain"
											size="sm"
											colorPalette="blue"
											class={css({
												px: "2",
												_hover: {
													bg: "blue.3",
												},
											})}
										>
											Read more
											<svg
												width="14"
												height="14"
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
											top: "3",
											right: "3",
											zIndex: "10",
										})}
									>
										<Badge variant="solid" colorPalette="orange" size="sm">
											Draft
										</Badge>
									</div>
								)}

								{/* Tags */}
								{post.tags.length > 0 && (
									<Stack gap="2" wrap="wrap" class={css({ mb: "3" })}>
										{post.tags.slice(0, 3).map((tag) => (
											<Badge
												key={tag}
												variant="subtle"
												colorPalette="blue"
												size="sm"
												class={css({
													borderRadius: "full",
													px: "2.5",
													py: "0.5",
													fontSize: "xs",
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
													px: "2.5",
													py: "0.5",
													fontSize: "xs",
												})}
											>
												+{post.tags.length - 3}
											</Badge>
										)}
									</Stack>
								)}
							</div>
						</Card>
					</div>
				))}
			</div>

			{/* Newsletter Section */}
			<section
				class={css({
					mt: "20",
					py: "12",
					px: "8",
					bgGradient: "to-br",
					gradientFrom: "blue.3",
					gradientTo: "purple.3",
					borderRadius: "3xl",
					textAlign: "center",
					position: "relative",
					overflow: "hidden",
				})}
			>
				{/* Decorative circles */}
				<div
					class={css({
						position: "absolute",
						top: "-100px",
						right: "-100px",
						w: "300px",
						h: "300px",
						borderRadius: "full",
						bg: "blue.5",
						opacity: "0.3",
						pointerEvents: "none",
					})}
				/>
				<div
					class={css({
						position: "absolute",
						bottom: "-50px",
						left: "-50px",
						w: "200px",
						h: "200px",
						borderRadius: "full",
						bg: "purple.5",
						opacity: "0.3",
						pointerEvents: "none",
					})}
				/>

				<div
					class={css({
						position: "relative",
						zIndex: "1",
					})}
				>
					<Stack
						gap="0"
						align="center"
						justify="center"
						class={css({
							w: "16",
							h: "16",
							mx: "auto",
							mb: "4",
							bg: "blue.9",
							borderRadius: "2xl",
							shadow: "lg",
						})}
					>
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							stroke-width="2"
						>
							<title>Newsletter</title>
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
							<polyline points="22,6 12,13 2,6" />
						</svg>
					</Stack>

					<Badge
						variant="subtle"
						colorPalette="blue"
						class={css({ mb: "4", px: "3", py: "1" })}
					>
						📬 Newsletter
					</Badge>

					<Heading as="h2" size="xl" class={css({ mb: "3" })}>
						Stay Updated
					</Heading>

					<Text
						class={css({
							color: "fg.muted",
							mb: "8",
							maxWidth: "lg",
							mx: "auto",
							lineHeight: "relaxed",
						})}
					>
						Get the latest articles and insights delivered straight to your
						inbox. No spam, just good content.
					</Text>

					<form
						class={css({
							display: "flex",
							gap: "3",
							maxWidth: "md",
							mx: "auto",
							flexDirection: { base: "column", sm: "row" },
						})}
					>
						<div class={css({ position: "relative", flex: "1" })}>
							<div
								class={css({
									position: "absolute",
									left: "3",
									top: "50%",
									transform: "translateY(-50%)",
									color: "fg.muted",
									pointerEvents: "none",
									zIndex: "1",
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
									<title>Email</title>
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
									<polyline points="22,6 12,13 2,6" />
								</svg>
							</div>
							<input
								type="email"
								placeholder="Enter your email"
								class={css({
									width: "full",
									pl: "10",
									pr: "4",
									py: "3.5",
									borderWidth: "2px",
									borderRadius: "xl",
									bg: "bg",
									color: "fg",
									borderColor: "border",
									fontSize: "md",
									transition: "all 0.2s",
									_focus: {
										outline: "none",
										borderColor: "blue.9",
										shadow: "0 0 0 3px var(--colors-blue-6)",
									},
									_placeholder: { color: "fg.muted" },
								})}
							/>
						</div>
						<Button
							type="submit"
							variant="solid"
							colorPalette="blue"
							size="lg"
							class={css({
								px: "8",
								py: "3.5",
								borderRadius: "xl",
								fontWeight: "semibold",
								shadow: "md",
								_hover: {
									shadow: "lg",
									transform: "translateY(-1px)",
								},
							})}
						>
							Subscribe
						</Button>
					</form>

					<Text
						size="xs"
						class={css({
							color: "fg.muted",
							mt: "4",
							display: "block",
						})}
					>
						We respect your privacy. Unsubscribe at any time.
					</Text>
				</div>
			</section>
		</div>,
	);
});
