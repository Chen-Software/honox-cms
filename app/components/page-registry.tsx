import { css, cx } from "design-system/css";
import { ChevronDownIcon } from "../icons/chevron-down";
import { localeToggleUrl, localiseHref } from "../lib/i18n";
import { listPageSlugs } from "../lib/pages";
import { extractCmsStyle, extractLayoutStyle } from "./block-style";
import { type BlockProps, type ComponentBlock, propsOf } from "./block-types";
import { customTableRenderers } from "./custom-table-renderers";
import { displayValueFormatters } from "./display-value-formatters";
import {
	AbsoluteCenter,
	Alert,
	AlertIcon,
	Anchor,
	AuthStatus,
	Avatar,
	Badge,
	Breadcrumb,
	Button,
	Card,
	Carousel,
	Checkbox,
	Clipboard,
	Collapsible,
	ColorPicker,
	Combobox,
	DatePicker,
	Dialog,
	DisplayValue,
	Drawer,
	Dropdown,
	Editable,
	Field,
	Fieldset,
	FileUpload,
	Grid,
	Group,
	Heading,
	HoverCard,
	Icon,
	Layout,
	Loader,
	PagePlayground,
	PaginatedTable,
	Pagination,
	PinField,
	Popover,
	Progress,
	RadioCardGroup,
	RadioGroup,
	RatingGroup,
	Search,
	SegmentGroup,
	Select,
	Skeleton,
	Slider,
	Spinner,
	Splitter,
	Stack,
	Switch,
	Table,
	Tabs,
	TagsField,
	Text,
	Textarea,
	Toast,
	Tooltip,
} from "./ui";

type BlockRenderer = (block: ComponentBlock) => JSX.Element;

// Static (Panda-visible) class backing the `stack` block's `hideBelowMd`
// toggle — see the `stack` registry entry below. A real media query, unlike
// anything routed through `block-style.ts`'s `--cms-*` custom-property
// bridge (a custom property holds one value, not one per breakpoint).
const hideBelowMdClass = css({ display: { base: "none", md: "flex" } });

// Static class backing the `stack` block's `fullBleed` toggle — see the
// `stack` registry entry below. Breaks the block out of a centered
// `maxWidth` ancestor (e.g. a page's padded body wrapper) to span the full
// viewport width, via the standard `calc(50% - 50vw)` negative-margin
// technique — not expressible through `block-style.ts`'s `--cms-*` bridge,
// since that composes a single static class's declarations from custom
// properties, and `calc()` mixing `%`/`vw` isn't a value the free-text
// Margin field's validator should be accepting anyway. `marginTop` cancels
// exactly one page body wrapper's `py: "12"` (3rem) top padding, so this is
// meant for a block sitting first inside that wrapper (e.g. a homepage hero) —
// not a fully general "full bleed anywhere" utility.
const fullBleedClass = css({
	width: "100vw",
	marginLeft: "calc(50% - 50vw)",
	marginRight: "calc(50% - 50vw)",
	marginTop: "-3rem",
});

// CMS content may use either casing for a given block type; both map to the
// same renderer. Aliases are declared once here — renderers are registered
// only under their canonical (camelCase) key.
const TYPE_ALIASES: Record<string, string> = {
	"file-upload": "fileUpload",
	"hover-card": "hoverCard",
	"paginated-table": "paginatedTable",
	"radio-card-group": "radioCardGroup",
	"radio-group": "radioGroup",
	"segment-group": "segmentGroup",
	"grid-col": "gridCol",
	"grid-row": "grid",
	"color-picker": "colorPicker",
	menu: "dropdown",
	// Legacy name for the `anchor` block — `anchor` is canonical and is what
	// the CMS config emits now; this alias keeps pre-rename content (and any
	// tooling still writing `blockType: "link"`) resolving to the same
	// renderer.
	link: "anchor",
	tagsInput: "tagsField",
};

function resolveType(type: string): string {
	return TYPE_ALIASES[type] ?? type;
}

// Recursively render a list of nested blocks (used by container renderers).
// `children` is pulled from the full block by callers — `propsOf` strips it —
// so it never leaks as a DOM attribute.
//
// `extraProps` is forwarded to every nested block same as `renderBlocks`'
// own second argument — needed so `locale`/`currentPath` reach a `search` or
// `dropdown` block nested inside a `stack` (e.g. the docs header's single
// content-authored `header` tree). Deliberately NOT the default: most
// container content is ordinary page-builder content with no request-scoped
// props to thread, so every other container renderer still calls this with
// no second argument. Only `stack` forwards its own extraProps here — see
// its registry entry below — since it's the one container currently used to
// nest locale-aware chrome (rather than reintroducing this generally; see
// the "Do NOT re-add extraProps-threading" note in project memory).
function renderChildren(
	children?: ComponentBlock[],
	extraProps?: Record<string, unknown>,
): JSX.Element[] {
	if (!children || !Array.isArray(children)) return [];
	return children.map((block, index) => (
		<RenderBlock
			key={`${block.blockType}-${index}`}
			block={block}
			{...extraProps}
		/>
	));
}

// Shared trigger-button builder for dropdown/popover: `triggerIcon` is raw
// SVG markup (same `svg` field convention as the `icon` block type, see the
// `icon` registry entry) rendered via `Icon`; `triggerAriaLabel` is required
// for an icon-only trigger to stay accessible. Either of
// `triggerText`/`triggerIcon` alone is fine — an icon-only settings-gear
// trigger has no text, mirroring the icon-only GitHub link elsewhere in the
// header.
function buildTrigger({
	triggerText,
	triggerIcon,
	triggerAriaLabel,
	size,
}: {
	triggerText?: unknown;
	triggerIcon?: unknown;
	triggerAriaLabel?: unknown;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
}): JSX.Element | undefined {
	if (!triggerText && !triggerIcon) return undefined;
	return (
		<Button
			variant="outline"
			size={size}
			aria-label={
				typeof triggerAriaLabel === "string" ? triggerAriaLabel : undefined
			}
		>
			{typeof triggerIcon === "string" && (
				<Icon
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					dangerouslySetInnerHTML={{ __html: triggerIcon }}
				/>
			)}
			{typeof triggerText === "string" ? triggerText : undefined}
		</Button>
	);
}

// Dialog/Drawer `footer` is a list of blocks (typically Buttons) rendered
// side by side — the footer recipe is already `display: flex; gap: 3`, so no
// extra wrapper is needed beyond a fragment. Unlike `trigger` (singular),
// every block in the list is kept, not just the first.
function footerFromBlocks(footer: unknown): JSX.Element | undefined {
	if (!Array.isArray(footer) || footer.length === 0) return undefined;
	return <>{renderBlocks(footer as ComponentBlock[])}</>;
}

// Dialog/Drawer content: nested `children` blocks are the only way current
// config.yml content can put anything beyond plain text inside one, and a
// few older entries still carry a plain-string `body` field from before
// `children` existed. Rendered into the `body` *prop* (not JSX `children`,
// which the Dialog/Drawer wrappers render as an unpadded, non-scrolling
// sibling of Header/Footer) so it lands in the recipe's actual `<Body>`
// slot and gets that slot's padding and scroll containment — see
// app/theme/recipes/drawer.ts's `body` slot vs. bare `content`.
function bodyFromBlocksOrString(
	children: unknown,
	legacyBody: unknown,
): JSX.Element | string | undefined {
	if (Array.isArray(children) && children.length > 0) {
		return <>{renderChildren(children as ComponentBlock[])}</>;
	}
	return typeof legacyBody === "string" ? legacyBody : undefined;
}

function tryParseJSON(val: unknown): unknown {
	if (typeof val === "string") {
		// An untouched optional CMS field (e.g. Grid's Rows/Min Child Width)
		// arrives as "", not omitted. `Number("")` is 0, not NaN, so without
		// this the fallback below would silently coerce "unset" to the literal
		// number 0 — same empty-string gotcha documented on the radioCardGroup/
		// editable/layout renderers, just for this JSON-or-number field type.
		if (val.trim() === "") return undefined;
		try {
			return JSON.parse(val);
		} catch (_) {
			const num = Number(val);
			if (!Number.isNaN(num)) {
				return num;
			}
		}
	}
	return val;
}

interface CarouselSlideBlock {
	image?: string;
	caption?: string;
	href?: string;
}

// CMS carousel slides are flat { image, caption, href } records, not
// component blocks — they never go through `RenderBlock`/the registry.
function renderCarouselSlide(slide: CarouselSlideBlock): JSX.Element {
	const content = (
		<div class={css({ position: "relative", width: "full", height: "full" })}>
			{slide.image && (
				<img
					src={slide.image}
					alt={slide.caption ?? ""}
					class={css({ width: "full", height: "full", objectFit: "cover" })}
				/>
			)}
			{slide.caption && (
				<div
					class={css({
						position: "absolute",
						insetX: "0",
						bottom: "0",
						p: "4",
						bgGradient: "to-t",
						gradientFrom: "black.a9",
						gradientTo: "transparent",
					})}
				>
					<Text class={css({ color: "white" })}>{slide.caption}</Text>
				</div>
			)}
		</div>
	);
	return slide.href ? (
		<a
			href={slide.href}
			class={css({ display: "block", width: "full", height: "full" })}
		>
			{content}
		</a>
	) : (
		content
	);
}

// One entry per supported block type. Each body ports the previous renderer
// verbatim, with the single change that cleaned props come from `propsOf(block)`
// (which strips `type`/`children`) so those meta-keys can never reach the DOM.
// Containers that nest children destructure `children` from the full block `b`
// and the remaining props from `propsOf(b)`.
const registry: Record<string, BlockRenderer> = {
	grid: (b) => {
		const { children } = b;
		const props = propsOf(b);
		const layoutStyle = extractLayoutStyle(props);

		const resolvedProps: Record<string, unknown> = {};
		for (const key of Object.keys(props)) {
			resolvedProps[key] = tryParseJSON(props[key]);
		}

		return (
			<Grid
				{...resolvedProps}
				class={layoutStyle.class}
				style={layoutStyle.style}
			>
				{renderChildren(children as ComponentBlock[])}
			</Grid>
		);
	},

	stack: (b) => {
		const { children } = b;
		// `locale`/`currentPath` are request-scoped extraProps (see
		// `renderBlocks`'/`renderChildren`'s second argument) — pulled out here
		// so they don't leak onto the `<Stack>` DOM node, and re-forwarded to
		// this stack's own children below so a `search`/`dropdown`/`anchor`
		// nested inside a content-authored stack (e.g. the docs header) still
		// gets them, same as if it were a top-level `headerItems` entry.
		// `hideBelowMd`/`fullBleed` are fixed boolean toggles (not general style
		// props — media queries and the `calc(%, vw)` breakout trick can't be
		// expressed via the `--cms-*` custom-property bridge in `block-style.ts`,
		// since a custom property holds one value, not one per breakpoint/not
		// safely-validatable freeform `calc()`) backed by the static
		// `hideBelowMdClass`/`fullBleedClass` below, which Panda's build-time
		// extractor can see and generate CSS for regardless of which stack
		// blocks set the flag at runtime.
		const { locale, currentPath, hideBelowMd, fullBleed, ...rest } = propsOf(b);
		const layoutStyle = extractLayoutStyle(rest);
		return (
			<Stack
				{...rest}
				class={cx(
					hideBelowMd ? hideBelowMdClass : undefined,
					fullBleed ? fullBleedClass : undefined,
					layoutStyle.class,
				)}
				style={layoutStyle.style}
			>
				{renderChildren(children as ComponentBlock[], { locale, currentPath })}
			</Stack>
		);
	},

	button: (b) => {
		// CMS field is "buttonType", not "type" — the HTML button/submit/reset
		// variant would otherwise collide with the block-type discriminator key,
		// since both live on the same flat JSON object (propsOf only strips one).
		const { text, buttonType, ...rest } = propsOf(b);
		return (
			<Button type={buttonType as "button" | "submit" | "reset"} {...rest}>
				{text}
			</Button>
		);
	},

	badge: (b) => {
		const { text, ...rest } = propsOf(b);
		const cmsStyle = extractCmsStyle(rest);
		return (
			<Badge class={cmsStyle.class} style={cmsStyle.style} {...rest}>
				{text}
			</Badge>
		);
	},

	// The generic repeater — no rendering opinion of its own. `children` has
	// already been expanded (one copy of the block's `template` per resolved
	// item, placeholders filled in) by `loadPage`'s `resolveBlockDataSources`
	// (app/lib/pages.ts) before this ever runs, so — like every other block
	// here — this stays a synchronous pass-through. Composing e.g. a labeled
	// filter row out of this is just ordinary CMS content: a `stack`
	// containing a `text` label and an `each` (see content/pages/tasks.json).
	each: (b) => {
		const { children } = b;
		return <>{renderChildren(children as ComponentBlock[])}</>;
	},

	alert: (b) => {
		const { title, description, status, variant, ...rest } = propsOf(b);
		return (
			<Alert
				title={title}
				description={description}
				status={status}
				variant={variant}
				indicator={<AlertIcon />}
				{...rest}
			/>
		);
	},

	heading: (b) => {
		const { text, ...rest } = propsOf(b);
		const cmsStyle = extractCmsStyle(rest);
		return (
			<Heading class={cmsStyle.class} style={cmsStyle.style} {...rest}>
				{text}
			</Heading>
		);
	},

	text: (b) => {
		const { content, ...rest } = propsOf(b);
		const cmsStyle = extractCmsStyle(rest);
		return (
			<Text class={cmsStyle.class} style={cmsStyle.style} {...rest}>
				{content}
			</Text>
		);
	},

	// `value` arrives as "" (not omitted) when a content author leaves the
	// CMS field untouched — that must fall through to DisplayValue's own
	// empty-state placeholder rather than rendering a blank string, so it's
	// normalised to undefined here (same empty-string gotcha noted elsewhere
	// in this file for other optional CMS fields).
	//
	// `formatValue` arrives as a string naming an entry in
	// displayValueFormatters (CMS JSON can't store a function) — same
	// string->function registry pattern as `customRenderer` in the `table`
	// block below. An unrecognised name is dropped rather than passed through,
	// since DisplayValue would otherwise try to call the raw string.
	displayValue: (b) => {
		const { value, formatValue, ...rest } = propsOf(b);
		return (
			<DisplayValue
				value={typeof value === "string" && value !== "" ? value : undefined}
				formatValue={
					typeof formatValue === "string"
						? displayValueFormatters[formatValue]
						: undefined
				}
				{...rest}
			/>
		);
	},

	anchor: (b) => {
		// `locale`, when passed as an extra prop (see renderBlocks' second
		// argument), localises `href` for chrome rendered outside per-locale
		// page-builder content — e.g. content/configs.json's `headerLinks`,
		// which stores one canonical relative href shared across every locale
		// file rather than a pre-localised one per file. Ordinary page-builder
		// anchors never pass this, so they're unaffected.
		//
		// `toggleLocale` is the language-switcher case: instead of a fixed
		// `href`, it names the locale this anchor should switch *to* — the
		// actual target is computed from the current request's path (also an
		// extraProp, see `renderBlocks` call sites) so the switch preserves
		// whatever page you're on, e.g. `/docs/foo` -> `/docs/de/foo`.
		//
		// Content is `children`-only (no flat `text` field) — a list of nested
		// blocks rendered via `renderChildren`, same convention as every other
		// container block (Stack/Card/...): usually a single `text` leaf for a
		// plain label, or an `icon` leaf (plus optional `text`) for a brand-mark
		// anchor like GitHub.
		const { children } = b;
		const { href, locale, currentPath, toggleLocale, ...rest } = propsOf(b);
		let resolvedHref = href;
		if (
			typeof toggleLocale === "string" &&
			typeof currentPath === "string" &&
			typeof locale === "string"
		) {
			resolvedHref = localeToggleUrl(currentPath, locale, toggleLocale);
		} else if (typeof href === "string" && typeof locale === "string") {
			resolvedHref = localiseHref(href, locale);
		}
		const cmsStyle = extractCmsStyle(rest);
		return (
			<Anchor
				href={resolvedHref}
				class={cmsStyle.class}
				style={cmsStyle.style}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Anchor>
		);
	},

	card: (b) => {
		const { children } = b;
		const {
			title,
			description,
			body,
			image,
			imagePosition,
			overflow,
			...rest
		} = propsOf(b);
		// boxShadow (plus margin/padding/maxWidth/... if ever set on a card)
		// goes through the same validated `--cms-*` token pipeline as
		// Stack/Grid/Layout — see block-style.ts. Default it to the recipe's
		// own "md" base shadow (card.ts) so that setting some *other* style
		// field (e.g. margin) doesn't silently zero out the shadow: once
		// `extractLayoutStyle` emits any `--cms-*` var, its shared utility
		// class sets `box-shadow: var(--cms-box-shadow, initial)` on the card
		// regardless of whether this block set boxShadow itself, and that
		// utility class's layer wins over the recipe's own default.
		if (rest.boxShadow === undefined) rest.boxShadow = "md";
		const layoutStyle = extractLayoutStyle(rest);
		// Card's root is `overflow: hidden` by default (clips its image slot to
		// the border radius) — but that also clips any absolutely-positioned
		// overlay content rendered inside it (Popover/Dropdown/Select/DatePicker/
		// ColorPicker/HoverCard aren't portaled). An inline style beats the
		// recipe's class specificity, so this reliably overrides it per-card.
		const overflowStyle = overflow ? `overflow: ${overflow}` : undefined;
		const style = [layoutStyle.style, overflowStyle].filter(Boolean).join("; ");
		return (
			<Card
				title={title}
				description={description}
				body={body}
				image={image}
				imagePosition={imagePosition}
				class={layoutStyle.class}
				style={style || undefined}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Card>
		);
	},

	carousel: (b) => {
		const { slides, slidesPerPage, autoplayDelay, ...rest } = propsOf(b);

		const slideElements = Array.isArray(slides)
			? (slides as CarouselSlideBlock[]).map(renderCarouselSlide)
			: [];
		const delay =
			autoplayDelay !== undefined && autoplayDelay !== ""
				? Number(autoplayDelay)
				: undefined;

		return (
			<Carousel
				interactive
				slides={slideElements}
				slidesPerPage={
					slidesPerPage !== undefined ? Number(slidesPerPage) : undefined
				}
				autoplay={delay ? { delay } : undefined}
				itemClass={css({ height: { base: "56", md: "72" } })}
				{...rest}
			/>
		);
	},

	checkbox: (b) => {
		const { label, checked, disabled, invalid, size, colorPalette, ...rest } =
			propsOf(b);
		// CMS field is "Checked", but forwarded as `defaultChecked` (uncontrolled
		// initial state) rather than `checked` — a controlled value with no
		// `onCheckedChange` handler (which CMS content can never supply) locks
		// the toggle so clicks stop doing anything. See switch below, same fix.
		return (
			<Checkbox
				interactive
				defaultChecked={checked}
				disabled={disabled}
				invalid={invalid}
				size={size}
				colorPalette={colorPalette}
				{...rest}
			>
				{label}
			</Checkbox>
		);
	},

	collapsible: (b) => {
		const { children } = b;
		const {
			showIndicator,
			indicatorPlacement,
			open,
			disabled,
			trigger: cmsTrigger,
			...rest
		} = propsOf(b);

		let trigger: JSX.Element | string | undefined;
		if (cmsTrigger) {
			if (Array.isArray(cmsTrigger)) {
				if (cmsTrigger.length > 0) {
					trigger = renderBlocks(cmsTrigger)[0];
				}
			} else if (typeof cmsTrigger === "object") {
				trigger = renderBlocks([cmsTrigger])[0];
			} else if (typeof cmsTrigger === "string") {
				trigger = cmsTrigger as string;
			}
		}

		if (!trigger) {
			trigger = "Toggle";
		}

		const indicator = showIndicator ? (
			<ChevronDownIcon
				width="20"
				height="20"
				class={css({
					transition: "transform 0.2s",
					"[data-state=open] &": { transform: "rotate(180deg)" },
				})}
			/>
		) : undefined;

		return (
			<Collapsible
				interactive
				trigger={trigger}
				indicator={indicator}
				indicatorPlacement={indicatorPlacement}
				defaultOpen={open}
				disabled={disabled}
				content={<div>{renderChildren(children as ComponentBlock[])}</div>}
				{...rest}
			/>
		);
	},

	combobox: (b) => {
		const { label, placeholder, items, ...rest } = propsOf(b);
		return (
			<Combobox
				interactive
				label={label}
				placeholder={placeholder}
				items={items || []}
				{...rest}
			/>
		);
	},

	dialog: (b) => {
		const { children } = b;
		const {
			title,
			description,
			confirmText,
			cancelText,
			role,
			trigger: cmsTrigger,
			footer: cmsFooter,
			body: cmsBody,
			...rest
		} = propsOf(b);

		let trigger: JSX.Element | string | undefined;
		if (cmsTrigger) {
			if (Array.isArray(cmsTrigger)) {
				if (cmsTrigger.length > 0) {
					trigger = renderBlocks(cmsTrigger)[0];
				}
			} else if (typeof cmsTrigger === "object") {
				trigger = renderBlocks([cmsTrigger])[0];
			} else if (typeof cmsTrigger === "string") {
				trigger = cmsTrigger as string;
			}
		}

		// A list of blocks (typically Buttons) rendered side by side in the
		// footer, alongside (or instead of) the dedicated Confirm/Cancel text
		// shortcuts — e.g. a "Refresh" button that dispatches a custom event.
		const footer = footerFromBlocks(cmsFooter);
		const body = bodyFromBlocksOrString(children, cmsBody);

		const confirm = confirmText ? <Button>{confirmText}</Button> : undefined;
		const cancel = cancelText ? (
			<Button variant="outline">{cancelText}</Button>
		) : undefined;

		return (
			<Dialog
				interactive
				title={title}
				description={description}
				trigger={trigger}
				confirm={confirm}
				cancel={cancel}
				footer={footer}
				body={body}
				role={role}
				{...rest}
			/>
		);
	},

	drawer: (b) => {
		const { children } = b;
		const {
			title,
			description,
			confirmText,
			cancelText,
			trigger: cmsTrigger,
			footer: cmsFooter,
			body: cmsBody,
			...rest
		} = propsOf(b);

		let trigger: JSX.Element | string | undefined;
		if (cmsTrigger) {
			if (Array.isArray(cmsTrigger)) {
				if (cmsTrigger.length > 0) {
					trigger = renderBlocks(cmsTrigger)[0];
				}
			} else if (typeof cmsTrigger === "object") {
				trigger = renderBlocks([cmsTrigger])[0];
			} else if (typeof cmsTrigger === "string") {
				trigger = cmsTrigger as string;
			}
		}

		const footer = footerFromBlocks(cmsFooter);
		const body = bodyFromBlocksOrString(children, cmsBody);

		const confirm = confirmText ? <Button>{confirmText}</Button> : undefined;
		const cancel = cancelText ? (
			<Button variant="outline">{cancelText}</Button>
		) : undefined;

		return (
			<Drawer
				interactive
				title={title}
				description={description}
				trigger={trigger}
				confirm={confirm}
				cancel={cancel}
				footer={footer}
				body={body}
				{...rest}
			/>
		);
	},

	field: (b) => {
		const { children } = b;
		const {
			label,
			helperText,
			errorText,
			defaultValue,
			disabled,
			invalid,
			required,
			readOnly,
			...rest
		} = propsOf(b);
		return (
			<Field
				interactive
				label={label}
				helperText={helperText}
				errorText={errorText}
				defaultValue={defaultValue}
				disabled={disabled}
				invalid={invalid}
				required={required}
				readOnly={readOnly}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Field>
		);
	},

	textarea: (b) => {
		const {
			label,
			helperText,
			errorText,
			defaultValue,
			disabled,
			invalid,
			required,
			readOnly,
			...rest
		} = propsOf(b);
		return (
			<Textarea
				interactive
				label={label}
				helperText={helperText}
				errorText={errorText}
				defaultValue={defaultValue}
				disabled={disabled}
				invalid={invalid}
				required={required}
				readOnly={readOnly}
				{...rest}
			/>
		);
	},

	fieldset: (b) => {
		const { children } = b;
		const {
			legend,
			helperText,
			errorText,
			disabled,
			invalid,
			required,
			...rest
		} = propsOf(b);
		return (
			<Fieldset
				legend={legend}
				helperText={helperText}
				errorText={errorText}
				disabled={disabled}
				invalid={invalid}
				required={required}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Fieldset>
		);
	},

	group: (b) => {
		const { children } = b;
		const { attached, grow, orientation, ...rest } = propsOf(b);
		return (
			<Group
				attached={attached}
				grow={grow}
				orientation={orientation}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Group>
		);
	},

	hoverCard: (b) => {
		const { children } = b;
		const { triggerText, title, description, ...rest } = propsOf(b);
		const trigger = triggerText ? (
			<Button variant="outline">{triggerText}</Button>
		) : undefined;
		const content =
			children || title || description ? (
				<>
					{title && <Text fontWeight="bold">{title}</Text>}
					{description && (
						<Text size="sm" class={css({ color: "fg.muted", mt: "1" })}>
							{description}
						</Text>
					)}
					{renderChildren(children as ComponentBlock[])}
				</>
			) : undefined;
		return (
			<HoverCard interactive trigger={trigger} content={content} {...rest} />
		);
	},

	dropdown: (b) => {
		const {
			triggerText,
			triggerIcon,
			triggerAriaLabel,
			items,
			placement,
			locale,
			currentPath,
			...rest
		} = propsOf(b);
		const trigger = buildTrigger({
			triggerText,
			triggerIcon,
			triggerAriaLabel,
			size: "sm",
		});
		// An `item` entry may carry `toggleLocale` instead of a fixed `href`
		// (the language-switcher case) — resolved here, server-side, from the
		// request's current path so the item's target survives into
		// `DropdownItemItem.href` (see dropdown.tsx) exactly like a normal
		// CMS-authored anchor. Same mechanism as `anchor`'s `toggleLocale`.
		const resolvedItems = (
			items as (BlockProps & { toggleLocale?: string })[] | undefined
		)?.map((item) =>
			item.toggleLocale &&
			typeof currentPath === "string" &&
			typeof locale === "string"
				? {
						...item,
						href: localeToggleUrl(currentPath, locale, item.toggleLocale),
					}
				: item,
		);
		return (
			<Dropdown
				interactive
				trigger={trigger}
				items={resolvedItems || []}
				placement={placement}
				{...rest}
			/>
		);
	},

	popover: (b) => {
		const { children } = b;
		const {
			triggerText,
			triggerIcon,
			triggerAriaLabel,
			title,
			description,
			body,
			footer,
			showArrow,
			closable,
			...rest
		} = propsOf(b);
		const trigger = buildTrigger({
			triggerText,
			triggerIcon,
			triggerAriaLabel,
		});
		const content = renderChildren(children as ComponentBlock[]);
		return (
			<Popover
				interactive
				trigger={trigger}
				title={title}
				description={description}
				body={body}
				footer={footer}
				showArrow={showArrow}
				closable={closable}
				{...rest}
			>
				{content.length ? content : undefined}
			</Popover>
		);
	},

	skeleton: (b) => {
		const { children } = b;
		const { shape, variant, noOfLines, loaded, ...rest } = propsOf(b);
		const resolvedShape =
			shape ||
			(variant === "text" || variant === "circle" ? variant : "children");
		const resolvedVariant =
			variant === "text" || variant === "circle" ? undefined : variant;

		return (
			<Skeleton
				shape={resolvedShape as "circle" | "text" | "children"}
				variant={resolvedVariant as "shine" | "fade" | undefined}
				noOfLines={noOfLines}
				loaded={loaded}
				{...rest}
			>
				{children ? renderChildren(children as ComponentBlock[]) : undefined}
			</Skeleton>
		);
	},

	icon: (b) => {
		const { svg, ariaLabel, ...rest } = propsOf(b);
		return (
			<Icon
				aria-label={ariaLabel}
				dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
				{...rest}
			/>
		);
	},

	// Inline boot-time script, e.g. syncing a control's rendered state (a
	// Switch's `checked`) to a `localStorage`/`data-*` value that only exists
	// client-side and can't be known at SSR time. Same `dangerouslySetInnerHTML`
	// convention as `icon`'s raw `svg`, just for JS instead of markup.
	script: (b) => {
		const { code } = propsOf(b);
		return typeof code === "string" ? (
			<script dangerouslySetInnerHTML={{ __html: code }} />
		) : (
			<></>
		);
	},

	paginatedTable: (b) => <PaginatedTable {...propsOf(b)} />,
	pagination: (b) => <Pagination interactive {...propsOf(b)} />,

	// Renders the interactive JSON-editor + live-preview tool at /playground
	// (content/pages/playground.json). Discovers previewable pages itself via
	// listPageSlugs() rather than taking them as CMS-authored props, so any
	// new content/pages/*.json file shows up automatically. Excludes its own
	// slug so the tool never lists itself.
	pagePlayground: () => {
		const pages = listPageSlugs()
			.filter((slug) => slug !== "playground")
			.sort((a, z) => a.localeCompare(z))
			.map((slug) => ({
				slug,
				label: slug
					.split("-")
					.map((word) => word[0]!.toUpperCase() + word.slice(1))
					.join(" "),
			}));
		const defaultSlug = pages.some((p) => p.slug === "about")
			? "about"
			: pages[0]?.slug;
		return <PagePlayground pages={pages} defaultSlug={defaultSlug} />;
	},

	progress: (b) => <Progress {...propsOf(b)} />,
	radioGroup: (b) => <RadioGroup interactive {...propsOf(b)} />,

	radioCardGroup: (b) => {
		// Untouched optional CMS fields arrive as "" (see radioGroup payloads in
		// content/pages); an empty variant/colorPalette would override the
		// recipe's defaults with a nonexistent value, so drop them.
		const props = propsOf(b);
		for (const key of Object.keys(props)) {
			if (props[key] === "") delete props[key];
		}
		return <RadioCardGroup interactive {...props} />;
	},
	segmentGroup: (b) => <SegmentGroup interactive {...propsOf(b)} />,

	editable: (b) => {
		// Same empty-string cleanup as radioCardGroup: untouched optional
		// select fields (size/activationMode/submitMode) arrive as "" rather
		// than being omitted, which would override the recipe/behavior
		// defaults with a nonexistent value.
		const props = propsOf(b);
		for (const key of Object.keys(props)) {
			if (props[key] === "") delete props[key];
		}
		return <Editable interactive {...props} />;
	},

	select: (b) => {
		const { label, placeholder, items, multiple, ...rest } = propsOf(b);
		return (
			<Select
				interactive
				label={label}
				placeholder={placeholder}
				items={items || []}
				multiple={multiple}
				{...rest}
			/>
		);
	},

	search: (b) => {
		const { debounceMs, maxSuggestions, total, ...rest } = propsOf(b);
		return (
			<Search
				interactive
				debounceMs={
					debounceMs !== undefined && debounceMs !== ""
						? Number(debounceMs)
						: undefined
				}
				maxSuggestions={
					maxSuggestions !== undefined && maxSuggestions !== ""
						? Number(maxSuggestions)
						: undefined
				}
				total={total !== undefined && total !== "" ? Number(total) : undefined}
				{...rest}
			/>
		);
	},

	fileUpload: (b) => {
		const { maxFiles, maxFileSize, ...rest } = propsOf(b);
		return (
			<FileUpload
				interactive
				maxFiles={maxFiles !== undefined ? Number(maxFiles) : undefined}
				maxFileSize={
					maxFileSize !== undefined && maxFileSize !== ""
						? Number(maxFileSize)
						: undefined
				}
				{...rest}
			/>
		);
	},

	slider: (b) => <Slider interactive {...propsOf(b)} />,
	switch: (b) => {
		// Same controlled-vs-uncontrolled fix as checkbox above: CMS "Checked"
		// must land as `defaultChecked`, not `checked`, or the toggle locks.
		const { label, checked, ...rest } = propsOf(b);
		return (
			<Switch interactive defaultChecked={checked} {...rest}>
				{label}
			</Switch>
		);
	},
	colorPicker: (b) => <ColorPicker interactive {...propsOf(b)} />,
	pinField: (b) => <PinField interactive {...propsOf(b)} />,
	avatar: (b) => <Avatar {...propsOf(b)} />,
	authStatus: (b) => <AuthStatus href={b["href"] as string | undefined} />,
	ratingGroup: (b) => <RatingGroup interactive {...propsOf(b)} />,
	clipboard: (b) => <Clipboard interactive {...propsOf(b)} />,
	// Renders the global toast host. Pair with a Button whose `onclick` raw
	// attribute dispatches a `park-ui:toast:create` CustomEvent — this works
	// without client hydration (see content/components/Toast.mdx).
	toast: () => <Toast.Toaster />,

	tabs: (b) => {
		const { items, variant, size, orientation, activationMode, ...rest } =
			propsOf(b);
		const tabItems = Array.isArray(items)
			? (items as Record<string, unknown>[])
			: [];
		const defaultActive =
			(tabItems.find((item) => !item.disabled)?.value as string) ||
			(tabItems[0]?.value as string);

		return (
			<Tabs
				interactive
				defaultValue={defaultActive}
				variant={variant as "line" | "subtle" | "enclosed"}
				size={size as "xs" | "sm" | "md" | "lg"}
				orientation={orientation as "horizontal" | "vertical"}
				activationMode={activationMode as "manual" | "automatic"}
				{...rest}
			>
				<Tabs.List>
					{tabItems.map((item) => (
						<Tabs.Trigger
							key={String(item.value)}
							value={String(item.value)}
							disabled={Boolean(item.disabled)}
						>
							{String(item.label)}
						</Tabs.Trigger>
					))}
					<Tabs.Indicator />
				</Tabs.List>

				{tabItems.map((item) => (
					<Tabs.Content key={String(item.value)} value={String(item.value)}>
						{Array.isArray(item.content)
							? renderBlocks(item.content as ComponentBlock[])
							: null}
					</Tabs.Content>
				))}
			</Tabs>
		);
	},

	breadcrumb: (b) => <Breadcrumb {...propsOf(b)} />,
	datePicker: (b) => <DatePicker interactive {...propsOf(b)} />,
	loader: (b) => <Loader {...propsOf(b)} />,
	spinner: (b) => <Spinner {...propsOf(b)} />,
	tagsField: (b) => <TagsField interactive {...propsOf(b)} />,

	table: (b) => {
		// Escape hatch for a table whose row rendering (drag-and-drop reorder,
		// collapsible tree nesting, hover actions opening islands/a drawer) is
		// too bespoke for the generic columns/rows path below — `data` is
		// attached server-side by `loadPage` from the matching resolver in
		// app/lib/data-sources.ts. See app/components/custom-table-renderers.tsx.
		const { customRenderer, data, columns, rows, ...rest } = propsOf(b);
		if (typeof customRenderer === "string") {
			const renderer = customTableRenderers[customRenderer];
			return renderer ? (
				renderer((data as Record<string, unknown>) ?? {})
			) : (
				<></>
			);
		}

		let parsedRows: unknown[] = [];
		if (typeof rows === "string" && rows.trim()) {
			try {
				const parsed = JSON.parse(rows);
				if (Array.isArray(parsed)) parsedRows = parsed;
			} catch (_) {
				parsedRows = [];
			}
		} else if (Array.isArray(rows)) {
			parsedRows = rows;
		}
		return (
			<Table
				columns={Array.isArray(columns) ? columns : []}
				rows={parsedRows}
				{...rest}
			/>
		);
	},

	tooltip: (b) => {
		const { triggerText, content, placement, showArrow, ...rest } = propsOf(b);
		return (
			<Tooltip
				content={content}
				placement={placement}
				showArrow={showArrow}
				asChild
				{...rest}
			>
				<Button variant="outline">{triggerText || "Hover me"}</Button>
			</Tooltip>
		);
	},

	layout: (b) => {
		// The four part fields are block lists, not props — pull them out and
		// render each into the matching slot prop (undefined when empty, so
		// the component skips that part's wrapper element entirely).
		const { header, sider, content, footer } = b;
		const props = propsOf(b);
		for (const key of ["header", "sider", "content", "footer"]) {
			delete props[key];
		}
		// Same empty-string cleanup as radioCardGroup: untouched optional
		// selects (siderWidth/siderHideBelow) arrive as "" and would override
		// the recipe's defaults with a nonexistent variant value.
		for (const key of Object.keys(props)) {
			if (props[key] === "") delete props[key];
		}
		const layoutStyle = extractLayoutStyle(props);
		const part = (blocks: unknown): JSX.Element | undefined =>
			Array.isArray(blocks) && blocks.length > 0 ? (
				<>{renderChildren(blocks as ComponentBlock[])}</>
			) : undefined;
		return (
			<Layout
				header={part(header)}
				sider={part(sider)}
				content={part(content)}
				footer={part(footer)}
				{...props}
				class={layoutStyle.class}
				style={layoutStyle.style}
			/>
		);
	},

	absoluteCenter: (b) => {
		const { children } = b;
		return (
			<AbsoluteCenter {...propsOf(b)}>
				{renderChildren(children as ComponentBlock[])}
			</AbsoluteCenter>
		);
	},

	splitter: (b) => {
		const { panels, ...rest } = propsOf(b);
		const resolvedPanels = Array.isArray(panels)
			? panels.map((panel: { id?: string; content?: ComponentBlock[] }) => ({
					id: panel.id,
					content:
						Array.isArray(panel.content) && panel.content.length > 0
							? renderBlocks(panel.content)[0]
							: undefined,
				}))
			: [];
		// Forced static: panel content is arbitrary nested JSX, which can't cross
		// the island's prop-serialisation boundary (unlike `children`, which
		// HonoX snapshots to HTML for hydration, `panels` is a plain prop and
		// would otherwise get JSON-serialised as a raw JSX element).
		return <Splitter interactive={false} panels={resolvedPanels} {...rest} />;
	},
};

// Safe fallback for an unrecognized block type. Previously this dumped the
// raw CMS payload as JSON to end users in production; now it always renders an
// inert marker element, emitting a dev-only warning so misconfiguration is
// still visible during development without leaking data.
function renderUnknown(block: ComponentBlock): JSX.Element {
	if (import.meta.env?.DEV) {
		console.warn(`[PageRenderer] Unknown component type: ${block.blockType}`);
	}
	return <div data-unknown-component={block.blockType} />;
}

function RenderBlock({
	block,
	...extraProps
}: {
	block: ComponentBlock;
	[key: string]: unknown;
}): JSX.Element {
	const render = registry[resolveType(block.blockType)];
	return render ? render({ ...block, ...extraProps }) : renderUnknown(block);
}

function renderBlocks(
	content?: ComponentBlock[] | null,
	extraProps?: Record<string, unknown>,
): JSX.Element[] {
	if (!content || !Array.isArray(content)) return [];
	return content.map((block, index) => (
		<RenderBlock
			key={`${block.blockType}-${index}`}
			block={block}
			{...extraProps}
		/>
	));
}

export { registry, renderBlocks, renderUnknown, resolveType };
