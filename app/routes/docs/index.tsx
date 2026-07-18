import { css } from "design-system/css";
import { createRoute } from "honox/factory";
import { DocsLayout } from "../../components/docs-layout";
import { Anchor, Card, Heading, Text } from "../../components/ui";
import { loadDocs } from "../../lib/docs";

export default createRoute(async (c) => {
	const docs = await loadDocs();

	return c.render(
		<DocsLayout docs={docs}>
			<title>Docs - Artefact</title>

			<Heading as="h1" size="2xl" class={css({ mb: "3" })}>
				Documentation
			</Heading>
			<Text class={css({ color: "fg.muted", mb: "10", maxWidth: "2xl" })}>
				Guides and component reference for the Artefact UI suite. Pick a page
				from the sidebar, or jump in below.
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
						href={`/docs/${doc.slug}`}
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
		</DocsLayout>,
	);
});
