import { css, cx } from "design-system/css";
import { type TabsVariantProps, tabs } from "design-system/recipes";
import type { JSX } from "hono/jsx";
import {
	cloneElement,
	createContext,
	type PropsWithChildren,
	useContext,
	useId,
} from "hono/jsx";

type TabsStyles = ReturnType<typeof tabs>;

interface TabsContextValue {
	styles: TabsStyles;
	value?: string;
	onValueChange?: (value: string) => void;
	id: string;
	orientation: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = () => {
	const context = useContext(TabsContext);
	if (!context) {
		// During SSR, return a default context to avoid errors
		if (typeof window === "undefined") {
			return {
				id: "ssr-tabs",
				styles: tabs({}),
				orientation: "horizontal",
			} as TabsContextValue;
		}
		throw new Error("useTabsContext must be used within a Tabs.Root");
	}
	return context;
};

export interface RootProps extends TabsVariantProps, PropsWithChildren {
	defaultValue?: string;
	value?: string;
	onValueChange?: (value: string) => void;
	id?: string;
	orientation?: "horizontal" | "vertical";
	activationMode?: "automatic" | "manual";
	rootRef?: any;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = tabs.splitVariantProps(props);
	const {
		children,
		value,
		defaultValue,
		onValueChange,
		id: idProp,
		orientation = "horizontal",
		rootRef,
		...rest
	} = localProps;

	const styles = tabs(variantProps);
	const fallbackId = useId();
	const id = idProp || fallbackId;

	const contextValue: TabsContextValue = {
		styles,
		value: value ?? defaultValue,
		onValueChange,
		id,
		orientation,
	};

	return (
		<TabsContext.Provider value={contextValue}>
			<div
				id={id}
				ref={(el: HTMLDivElement | null) => {
					if (rootRef) rootRef.current = el;
				}}
				class={cx(styles.root, localProps.class)}
				data-orientation={orientation}
				data-scope="tabs"
				data-part="root"
				{...rest}
			>
				{children}
			</div>
		</TabsContext.Provider>
	);
}

export interface ListProps extends PropsWithChildren {
	class?: string;
}

export function List(props: ListProps) {
	const context = useTabsContext();
	return (
		<div
			role="tablist"
			class={cx(context.styles.list, props.class)}
			data-orientation={context.orientation}
			data-scope="tabs"
			data-part="list"
		>
			{props.children}
		</div>
	);
}

function CloseIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<title>Close</title>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<title>Add tab</title>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
}

export interface TriggerProps extends PropsWithChildren {
	value: string;
	disabled?: boolean;
	class?: string;
	asChild?: boolean;
	/** Icon rendered before the label. */
	icon?: JSX.Element;
	/** Render a close button inside the tab (used by closable/editable tabs). */
	closable?: boolean;
	onClose?: () => void;
	closeAriaLabel?: string;
}

export function Trigger(props: TriggerProps) {
	const {
		value,
		disabled,
		children,
		class: classProp,
		asChild,
		icon,
		closable,
		onClose,
		closeAriaLabel = "Close tab",
	} = props;
	const context = useTabsContext();
	const isSelected = context.value === value;

	const triggerProps = {
		role: "tab",
		disabled,
		"aria-selected": isSelected ? "true" : "false",
		"aria-controls": `tabs-content-${context.id}-${value}`,
		"data-selected": isSelected ? "" : undefined,
		"data-disabled": disabled ? "" : undefined,
		"data-value": value,
		"data-orientation": context.orientation,
		"data-scope": "tabs",
		"data-part": "trigger",
		tabIndex: isSelected ? 0 : -1,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			type: "button",
			class: cx(context.styles.trigger, classProp, child.props?.class),
		});
	}

	const label = (
		<>
			{icon}
			{children}
		</>
	);

	if (closable) {
		return (
			<div {...triggerProps} class={cx(context.styles.trigger, classProp)}>
				{label}
				<button
					type="button"
					data-scope="tabs"
					data-part="close"
					aria-label={closeAriaLabel}
					class={context.styles.close}
					onClick={(e) => {
						e.stopPropagation();
						onClose?.();
					}}
				>
					<CloseIcon />
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			{...triggerProps}
			class={cx(context.styles.trigger, classProp)}
		>
			{label}
		</button>
	);
}

export interface ContentProps extends PropsWithChildren {
	value: string;
	class?: string;
}

export function Content(props: ContentProps) {
	const { value, children, class: classProp } = props;
	const context = useTabsContext();
	const isSelected = context.value === value;

	return (
		<div
			id={`tabs-content-${context.id}-${value}`}
			role="tabpanel"
			data-scope="tabs"
			data-part="content"
			data-value={value}
			data-orientation={context.orientation}
			data-selected={isSelected ? "" : undefined}
			class={cx(context.styles.content, classProp)}
			hidden={!isSelected}
		>
			{children}
		</div>
	);
}

export interface IndicatorProps {
	class?: string;
	style?: any;
}

export function Indicator(props: IndicatorProps) {
	const { class: classProp, style, ...rest } = props;
	const context = useTabsContext();
	return (
		<div
			data-scope="tabs"
			data-part="indicator"
			data-orientation={context.orientation}
			class={cx(context.styles.indicator, classProp)}
			style={style}
			{...rest}
		/>
	);
}

export interface TabsItem {
	value: string;
	label: string | JSX.Element;
	content: string | JSX.Element;
	disabled?: boolean;
	/** Icon rendered before the label. */
	icon?: JSX.Element;
	/** Overrides the structure-level `closable`/`editable` default for this tab. */
	closable?: boolean;
}

export interface AddTriggerProps {
	class?: string;
	onAdd?: () => void;
	disabled?: boolean;
	ariaLabel?: string;
}

/** The trailing "+" trigger rendered by editable tab lists to append a new tab. */
export function AddTrigger(props: AddTriggerProps) {
	const { class: classProp, onAdd, disabled, ariaLabel = "Add tab" } = props;
	const context = useTabsContext();
	return (
		<button
			type="button"
			data-scope="tabs"
			data-part="add"
			aria-label={ariaLabel}
			disabled={disabled}
			data-disabled={disabled ? "" : undefined}
			class={cx(context.styles.add, classProp)}
			onClick={() => onAdd?.()}
		>
			<PlusIcon />
		</button>
	);
}

export interface TabsStructureProps {
	items: TabsItem[];
	indicator?: boolean;
	/** Every tab gets a close button (no "add" trigger). Per-item `closable` still wins. */
	closable?: boolean;
	/** Shorthand for `closable` plus a trailing "add tab" trigger. */
	editable?: boolean;
	onTabClose?: (value: string) => void;
	onTabAdd?: () => void;
	addAriaLabel?: string;
	/** Content rendered alongside the tab list — a single node, or split start/end. */
	extra?: JSX.Element | { start?: JSX.Element; end?: JSX.Element };
}

export const TabsStructure = (props: TabsStructureProps) => {
	const {
		items,
		indicator = true,
		closable,
		editable,
		onTabClose,
		onTabAdd,
		addAriaLabel,
		extra,
	} = props;
	const showClose = closable || editable;
	const isSplitExtra =
		extra != null &&
		typeof extra === "object" &&
		("start" in extra || "end" in extra);
	const extraStart = isSplitExtra
		? (extra as { start?: JSX.Element }).start
		: undefined;
	const extraEnd = isSplitExtra
		? (extra as { end?: JSX.Element }).end
		: extra;

	const list = (
		<List>
			{items.map((item) => (
				<Trigger
					key={item.value}
					value={item.value}
					disabled={item.disabled}
					icon={item.icon}
					closable={item.closable ?? showClose}
					onClose={() => onTabClose?.(item.value)}
				>
					{item.label}
				</Trigger>
			))}
			{editable && <AddTrigger onAdd={onTabAdd} ariaLabel={addAriaLabel} />}
			{indicator && <Indicator />}
		</List>
	);

	return (
		<>
			{extra ? (
				<div
					class={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "4",
						width: "full",
					})}
				>
					{extraStart}
					{list}
					{extraEnd}
				</div>
			) : (
				list
			)}
			{items.map((item) => (
				<Content key={item.value} value={item.value}>
					{item.content}
				</Content>
			))}
		</>
	);
};

export { Root as InteractiveRoot };
