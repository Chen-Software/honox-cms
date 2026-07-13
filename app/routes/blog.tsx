import { createRoute } from "honox/factory";
import { css } from "styled-system/css";
import {
	Badge,
	Button,
	Card,
	Drawer,
	Heading,
	Stack,
	Text,
} from "../components/ui";
import { parseFrontmatter } from "../utils/markdown";

// Use Vite's import.meta.glob to import all markdown files at build time
const posts = import.meta.glob("/content/posts/*.md", {
	query: "?raw",
	import: "default",
});

interface BlogPost {
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

export default createRoute(async (c) => {
	// Load and parse all blog posts
	const blogPosts: BlogPost[] = [];

	for (const [path, loader] of Object.entries(posts)) {
		try {
			const markdown = await (loader as () => Promise<string>)();
			const { data } = parseFrontmatter(markdown);

			// Skip drafts in production
			if (data.draft === true && process.env.NODE_ENV === "production") {
				continue;
			}

			const slug = path.replace("/content/posts/", "").replace(".md", "");

			const postTags = Array.isArray(data.tags) ? data.tags : [];

			blogPosts.push({
				slug,
				title: data.title || "Untitled",
				date: data.date || "",
				description: data.description || "",
				tags: postTags,
				draft: data.draft === true,
				author: data.author || "Artefact Team",
				readTime: data.readTime || "5 min read",
				cover: data.cover || null,
			});
		} catch (error) {
			console.error(`Error loading ${path}:`, error);
		}
	}

	// Sort posts by date (newest first)
	blogPosts.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return dateB - dateA;
	});

	// Get unique tags for filter UI
	const allTags = new Set<string>();
	for (const [_path, loader] of Object.entries(posts)) {
		try {
			const markdown = await (loader as () => Promise<string>)();
			const { data } = parseFrontmatter(markdown);

			if (data.draft === true && process.env.NODE_ENV === "production") {
				continue;
			}

			const postTags = Array.isArray(data.tags) ? data.tags : [];
			postTags.forEach((tag: string) => {
				allTags.add(tag);
			});
		} catch (_error) {
			// Ignore errors
		}
	}

	const tags = Array.from(allTags).sort();

	// Get URL parameters for searching
	const url = new URL(c.req.url);
	const searchQuery = url.searchParams.get("q") || "";

	// Filter posts based on search only
	const filteredPosts = blogPosts.filter((post) => {
		const matchesSearch =
			!searchQuery ||
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase()),
			);

		return matchesSearch;
	});

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

			{/* Filter Button - Opens Drawer */}
			<section class={css({ mb: "8" })}>
				<Stack gap="4" align="center" justify="space-between" wrap="wrap">
					{/* Results Count */}
					<Text
						size="sm"
						class={css({
							color: "fg.muted",
							display: "flex",
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
							<title>Articles</title>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
						Showing {filteredPosts.length} article
						{filteredPosts.length !== 1 ? "s" : ""}
						{searchQuery && ` for "${searchQuery}"`}
					</Text>

					{/* Filter Button */}
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
								{searchQuery && (
									<Badge
										variant="solid"
										colorPalette="blue"
										size="sm"
										class={css({
											borderRadius: "full",
											w: "5",
											h: "5",
											p: "0",
										})}
									>
										1
									</Badge>
								)}
								{searchQuery ? `"${searchQuery}"` : "Filter articles..."}
							</Button>
						}
						title="Search & Filter"
						description="Find articles by keyword or browse by tag"
						body={
							<div>
								{/* Search Section */}
								<div class={css({ mb: "6" })}>
									<Text
										size="sm"
										class={css({
											fontWeight: "semibold",
											mb: "3",
											display: "block",
											color: "fg",
										})}
									>
										Search Articles
									</Text>
									<form
										action="/blog"
										method="GET"
										class={css({
											display: "flex",
											flexDirection: "column",
											gap: "3",
										})}
									>
										<div class={css({ position: "relative" })}>
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
													<title>Search</title>
													<circle cx="11" cy="11" r="8" />
													<path d="m21 21-4.3-4.3" />
												</svg>
											</div>
											<input
												type="search"
												name="q"
												placeholder="Type to search..."
												value={searchQuery}
												autofocus
												class={css({
													width: "full",
													pl: "10",
													pr: "4",
													py: "3",
													borderWidth: "2px",
													borderRadius: "lg",
													bg: "bg",
													color: "fg",
													borderColor: "border",
													fontSize: "lg",
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
										<Stack gap="2" justify="flex-end">
											{searchQuery && (
												<a href="/blog" style={{ textDecoration: "none" }}>
													<Button variant="plain" size="sm">
														Clear
													</Button>
												</a>
											)}
											<Button type="submit" variant="solid" colorPalette="blue">
												Apply
											</Button>
										</Stack>
									</form>
								</div>

								{/* Divider */}
								<div
									class={css({
										my: "6",
										borderTopWidth: "1px",
										borderColor: "border.subtle",
									})}
								/>

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

								{/* Active Filters */}
								{searchQuery && (
									<div
										class={css({
											mt: "6",
											pt: "6",
											borderTopWidth: "1px",
											borderColor: "border.subtle",
										})}
									>
										<Text
											size="sm"
											class={css({
												color: "fg.muted",
												mb: "3",
												fontWeight: "medium",
												textTransform: "uppercase",
												letterSpacing: "wide",
												fontSize: "xs",
											})}
										>
											Active Filters
										</Text>
										<Stack gap="2" align="center" wrap="wrap">
											<Badge
												variant="subtle"
												colorPalette="blue"
												class={css({
													px: "3",
													py: "1.5",
													borderRadius: "full",
												})}
											>
												Search: "{searchQuery}"
											</Badge>
											<a href="/blog" style={{ textDecoration: "none" }}>
												<Button variant="plain" size="sm" colorPalette="red">
													Clear all
												</Button>
											</a>
										</Stack>
									</div>
								)}
							</div>
						}
					/>
				</Stack>
			</section>

			{/* Posts Grid */}
			{filteredPosts.length === 0 && (
				<div
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
			)}

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
				{filteredPosts.map((post, index) => (
					<Card
						key={post.slug}
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
									<Stack
										gap="0"
										align="center"
										justify="center"
										class={css({
											w: "9",
											h: "9",
											borderRadius: "full",
											bg: "blue.9",
											color: "white",
											fontSize: "sm",
											fontWeight: "semibold",
											flexShrink: "0",
										})}
									>
										{post.author?.charAt(0).toUpperCase() || "A"}
									</Stack>
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
