import { css } from "design-system/css";
import type { DocSummary } from "../lib/docs";
import { Anchor, Avatar, Heading, Search, Stack, Text } from "./ui";

interface DocsLayoutProps {
	docs: DocSummary[];
	activeSlug?: string;
	children?: unknown;
}

// Sidebar order for component categories; anything uncategorized (or a
// future category not listed here) falls into a trailing "Other" group.
const CATEGORY_ORDER = [
	"Layout",
	"Typography",
	"Navigation",
	"Feedback",
	"Data Display",
	"Forms",
	"Overlays",
];

function DocsHeader() {
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
				<Anchor
					href="/"
					variant="plain"
					class={css({ textDecoration: "none", flexShrink: "0" })}
				>
					<Stack direction="horizontal" gap="3" align="center">
						<Avatar
							name="Artefact UI"
							size="sm"
							variant="solid"
							colorPalette="blue"
						/>
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
					<Anchor
						href="/blog"
						variant="plain"
						class={css({ textStyle: "sm", fontWeight: "medium" })}
					>
						Blog
					</Anchor>
					<Anchor
						href="/"
						variant="plain"
						class={css({ textStyle: "sm", fontWeight: "medium" })}
					>
						Home
					</Anchor>
				</nav>
			</div>
		</header>
	);
}

interface DocGroup {
	label: string;
	items: DocSummary[];
}

function buildGroups(docs: DocSummary[]): DocGroup[] {
	const guides = docs.filter((doc) => doc.section === "Guides");
	const components = docs.filter((doc) => doc.section === "Components");

	const categoryGroups = CATEGORY_ORDER.map((category) => ({
		label: category,
		items: components.filter((doc) => doc.category === category),
	})).filter((group) => group.items.length > 0);

	const uncategorized = components.filter(
		(doc) => !doc.category || !CATEGORY_ORDER.includes(doc.category),
	);

	return [
		...(guides.length > 0 ? [{ label: "Guides", items: guides }] : []),
		...categoryGroups,
		...(uncategorized.length > 0
			? [{ label: "Other", items: uncategorized }]
			: []),
	];
}

export function DocsLayout({ docs, activeSlug, children }: DocsLayoutProps) {
	const groups = buildGroups(docs);

	return (
		<div class={css({ bg: "bg.canvas", minH: "screen" })}>
			<DocsHeader />

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
					</nav>
				</aside>

				<main class={css({ flex: "1", minWidth: "0" })}>{children}</main>
			</div>
		</div>
	);
}
