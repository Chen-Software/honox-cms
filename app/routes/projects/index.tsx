import { css, cx } from "design-system/css";
import { button } from "design-system/recipes";
import { createRoute } from "honox/factory";
import {
	Anchor,
	Avatar,
	Badge,
	Card,
	Heading,
	Progress,
	Search,
	Stack,
	Text,
} from "../../components/ui";
import { colorPaletteClass } from "../../components/ui/color-palette";
import { Toaster } from "../../components/ui/toast";
import { EllipsisIcon } from "../../icons/ellipsis";
import AuthStatus from "../../islands/auth-status";
import PmsCreateMenu from "../../islands/pms-create-menu";
import ProjectRowActionsMenu from "../../islands/project-row-actions-menu";
import ProjectStatusFilter from "../../islands/project-status-filter";
import { loadDocsConfig } from "../../lib/configs";
import { mergeColorOverrides } from "../../lib/pms-config";
import {
	buildProjectSearchEntries,
	listProjects,
	PROJECT_STATUS_COLOR,
	type Project,
} from "../../lib/projects";
import { listTasks, type Task } from "../../lib/tasks";
import { filterEntries } from "../../utils/search";

function projectProgress(project: Project, tasks: Task[]) {
	const projectTasks = tasks.filter((task) => task.project === project.slug);
	const done = projectTasks.filter((task) => task.status === "Done").length;
	return { done, total: projectTasks.length };
}

export default createRoute(async (c) => {
	const [projects, tasks, config] = await Promise.all([
		listProjects(),
		listTasks(),
		loadDocsConfig("en"),
	]);
	const projectStatusColor = mergeColorOverrides(
		PROJECT_STATUS_COLOR,
		config.pms?.projectStatusColors,
	);
	const projectItems = projects.map((project) => ({
		label: project.title,
		value: project.slug,
	}));

	const url = new URL(c.req.url);
	const searchQuery = url.searchParams.get("q") || "";
	const statusQuery = url.searchParams.get("status") || "";

	// Server-side filtering for the no-JS fallback
	const matchedSlugs = new Set(
		filterEntries(buildProjectSearchEntries(projects), searchQuery).map(
			(entry) => entry.key,
		),
	);

	const allowedStatuses = statusQuery
		? new Set(statusQuery.split(",").map((s) => s.trim()))
		: null;

	return c.render(
		<>
			<title>Projects - Artefact</title>
			<Toaster />
			<style
				dangerouslySetInnerHTML={{
					__html: `
						[data-project-status-hidden="true"] {
							display: none !important;
						}
					`,
				}}
			/>

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
						flexWrap: "wrap",
						rowGap: "3",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "4",
					})}
				>
					<Anchor
						href="/"
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
							Artefact UI
						</Heading>
					</Anchor>

					{projects.length > 0 && (
						<div
							class={css({
								flex: "1",
								maxWidth: "md",
								minWidth: "160px",
								display: "flex",
								gap: "2",
							})}
						>
							<div class={css({ flex: "1" })}>
								<Search
									size="sm"
									src="/api/projects/search.json"
									action="/projects"
									initialQuery={searchQuery}
									placeholder="Search projects..."
									itemLabel="projects"
									total={projects.length}
									filterAttribute="data-project-slug"
									emptyStateId="projects-search-empty"
									showCount={false}
								/>
							</div>
							<div class={css({ flexShrink: 0, display: "flex", gap: "2" })}>
								<ProjectStatusFilter />
							</div>
						</div>
					)}

					<nav class={css({ display: "flex", gap: "6", alignItems: "center" })}>
						<Anchor
							href="/projects"
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "semibold",
								color: "fg",
								textDecoration: "none",
							})}
						>
							Projects
						</Anchor>
						<Anchor
							href="/tasks"
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "medium",
								color: "fg.muted",
								textDecoration: "none",
								_hover: { color: "fg" },
							})}
						>
							Tasks
						</Anchor>
						<Anchor
							href="/settings"
							variant="plain"
							class={css({
								textStyle: "sm",
								fontWeight: "medium",
								color: "fg.muted",
								textDecoration: "none",
								_hover: { color: "fg" },
							})}
						>
							Settings
						</Anchor>
						<PmsCreateMenu projects={projectItems} />
						<AuthStatus />
					</nav>
				</div>
			</header>

			<div
				class={css({
					py: { base: "8", md: "12" },
					px: { base: "4", md: "6", lg: "8" },
					maxWidth: "7xl",
					mx: "auto",
				})}
			>
				<Heading as="h1" size="3xl" class={css({ mb: "2" })}>
					Projects
				</Heading>
				<Text class={css({ color: "fg.muted", mb: "8" })}>
					Git-backed project tracking — edit projects and tasks in{" "}
					<Anchor href="/admin" variant="plain">
						/admin
					</Anchor>
					, every change commits straight to the repo.
				</Text>

				<div
					id="projects-search-empty"
					hidden={projects.length === 0 || matchedSlugs.size !== 0}
					class={css({ textAlign: "center", py: "16", px: "4" })}
				>
					<Text class={css({ color: "fg.muted" })}>
						No projects match your search.
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
					{projects.map((project) => {
						const { done, total } = projectProgress(project, tasks);
						const isSearchMatch = matchedSlugs.has(project.slug);
						const isStatusMatch =
							!allowedStatuses || allowedStatuses.has(project.status);
						const isHidden = !isSearchMatch || !isStatusMatch;

						return (
							<Anchor
								key={project.slug}
								id={`project-${project.slug}`}
								data-project-slug={project.slug}
								data-project-status={project.status}
								data-project-status-hidden={!isStatusMatch ? "true" : undefined}
								hidden={isHidden}
								href={`/projects/${project.slug}`}
								variant="plain"
								class={css({ textDecoration: "none", position: "relative" })}
							>
								<Card
									variant="outline"
									colorPalette={projectStatusColor[project.status]}
									class={css({
										height: "full",
										transition: "all 0.2s",
										_hover: {
											borderColor: "colorPalette.7",
											shadow: "md",
											transform: "translateY(-2px)",
										},
									})}
									title={project.title}
									description={project.summary}
									headerClass={css({ p: "5", pb: "0" })}
									bodyClass={css({ p: "5", pt: "3" })}
									headerAction={
										<button
											type="button"
											data-project-row-actions-trigger
											data-project-slug={project.slug}
											data-project-title={project.title}
											aria-label={`More actions for "${project.title}"`}
											class={cx(
												button({ variant: "outline", size: "sm" }),
												css({ px: "1.5", pointerEvents: "auto" }),
											)}
										>
											<EllipsisIcon width="16" height="16" />
										</button>
									}
								>
									<Stack gap="2" wrap="wrap" class={css({ mb: "4" })}>
										<Badge
											variant="subtle"
											size="sm"
											colorPalette={projectStatusColor[project.status]}
										>
											{project.status}
										</Badge>
										{project.tags.slice(0, 2).map((tag) => (
											<Badge key={tag} variant="outline" size="sm">
												{tag}
											</Badge>
										))}
									</Stack>

									{total > 0 && (
										<Progress
											value={done}
											max={total}
											size="sm"
											showValueText
											valueText={`${done}/${total} tasks`}
											class={cx(
												colorPaletteClass(projectStatusColor[project.status]),
												css({ mb: "4" }),
											)}
										/>
									)}

									<Stack align="center" justify="space-between">
										{project.owner ? (
											<Stack gap="2" align="center">
												<Avatar size="xs" name={project.owner} />
												<Text size="sm" class={css({ color: "fg.muted" })}>
													{project.owner}
												</Text>
											</Stack>
										) : (
											<span />
										)}
										{project.dueDate && (
											<Text size="xs" class={css({ color: "fg.muted" })}>
												Due{" "}
												{new Date(project.dueDate).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}
											</Text>
										)}
									</Stack>
								</Card>
							</Anchor>
						);
					})}
				</div>
			</div>
			<ProjectRowActionsMenu />
		</>,
	);
});
