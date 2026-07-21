import { css, cx } from "design-system/css";
import { button } from "design-system/recipes";
import { createRoute } from "honox/factory";
import {
	Anchor,
	Card,
	Heading,
	Layout,
	type LayoutProps,
	Search,
	Stack,
	Text,
} from "../../components/ui";
import { ChevronDownIcon as ChevronDownIconImport } from "../../icons/chevron-down";
import { ExternalLinkIcon as ExternalLinkIconImport } from "../../icons/external-link";
import { GitHubIcon as GitHubIconImport } from "../../icons/github";
import {
	type DocsConfig,
	type DocsNavLinkConfig,
	loadDocsConfig,
} from "../../lib/configs";
import { type DocSummary, loadDocs } from "../../lib/docs";

// ---------------------------------------------------------------------------
// Inlined docs nav shell.
//
// Previously extracted into `app/components/docs-nav.tsx` and imported by every
// docs route. Intentionally un-DRY now: the header, sidenav and shell styling
// live directly in this page so there is no shared nav component to import.
// (Only the pure data types come from `lib/docs.ts` — importing a type is not
// importing a component.)
// ---------------------------------------------------------------------------

function isGithubLink(link: DocsNavLinkConfig): boolean {
	try {
		return new URL(link.href).hostname === "github.com";
	} catch {
		return false;
	}
}

const GitHubIcon = () => <GitHubIconImport width="20" height="20" />;
const ChevronDownIcon = () => <ChevronDownIconImport width="16" height="16" />;
const ExternalLinkIcon = () => (
	<ExternalLinkIconImport width="16" height="16" />
);

interface DocGroup {
	label: string;
	items: DocSummary[];
}

// Fully data-driven: each configured group claims every doc matching its
// `section` and/or `category` filter (both are AND'd when both are set), in
// the order the CMS singleton lists them. Anything no group claims falls into
// a trailing fallback group, so this stays usable for any doc collection
// shape without editing this file.
function buildDocGroups(docs: DocSummary[], config: DocsConfig): DocGroup[] {
	const claimed = new Set<string>();

	const groups = config.groups
		.map((groupConfig) => {
			const items = docs.filter((doc) => {
				if (groupConfig.section && doc.section !== groupConfig.section) {
					return false;
				}
				if (groupConfig.category && doc.category !== groupConfig.category) {
					return false;
				}
				return true;
			});
			for (const doc of items) claimed.add(doc.slug);
			return { label: groupConfig.label, items };
		})
		.filter((group) => group.items.length > 0);

	const unclaimed = docs.filter((doc) => !claimed.has(doc.slug));
	if (unclaimed.length > 0) {
		groups.push({
			label: config.fallbackLabel || "Other",
			items: unclaimed,
		});
	}

	return groups;
}

interface DocsSidenavProps {
	groups: DocGroup[];
	activeSlug?: string;
	links?: DocsNavLinkConfig[];
	currentLocale?: string;
}

function DocsSidenav({
	groups,
	activeSlug,
	links,
	currentLocale = "en",
}: DocsSidenavProps) {
	const localiseLink = (href: string) => {
		if (
			currentLocale === "zh" &&
			!href.startsWith("/zh") &&
			href.startsWith("/")
		) {
			return `/zh${href}`;
		}
		return href;
	};

	return (
		<nav
			class={css({
				display: "flex",
				flexDirection: "column",
				gap: "6",
			})}
		>
			{groups.map((group) => (
				<div key={group.label}>
					<Text
						size="xs"
						class={css({
							fontWeight: "semibold",
							textTransform: "uppercase",
							letterSpacing: "wide",
							color: "fg.muted",
							mb: "2",
							display: "block",
						})}
					>
						{group.label}
					</Text>
					<div
						class={css({
							display: "flex",
							flexDirection: "column",
							gap: "0.5",
						})}
					>
						{group.items.map((doc) => {
							const isActive = doc.slug === activeSlug;
							return (
								<a
									key={doc.slug}
									href={localiseLink(`/docs/${doc.slug}`)}
									aria-current={isActive ? "page" : undefined}
									class={css({
										display: "block",
										px: "3",
										// ~44px touch target on mobile; compact on desktop
										py: { base: "2.5", md: "1.5" },
										borderRadius: "md",
										fontSize: "sm",
										textDecoration: "none",
										color: isActive ? "fg" : "fg.muted",
										bg: isActive ? "blue.4" : "transparent",
										fontWeight: isActive ? "semibold" : "normal",
										_hover: {
											bg: isActive ? "blue.4" : "bg.subtle",
											color: "fg",
										},
									})}
								>
									{doc.title}
								</a>
							);
						})}
					</div>
				</div>
			))}
			{links && links.length > 0 && (
				<div
					class={css({
						borderTopWidth: "1px",
						borderColor: "border",
						pt: "4",
						display: "flex",
						flexDirection: "column",
						gap: "0.5",
					})}
				>
					{links.map((link) => (
						<Anchor
							key={link.href}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							variant="plain"
							class={css({
								display: "flex",
								alignItems: "center",
								gap: "2",
								px: "3",
								py: { base: "2.5", md: "1.5" },
								borderRadius: "md",
								fontSize: "sm",
								textDecoration: "none",
								color: "fg.muted",
								_hover: {
									bg: "bg.subtle",
									color: "fg",
								},
							})}
						>
							{isGithubLink(link) ? <GitHubIcon /> : <ExternalLinkIcon />}
							{link.label}
						</Anchor>
					))}
				</div>
			)}
		</nav>
	);
}

// Mobile sidenav: a native <details> disclosure bar attached under the header
// row instead of a Drawer overlay. Zero JS / no island, so it works before
// hydration and without JS at all — and since every doc link is a full-page
// MPA navigation, the collapsed-after-navigation state of an in-flow
// disclosure is the natural resting position rather than a bug to fight.
function MobileNav({ groups, activeSlug, links }: DocsSidenavProps) {
	return (
		<details
			class={css({
				display: { base: "block", md: "none" },
				borderTopWidth: "1px",
				borderColor: { _light: "white.a4", _dark: "black.a4" },
				"& summary svg": {
					transition: "transform 0.2s",
				},
				// Explicit [open] selector: Panda's _open condition targets
				// data-state attrs, not the native <details> open attribute.
				"&[open] summary svg": {
					transform: "rotate(180deg)",
				},
			})}
		>
			<summary
				class={css({
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "2",
					px: "4",
					py: "3",
					fontSize: "sm",
					fontWeight: "medium",
					cursor: "pointer",
					userSelect: "none",
					listStyle: "none",
					"&::-webkit-details-marker": {
						display: "none",
					},
				})}
			>
				Menu
				<ChevronDownIcon />
			</summary>
			<div
				class={css({
					maxH: "60vh",
					overflowY: "auto",
					px: "4",
					pb: "4",
				})}
			>
				<DocsSidenav groups={groups} activeSlug={activeSlug} links={links} />
			</div>
		</details>
	);
}

function getLocaleToggleUrl(
	currentPath: string,
	targetLocale: "en" | "zh",
): string {
	if (targetLocale === "zh") {
		if (currentPath.startsWith("/zh")) {
			return currentPath;
		}
		return currentPath === "/" ? "/zh" : `/zh${currentPath}`;
	} else {
		if (currentPath.startsWith("/zh")) {
			const rest = currentPath.slice(3);
			return rest === "" ? "/" : rest;
		}
		return currentPath;
	}
}

interface DocsHeaderProps {
	editUrl?: string;
	groups: DocGroup[];
	activeSlug?: string;
	links?: DocsNavLinkConfig[];
	headerLinks?: DocsNavLinkConfig[];
	currentPath: string;
	currentLocale: string;
}

function DocsHeader({
	editUrl,
	groups,
	activeSlug,
	links,
	headerLinks,
	currentPath,
	currentLocale,
}: DocsHeaderProps) {
	const githubLink = links?.find(isGithubLink);
	const localiseLink = (href: string) => {
		if (
			currentLocale === "zh" &&
			!href.startsWith("/zh") &&
			href.startsWith("/")
		) {
			return `/zh${href}`;
		}
		return href;
	};

	return (
		<>
			<div
				class={css({
					maxWidth: "7xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
					py: "4",
					display: "flex",
					alignItems: "center",
					gap: { base: "4", md: "8" },
				})}
			>
				<Anchor
					href={localiseLink("/")}
					variant="plain"
					class={css({ textDecoration: "none", flexShrink: "0" })}
				>
					<Stack direction="horizontal" gap="3" align="center">
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
					</Stack>
				</Anchor>

				<div
					class={css({
						flex: "1",
						maxWidth: "md",
						mx: { base: "0", md: "auto" },
					})}
				>
					<Search
						src="/api/docs/search.json"
						placeholder={
							currentLocale === "zh" ? "搜索文档..." : "Search docs..."
						}
						itemLabel={currentLocale === "zh" ? "文档" : "docs"}
						showCount={false}
						syncUrl={false}
					/>
				</div>

				<nav
					class={css({
						display: { base: "none", md: "flex" },
						gap: "6",
						alignItems: "center",
						flexShrink: "0",
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
					{editUrl ? (
						<Anchor
							href={editUrl}
							class={cx(
								button({ variant: "outline", size: "sm" }),
								css({ textStyle: "sm", fontWeight: "medium" }),
							)}
						>
							{currentLocale === "zh" ? "编辑" : "Edit"}
						</Anchor>
					) : (
						<Anchor
							href={"/admin"}
							class={cx(
								button({ variant: "outline", size: "sm" }),
								css({ textStyle: "sm", fontWeight: "medium" }),
							)}
						>
							{currentLocale === "zh" ? "内容管理" : "Admin"}
						</Anchor>
					)}
					{currentLocale === "zh" ? (
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
					) : (
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
					{githubLink && (
						<Anchor
							href={githubLink.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="View on GitHub"
							class={cx(
								button({ variant: "plain", size: "sm" }),
								css({ px: "0" }),
							)}
						>
							<GitHubIcon />
						</Anchor>
					)}
				</nav>
			</div>

			<MobileNav groups={groups} activeSlug={activeSlug} links={links} />
		</>
	);
}

/** Shared `<Layout>` props for the docs shell, so every docs route renders
 * the identical frame: viewport-filling canvas, sticky glass header, and a
 * sticky sider rail that hides below `md` (the header's <details> menu takes
 * over there). Spread first, then pass the route's header/sider/content. */
const docsShellProps = {
	fullHeight: true,
	stickyHeader: true,
	stickySider: true,
	siderHideBelow: "md",
	class: css({ bg: "bg.canvas" }),
	headerClass: css({
		borderBottomWidth: "1px",
		borderColor: { _light: "white.a4", _dark: "black.a4" },
		bg: { _light: "white.a7", _dark: "black.a7" },
		backdropFilter: "blur(20px) saturate(180%)",
		boxShadow: {
			_light:
				"inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 4px 30px rgba(0, 0, 0, 0.03)",
			_dark:
				"inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 4px 30px rgba(0, 0, 0, 0.2)",
		},
	}),
	bodyClass: css({
		maxWidth: "7xl",
		width: "full",
		mx: "auto",
		px: { base: "4", md: "6", lg: "8" },
		py: { base: "8", md: "12" },
		gap: "10",
	}),
	// The sider top clears the sticky glass header (~4.5rem tall) plus a gap
	// so the first nav group isn't blurred behind it while scrolling.
	siderClass: css({
		top: "24",
		maxH: "calc(100vh - 7rem)",
	}),
} satisfies Partial<LayoutProps>;

export default createRoute(async (c) => {
	const currentPath = c.req.path;
	const currentLocale = currentPath.startsWith("/zh") ? "zh" : "en";
	const [docs, config] = await Promise.all([
		loadDocs(currentLocale),
		loadDocsConfig(),
	]);
	const groups = buildDocGroups(docs, config);

	const localiseLink = (href: string) => {
		if (
			currentLocale === "zh" &&
			!href.startsWith("/zh") &&
			href.startsWith("/")
		) {
			return `/zh${href}`;
		}
		return href;
	};

	return c.render(
		<Layout
			{...docsShellProps}
			header={
				<DocsHeader
					groups={groups}
					links={config.links}
					headerLinks={config.headerLinks}
					currentPath={currentPath}
					currentLocale={currentLocale}
				/>
			}
			sider={
				<DocsSidenav
					groups={groups}
					links={config.links}
					currentLocale={currentLocale}
				/>
			}
			content={
				<>
					<title>
						{currentLocale === "zh" ? "文档 - Artefact" : "Docs - Artefact"}
					</title>

					<Heading as="h1" size="2xl" class={css({ mb: "3" })}>
						{currentLocale === "zh" ? "官方文档" : "Documentation"}
					</Heading>
					<Text class={css({ color: "fg.muted", mb: "10", maxWidth: "2xl" })}>
						{currentLocale === "zh"
							? "Artefact UI 组件套件的使用指南与参考文档。请从侧边栏中选择页面，或直接在下方浏览。"
							: "Guides and component reference for the Artefact UI suite. Pick a page from the sidenav, or jump in below."}
					</Text>

					<div
						class={css({
							display: "grid",
							gridTemplateColumns: {
								base: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(3, 1fr)",
							},
							gap: "4",
						})}
					>
						{docs.map((doc) => (
							<Anchor
								key={doc.slug}
								href={localiseLink(`/docs/${doc.slug}`)}
								variant="plain"
								class={css({ textDecoration: "none" })}
							>
								<Card
									variant="outline"
									class={css({
										height: "full",
										transition: "all 0.2s",
										_hover: {
											borderColor: "blue.4",
											shadow: "md",
											transform: "translateY(-2px)",
										},
									})}
									title={doc.title}
									bodyClass={css({ p: "5" })}
								>
									<Text size="sm" class={css({ color: "fg.muted" })}>
										{doc.category ?? doc.section}
									</Text>
								</Card>
							</Anchor>
						))}
					</div>
				</>
			}
		/>,
	);
});
