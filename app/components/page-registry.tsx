import { css } from "design-system/css";
import { type ComponentBlock, propsOf } from "./block-types";
import {
	Alert,
	AlertIcon,
	Anchor,
	Badge,
	Button,
	Card,
	Checkbox,
	Collapsible,
	ColorPicker,
	Combobox,
	Dialog,
	Drawer,
	Dropdown,
	Field,
	Fieldset,
	FileUpload,
	Grid,
	Group,
	Heading,
	HoverCard,
	PaginatedTable,
	Pagination,
	Popover,
	Progress,
	RadioGroup,
	SegmentGroup,
	Select,
	Skeleton,
	Slider,
	Stack,
	Switch,
	Text,
} from "./ui";

type BlockRenderer = (block: ComponentBlock) => JSX.Element;

// CMS content may use either casing for a given block type; both map to the
// same renderer. Aliases are declared once here — renderers are registered
// only under their canonical (camelCase) key.
const TYPE_ALIASES: Record<string, string> = {
	"file-upload": "fileUpload",
	"hover-card": "hoverCard",
	"paginated-table": "paginatedTable",
	"radio-group": "radioGroup",
	"segment-group": "segmentGroup",
	"grid-col": "gridCol",
	"grid-row": "grid",
	"color-picker": "colorPicker",
	menu: "dropdown",
	link: "anchor",
};

function resolveType(type: string): string {
	return TYPE_ALIASES[type] ?? type;
}

// Recursively render a list of nested blocks (used by container renderers).
// `children` is pulled from the full block by callers — `propsOf` strips it —
// so it never leaks as a DOM attribute.
function renderChildren(children?: ComponentBlock[]): JSX.Element[] {
	if (!children || !Array.isArray(children)) return [];
	return children.map((block, index) => (
		<RenderBlock key={`${block.type}-${index}`} block={block} />
	));
}

function tryParseJSON(val: unknown): unknown {
	if (typeof val === "string") {
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

// One entry per supported block type. Each body ports the previous renderer
// verbatim, with the single change that cleaned props come from `propsOf(block)`
// (which strips `type`/`children`) so those meta-keys can never reach the DOM.
// Containers that nest children destructure `children` from the full block `b`
// and the remaining props from `propsOf(b)`.
const registry: Record<string, BlockRenderer> = {
	grid: (b) => {
		const { children } = b;
		const props = propsOf(b);

		const resolvedProps: Record<string, unknown> = {};
		for (const key of Object.keys(props)) {
			resolvedProps[key] = tryParseJSON(props[key]);
		}

		return (
			<Grid {...resolvedProps}>
				{renderChildren(children as ComponentBlock[])}
			</Grid>
		);
	},

	stack: (b) => {
		const { children } = b;
		return (
			<Stack {...propsOf(b)}>
				{renderChildren(children as ComponentBlock[])}
			</Stack>
		);
	},

	button: (b) => {
		const { text, ...rest } = propsOf(b);
		return <Button {...rest}>{text}</Button>;
	},

	badge: (b) => {
		const { text, ...rest } = propsOf(b);
		return <Badge {...rest}>{text}</Badge>;
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
		return <Heading {...rest}>{text}</Heading>;
	},

	text: (b) => {
		const { content, ...rest } = propsOf(b);
		return <Text {...rest}>{content}</Text>;
	},

	anchor: (b) => {
		const { text, ...rest } = propsOf(b);
		return <Anchor {...rest}>{text}</Anchor>;
	},

	card: (b) => {
		const { children } = b;
		const { title, description, body, image, imagePosition, ...rest } =
			propsOf(b);
		return (
			<Card
				title={title}
				description={description}
				body={body}
				image={image}
				imagePosition={imagePosition}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Card>
		);
	},

	checkbox: (b) => {
		const { label, checked, disabled, invalid, size, colorPalette, ...rest } =
			propsOf(b);
		return (
			<Checkbox
				interactive
				checked={checked}
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
				class={css({
					transition: "transform 0.2s",
					"[data-state=open] &": { transform: "rotate(180deg)" },
				})}
			>
				<title>Chevron Down</title>
				<path d="m6 9 6 6 6-6" />
			</svg>
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
				role={role}
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Dialog>
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
				{...rest}
			>
				{renderChildren(children as ComponentBlock[])}
			</Drawer>
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

	fieldset: (b) => {
		const { children } = b;
		const { legend, helperText, errorText, disabled, invalid, ...rest } =
			propsOf(b);
		return (
			<Fieldset
				legend={legend}
				helperText={helperText}
				errorText={errorText}
				disabled={disabled}
				invalid={invalid}
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
		const { triggerText, showArrow, title, description, ...rest } = propsOf(b);
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
			<HoverCard
				interactive
				trigger={trigger}
				showArrow={showArrow}
				content={content}
				{...rest}
			/>
		);
	},

	dropdown: (b) => {
		const { triggerText, items, ...rest } = propsOf(b);
		const trigger = triggerText ? (
			<Button variant="outline">{triggerText}</Button>
		) : undefined;
		return (
			<Dropdown interactive trigger={trigger} items={items || []} {...rest} />
		);
	},

	popover: (b) => {
		const { children } = b;
		const {
			triggerText,
			title,
			description,
			body,
			footer,
			showArrow,
			closable,
			...rest
		} = propsOf(b);
		const trigger = triggerText ? (
			<Button variant="outline">{triggerText}</Button>
		) : undefined;
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

	paginatedTable: (b) => <PaginatedTable {...propsOf(b)} />,
	pagination: (b) => <Pagination interactive {...propsOf(b)} />,
	progress: (b) => <Progress {...propsOf(b)} />,
	radioGroup: (b) => <RadioGroup interactive {...propsOf(b)} />,
	segmentGroup: (b) => <SegmentGroup interactive {...propsOf(b)} />,

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
	switch: (b) => <Switch interactive {...propsOf(b)} />,
	colorPicker: (b) => <ColorPicker interactive {...propsOf(b)} />,
};

// Safe fallback for an unrecognized block type. Previously this dumped the
// raw CMS payload as JSON to end users in production; now it always renders an
// inert marker element, emitting a dev-only warning so misconfiguration is
// still visible during development without leaking data.
function renderUnknown(block: ComponentBlock): JSX.Element {
	if (import.meta.env?.DEV) {
		console.warn(`[PageRenderer] Unknown component type: ${block.type}`);
	}
	return <div data-unknown-component={block.type} />;
}

function RenderBlock({
	block,
	...extraProps
}: {
	block: ComponentBlock;
	[key: string]: unknown;
}): JSX.Element {
	const render = registry[resolveType(block.type)];
	return render ? render({ ...block, ...extraProps }) : renderUnknown(block);
}

function renderBlocks(
	content?: ComponentBlock[] | null,
	extraProps?: Record<string, unknown>,
): JSX.Element[] {
	if (!content || !Array.isArray(content)) return [];
	return content.map((block, index) => (
		<RenderBlock key={`${block.type}-${index}`} block={block} {...extraProps} />
	));
}

export { registry, renderBlocks, renderUnknown, resolveType };
