import { css, cx } from "design-system/css";
import { button } from "design-system/recipes";
import type { DocSummary, DocsConfig, DocsNavLinkConfig } from "../lib/docs";
import { Anchor, Drawer, Heading, IconButton, Search, Stack, Text } from "./ui";

interface DocsLayoutProps {
	docs: DocSummary[];
	/** Sidenav grouping/ordering — loaded from the DocsConfig singleton
	 * (content/config/docs.json) by the route, not hardcoded per collection. */
	config: DocsConfig;
	activeSlug?: string;
	children?: unknown;
}

function isGithubLink(link: DocsNavLinkConfig): boolean {
	try {
		return new URL(link.href).hostname === "github.com";
	} catch {
		return false;
	}
}

function GitHubIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<title>GitHub</title>
			<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
		</svg>
	);
}

function HamburgerIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Open menu</title>
			<path d="M4 6h16" />
			<path d="M4 12h16" />
			<path d="M4 18h16" />
		</svg>
	);
}

function ExternalLinkIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>External link</title>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
		</svg>
	);
}

// Workaround: HonoX's client hydration snapshots a Drawer island's `children`
// outside of the DrawerContext.Provider that supplies its variant styles, so
// the `placement="start"` prop resets to the "end" default the moment
// hydration runs (verified via SSR vs. post-hydration DOM diff). Force the
// left-docked layout and matching slide direction directly so the sidenav
// drawer keeps opening from the left regardless of that upstream bug.
const sidenavDrawerOverride = css({
	"& [data-part='positioner']": {
		justifyContent: "flex-start",
	},
	"& [data-part='content']": {
		_open: {
			animationName: "slide-from-left-full, fade-in",
		},
		_closed: {
			animationName: "slide-to-left-full, fade-out",
		},
	},
});

interface DocGroup {
	label: string;
	items: DocSummary[];
}

// Fully data-driven: each configured group claims every doc matching its
// `section` and/or `category` filter (both are AND'd when both are set), in
// the order the CMS singleton lists them. Anything no group claims falls into
// a trailing fallback group, so this stays usable for any doc collection
// shape without editing this file.
function buildGroups(docs: DocSummary[], config: DocsConfig): DocGroup[] {
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

interface SidenavProps {
	groups: DocGroup[];
	activeSlug?: string;
	links?: DocsNavLinkConfig[];
}

function Sidenav({ groups, activeSlug, links }: SidenavProps) {
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
									href={`/docs/${doc.slug}`}
									aria-current={isActive ? "page" : undefined}
									class={css({
										display: "block",
										px: "3",
										py: "1.5",
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
								py: "1.5",
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

interface DocsHeaderProps {
	editUrl?: string;
	groups: DocGroup[];
	activeSlug?: string;
	links?: DocsNavLinkConfig[];
	headerLinks?: DocsNavLinkConfig[];
}

function DocsHeader({
	editUrl,
	groups,
	activeSlug,
	links,
	headerLinks,
}: DocsHeaderProps) {
	const githubLink = links?.find(isGithubLink);
	return (
		<header
			class={css({
				borderBottomWidth: "1px",
				borderColor: "border",
				bg: "bg.default",
				position: "sticky",
				top: "0",
				zIndex: "20",
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
					gap: { base: "4", md: "8" },
				})}
			>
				<div class={sidenavDrawerOverride}>
					<Drawer
						placement="start"
						aria-label="Docs navigation"
						trigger={
							<IconButton
								variant="plain"
								size="sm"
								aria-label="Open menu"
								class={css({ display: { base: "flex", md: "none" } })}
							>
								<HamburgerIcon />
							</IconButton>
						}
						body={
							<Sidenav groups={groups} activeSlug={activeSlug} links={links} />
						}
					/>
				</div>

				<Anchor
					href="/"
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
								display: { base: "none", sm: "block" },
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
						placeholder="Search docs..."
						itemLabel="docs"
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
							href={link.href}
							variant="plain"
							class={css({ textStyle: "sm", fontWeight: "medium" })}
						>
							{link.label}
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
							Edit
						</Anchor>
					) : (
						<Anchor
							href={"/admin"}
							class={cx(
								button({ variant: "outline", size: "sm" }),
								css({ textStyle: "sm", fontWeight: "medium" }),
							)}
						>
							Admin
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
		</header>
	);
}

export function DocsLayout({
	docs,
	config,
	activeSlug,
	children,
}: DocsLayoutProps) {
	const groups = buildGroups(docs, config);

	const activeDoc = activeSlug
		? docs.find((doc) => doc.slug === activeSlug)
		: undefined;
	let editUrl: string | undefined;
	if (activeDoc) {
		const cmsCollection =
			config.collections?.find((c) => c.folder === activeDoc.collection)
				?.cmsCollection ?? activeDoc.collection;
		editUrl = `/admin/#/collections/${cmsCollection}/entries/${activeDoc.slug}`;
	}

	return (
		<div class={css({ bg: "bg.canvas", minH: "screen" })}>
			<DocsHeader
				editUrl={editUrl}
				groups={groups}
				activeSlug={activeSlug}
				links={config.links}
				headerLinks={config.headerLinks}
			/>

			<div
				class={css({
					maxWidth: "7xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
					py: { base: "8", md: "12" },
					display: "flex",
					alignItems: "flex-start",
					gap: "10",
				})}
			>
				<aside
					class={css({
						display: { base: "none", md: "block" },
						width: "64",
						flexShrink: "0",
						position: "sticky",
						top: "6",
						maxH: "calc(100vh - 3rem)",
						overflowY: "auto",
					})}
				>
					<Sidenav
						groups={groups}
						activeSlug={activeSlug}
						links={config.links}
					/>
				</aside>

				<main class={css({ flex: "1", minWidth: "0" })}>
					{activeDoc && (
						// Bigger than the content's own h1s (markdownContentClass fixes
						// those at "2xl") so the page title reads as a distinct, higher
						// level of hierarchy rather than just another section heading.
						// Deliberately a flat literal size, not a responsive object: this
						// repo's staticCss config can't statically generate responsive
						// recipe-variant classes (no `jsx: [...]` mapping — see
						// panda.config.ts's staticCss.recipes comment), so a `{ base, md }`
						// value here renders the right classes in HTML but with no
						// matching CSS ever emitted for the breakpoint-scoped one.
						<Heading as="h1" size="3xl" class={css({ mb: "6" })}>
							{activeDoc.title}
						</Heading>
					)}
					{children}
				</main>
			</div>
		</div>
	);
}
