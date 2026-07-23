import { css, cx } from "design-system/css";
import { button } from "design-system/recipes";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { LanguageSwitcher } from "../../../components/language-switcher";
import {
	Anchor,
	Avatar,
	Badge,
	Button,
	Card,
	Heading,
	Layout,
	Search,
	Stack,
	Text,
} from "../../../components/ui";
import { ArrowLeftIcon } from "../../../icons/arrow-left";
import { ArrowRightIcon } from "../../../icons/arrow-right";
import { CheckIcon } from "../../../icons/check";
import { TagIcon } from "../../../icons/tag";
import { DEFAULT_DOCS_UI, loadDocsConfig } from "../../../lib/configs";
import {
	BLOG_SEARCH_STRINGS,
	detectLocale,
	localiseHref,
} from "../../../lib/i18n";
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
		const currentLocale = detectLocale(c.req.path);
		const localiseLink = (href: string) => localiseHref(href, currentLocale);
		const searchStrings =
			BLOG_SEARCH_STRINGS[currentLocale] ?? BLOG_SEARCH_STRINGS.en;

		const [{ posts, tags }, config] = await Promise.all([
			loadPosts(currentLocale),
			loadDocsConfig(currentLocale),
		]);
		const blogPosts = posts.filter((post) => post.tags.includes(tagFilter));
		const docsUi = { ...DEFAULT_DOCS_UI, ...config.docsUi };

		return c.render(
			<>
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
								as="span"
								class={css({
									fontSize: "lg",
									fontWeight: "bold",
									tracking: "tight",
								})}
							>
								{config.home?.brandName ?? "Artefact UI"}
							</Heading>
						</Anchor>

						<nav
							class={css({
								display: "flex",
								gap: { base: "3", md: "6" },
								alignItems: "center",
							})}
						>
							{config.headerLinks?.map((link) => (
								<Anchor
									key={link.href}
									href={localiseLink(link.href)}
									variant="plain"
									class={css({ textStyle: "sm", fontWeight: "medium" })}
								>
									{link.label}
								</Anchor>
							))}
							<Anchor
								href="/admin"
								class={cx(
									button({ variant: "outline", size: "sm" }),
									css({ textStyle: "sm", fontWeight: "medium" }),
								)}
							>
								{docsUi.admin}
							</Anchor>
							<LanguageSwitcher
								currentPath={c.req.path}
								currentLocale={currentLocale}
							/>
						</nav>
					</div>
				</header>
				<Layout
				class={css({
					py: { base: "8", md: "12" },
					px: { base: "4", md: "6", lg: "8" },
					maxWidth: "7xl",
					width: "full",
					mx: "auto",
				})}
				headerClass={css({
					textAlign: "center",
					mb: "12",
					position: "relative",
				})}
				footerClass={css({ mt: "16", textAlign: "center" })}
				header={
					<>
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

						{/* Back Button */}
						<div class={css({ mb: "6", textAlign: "left" })}>
							<a href={localiseLink("/blog")} style={{ textDecoration: "none" }}>
								<Button
									variant="plain"
									colorPalette="blue"
									class={css({
										px: "4",
										_hover: { bg: "blue.3" },
									})}
								>
									<ArrowLeftIcon
										width="16"
										height="16"
										style={{ marginRight: "8px" }}
									/>
									All Posts
								</Button>
							</a>
						</div>

						<Stack
							gap="0"
							align="center"
							justify="center"
							class={css({
								w: "20",
								h: "20",
								mx: "auto",
								mb: "6",
								bgGradient: "to-r",
								gradientFrom: "blue.9",
								gradientTo: "purple.9",
								borderRadius: "2xl",
								shadow: "lg",
								position: "relative",
								"&::before": {
									content: '""',
									position: "absolute",
									inset: "0",
									borderRadius: "2xl",
									bgGradient: "to-r",
									gradientFrom: "blue.8",
									gradientTo: "purple.8",
									opacity: "0",
									transition: "opacity 0.3s",
								},
								_hover: {
									"&::before": {
										opacity: "1",
									},
								},
							})}
						>
							<TagIcon
								width="36"
								height="36"
								stroke="white"
								style={{ position: "relative", zIndex: "1" }}
							/>
						</Stack>

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
							🏷️ Tagged Posts
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
								color: "transparent",
							})}
						>
							{tagFilter}
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
							Showing {blogPosts.length} article
							{blogPosts.length !== 1 ? "s" : ""} tagged with "{tagFilter}"
						</Text>
					</>
				}
				content={
					<>
						<title>{`Posts tagged: ${tagFilter} - Artefact Blog`}</title>

						{/* Search (island) — global autocomplete over /api/posts/search.json */}
						<section class={css({ mb: "8", maxWidth: "xl", mx: "auto" })}>
							<Search
								locale={currentLocale}
								placeholder={searchStrings.placeholderAll}
								itemLabel={searchStrings.itemLabel}
								showCount={false}
								syncUrl={false}
							/>
						</section>

						{/* Tag filter chips */}
						{tags.length > 0 && (
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
									<a href={localiseLink("/blog")} style={{ textDecoration: "none" }}>
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
											href={localiseLink(`/blog/by-tag/${tag}`)}
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
													<CheckIcon
														width="14"
														height="14"
														stroke-width="2.5"
														style={{
															marginRight: "6px",
															verticalAlign: "middle",
														}}
													/>
												)}
												{tag}
											</Badge>
										</a>
									))}
								</Stack>
							</section>
						)}

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
										gradientFrom: "blue.3",
										gradientTo: "purple.3",
										borderRadius: "full",
										animation: "pulse",
										shadow: "lg",
									})}
								>
									<TagIcon
										width="48"
										height="48"
										stroke-width="1.5"
										class={css({ color: "fg.muted" })}
									/>
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
									No posts found with tag "<strong>{tagFilter}</strong>". Try
									browsing all tags or check back later.
								</Text>
								<div class={css({ mt: "8" })}>
									<a href={localiseLink("/blog")} style={{ textDecoration: "none" }}>
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
											borderColor: "blue.7",
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
												<Anchor
													href={localiseLink(`/blog/by-author/${post.author}`)}
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
														name={post.author}
														class={css({ shadow: "sm" })}
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
																fontWeight: "semibold",
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
												href={localiseLink(`/blog/${post.slug}`)}
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
													<ArrowRightIcon width="16" height="16" />
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
													</Anchor>
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
					</>
				}
				footer={
					blogPosts.length > 0 ? (
						<a href={localiseLink("/blog")} style={{ textDecoration: "none" }}>
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
								<ArrowLeftIcon
									width="18"
									height="18"
									style={{ marginRight: "8px" }}
								/>
								Back to All Posts
							</Button>
						</a>
					) : undefined
				}
			/>
			</>,
		);
	},
);
