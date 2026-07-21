import { css, cx } from "design-system/css";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { Badge, Heading, Stack, Text } from "../../components/ui";
import { ArrowLeftIcon } from "../../icons/arrow-left";
import { EditIcon } from "../../icons/edit";
import { PinIcon } from "../../icons/pin";
import { loadNoteBySlug, loadNotes, type NoteColor } from "../../lib/notes";
import { markdownContentClass } from "../../utils/markdown-content-style";

// See app/routes/notes/index.tsx for why this stays a literal-per-color
// lookup instead of a dynamic css({ borderTopColor: token }) call.
const ACCENT_TOP_CLASS: Record<NoteColor, string> = {
	default: css({ borderTopColor: "border" }),
	gray: css({ borderTopColor: "gray.9" }),
	red: css({ borderTopColor: "red.9" }),
	orange: css({ borderTopColor: "orange.9" }),
	green: css({ borderTopColor: "green.9" }),
	cyan: css({ borderTopColor: "cyan.9" }),
	blue: css({ borderTopColor: "blue.9" }),
	purple: css({ borderTopColor: "purple.9" }),
};

export default createRoute(
	ssgParams(async () => {
		const { notes } = await loadNotes();
		return notes.map((note) => ({ slug: note.slug }));
	}),

	async (c) => {
		const slug = c.req.param("slug");
		const currentPath = c.req.path;
		let currentLocale = "en";
		if (currentPath.startsWith("/zh")) {
			currentLocale = "zh";
		} else if (currentPath.startsWith("/es")) {
			currentLocale = "es";
		}

		const note = await loadNoteBySlug(slug, currentLocale);

		if (!note) {
			return c.notFound();
		}

		const accentPalette = note.color === "default" ? "gray" : note.color;

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

		return c.render(
			<div class={css({ minHeight: "100vh", bg: "bg.subtle" })}>
				<title>
					{note.title} - {currentLocale === "zh" ? "笔记" : "Notes"}
				</title>

				<section
					class={css({
						maxWidth: "3xl",
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
						<a
							href={localiseLink("/notes")}
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
							{currentLocale === "zh" ? "返回笔记" : "Back to Notes"}
						</a>

						<a
							href={`/admin/#/collections/notes/entries/${slug}`}
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
							{currentLocale === "zh" ? "编辑笔记" : "Edit Note"}
						</a>
					</Stack>

					<div
						class={cx(
							css({
								bg: "bg",
								borderRadius: "2xl",
								borderTopWidth: "4px",
								shadow: "lg",
								overflow: "hidden",
								px: { base: "6", md: "10" },
								py: { base: "8", md: "10" },
							}),
							ACCENT_TOP_CLASS[note.color],
						)}
					>
						<Stack
							direction="horizontal"
							align="center"
							gap="3"
							wrap="wrap"
							class={css({ mb: "3" })}
						>
							{note.pinned && (
								<Badge
									variant="subtle"
									colorPalette={accentPalette}
									class={css({
										display: "inline-flex",
										alignItems: "center",
										gap: "1",
										borderRadius: "full",
									})}
								>
									<PinIcon width="12" height="12" />
									Pinned
								</Badge>
							)}
							{note.archived && (
								<Badge
									variant="subtle"
									colorPalette="gray"
									class={css({ borderRadius: "full" })}
								>
									Archived
								</Badge>
							)}
						</Stack>

						<Heading
							as="h1"
							size={{ base: "2xl", md: "3xl" }}
							class={css({ fontWeight: "bold", lineHeight: "tight", mb: "3" })}
						>
							{note.title}
						</Heading>

						{note.updated && (
							<Text size="sm" class={css({ color: "fg.muted", mb: "6" })}>
								{currentLocale === "zh" ? "最后更新时间 " : "Last updated "}
								{new Date(note.updated).toLocaleDateString(
									currentLocale === "zh" ? "zh-CN" : "en-US",
									{
										month: "long",
										day: "numeric",
										year: "numeric",
									},
								)}
							</Text>
						)}

						{note.tags.length > 0 && (
							<Stack gap="2" wrap="wrap" class={css({ mb: "6" })}>
								{note.tags.map((tag) => (
									<Badge
										key={tag}
										variant="subtle"
										colorPalette={accentPalette}
										size="sm"
										class={css({ borderRadius: "full", px: "2.5" })}
									>
										{tag}
									</Badge>
								))}
							</Stack>
						)}

						<div
							class={css({
								pt: "6",
								borderTopWidth: "1px",
								borderColor: "border.subtle",
							})}
						>
							<div
								class={markdownContentClass}
								dangerouslySetInnerHTML={{ __html: note.html }}
							/>
						</div>
					</div>
				</section>
			</div>,
		);
	},
);
