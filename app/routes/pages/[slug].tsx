import { css } from "design-system/css";
import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { PageRenderer } from "../../components/page-renderer";

const pages = import.meta.glob("/content/pages/*.json", {
	import: "default",
});

export default createRoute(
	ssgParams(async () => {
		const pages = import.meta.glob("/content/pages/*.json");
		return Object.keys(pages).map((path) => ({
			slug: path.replace("/content/pages/", "").replace(".json", ""),
		}));
	}),
	async (c) => {
		const slug = c.req.param("slug");
		const pagePath = `/content/pages/${slug}.json`;
		const loader = pages[pagePath];

		if (!loader) {
			return c.notFound();
		}

		try {
			const data = (await loader()) as any;

			return c.render(
				<div
					class={css({
						maxWidth: "5xl",
						mx: "auto",
						px: "4",
						py: "12",
						display: "flex",
						flexDirection: "column",
						gap: "10",
					})}
				>
					<title>{data.title}</title>
					<PageRenderer content={data.content} />
				</div>,
			);
		} catch (error) {
			console.error(`Error loading page ${slug}:`, error);
			return c.notFound();
		}
	},
);
