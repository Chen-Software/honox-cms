import type { PropsWithChildren } from "hono/jsx";
import {
	cloneElement,
	createContext,
	useContext,
	useId,
	useRef,
	useState,
} from "hono/jsx";
import { css, cx } from "styled-system/css";
import type { DrawerVariantProps } from "styled-system/recipes";
import { drawer } from "styled-system/recipes";
import { hasPart, useOverlay } from "./overlay-a11y";

type DrawerStyles = ReturnType<typeof drawer>;

interface DrawerContextValue {
	styles: DrawerStyles;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	id: string;
	dialogRole?: "dialog" | "alertdialog";
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

const useDrawerContext = () => {
	const context = useContext(DrawerContext);
	return context;
};

export interface RootProps extends DrawerVariantProps, PropsWithChildren {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	id?: string;
	rootRef?: any;
	dialogRole?: "dialog" | "alertdialog";
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = drawer.splitVariantProps(props);
	const {
		children,
		open,
		onOpenChange,
		id: idProp,
		rootRef,
		dialogRole,
	} = localProps;
	const styles = drawer(variantProps);
	const generatedId = useId();
	const id = idProp || generatedId;

	const value = {
		styles,
		open,
		onOpenChange,
		id,
		dialogRole,
	};

	return (
		<div id={id} ref={rootRef}>
			<DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
		</div>
	);
}

export interface TriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
}

export function Trigger(props: TriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = useDrawerContext();
	const open = context?.open;

	const triggerProps = {
		"aria-haspopup": "dialog",
		"aria-expanded": open,
		"data-part": "trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(classProp, child.props?.class),
		});
	}

	return (
		<button type="button" {...triggerProps}>
			{children}
		</button>
	);
}

export interface BackdropProps extends PropsWithChildren {
	class?: string;
}

export function Backdrop(props: BackdropProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();
	const open = context?.open;
	return (
		<div
			class={cx(
				styles.backdrop,
				"drawer__backdrop",
				classProp,
				!open && css({ display: "none" }),
			)}
			data-state={open ? "open" : "closed"}
			data-part="backdrop"
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface PositionerProps extends PropsWithChildren {
	class?: string;
}

export function Positioner(props: PositionerProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();
	const open = context?.open;

	return (
		<div
			class={cx(
				styles.positioner,
				"drawer__positioner",
				classProp,
				!open && css({ display: "none" }),
			)}
			data-state={open ? "open" : "closed"}
			data-part="positioner"
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface ContentProps extends PropsWithChildren {
	class?: string;
	"aria-label"?: string;
}

export function Content(props: ContentProps) {
	const {
		children,
		class: classProp,
		"aria-label": ariaLabel,
		...restProps
	} = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();
	const open = context?.open;
	const id = context?.id;
	const role = context?.dialogRole ?? "dialog";

	const titleId = id ? `${id}-title` : undefined;
	const descriptionId = id ? `${id}-description` : undefined;

	// Accessible name resolution (WAI-ARIA):
	//  - explicit `aria-label` wins
	//  - else reference the visible Title via `aria-labelledby` (Title renders id `${id}-title`)
	//  - else fall back to a role-based default so screen readers always get *something*
	//    (this avoids pointing `aria-labelledby` at a non-existent element when `title` is omitted)
	//
	// Detection is by component TYPE reference (`hasPart(children, Title)`), not by a
	// `data-part` prop, because the `data-part="title"` marker is applied inside `Title`'s
	// render and is not present on the `<Title>` element's props at this point.
	const titleRendered = hasPart(children, Title);
	const hasDescription = hasPart(children, Description);
	const describedBy =
		descriptionId && hasDescription ? descriptionId : undefined;

	const nameProps = ariaLabel
		? { "aria-label": ariaLabel }
		: titleRendered
			? { "aria-labelledby": titleId }
			: { "aria-label": role === "alertdialog" ? "Alert" : "Dialog" };

	// Dev aid: a drawer must have an accessible name (WAI-ARIA). Warn client-side only.
	if (typeof window !== "undefined" && !ariaLabel && !titleRendered) {
		console.warn(
			"[Drawer] Missing accessible name: provide a `title` or `aria-label` so screen readers can identify the drawer.",
		);
	}

	return (
		<div
			role={role}
			data-part="content"
			aria-modal="true"
			tabIndex={-1}
			{...nameProps}
			{...(describedBy ? { "aria-describedby": describedBy } : {})}
			class={cx(
				styles.content,
				"drawer__content",
				classProp,
				!open && css({ display: "none" }),
			)}
			data-state={open ? "open" : "closed"}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface HeaderProps extends PropsWithChildren {
	class?: string;
}

export function Header(props: HeaderProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();

	return (
		<div class={cx(styles.header, "drawer__header", classProp)} {...restProps}>
			{children}
		</div>
	);
}

export interface BodyProps extends PropsWithChildren {
	class?: string;
}

export function Body(props: BodyProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();

	return (
		<div class={cx(styles.body, "drawer__body", classProp)} {...restProps}>
			{children}
		</div>
	);
}

export interface FooterProps extends PropsWithChildren {
	class?: string;
}

export function Footer(props: FooterProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();

	return (
		<div class={cx(styles.footer, "drawer__footer", classProp)} {...restProps}>
			{children}
		</div>
	);
}

export interface TitleProps extends PropsWithChildren {
	class?: string;
}

export function Title(props: TitleProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();
	const id = context?.id;

	return (
		<h2
			id={id ? `${id}-title` : undefined}
			data-part="title"
			class={cx(styles.title, "drawer__title", classProp)}
			{...restProps}
		>
			{children}
		</h2>
	);
}

export interface DescriptionProps extends PropsWithChildren {
	class?: string;
}

export function Description(props: DescriptionProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();
	const id = context?.id;

	return (
		<div
			id={id ? `${id}-description` : undefined}
			data-part="description"
			class={cx(styles.description, "drawer__description", classProp)}
			{...restProps}
		>
			{children}
		</div>
	);
}

export interface CloseTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	unstyled?: boolean;
}

export function CloseTrigger(props: CloseTriggerProps) {
	const { children, class: classProp, asChild, unstyled, ...restProps } = props;
	const context = useDrawerContext();
	const styles = context?.styles || drawer();

	const triggerProps = {
		"data-part": "close-trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(
				!unstyled && styles.closeTrigger,
				!unstyled && "drawer__closeTrigger",
				classProp,
				child.props?.class,
			),
		});
	}

	return (
		<button
			type="button"
			aria-label="Close"
			class={cx(
				!unstyled && styles.closeTrigger,
				!unstyled && "drawer__closeTrigger",
				classProp,
			)}
			{...triggerProps}
		>
			{children}
		</button>
	);
}

export interface ActionTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
}

export function ActionTrigger(props: ActionTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;

	const triggerProps = {
		"data-part": "action-trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(classProp, child.props?.class),
		});
	}

	return (
		<button type="button" class={cx(classProp)} {...triggerProps}>
			{children}
		</button>
	);
}

// Interactive version with state management and full a11y behavior
// (focus trap, Escape, inert background, scroll lock, focus return).
// The behavior layer itself lives in `./overlay-a11y` (`useOverlay`) and is
// shared with Dialog so nested overlays cooperate on `inert` and focus.

export interface InteractiveDrawerProps extends RootProps {
	defaultOpen?: boolean;
	/** Close when Escape is pressed. Default: true. */
	closeOnEscape?: boolean;
	/** Close when the backdrop is clicked / interaction occurs outside. Default: true. */
	closeOnInteractOutside?: boolean;
	/** Element to focus when the drawer opens. Defaults to the first focusable. */
	initialFocusEl?: () => HTMLElement | null;
	/** Element to focus when the drawer closes. Defaults to the trigger. */
	finalFocusEl?: () => HTMLElement | null;
}

export function InteractiveDrawer(props: InteractiveDrawerProps) {
	const {
		open: openProp,
		onOpenChange: onOpenChangeProp,
		defaultOpen,
		id: idProp,
		dialogRole,
		closeOnEscape = true,
		closeOnInteractOutside = true,
		initialFocusEl,
		finalFocusEl,
		...rest
	} = props;
	const [isOpen, setIsOpen] = useState(openProp ?? defaultOpen ?? false);

	const isControlled = openProp !== undefined;
	const open = isControlled ? openProp : isOpen;

	const fallbackId = useId();
	const rootId = idProp || `drawer-${fallbackId}`;
	const rootRef = useRef<HTMLElement>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!isControlled) {
			setIsOpen(nextOpen);
		}
		onOpenChangeProp?.(nextOpen);
	};

	// Click delegation + focus trap / Escape / inert / scroll lock / focus return.
	useOverlay({
		rootRef,
		open,
		closeOnEscape,
		closeOnInteractOutside,
		onChange: handleOpenChange,
		initialFocusEl,
		finalFocusEl,
	});

	return (
		<Root
			{...rest}
			id={rootId}
			open={open}
			onOpenChange={handleOpenChange}
			rootRef={rootRef}
			dialogRole={dialogRole}
		/>
	);
}
