import type { ComponentBlock } from "../components/block-types";
import {
	type DataSourceContext,
	resolveCustomTableData,
	resolveDataSource,
} from "./data-sources";

// Pages content lives under content/pages/*.json for the default locale
// (en), and content/pages/<locale>/*.json for translations — matching the
// CMS's `structure: multiple_folders` (public/admin/config.yml) with
// `omit_default_locale_from_file_path: true`, same convention as app/lib/docs.ts.
const pageModules = (
	typeof import.meta.glob === "function"
		? import.meta.glob("/content/pages/**/*.json", { import: "default" })
		: {}
) as Record<string, () => Promise<unknown>>;

export interface PageData {
	title?: string;
	content?: ComponentBlock[];
	/** Optional custom-header slots — a page whose route renders its own
	 * header (rather than a shared one) can source it from here instead of
	 * hardcoding it. See content/pages/index.json and app/routes/index.tsx
	 * for the reference usage. */
	headerBrand?: ComponentBlock[];
	headerNav?: ComponentBlock[];
	headerActions?: ComponentBlock[];
	[key: string]: unknown;
}

function pagePath(slug: string, locale: string): string {
	return locale === "en"
		? `/content/pages/${slug}.json`
		: `/content/pages/${locale}/${slug}.json`;
}

// A `{{item.foo}}` placeholder, whole-string only (no partial/in-string
// interpolation — not needed by any current template and keeps this a
// straight value substitution rather than a template-string parser).
const ITEM_PLACEHOLDER = /^\{\{item\.(\w+)\}\}$/;

/** Fills in one `each` block's `template` for one resolved item: any prop
 * value that's exactly `"{{item.foo}}"` becomes `item.foo`, or — if `foo` is
 * missing on this item (e.g. a project/assignee has no `colorPalette`) — is
 * dropped from the block entirely so the component's own default applies,
 * rather than passing an explicit `undefined`/empty value. Recurses into
 * `children` so a template can nest (e.g. an `anchor` wrapping a `badge`). */
function interpolateBlock(
	block: ComponentBlock,
	item: Record<string, unknown>,
): ComponentBlock {
	const next: ComponentBlock = {};
	for (const [key, value] of Object.entries(block)) {
		if (key === "children" && Array.isArray(value)) {
			next.children = (value as ComponentBlock[]).map((child) =>
				interpolateBlock(child, item),
			);
			continue;
		}
		if (typeof value === "string") {
			const match = value.match(ITEM_PLACEHOLDER);
			if (match) {
				const resolved = item[match[1]];
				if (resolved === undefined) continue; // drop the prop
				next[key] = resolved;
				continue;
			}
		}
		next[key] = value;
	}
	return next;
}

/** Recursively resolves any `each` (`dataSource`/`items` + `template`) or
 * `table` (`customRenderer`) block in a content tree against
 * app/lib/data-sources.ts, so page-registry's (synchronous) block renderers
 * never fetch anything themselves — see data-sources.ts for why resolution
 * happens here instead. A no-op walk for any page that doesn't use either
 * field.
 *
 * `each` is the generic repeater: given a named data source (or a literal
 * `items` array, for hand-authored CMS content), it renders one copy of
 * `template` — an ordinary block list, e.g. an `anchor` wrapping a `badge` —
 * per resolved item, with that item's fields filled into any
 * `"{{item.foo}}"` placeholder. It has no rendering opinion of its own (see
 * the trivial `each` renderer in page-registry.tsx); layout (e.g. a
 * horizontal `stack` with a leading `text` label) is just the surrounding
 * CMS content, same as any other composed block tree. */
async function resolveBlockDataSources(
	blocks: ComponentBlock[] | undefined,
	ctx: DataSourceContext,
): Promise<ComponentBlock[] | undefined> {
	if (!blocks) return blocks;
	return Promise.all(
		blocks.map(async (block) => {
			const next: ComponentBlock = { ...block };
			if (block.blockType === "each") {
				const items =
					typeof block.dataSource === "string"
						? await resolveDataSource(block.dataSource, ctx)
						: Array.isArray(block.items)
							? block.items
							: [];
				const template = Array.isArray(block.template)
					? (block.template as ComponentBlock[])
					: [];
				next.children = items.flatMap((item) =>
					template.map((tpl) =>
						interpolateBlock(tpl, item as unknown as Record<string, unknown>),
					),
				);
				delete next.dataSource;
				delete next.items;
				delete next.template;
			}
			if (
				block.blockType === "table" &&
				typeof block.customRenderer === "string"
			) {
				next.data = await resolveCustomTableData(block.customRenderer, ctx);
			}
			if (Array.isArray(next.children)) {
				next.children = await resolveBlockDataSources(
					next.children as ComponentBlock[],
					ctx,
				);
			}
			return next;
		}),
	);
}

/** Loads a page by slug, falling back to the default-locale file when no
 * translation exists for `locale`. Returns undefined if neither exists. */
export async function loadPage(
	slug: string,
	locale = "en",
	ctx: DataSourceContext = {},
): Promise<PageData | undefined> {
	const loader =
		pageModules[pagePath(slug, locale)] ??
		(locale !== "en" ? pageModules[pagePath(slug, "en")] : undefined);
	if (!loader) return undefined;
	const data = (await loader()) as PageData;
	return {
		...data,
		content: await resolveBlockDataSources(data.content, ctx),
		headerBrand: await resolveBlockDataSources(data.headerBrand, ctx),
		headerNav: await resolveBlockDataSources(data.headerNav, ctx),
		headerActions: await resolveBlockDataSources(data.headerActions, ctx),
	};
}

/** All default-locale page slugs, for ssgParams — translations reuse the
 * same slug under a locale-prefixed route, so they don't need their own params. */
export function listPageSlugs(): string[] {
	const slugs: string[] = [];
	for (const path of Object.keys(pageModules)) {
		const match = path.match(/^\/content\/pages\/([^/]+)\.json$/);
		if (match) slugs.push(match[1]);
	}
	return slugs;
}
