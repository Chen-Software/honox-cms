import { css, cx } from "design-system/css";
import { type DropdownVariantProps, dropdown } from "design-system/recipes";
import {
	cloneElement,
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "hono/jsx";
import { ChevronRightIcon } from "../../icons/chevron-right";
import { whenAnimationEnds } from "./overlay-a11y";
import {
	getArrowRotation,
	getArrowStyle,
	getPlacementStyle,
	type OverlayPlacement,
	positionOverlay,
} from "./overlay-position";

const ARROW_OFFSET = "16px";

type DropdownStyles = ReturnType<typeof dropdown>;

const PLACEMENT_MAP: Record<
	string,
	{ side: OverlayPlacement; align: "start" | "center" | "end" }
> = {
	top: { side: "top", align: "center" },
	topLeft: { side: "top", align: "start" },
	"top-start": { side: "top", align: "start" },
	topRight: { side: "top", align: "end" },
	"top-end": { side: "top", align: "end" },
	bottom: { side: "bottom", align: "center" },
	bottomLeft: { side: "bottom", align: "start" },
	"bottom-start": { side: "bottom", align: "start" },
	bottomRight: { side: "bottom", align: "end" },
	"bottom-end": { side: "bottom", align: "end" },
	left: { side: "left", align: "center" },
	leftTop: { side: "left", align: "start" },
	"left-start": { side: "left", align: "start" },
	leftBottom: { side: "left", align: "end" },
	"left-end": { side: "left", align: "end" },
	right: { side: "right", align: "center" },
	rightTop: { side: "right", align: "start" },
	"right-start": { side: "right", align: "start" },
	rightBottom: { side: "right", align: "end" },
	"right-end": { side: "right", align: "end" },
};

/** Resolves a 12-way (or dash-case) placement name to `{ side, align }`. Defaults to `bottomLeft`. */
function resolveDropdownPlacement(placement?: string) {
	return (placement && PLACEMENT_MAP[placement]) || PLACEMENT_MAP.bottomLeft;
}

interface DropdownContextValue {
	id: string;
	open: boolean;
	disabled?: boolean;
	styles: DropdownStyles;
	onClose?: () => void;
	parentDropdownId?: string;
	rendered?: boolean;
	destroyOnHidden?: boolean;
	classNames?: Record<string, string>;
	stylesObj?: Record<string, any>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export const useDropdownContext = () => {
	const context = useContext(DropdownContext);
	if (!context) {
		// During SSR, return a default context to avoid errors
		if (typeof window === "undefined") {
			return {
				id: "ssr-dropdown",
				open: false,
				styles: dropdown({}),
				parentDropdownId: undefined,
				rendered: false,
				destroyOnHidden: false,
				classNames: {},
				stylesObj: {},
			} as DropdownContextValue;
		}
		throw new Error("useDropdownContext must be used within a Dropdown.Root");
	}
	return context;
};

export interface DropdownRootProps
	extends DropdownVariantProps,
		PropsWithChildren {
	id?: string;
	open?: boolean;
	/** Disables every trigger mode and renders the trigger as inert. Default `false`. */
	disabled?: boolean;
	onClose?: () => void;
	/** Called when the menu opens or closes (interactive islands only). */
	onOpenChange?: (open: boolean, info?: { source: "trigger" | "menu" }) => void;
	/** Called with an item's `value` when it is activated (interactive islands only). */
	onSelect?: (value: string) => void;
	rendered?: boolean;
	destroyOnHidden?: boolean;
	classNames?: Record<string, string>;
	stylesObj?: Record<string, any>;
}

interface DropdownRadioGroupContextValue {
	value?: string;
	onValueChange?: (details: { value: string }) => void;
}

const DropdownRadioGroupContext =
	createContext<DropdownRadioGroupContextValue | null>(null);

export const useDropdownRadioGroupContext = () =>
	useContext(DropdownRadioGroupContext);

export function DropdownRoot(props: DropdownRootProps) {
	const [variantProps, localProps] = dropdown.splitVariantProps(props);
	const {
		id: idProp,
		open = false,
		disabled,
		children,
		onClose,
		rendered = open,
		destroyOnHidden = false,
		classNames,
		stylesObj,
	} = localProps;
	const autoId = useId();
	const id = idProp || autoId;
	const styles = dropdown(variantProps);

	const parentContext = useContext(DropdownContext);

	return (
		<DropdownContext.Provider
			value={{
				id,
				open,
				disabled,
				styles,
				onClose,
				parentDropdownId: parentContext?.id,
				rendered,
				destroyOnHidden,
				classNames,
				stylesObj,
			}}
		>
			{children}
		</DropdownContext.Provider>
	);
}

export interface DropdownTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

export function DropdownTrigger(props: DropdownTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = useDropdownContext();
	const disabled = context.disabled;

	const triggerProps = {
		id: `dropdown-trigger-${context.id}`,
		"aria-haspopup": "menu",
		"aria-expanded": context.open ? "true" : "false",
		"aria-controls": `dropdown-content-${context.id}`,
		"aria-disabled": disabled ? "true" : undefined,
		"data-state": context.open ? "open" : "closed",
		"data-scope": "dropdown",
		"data-part": "trigger",
		"data-disabled": disabled ? "" : undefined,
		disabled: disabled || undefined,
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(
				context.styles.trigger,
				classProp,
				context.classNames?.trigger,
				child.props?.class,
			),
			style: { ...context.stylesObj?.trigger, ...child.props?.style },
		});
	}

	return (
		<button
			type="button"
			class={cx(context.styles.trigger, classProp, context.classNames?.trigger)}
			style={{ ...context.stylesObj?.trigger }}
			{...triggerProps}
		>
			{children}
		</button>
	);
}

export function DropdownContextTrigger(props: DropdownTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = useDropdownContext();

	const triggerProps = {
		id: `dropdown-trigger-${context.id}`,
		"aria-haspopup": "menu",
		"aria-expanded": context.open ? "true" : "false",
		"aria-controls": `dropdown-content-${context.id}`,
		"data-state": context.open ? "open" : "closed",
		"data-scope": "dropdown",
		"data-part": "context-trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(
				context.styles.contextTrigger,
				classProp,
				context.classNames?.trigger,
				child.props?.class,
			),
			style: { ...context.stylesObj?.trigger, ...child.props?.style },
		});
	}

	return (
		<div
			class={cx(
				context.styles.contextTrigger,
				classProp,
				context.classNames?.trigger,
			)}
			style={{ ...context.stylesObj?.trigger }}
			{...triggerProps}
		>
			{children}
		</div>
	);
}

export interface DropdownPositionerProps extends PropsWithChildren {
	class?: string;
	/** 12-way placement name; only meaningful for the top-level (non-submenu, non-context) trigger. */
	placement?: string;
	[key: string]: unknown;
}

export function DropdownPositioner(props: DropdownPositionerProps) {
	const {
		children,
		class: classProp,
		placement: placementProp,
		...restProps
	} = props;
	const context = useDropdownContext();

	if (context.destroyOnHidden && !context.rendered) {
		return null;
	}

	const { side, align } = resolveDropdownPlacement(placementProp);

	return (
		<div
			class={cx(
				context.styles.positioner,
				classProp,
				context.classNames?.positioner,
				context.classNames?.root,
				!context.open && css({ display: "none" }),
			)}
			data-state={context.open ? "open" : "closed"}
			data-scope="dropdown"
			data-part="positioner"
			data-placement={side}
			style={{
				position: "absolute",
				...getPlacementStyle(side, { align, arrowOffset: ARROW_OFFSET }),
				...context.stylesObj?.positioner,
				...context.stylesObj?.root,
			}}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownContentProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function DropdownContent(props: DropdownContentProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<div
			id={`dropdown-content-${context.id}`}
			role="menu"
			aria-labelledby={`dropdown-trigger-${context.id}`}
			class={cx(context.styles.content, classProp, context.classNames?.content)}
			data-state={context.open ? "open" : "closed"}
			tabIndex={-1}
			data-scope="dropdown"
			data-part="content"
			style={{ ...context.stylesObj?.content }}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownItemProps extends PropsWithChildren {
	id?: string;
	disabled?: boolean;
	class?: string;
	value?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

export function DropdownItem(props: DropdownItemProps) {
	const {
		children,
		id,
		disabled,
		class: classProp,
		value,
		asChild,
		...restProps
	} = props;
	const context = useDropdownContext();

	const itemProps = {
		id,
		role: "menuitem",
		"data-scope": "dropdown",
		"data-part": "item",
		"data-disabled": disabled ? "" : undefined,
		"data-value": value,
		"aria-disabled": disabled ? "true" : undefined,
		tabIndex: -1,
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...itemProps,
			class: cx(
				context.styles.item,
				classProp,
				context.classNames?.item,
				child.props?.class,
			),
			style: { ...context.stylesObj?.item, ...child.props?.style },
		});
	}

	return (
		<div
			class={cx(context.styles.item, classProp, context.classNames?.item)}
			style={{ ...context.stylesObj?.item }}
			{...itemProps}
		>
			{children}
		</div>
	);
}

export function DropdownTriggerItem(props: DropdownItemProps) {
	const { children, disabled, class: classProp, asChild, ...restProps } = props;
	const context = useDropdownContext();

	const itemProps = {
		id: `dropdown-trigger-${context.id}`,
		role: "menuitem",
		"aria-haspopup": "menu",
		"aria-expanded": context.open ? "true" : "false",
		"aria-controls": `dropdown-content-${context.id}`,
		"aria-disabled": disabled ? "true" : undefined,
		"data-state": context.open ? "open" : "closed",
		"data-scope": "dropdown",
		"data-part": "trigger-item",
		"data-disabled": disabled ? "" : undefined,
		tabIndex: -1,
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...itemProps,
			class: cx(
				context.styles.item,
				context.styles.triggerItem,
				classProp,
				context.classNames?.item,
				child.props?.class,
			),
			style: { ...context.stylesObj?.item, ...child.props?.style },
		});
	}

	return (
		<div
			class={cx(
				context.styles.item,
				context.styles.triggerItem,
				classProp,
				context.classNames?.item,
			)}
			style={{ ...context.stylesObj?.item }}
			{...itemProps}
		>
			{children}
			<ChevronRightIcon width="16" height="16" aria-hidden="true" />
		</div>
	);
}

export interface DropdownItemGroupProps extends PropsWithChildren {
	id?: string;
	class?: string;
	[key: string]: unknown;
}

export function DropdownItemGroup(props: DropdownItemGroupProps) {
	const { children, id, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<fieldset
			id={id}
			data-part="item-group"
			class={cx(context.styles.itemGroup, classProp)}
			{...restProps}
		>
			{children}
		</fieldset>
	);
}

export interface DropdownItemGroupLabelProps extends PropsWithChildren {
	htmlFor?: string;
	class?: string;
	[key: string]: unknown;
}

export function DropdownItemGroupLabel(props: DropdownItemGroupLabelProps) {
	const { children, htmlFor, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<div
			data-part="item-group-label"
			class={cx(context.styles.itemGroupLabel, classProp)}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownItemTextProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function DropdownItemText(props: DropdownItemTextProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<div
			data-part="item-text"
			class={cx(context.styles.itemText, classProp)}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownSeparatorProps {
	class?: string;
	[key: string]: unknown;
}

export function DropdownSeparator(props: DropdownSeparatorProps) {
	const { class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<hr
			data-part="separator"
			class={cx(context.styles.separator, classProp)}
			{...restProps}
		/>
	);
}

export interface DropdownIndicatorProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function DropdownIndicator(props: DropdownIndicatorProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<div
			data-part="indicator"
			class={cx(context.styles.indicator, classProp)}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownCheckboxItemProps extends DropdownItemProps {
	checked?: boolean;
}

export function DropdownCheckboxItem(props: DropdownCheckboxItemProps) {
	const {
		children,
		checked,
		disabled,
		value,
		class: classProp,
		...restProps
	} = props;
	const context = useDropdownContext();

	return (
		<div
			role="menuitemcheckbox"
			aria-checked={checked ? "true" : "false"}
			aria-disabled={disabled ? "true" : undefined}
			data-state={checked ? "checked" : "unchecked"}
			data-scope="dropdown"
			data-part="item"
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(context.styles.item, classProp, context.classNames?.item)}
			style={{ ...context.stylesObj?.item }}
			tabIndex={-1}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownRadioItemGroupProps extends DropdownItemGroupProps {
	value?: string;
	onValueChange?: (details: { value: string }) => void;
}

export function DropdownRadioItemGroup(props: DropdownRadioItemGroupProps) {
	const { children, value, onValueChange, ...restProps } = props;
	return (
		<DropdownRadioGroupContext.Provider value={{ value, onValueChange }}>
			<DropdownItemGroup {...restProps}>{children}</DropdownItemGroup>
		</DropdownRadioGroupContext.Provider>
	);
}

export interface DropdownRadioItemProps extends DropdownItemProps {
	value: string;
	checked?: boolean;
}

export function DropdownRadioItem(props: DropdownRadioItemProps) {
	const {
		children,
		value,
		checked,
		disabled,
		class: classProp,
		...restProps
	} = props;
	const context = useDropdownContext();
	const radioGroup = useDropdownRadioGroupContext();
	const isChecked = checked ?? radioGroup?.value === value;

	return (
		<div
			role="menuitemradio"
			aria-checked={isChecked ? "true" : "false"}
			aria-disabled={disabled ? "true" : undefined}
			data-state={isChecked ? "checked" : "unchecked"}
			data-scope="dropdown"
			data-part="item"
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(context.styles.item, classProp, context.classNames?.item)}
			style={{ ...context.stylesObj?.item }}
			tabIndex={-1}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownItemIndicatorProps extends PropsWithChildren {
	class?: string;
	checked?: boolean;
	[key: string]: unknown;
}

export function DropdownItemIndicator(props: DropdownItemIndicatorProps) {
	const { children, checked, class: classProp, ...restProps } = props;
	const context = useDropdownContext();

	return (
		<div
			data-scope="dropdown"
			data-part="item-indicator"
			data-state={
				checked === undefined ? undefined : checked ? "checked" : "unchecked"
			}
			class={cx(context.styles.itemIndicator, classProp)}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface DropdownArrowProps extends PropsWithChildren {
	class?: string;
	placement?: string;
	[key: string]: unknown;
}

export function DropdownArrow(props: DropdownArrowProps) {
	const {
		children,
		class: classProp,
		placement: placementProp,
		...restProps
	} = props;
	const context = useDropdownContext();
	const { side, align } = resolveDropdownPlacement(placementProp);
	return (
		<div
			class={cx(context.styles.arrow, classProp, context.classNames?.arrow)}
			data-scope="dropdown"
			data-part="arrow"
			style={{
				...getArrowStyle(side, { align, arrowOffset: ARROW_OFFSET }),
				...context.stylesObj?.arrow,
			}}
			{...restProps}
		>
			{children}
		</div>
	);
}

export function DropdownArrowTip(props: {
	class?: string;
	placement?: string;
}) {
	const { class: classProp, placement: placementProp, ...restProps } = props;
	const context = useDropdownContext();
	const { side } = resolveDropdownPlacement(placementProp);
	return (
		<div
			class={cx(
				context.styles.arrowTip,
				classProp,
				context.classNames?.arrowTip,
			)}
			data-scope="dropdown"
			data-part="arrow-tip"
			style={{
				transform: `rotate(${getArrowRotation(side)}deg)`,
				...context.stylesObj?.arrowTip,
			}}
			{...restProps}
		/>
	);
}

// ============= Interactive island engine =============

export interface InteractiveDropdownRootProps extends DropdownRootProps {
	defaultOpen?: boolean;
	placement?: string;
	trigger?:
		| ("click" | "hover" | "contextDropdown" | "contextMenu")[]
		| "click"
		| "hover"
		| "contextDropdown"
		| "contextMenu";
	mouseEnterDelay?: number;
	mouseLeaveDelay?: number;
	arrow?: boolean | { pointAtCenter?: boolean };
	/** Close when Escape is pressed. Default `true`. */
	closeOnEscape?: boolean;
	/**
	 * Marks this instance as a cascading submenu, nested inside a parent
	 * menu's content. Changes the root wrapper from a positioned box (for the
	 * top-level trigger-anchored math) to a transparent one (so its
	 * `TriggerItem` lays out as a normal flex child of the parent's content),
	 * and anchors its content beside the trigger item instead of below/around
	 * a top-level trigger. Internal — set by `Dropdown`'s submenu rendering.
	 */
	submenu?: boolean;
}

function normaliseTriggerModes(
	mode: InteractiveDropdownRootProps["trigger"],
): ("click" | "hover" | "contextDropdown")[] {
	if (!mode) return ["click"];
	const array = Array.isArray(mode) ? mode : [mode];
	return array.map((m) => {
		if (m === "contextMenu") return "contextDropdown";
		return m;
	}) as ("click" | "hover" | "contextDropdown")[];
}

export function InteractiveDropdownRoot(props: InteractiveDropdownRootProps) {
	const {
		open: openProp,
		defaultOpen,
		children,
		id: idProp,
		disabled,
		onOpenChange,
		onSelect,
		onClose,
		placement = "bottomLeft",
		trigger: triggerMode,
		mouseEnterDelay = 150,
		mouseLeaveDelay = 100,
		closeOnEscape = true,
		submenu = false,
		arrow,
		destroyOnHidden,
		classNames,
		styles,
		...rest
	} = props;

	const isControlled = openProp !== undefined;
	const [isOpen, setIsOpen] = useState(openProp ?? defaultOpen ?? false);
	const open = isControlled ? openProp : isOpen;

	const [isRendered, setIsRendered] = useState(open);

	const fallbackId = useId();
	const rootIdRef = useRef<string | null>(null);
	if (!rootIdRef.current) {
		rootIdRef.current = idProp || `dropdown-${fallbackId}`;
	}
	const rootId = rootIdRef.current;

	const rootRef = useRef<HTMLElement | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const contentRef = useRef<HTMLElement | null>(null);
	const positionerRef = useRef<HTMLElement | null>(null);

	// Checked-state overrides applied on top of the server-rendered
	// checkbox/radio props, keyed by item value. State changes (open/close)
	// re-render this subtree from the original `items` props, which would
	// otherwise reset any client-side toggle; re-applied after every render.
	const checkedOverridesRef = useRef<Map<string, boolean>>(new Map());

	const isOpenRef = useRef(isOpen);
	isOpenRef.current = open;

	const onOpenChangeRef = useRef(onOpenChange);
	onOpenChangeRef.current = onOpenChange;
	const onSelectRef = useRef(onSelect);
	onSelectRef.current = onSelect;
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	const closeOnEscapeRef = useRef(closeOnEscape);
	closeOnEscapeRef.current = closeOnEscape;

	const triggerActions = disabled ? [] : normaliseTriggerModes(triggerMode);
	// Structural inputs to the mount effect below (which trigger modes are
	// wired up, hover delays, placement math) — changing any of these
	// re-registers the DOM listeners with fresh values. Plain callback props
	// use the refs above instead, so they stay fresh without a full rebuild.
	const triggerModeKey = triggerActions.join(",");

	// Items belonging to this menu level (submenu items live in their own
	// nested content and are handled by their own island instance).
	const getItems = () => {
		const content = contentRef.current;
		if (!content) return [];
		return Array.from(
			content.querySelectorAll<HTMLElement>(
				'[data-part="item"]:not([data-disabled]), [data-part="trigger-item"]:not([data-disabled])',
			),
		).filter((el) => el.closest('[data-part="content"]') === content);
	};

	const ownsTarget = (el: HTMLElement) =>
		el.closest("[data-overlay-root]") === rootRef.current;

	const setItemChecked = (item: HTMLElement, checked: boolean) => {
		item.setAttribute("aria-checked", String(checked));
		item.setAttribute("data-state", checked ? "checked" : "unchecked");
		item
			.querySelector('[data-part="item-indicator"]')
			?.setAttribute("data-state", checked ? "checked" : "unchecked");
		const value = item.getAttribute("data-value");
		if (value) checkedOverridesRef.current.set(value, checked);
	};

	const toggleChecked = (item: HTMLElement, role: string) => {
		if (role === "menuitemcheckbox") {
			setItemChecked(item, item.getAttribute("aria-checked") !== "true");
			return;
		}
		// Radio: check this item, uncheck its group siblings.
		const scope =
			item.closest<HTMLElement>('[data-part="item-group"]') ||
			contentRef.current;
		scope
			?.querySelectorAll<HTMLElement>('[role="menuitemradio"]')
			.forEach((el) => {
				setItemChecked(el, el === item);
			});
	};

	const applyCheckedOverrides = () => {
		const content = contentRef.current;
		if (!content) return;
		checkedOverridesRef.current.forEach((checked, value) => {
			const item = content.querySelector<HTMLElement>(
				`[data-part="item"][data-value="${CSS.escape(value)}"]`,
			);
			if (item?.getAttribute("role")?.startsWith("menuitem")) {
				item.setAttribute("aria-checked", String(checked));
				item.setAttribute("data-state", checked ? "checked" : "unchecked");
				item
					.querySelector('[data-part="item-indicator"]')
					?.setAttribute("data-state", checked ? "checked" : "unchecked");
			}
		});
	};

	// Positions the top-level (trigger-anchored) menu using the shared
	// overlay math, or a context menu / submenu using pointer / item-relative
	// coordinates that overlay-position.ts doesn't model.
	const updatePosition = (e?: MouseEvent) => {
		const trigger = triggerRef.current;
		const positioner = positionerRef.current;
		const content = contentRef.current;
		const root = rootRef.current;
		if (!positioner || !trigger || !root) return;

		const part = trigger.getAttribute("data-part");

		if (part === "trigger") {
			positioner.style.position = "absolute";
			positioner.style.removeProperty("top");
			positioner.style.removeProperty("left");
			const { align } = resolveDropdownPlacement(placement);
			const isPointAtCenter =
				typeof arrow === "object" && arrow !== null && "pointAtCenter" in arrow
					? !!arrow.pointAtCenter
					: false;
			positionOverlay(root, {
				align,
				arrowOffset: ARROW_OFFSET,
				pointAtCenter: isPointAtCenter,
			});
			return;
		}

		// Context menu (pointer-anchored) and submenu (item-anchored) both
		// escape their content's normal box via fixed, viewport-relative
		// coordinates computed by hand.
		positioner.style.position = "fixed";
		const menuWidth = content?.offsetWidth || 200;
		const menuHeight = content?.offsetHeight || 200;
		let x = 0;
		let y = 0;

		if (part === "context-trigger" && e) {
			x = e.clientX;
			y = e.clientY;
			if (x + menuWidth > window.innerWidth) x -= menuWidth;
			if (y + menuHeight > window.innerHeight) y -= menuHeight;
		} else {
			// Submenu: open beside its trigger item, flipping to the left
			// when there isn't room on the right.
			const rect = trigger.getBoundingClientRect();
			x = rect.right;
			y = rect.top;
			if (x + menuWidth > window.innerWidth)
				x = Math.max(0, rect.left - menuWidth);
			if (y + menuHeight > window.innerHeight) {
				y = Math.max(0, window.innerHeight - menuHeight);
			}
		}

		x = Math.max(0, Math.min(x, window.innerWidth - menuWidth));
		y = Math.max(0, Math.min(y, window.innerHeight - menuHeight));
		positioner.style.top = `${y}px`;
		positioner.style.left = `${x}px`;
	};

	// Pure DOM effect of opening/closing, decoupled from who asked for it (a
	// user interaction below, or a controlled `open` prop flipped by a parent).
	// Closing defers `display: none` until the `_closed` exit animation
	// actually finishes, so it gets a chance to play instead of being cut off.
	const cancelPendingHideRef = useRef<() => void>(() => {});
	const applyOpenState = (
		next: boolean,
		e?: MouseEvent,
		focusItem: "first" | "last" | null = null,
	) => {
		const positioner = positionerRef.current;
		if (!positioner) return;
		cancelPendingHideRef.current();
		if (next) {
			positioner.style.setProperty("display", "block", "important");
			positioner.setAttribute("data-state", "open");
			contentRef.current?.setAttribute("data-state", "open");
			setTimeout(() => {
				applyCheckedOverrides();
				updatePosition(e);
				if (focusItem) {
					const items = getItems();
					(focusItem === "last" ? items[items.length - 1] : items[0])?.focus();
				}
			}, 0);
		} else {
			positioner.setAttribute("data-state", "closed");
			contentRef.current?.setAttribute("data-state", "closed");
			const animatedEl = contentRef.current ?? positioner;
			cancelPendingHideRef.current = whenAnimationEnds(animatedEl, () => {
				positioner.style.setProperty("display", "none", "important");
				setIsRendered(false);
			});
		}
	};

	const handleOpen = (
		e?: MouseEvent,
		focusItem: "first" | "last" = "first",
	) => {
		setIsRendered(true);
		applyOpenState(true, e, focusItem);
		if (!isControlled) setIsOpen(true);
		onOpenChangeRef.current?.(true, { source: "trigger" });
	};

	const handleClose = (source: "trigger" | "menu" = "trigger") => {
		applyOpenState(false);
		if (!isControlled) setIsOpen(false);
		onOpenChangeRef.current?.(false, { source });
		onCloseRef.current?.();
	};

	// Sync a controlled `open` prop into the DOM (uncontrolled changes already
	// flow through `handleOpen`/`handleClose` above, which call this via
	// `setIsOpen`/re-render — this effect is a no-op the first time it runs
	// since the SSR-rendered class already reflects the initial state).
	const isFirstRenderRef = useRef(true);
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (!isFirstRenderRef.current) {
			if (open) {
				setIsRendered(true);
			}
			applyOpenState(open);
		}
		isFirstRenderRef.current = false;
	}, [open]);

	// Positioner-sync effect that runs whenever `isRendered` becomes true and `open` is true
	useEffect(() => {
		if (open && isRendered) {
			const root = document.getElementById(rootId);
			if (root) {
				rootRef.current = root;
				triggerRef.current = root.querySelector<HTMLElement>(
					'[data-part="trigger"], [data-part="context-trigger"], [data-part="trigger-item"]',
				);
				contentRef.current = root.querySelector<HTMLElement>(
					'[data-part="content"]',
				);
				positionerRef.current = root.querySelector<HTMLElement>(
					'[data-part="positioner"]',
				);
			}
			updatePosition();
			applyCheckedOverrides();
		}
	}, [open, isRendered]);

	useEffect(() => {
		if (typeof document === "undefined") return;

		const root = document.getElementById(rootId);
		if (!root) return;

		rootRef.current = root;
		triggerRef.current = root.querySelector<HTMLElement>(
			'[data-part="trigger"], [data-part="context-trigger"], [data-part="trigger-item"]',
		);
		contentRef.current = root.querySelector<HTMLElement>(
			'[data-part="content"]',
		);
		positionerRef.current = root.querySelector<HTMLElement>(
			'[data-part="positioner"]',
		);
		const triggerEl = triggerRef.current;
		const contentEl = contentRef.current;

		// State changes re-render the subtree from the original props; restore
		// any client-side checkbox/radio toggles.
		applyCheckedOverrides();
		if (isOpenRef.current) updatePosition();

		let openTimer: ReturnType<typeof setTimeout> | null = null;
		let closeTimer: ReturnType<typeof setTimeout> | null = null;

		const clearTimers = () => {
			if (openTimer) clearTimeout(openTimer);
			if (closeTimer) clearTimeout(closeTimer);
			openTimer = null;
			closeTimer = null;
		};

		const requestOpen = (delay: number) => {
			if (closeTimer) {
				clearTimeout(closeTimer);
				closeTimer = null;
			}
			if (isOpenRef.current || openTimer) return;
			openTimer = setTimeout(() => {
				openTimer = null;
				handleOpen();
			}, delay);
		};

		const requestClose = (delay: number) => {
			if (openTimer) {
				clearTimeout(openTimer);
				openTimer = null;
			}
			if (closeTimer || !isOpenRef.current) return;
			closeTimer = setTimeout(() => {
				closeTimer = null;
				handleClose("trigger");
			}, delay);
		};

		const handleClick = (e: MouseEvent) => {
			const target = (e.target as HTMLElement).closest<HTMLElement>(
				"[data-part]",
			);
			if (!target) return;

			const dataPart = target.getAttribute("data-part");

			if (dataPart === "trigger" || dataPart === "trigger-item") {
				// Only the menu level owning this trigger reacts; a submenu's
				// trigger-item bubbles through ancestor roots.
				if (
					!ownsTarget(target) ||
					target.hasAttribute("data-disabled") ||
					!triggerActions.includes("click")
				) {
					return;
				}
				clearTimers();
				if (isOpenRef.current) handleClose("trigger");
				else handleOpen(e);
			} else if (dataPart === "item") {
				if (target.hasAttribute("data-disabled")) return;
				const role = target.getAttribute("role") || "";
				const value = target.getAttribute("data-value") || "";

				if (role === "menuitemcheckbox" || role === "menuitemradio") {
					// Toggle in place and keep the menu open.
					if (ownsTarget(target)) {
						toggleChecked(target, role);
						onSelectRef.current?.(value);
					}
					return;
				}

				// A regular item closes every menu level it bubbles through.
				if (ownsTarget(target)) onSelectRef.current?.(value);
				handleClose("menu");
				if (triggerRef.current?.getAttribute("data-part") === "trigger") {
					triggerRef.current.focus();
				}
			}
		};

		const handleContextMenu = (e: MouseEvent) => {
			if (!triggerActions.includes("contextDropdown")) return;
			const target = (e.target as HTMLElement).closest<HTMLElement>(
				'[data-part="context-trigger"]',
			);
			if (target && ownsTarget(target)) {
				e.preventDefault();
				handleOpen(e);
			}
		};

		const handleMouseOver = (e: MouseEvent) => {
			if (!isOpenRef.current) return;
			const item = (e.target as HTMLElement).closest<HTMLElement>(
				'[data-part="item"], [data-part="trigger-item"]',
			);
			if (
				item &&
				!item.hasAttribute("data-disabled") &&
				item.closest('[data-part="content"]') === contentRef.current
			) {
				item.focus();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			const eventTarget = e.target as HTMLElement;
			if (eventTarget.closest("[data-overlay-root]") !== root) return;

			if (
				!isOpenRef.current &&
				(e.key === "Enter" ||
					e.key === " " ||
					e.key === "ArrowDown" ||
					e.key === "ArrowUp")
			) {
				if (
					eventTarget.closest(
						'[data-part="trigger"], [data-part="trigger-item"]',
					)
				) {
					handleOpen(undefined, e.key === "ArrowUp" ? "last" : "first");
					e.preventDefault();
				}
				return;
			}

			if (!isOpenRef.current) return;

			const items = getItems();
			const currentIndex = items.indexOf(document.activeElement as HTMLElement);

			if (e.key === "Escape") {
				if (!closeOnEscapeRef.current) return;
				handleClose("trigger");
				triggerRef.current?.focus();
				e.preventDefault();
				e.stopPropagation();
			} else if (e.key === "Tab") {
				handleClose("trigger");
			} else if (e.key === "ArrowDown") {
				items[(currentIndex + 1) % items.length]?.focus();
				e.preventDefault();
			} else if (e.key === "ArrowUp") {
				items[(currentIndex - 1 + items.length) % items.length]?.focus();
				e.preventDefault();
			} else if (e.key === "ArrowRight") {
				const currentItem = document.activeElement as HTMLElement;
				if (currentItem?.getAttribute("data-part") === "trigger-item") {
					currentItem.click();
					e.preventDefault();
				}
			} else if (e.key === "ArrowLeft") {
				if (triggerRef.current?.getAttribute("data-part") === "trigger-item") {
					handleClose("trigger");
					triggerRef.current?.focus();
					e.preventDefault();
					e.stopPropagation();
				}
			} else if (e.key === "Home") {
				items[0]?.focus();
				e.preventDefault();
			} else if (e.key === "End") {
				items[items.length - 1]?.focus();
				e.preventDefault();
			} else if (e.key === "Enter" || e.key === " ") {
				const currentItem = document.activeElement as HTMLElement;
				if (items.includes(currentItem)) {
					currentItem.click();
					e.preventDefault();
				}
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (isOpenRef.current && root && !root.contains(e.target as Node)) {
				handleClose("trigger");
			}
		};

		const handleReposition = () => {
			// Context menus are anchored to the pointer, not the trigger; leave
			// them where they opened.
			if (
				isOpenRef.current &&
				triggerRef.current?.getAttribute("data-part") !== "context-trigger"
			) {
				updatePosition();
			}
		};

		const handleScroll = (e: Event) => {
			// The top-level trigger's menu is `position: absolute` and scrolls
			// with the page for free (see updatePosition); only the pointer- and
			// item-anchored `position: fixed` cases (context menu, submenu) can
			// visually detach from their anchor on scroll, so only those close.
			if (triggerRef.current?.getAttribute("data-part") === "trigger") return;
			if (
				isOpenRef.current &&
				!contentRef.current?.contains(e.target as Node)
			) {
				handleClose("trigger");
			}
		};

		const onTriggerEnter = () => requestOpen(mouseEnterDelay);
		const onTriggerLeave = () => requestClose(mouseLeaveDelay);
		// Moving onto the content itself keeps the menu open (WCAG 1.4.13).
		const onContentEnter = () => requestOpen(0);
		const onContentLeave = () => requestClose(mouseLeaveDelay);

		root.addEventListener("click", handleClick);
		root.addEventListener("contextmenu", handleContextMenu);
		root.addEventListener("mouseover", handleMouseOver);
		root.addEventListener("keydown", handleKeyDown);
		window.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("scroll", handleScroll, true);
		window.addEventListener("resize", handleReposition);

		const hoverEnabled = triggerActions.includes("hover") && triggerEl;
		if (hoverEnabled) {
			triggerEl.addEventListener("mouseenter", onTriggerEnter);
			triggerEl.addEventListener("mouseleave", onTriggerLeave);
			if (contentEl) {
				contentEl.addEventListener("mouseenter", onContentEnter);
				contentEl.addEventListener("mouseleave", onContentLeave);
			}
		}

		return () => {
			clearTimers();
			cancelPendingHideRef.current();
			root.removeEventListener("click", handleClick);
			root.removeEventListener("contextmenu", handleContextMenu);
			root.removeEventListener("mouseover", handleMouseOver);
			root.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", handleReposition);
			if (hoverEnabled) {
				triggerEl.removeEventListener("mouseenter", onTriggerEnter);
				triggerEl.removeEventListener("mouseleave", onTriggerLeave);
				if (contentEl) {
					contentEl.removeEventListener("mouseenter", onContentEnter);
					contentEl.removeEventListener("mouseleave", onContentLeave);
				}
			}
		};
		// Callback props (onOpenChange/onSelect/onClose/closeOnEscape) are read
		// through refs above and don't need to retrigger this effect; the deps
		// below are the ones that change which listeners get wired up or how
		// positioning math runs.
	}, [
		rootId,
		disabled,
		triggerModeKey,
		mouseEnterDelay,
		mouseLeaveDelay,
		placement,
	]);

	return (
		<div
			id={rootId}
			data-scope="dropdown"
			data-part="root"
			data-overlay-root
			style={
				submenu
					? { display: "contents" }
					: { position: "relative", display: "inline-block" }
			}
		>
			<DropdownRoot
				{...rest}
				disabled={disabled}
				open={open}
				rendered={isRendered}
				destroyOnHidden={destroyOnHidden}
				classNames={classNames}
				stylesObj={styles}
				id={rootId}
				onClose={onClose}
			>
				{children}
			</DropdownRoot>
		</div>
	);
}

export { DropdownContext as Context };
