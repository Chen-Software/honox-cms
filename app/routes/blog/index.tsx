import { css } from "design-system/css";
import { createRoute } from "honox/factory";
import {
	Anchor,
	Avatar,
	Badge,
	Button,
	Card,
	Carousel,
	Heading,
	Popover,
	Search,
	Stack,
	Text,
} from "../../components/ui";
import { ArrowRightIcon } from "../../icons/arrow-right";
import { FilterIcon } from "../../icons/filter";
import { MailIcon } from "../../icons/mail";
import { SearchIcon } from "../../icons/search";
import { type DocsNavLinkConfig, loadDocsConfig } from "../../lib/configs";
import { loadPosts } from "../../lib/posts";
import { filterEntries } from "../../utils/search";

// Site header — same shape/data as the docs section's header (both read the
// "configs" CMS singleton's `headerLinks`), kept as a local, un-DRY copy
// rather than a shared component (see app/routes/docs/index.tsx).
function getLocaleToggleUrl(
	currentPath: string,
	targetLocale: "en" | "zh" | "es",
): string {
	let cleanPath = currentPath;
	if (cleanPath.startsWith("/zh")) {
		cleanPath = cleanPath.slice(3);
	} else if (cleanPath.startsWith("/es")) {
		cleanPath = cleanPath.slice(3);
	}
	if (cleanPath === "") {
		cleanPath = "/";
	}

	if (targetLocale === "en") {
		return cleanPath;
	}
	return cleanPath === "/"
		? `/${targetLocale}`
		: `/${targetLocale}${cleanPath}`;
}

function BlogHeader({
	headerLinks,
	currentPath,
	currentLocale,
}: {
	headerLinks?: DocsNavLinkConfig[];
	currentPath: string;
	currentLocale: string;
}) {
	const localiseLink = (href: string) => {
		if (
			currentLocale !== "en" &&
			!href.startsWith(`/${currentLocale}`) &&
			href.startsWith("/")
		) {
			return `/${currentLocale}${href}`;
		}
		return href;
	};

	return (
		<header
			class={css({
				borderBottomWidth: "1px",
				borderColor: { _light: "white.a4", _dark: "black.a4" },
				bg: { _light: "white.a7", _dark: "black.a7" },
				backdropFilter: "blur(20px) saturate(180%)",
				position: "sticky",
				top: "0",
				zIndex: "10",
			})}
		>
			<div
				class={css({
					maxWidth: "7xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
					py: "4",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "4",
				})}
			>
				<Anchor
					href={localiseLink("/")}
					variant="plain"
					class={css({ textDecoration: "none", flexShrink: "0" })}
				>
					<Heading
						as="h1"
						class={css({
							fontSize: "lg",
							fontWeight: "bold",
							tracking: "tight",
						})}
					>
						Artefact UI
					</Heading>
				</Anchor>

				<nav
					class={css({
						display: "flex",
						gap: { base: "3", md: "6" },
						alignItems: "center",
					})}
				>
					{headerLinks?.map((link) => (
						<Anchor
							key={link.href}
							href={localiseLink(link.href)}
							variant="plain"
							class={css({ textStyle: "sm", fontWeight: "medium" })}
						>
							{currentLocale === "zh" && link.label === "Blog"
								? "博客"
								: currentLocale === "zh" && link.label === "Docs"
									? "文档"
									: link.label}
						</Anchor>
					))}
					<Anchor
						href="/admin"
						variant="plain"
						class={css({ textStyle: "sm", fontWeight: "medium" })}
					>
						{currentLocale === "zh" ? "内容管理" : "Admin"}
					</Anchor>
					{currentLocale !== "en" && (
						<Anchor
							href={getLocaleToggleUrl(currentPath, "en")}
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "medium",
								color: "blue.11",
							})}
						>
							English
						</Anchor>
					)}
					{currentLocale !== "zh" && (
						<Anchor
							href={getLocaleToggleUrl(currentPath, "zh")}
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "medium",
								color: "blue.11",
							})}
						>
							中文
						</Anchor>
					)}
					{currentLocale !== "es" && (
						<Anchor
							href={getLocaleToggleUrl(currentPath, "es")}
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "medium",
								color: "blue.11",
							})}
						>
							Español
						</Anchor>
					)}
				</nav>
			</div>
		</header>
	);
}

export default createRoute(async (c) => {
	const currentPath = c.req.path;
	let currentLocale = "en";
	if (currentPath.startsWith("/zh")) {
		currentLocale = "zh";
	} else if (currentPath.startsWith("/es")) {
		currentLocale = "es";
	}
	const [{ posts: blogPosts, searchEntries, tags }, config] = await Promise.all(
		[loadPosts(currentLocale), loadDocsConfig()],
	);

	const localiseLink = (href: string) => {
		if (
			currentLocale !== "en" &&
			!href.startsWith(`/${currentLocale}`) &&
			href.startsWith("/")
		) {
			return `/${currentLocale}${href}`;
		}
		return href;
	};

	// Get URL parameters for searching
	const url = new URL(c.req.url);
	const searchQuery = url.searchParams.get("q") || "";

	// Server-side filtering for the no-JS ?q= fallback. All posts are still
	// rendered (non-matches hidden) so the Search island can broaden results
	// client-side without a round-trip.
	const matchedSlugs = new Set(
		filterEntries(searchEntries, searchQuery).map((entry) => entry.key),
	);

	// `blogPosts` is already newest-first; a post without a cover has nothing
	// to show in a hero slide, so it's excluded rather than left blank.
	const featuredPosts = blogPosts.filter((post) => post.cover).slice(0, 5);

	return c.render(
		<>
			<title>
				{currentLocale === "zh"
					? "博客 - Artefact"
					: (config.blog?.title ?? "Blog - Artefact")}
			</title>

			<BlogHeader
				headerLinks={config.headerLinks}
				currentPath={currentPath}
				currentLocale={currentLocale}
			/>

			<div
				class={css({
					py: { base: "8", md: "12" },
					px: { base: "4", md: "6", lg: "8" },
					maxWidth: "7xl",
					mx: "auto",
				})}
			>
				{config.blog?.description && (
					<Text class={css({ color: "fg.muted", mb: "8", maxWidth: "2xl" })}>
						{config.blog.description}
					</Text>
				)}

				{/* Featured Posts (latest posts with a cover image) */}
				{featuredPosts.length > 0 && (
					<section class={css({ mb: "10" })}>
						<Carousel.Root
							slideCount={featuredPosts.length}
							autoplay={featuredPosts.length > 1 ? { delay: 6000 } : false}
							pauseOnHover
							loop
							colorPalette="blue"
						>
							<div class={css({ position: "relative" })}>
								<Carousel.ItemGroup
									class={css({
										borderRadius: "3xl",
										overflow: "hidden",
										shadow: "lg",
									})}
								>
									{featuredPosts.map((post, index) => (
										<Carousel.Item index={index}>
											<div
												class={css({
													display: "block",
													position: "relative",
													width: "full",
													height: { base: "80", md: "96" },
												})}
											>
												<a
													href={localiseLink(`/blog/${post.slug}`)}
													class={css({
														position: "absolute",
														inset: "0",
														width: "full",
														height: "full",
														zIndex: "1",
													})}
												>
													<img
														src={post.cover}
														alt={post.title}
														class={css({
															position: "absolute",
															inset: "0",
															width: "full",
															height: "full",
															objectFit: "cover",
														})}
													/>
													<div
														class={css({
															position: "absolute",
															inset: "0",
															bgGradient: "to-t",
															gradientFrom: "black.a10",
															gradientVia: "black.a5",
															gradientTo: "transparent",
														})}
													/>
												</a>
												<div
													class={css({
														position: "absolute",
														insetX: "0",
														bottom: "0",
														p: { base: "6", md: "10" },
														maxWidth: "3xl",
														zIndex: "2",
														pointerEvents: "none",
													})}
												>
													{index === 0 && (
														<Badge
															variant="solid"
															colorPalette="blue"
															size="sm"
															class={css({ mb: "3", pointerEvents: "auto" })}
														>
															{currentLocale === "zh" ? "最新" : "Latest"}
														</Badge>
													)}
													<Heading
														as="h2"
														size="xl"
														class={css({
															mb: "2",
															lineHeight: "tight",
															pointerEvents: "auto",
														})}
													>
														<a
															href={localiseLink(`/blog/${post.slug}`)}
															class={css({
																color: "white",
																textDecoration: "none",
																_hover: { textDecoration: "underline" },
															})}
														>
															{post.title}
														</a>
													</Heading>
													<Text
														class={css({
															color: "white.a11",
															mb: "4",
															display: { base: "none", md: "block" },
															maxWidth: "2xl",
															pointerEvents: "auto",
														})}
													>
														<a
															href={localiseLink(`/blog/${post.slug}`)}
															class={css({
																color: "inherit",
																textDecoration: "none",
															})}
														>
															{post.description}
														</a>
													</Text>
													<Stack
														gap="2.5"
														align="center"
														class={css({ pointerEvents: "auto" })}
													>
														{post.author && (
															<Anchor
																href={localiseLink(
																	`/blog/by-author/${post.author}`,
																)}
																class={css({
																	display: "inline-flex",
																	alignItems: "center",
																	gap: "2.5",
																	textDecoration: "none",
																	color: "white.a12",
																	_hover: { color: "blue.4" },
																})}
															>
																<Avatar
																	size="sm"
																	variant="solid"
																	colorPalette="blue"
																	name={post.author}
																/>
																<Text
																	size="sm"
																	class={css({
																		color: "inherit",
																		fontWeight: "medium",
																	})}
																>
																	{post.author}
																</Text>
															</Anchor>
														)}
														<Text size="sm" class={css({ color: "white.a10" })}>
															{post.author ? "· " : ""}
															{new Date(post.date).toLocaleDateString(
																currentLocale === "zh" ? "zh-CN" : "en-US",
																{
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																},
															)}
															{post.readTime ? ` · ${post.readTime}` : ""}
														</Text>
													</Stack>
												</div>
											</div>
										</Carousel.Item>
									))}
								</Carousel.ItemGroup>

								{featuredPosts.length > 1 && (
									<>
										<Carousel.PrevTrigger
											class={css({
												position: "absolute",
												top: "50%",
												left: "4",
												transform: "translateY(-50%)",
												bg: "black.a7",
												borderColor: "transparent",
												color: "white",
												_hover: { bg: "black.a9" },
											})}
										/>
										<Carousel.NextTrigger
											class={css({
												position: "absolute",
												top: "50%",
												right: "4",
												transform: "translateY(-50%)",
												bg: "black.a7",
												borderColor: "transparent",
												color: "white",
												_hover: { bg: "black.a9" },
											})}
										/>
										<Carousel.IndicatorGroup
											class={css({
												position: "absolute",
												bottom: "4",
												left: "50%",
												transform: "translateX(-50%)",
												bg: "black.a7",
												borderRadius: "full",
												px: "3",
												py: "2",
											})}
										>
											{featuredPosts.map((_, index) => (
												<Carousel.Indicator index={index} />
											))}
										</Carousel.IndicatorGroup>
									</>
								)}
							</div>
						</Carousel.Root>
					</section>
				)}

				{/* Search + Tag Browse */}
				<section class={css({ mb: "8" })}>
					<Stack gap="4" align="flex-start" justify="space-between" wrap="wrap">
						{/* Instant Search (island) — lazily fetches /api/posts/search.json */}
						<div class={css({ flex: "1", minWidth: "260px" })}>
							<Search
								src="/api/posts/search.json"
								action={localiseLink("/blog")}
								initialQuery={searchQuery}
								placeholder={
									currentLocale === "zh" ? "搜索文章..." : "Search articles..."
								}
								itemLabel={currentLocale === "zh" ? "文章" : "articles"}
								total={blogPosts.length}
								filterAttribute="data-post-slug"
								emptyStateId="blog-search-empty"
							/>
						</div>

						{/* Tag Browse Button */}
						<Popover
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
									<FilterIcon width="18" height="18" />
									{currentLocale === "zh" ? "浏览标签" : "Browse tags"}
								</Button>
							}
							title={currentLocale === "zh" ? "浏览标签" : "Browse by Tag"}
							description={
								currentLocale === "zh"
									? "快速跳转到标签存档"
									: "Jump to a tag archive"
							}
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
											{currentLocale === "zh" ? "按标签过滤" : "Filter by Tag"}
										</Text>
										<Stack direction="column" gap="1">
											{[currentLocale === "zh" ? "全部" : "All", ...tags].map(
												(tag) => {
													const realTag =
														tag === "全部" || tag === "All" ? "All" : tag;
													const href =
														realTag === "All"
															? localiseLink("/blog")
															: localiseLink(`/blog/by-tag/${realTag}`);

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
												},
											)}
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
						<SearchIcon
							width="40"
							height="40"
							stroke-width="1.5"
							class={css({ color: "fg.muted" })}
						/>
					</Stack>
					<Heading as="h3" size="xl" class={css({ mb: "3" })}>
						{currentLocale === "zh" ? "未找到相关文章" : "No articles found"}
					</Heading>
					<Text
						class={css({
							color: "fg.muted",
							maxWidth: "md",
							mx: "auto",
							lineHeight: "relaxed",
						})}
					>
						{currentLocale === "zh"
							? "请调整搜索词或过滤器，以找到您需要的内容。"
							: "Try adjusting your search or filter to find what you're looking for."}
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
										href={localiseLink(`/blog/${post.slug}`)}
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
											<Anchor
												href={localiseLink(`/blog/by-author/${post.author}`)}
												class={css({
													display: "inline-flex",
													alignItems: "center",
													textDecoration: "none",
												})}
											>
												<Avatar
													size="sm"
													variant="solid"
													colorPalette="blue"
													name={post.author}
												/>
											</Anchor>
											<div>
												<Anchor
													href={localiseLink(`/blog/by-author/${post.author}`)}
													class={css({
														textDecoration: "none",
														color: "fg",
														_hover: { color: "blue.10" },
													})}
												>
													<Text
														size="sm"
														class={css({
															fontWeight: "medium",
															lineHeight: "tight",
															display: "block",
															color: "inherit",
														})}
													>
														{post.author}
													</Text>
												</Anchor>
												<Stack
													gap="2"
													align="center"
													class={css({ mt: "0.5" })}
												>
													<Text size="xs" class={css({ color: "fg.muted" })}>
														{new Date(post.date).toLocaleDateString(
															currentLocale === "zh" ? "zh-CN" : "en-US",
															{
																month: "short",
																day: "numeric",
																year: "numeric",
															},
														)}
													</Text>
													<Text size="xs" class={css({ color: "fg.muted" })}>
														· {post.readTime}
													</Text>
												</Stack>
											</div>
										</Stack>

										{/* Read More Button */}
										<a
											href={localiseLink(`/blog/${post.slug}`)}
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
												{currentLocale === "zh" ? "阅读更多" : "Read more"}
												<ArrowRightIcon width="14" height="14" />
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
												{currentLocale === "zh" ? "草稿" : "Draft"}
											</Badge>
										</div>
									)}

									{/* Tags */}
									{post.tags.length > 0 && (
										<Stack gap="2" wrap="wrap" class={css({ mb: "3" })}>
											{post.tags.slice(0, 3).map((tag) => (
												<Anchor
													key={tag}
													href={localiseLink(`/blog/by-tag/${tag}`)}
													variant="plain"
													class={css({
														textDecoration: "none",
													})}
												>
													<Badge
														variant="subtle"
														colorPalette="blue"
														size="sm"
														class={css({
															borderRadius: "full",
															px: "2.5",
															py: "0.5",
															fontSize: "xs",
															transition: "all 0.2s",
															_hover: {
																bg: "blue.4",
															},
														})}
													>
														{tag}
													</Badge>
												</Anchor>
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
							<MailIcon width="28" height="28" stroke="white" />
						</Stack>

						<Badge
							variant="subtle"
							colorPalette="blue"
							class={css({ mb: "4", px: "3", py: "1" })}
						>
							📬 Newsletter
						</Badge>

						<Heading as="h2" size="xl" class={css({ mb: "3" })}>
							{config.blog?.newsletterHeading ?? "Stay Updated"}
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
							{config.blog?.newsletterDescription ??
								"Get the latest articles and insights delivered straight to your inbox. No spam, just good content."}
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
									<MailIcon width="20" height="20" />
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
			</div>
		</>,
	);
});
