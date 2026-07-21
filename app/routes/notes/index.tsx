import { css, cx } from "design-system/css";
import { createRoute } from "honox/factory";
import {
	Anchor,
	Badge,
	Card,
	Heading,
	Search,
	Stack,
	Text,
} from "../../components/ui";
import { EditIcon } from "../../icons/edit";
import { PinIcon } from "../../icons/pin";
import { PlusIcon } from "../../icons/plus";
import { SearchIcon } from "../../icons/search";
import { type DocsNavLinkConfig, loadDocsConfig } from "../../lib/configs";
import { loadNotes, type Note, type NoteColor } from "../../lib/notes";
import { filterEntries } from "../../utils/search";

// One literal css() call per color — each call's argument must stay a literal
// object for Panda's static extractor to see it (see NOTE_COLORS in
// lib/notes.ts); looking a token up dynamically inside css() would not.
const ACCENT_BORDER_CLASS: Record<NoteColor, string> = {
	default: css({ borderLeftColor: "border" }),
	gray: css({ borderLeftColor: "gray.9" }),
	red: css({ borderLeftColor: "red.9" }),
	orange: css({ borderLeftColor: "orange.9" }),
	green: css({ borderLeftColor: "green.9" }),
	cyan: css({ borderLeftColor: "cyan.9" }),
	blue: css({ borderLeftColor: "blue.9" }),
	purple: css({ borderLeftColor: "purple.9" }),
};

// Site header — same shape/data as the blog and docs headers (all three read
// the "configs" CMS singleton's `headerLinks`), kept as a local, un-DRY copy
// rather than a shared component (see app/routes/blog/index.tsx).
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

function NotesHeader({
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

type View = "active" | "archived" | "all";

const VIEWS: { value: View; label: string }[] = [
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
	{ value: "all", label: "All" },
];

function NoteCard({ note }: { note: Note }) {
	const accentPalette = note.color === "default" ? "gray" : note.color;

	return (
		<div data-note-slug={note.slug}>
			<Card
				variant="outline"
				class={cx(
					css({
						borderLeftWidth: "4px",
						transition: "all 0.2s",
						height: "full",
						_hover: { shadow: "md", transform: "translateY(-2px)" },
					}),
					ACCENT_BORDER_CLASS[note.color],
				)}
				headerClass={css({ pb: "0" })}
				bodyClass={css({ pt: "3" })}
				title={
					<Stack
						direction="horizontal"
						align="center"
						justify="space-between"
						gap="2"
					>
						<Anchor
							href={`/notes/${note.slug}`}
							class={css({
								color: "fg",
								textDecoration: "none",
								_hover: { color: "blue.10" },
							})}
						>
							{note.title}
						</Anchor>
						{note.pinned && (
							<PinIcon
								width="16"
								height="16"
								class={css({ color: "fg.muted", flexShrink: "0" })}
							/>
						)}
					</Stack>
				}
				footer={
					<Stack
						direction="horizontal"
						align="center"
						justify="space-between"
						gap="2"
						class={css({
							pt: "3",
							borderTopWidth: "1px",
							borderColor: "border.subtle",
							width: "full",
						})}
					>
						<Text size="xs" class={css({ color: "fg.muted" })}>
							{note.updated
								? new Date(note.updated).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})
								: ""}
						</Text>
						<a
							href={`/admin/#/collections/notes/entries/${note.slug}`}
							class={css({
								display: "inline-flex",
								alignItems: "center",
								gap: "1",
								color: "fg.muted",
								textDecoration: "none",
								fontSize: "xs",
								_hover: { color: "fg" },
							})}
						>
							<EditIcon width="14" height="14" />
							Edit
						</a>
					</Stack>
				}
			>
				{note.excerpt && (
					<Text
						size="sm"
						class={css({
							color: "fg.muted",
							mb: "3",
							lineHeight: "relaxed",
							display: "-webkit-box",
							overflow: "hidden",
							WebkitBoxOrient: "vertical",
							WebkitLineClamp: "4",
						})}
					>
						{note.excerpt}
					</Text>
				)}
				{note.tags.length > 0 && (
					<Stack gap="2" wrap="wrap">
						{note.tags.map((tag) => (
							<Badge
								key={tag}
								variant="subtle"
								colorPalette={accentPalette}
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
					</Stack>
				)}
			</Card>
		</div>
	);
}

function NoteGrid({ notes }: { notes: Note[] }) {
	return (
		<div
			class={css({
				display: "grid",
				gridTemplateColumns: {
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				},
				gap: "5",
			})}
		>
			{notes.map((note) => (
				<NoteCard key={note.slug} note={note} />
			))}
		</div>
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
	const [{ notes: allNotes, searchEntries, tags }, config] = await Promise.all([
		loadNotes(currentLocale),
		loadDocsConfig(),
	]);

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

	const url = new URL(c.req.url);
	const searchQuery = url.searchParams.get("q") || "";
	const view: View = (["active", "archived", "all"] as const).includes(
		url.searchParams.get("view") as View,
	)
		? (url.searchParams.get("view") as View)
		: "active";

	const viewNotes = allNotes.filter((note) => {
		if (view === "active") return !note.archived;
		if (view === "archived") return note.archived;
		return true;
	});

	// Server-side filtering for the no-JS ?q= fallback. All notes in the
	// current view are still rendered (non-matches hidden) so the Search
	// island can broaden results client-side without a round-trip.
	const matchedSlugs = new Set(
		filterEntries(
			searchEntries.filter((entry) =>
				viewNotes.some((note) => note.slug === entry.key),
			),
			searchQuery,
		).map((entry) => entry.key),
	);

	const pinnedNotes = viewNotes.filter((note) => note.pinned);
	const otherNotes = viewNotes.filter((note) => !note.pinned);

	return c.render(
		<>
			<title>
				{currentLocale === "zh" ? "笔记 - Artefact" : "Notes - Artefact"}
			</title>

			<NotesHeader
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
				<Stack
					direction="horizontal"
					align="flex-start"
					justify="space-between"
					wrap="wrap"
					gap="4"
					class={css({ mb: "8" })}
				>
					<div>
						<Heading as="h1" size="2xl" class={css({ mb: "2" })}>
							Notes
						</Heading>
						<Text class={css({ color: "fg.muted", maxWidth: "2xl" })}>
							Quick notes, checklists, and reminders — created and edited
							through the CMS.
						</Text>
					</div>
					<a
						href="/admin/#/collections/notes/new"
						class={css({ textDecoration: "none" })}
					>
						<Stack
							direction="horizontal"
							align="center"
							gap="2"
							class={css({
								px: "4",
								py: "2.5",
								borderRadius: "lg",
								bg: "colorPalette.9",
								color: "white",
								colorPalette: "blue",
								fontSize: "sm",
								fontWeight: "medium",
								transition: "all 0.2s",
								_hover: { bg: "colorPalette.10" },
							})}
						>
							<PlusIcon width="18" height="18" />
							New Note
						</Stack>
					</a>
				</Stack>

				{/* Search + View filter */}
				<Stack
					gap="4"
					align="flex-start"
					justify="space-between"
					wrap="wrap"
					class={css({ mb: "8" })}
				>
					<div class={css({ flex: "1", minWidth: "260px" })}>
						<Search
							src="/api/notes/search.json"
							action="/notes"
							initialQuery={searchQuery}
							placeholder="Search notes..."
							itemLabel="notes"
							total={viewNotes.length}
							filterAttribute="data-note-slug"
							emptyStateId="notes-search-empty"
						/>
					</div>

					<Stack
						direction="horizontal"
						gap="1"
						class={css({
							p: "1",
							bg: "gray.subtle.bg",
							borderRadius: "lg",
						})}
					>
						{VIEWS.map((item) => {
							const params = new URLSearchParams();
							if (searchQuery) params.set("q", searchQuery);
							if (item.value !== "active") params.set("view", item.value);
							const qs = params.toString();
							const isActive = item.value === view;
							return (
								<a
									key={item.value}
									href={`/notes${qs ? `?${qs}` : ""}`}
									aria-current={isActive ? "page" : undefined}
									class={css({
										px: "3",
										py: "1.5",
										borderRadius: "md",
										fontSize: "sm",
										fontWeight: "medium",
										textDecoration: "none",
										color: isActive ? "fg" : "fg.muted",
										bg: isActive ? "bg" : "transparent",
										shadow: isActive ? "sm" : "none",
										transition: "all 0.15s",
										_hover: { color: "fg" },
									})}
								>
									{item.label}
								</a>
							);
						})}
					</Stack>
				</Stack>

				{tags.length > 0 && (
					<Stack gap="2" wrap="wrap" class={css({ mb: "8" })}>
						{tags.map((tag) => (
							<Badge
								key={tag}
								variant="subtle"
								colorPalette="gray"
								size="sm"
								class={css({ borderRadius: "full", px: "2.5" })}
							>
								{tag}
							</Badge>
						))}
					</Stack>
				)}

				{/* Empty state — visibility is toggled by the notes-search island */}
				<div
					id="notes-search-empty"
					hidden={matchedSlugs.size !== 0}
					class={css({ textAlign: "center", py: "20", px: "4" })}
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
						No notes found
					</Heading>
					<Text
						class={css({
							color: "fg.muted",
							maxWidth: "md",
							mx: "auto",
							lineHeight: "relaxed",
						})}
					>
						{view === "active" && viewNotes.length === 0
							? "Nothing here yet — create your first note in the CMS."
							: "Try adjusting your search or switching views."}
					</Text>
				</div>

				{pinnedNotes.length > 0 && (
					<section class={css({ mb: "10" })}>
						<Text
							size="xs"
							class={css({
								fontWeight: "semibold",
								textTransform: "uppercase",
								letterSpacing: "wide",
								color: "fg.muted",
								mb: "3",
								display: "block",
							})}
						>
							Pinned
						</Text>
						<NoteGrid notes={pinnedNotes} />
					</section>
				)}

				{otherNotes.length > 0 && (
					<section>
						{pinnedNotes.length > 0 && (
							<Text
								size="xs"
								class={css({
									fontWeight: "semibold",
									textTransform: "uppercase",
									letterSpacing: "wide",
									color: "fg.muted",
									mb: "3",
									display: "block",
								})}
							>
								Others
							</Text>
						)}
						<NoteGrid notes={otherNotes} />
					</section>
				)}
			</div>
		</>,
	);
});
