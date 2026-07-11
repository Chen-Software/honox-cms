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
import { css, cx } from "styled-system/css";
import { popover } from "styled-system/recipes";
import { getFocusable, hasPart } from "./overlay-a11y";

type PopoverStyles = ReturnType<typeof popover>;

interface PopoverContextValue {
	id: string;
	open: boolean;
	styles: PopoverStyles;
	onClose?: () => void;
	onToggle?: () => void;
}

interface PopoverRootProps extends PropsWithChildren {
	id?: string;
	open?: boolean;
	onClose?: () => void;
	onToggle?: () => void;
	/** Close when Escape is pressed. Default: true. */
	closeOnEscape?: boolean;
	/** Close when interaction occurs outside the popover. Default: true. */
	closeOnInteractOutside?: boolean;
}

interface PopoverTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

interface PopoverPositionerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

interface PopoverContentProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

interface PopoverTitleProps extends PropsWithChildren {
	class?: string;
}

interface PopoverDescriptionProps extends PropsWithChildren {
	class?: string;
}

interface PopoverCloseTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
}

interface PopoverAnchorProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

interface PopoverIndicatorProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

interface InteractivePopoverProps extends PopoverRootProps {
	defaultOpen?: boolean;
	onOpenChange?: (details: { open: boolean }) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
	const context = useContext(PopoverContext);
	return context;
};

function Root(props: PopoverRootProps) {
	const { id: idProp, open = false, children, onClose, onToggle } = props;
	const autoId = useId();
	const id = idProp || autoId;
	const styles = popover();

	return (
		<PopoverContext.Provider value={{ id, open, styles, onClose, onToggle }}>
			{children}
		</PopoverContext.Provider>
	);
}

function RootProvider(props: PopoverRootProps) {
	return <Root {...props} />;
}

function Anchor(props: PopoverAnchorProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();

	const anchorProps = {
		"data-scope": "popover",
		"data-part": "anchor",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...anchorProps,
			class: cx(styles.anchor, classProp, child.props?.class),
		});
	}

	return (
		<div class={cx(styles.anchor, classProp)} {...anchorProps}>
			{children}
		</div>
	);
}

function Trigger(props: PopoverTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = usePopoverContext();
	const id = context?.id;
	const open = context?.open;
	const styles = context?.styles || popover();

	const triggerProps = {
		id: id ? `popover-trigger-${id}` : undefined,
		"aria-haspopup": "dialog",
		"aria-expanded": open ? "true" : "false",
		"aria-controls": open && id ? `popover-content-${id}` : undefined,
		"data-state": open ? "open" : "closed",
		"data-scope": "popover",
		"data-part": "trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(styles.trigger, classProp, child.props?.class),
		});
	}

	return (
		<button
			type="button"
			class={cx(styles.trigger, classProp)}
			{...triggerProps}
		>
			{children}
		</button>
	);
}

function Positioner(props: PopoverPositionerProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const open = context?.open;
	const styles = context?.styles || popover();

	return (
		<div
			class={cx(
				styles.positioner,
				classProp,
				!open && css({ display: "none" }),
			)}
			data-state={open ? "open" : "closed"}
			data-scope="popover"
			data-part="positioner"
			style={{
				position: "absolute",
				top: "100%",
				left: "0",
				zIndex: 1000,
			}}
			{...restProps}
		>
			{children}
		</div>
	);
}

function Content(props: PopoverContentProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const id = context?.id;
	const open = context?.open;
	const styles = context?.styles || popover();

	const titleId = id ? `popover-title-${id}` : undefined;
	const descriptionId = id ? `popover-description-${id}` : undefined;
	const titleRendered = hasPart(children, Title);
	const hasDescription = hasPart(children, Description);

	return (
		<div
			id={id ? `popover-content-${id}` : undefined}
			role="dialog"
			data-scope="popover"
			data-part="content"
			{...(titleRendered ? { "aria-labelledby": titleId } : {})}
			{...(hasDescription ? { "aria-describedby": descriptionId } : {})}
			class={cx(styles.content, classProp)}
			data-state={open ? "open" : "closed"}
			tabIndex={-1}
			{...restProps}
		>
			{children}
		</div>
	);
}

function Header(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	return (
		<header
			class={cx(styles.header, classProp)}
			data-scope="popover"
			data-part="header"
			{...restProps}
		>
			{children}
		</header>
	);
}

function Body(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	return (
		<div
			class={cx(styles.body, classProp)}
			data-scope="popover"
			data-part="body"
			{...restProps}
		>
			{children}
		</div>
	);
}

function Footer(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	return (
		<footer
			class={cx(styles.footer, classProp)}
			data-scope="popover"
			data-part="footer"
			{...restProps}
		>
			{children}
		</footer>
	);
}

function Title(props: PopoverTitleProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const id = context?.id;
	const styles = context?.styles || popover();
	return (
		<h2
			id={id ? `popover-title-${id}` : undefined}
			class={cx(styles.title, classProp)}
			data-scope="popover"
			data-part="title"
			{...restProps}
		>
			{children}
		</h2>
	);
}

function Description(props: PopoverDescriptionProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const id = context?.id;
	const styles = context?.styles || popover();
	return (
		<p
			id={id ? `popover-description-${id}` : undefined}
			class={cx(styles.description, classProp)}
			data-scope="popover"
			data-part="description"
			{...restProps}
		>
			{children}
		</p>
	);
}

function CloseTrigger(props: PopoverCloseTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();

	const triggerProps = {
		"aria-label": "Close",
		"data-scope": "popover",
		"data-part": "close-trigger",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(styles.closeTrigger, classProp, child.props?.class),
		});
	}

	return (
		<button
			type="button"
			class={cx(styles.closeTrigger, classProp)}
			{...triggerProps}
		>
			{children}
		</button>
	);
}

function Arrow(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	return (
		<div
			class={cx(styles.arrow, classProp)}
			data-scope="popover"
			data-part="arrow"
			{...restProps}
		>
			{children}
		</div>
	);
}

function ArrowTip(props: { class?: string }) {
	const { class: classProp, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	return (
		<div
			class={cx(styles.arrowTip, classProp)}
			data-scope="popover"
			data-part="arrow-tip"
			{...restProps}
		/>
	);
}

function Indicator(props: PopoverIndicatorProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = usePopoverContext();
	const styles = context?.styles || popover();
	const open = context?.open;

	const indicatorProps = {
		"data-scope": "popover",
		"data-part": "indicator",
		"data-state": open ? "open" : "closed",
		...restProps,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...indicatorProps,
			class: cx(styles.indicator, classProp, child.props?.class),
		});
	}

	return (
		<div class={cx(styles.indicator, classProp)} {...indicatorProps}>
			{children}
		</div>
	);
}

function Context(props: { children: (context: any) => any }) {
	const context = usePopoverContext();
	return props.children(context);
}

function InteractivePopoverRoot(props: InteractivePopoverProps) {
	const {
		open: openProp,
		children,
		id: idProp,
		closeOnEscape = true,
		closeOnInteractOutside = true,
		defaultOpen,
		onOpenChange,
		...rest
	} = props;
	const [isOpen, setIsOpen] = useState(openProp ?? defaultOpen ?? false);
	const isControlled = openProp !== undefined;
	const open = isControlled ? openProp : isOpen;

	const fallbackId = useId();
	const rootId = idProp || `popover-${fallbackId}`;
	const handleOpenChangeRef = useRef<(nextOpen: boolean) => void>(() => {});
	const closeOnEscapeRef = useRef(closeOnEscape);
	closeOnEscapeRef.current = closeOnEscape;
	const closeOnInteractOutsideRef = useRef(closeOnInteractOutside);
	closeOnInteractOutsideRef.current = closeOnInteractOutside;
	const prevFocusRef = useRef<HTMLElement | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!isControlled) {
			setIsOpen(nextOpen);
		}
		onOpenChange?.({ open: nextOpen });
	};

	useEffect(() => {
		handleOpenChangeRef.current = handleOpenChange;
	}, [isControlled, onOpenChange]);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const root = document.getElementById(rootId);
		if (!root) {
			return;
		}

		const getPositioners = () =>
			Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="positioner"]'),
			);

		const openPopover = () => {
			prevFocusRef.current = document.activeElement as HTMLElement | null;
			root.setAttribute("data-state", "open");
			getPositioners().forEach((p) => {
				p.style.cssText = "display: block !important;";
				p.setAttribute("data-state", "open");
			});
			const content = root.querySelector<HTMLElement>('[data-part="content"]');
			if (content) {
				content.setAttribute("data-state", "open");
				const focusable = getFocusable(content);
				(focusable[0] ?? content).focus();
			}
			const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
			if (trigger) {
				trigger.setAttribute("data-state", "open");
				trigger.setAttribute("aria-expanded", "true");
			}
			const indicators = root.querySelectorAll<HTMLElement>(
				'[data-part="indicator"]',
			);
			indicators.forEach((i) => {
				i.setAttribute("data-state", "open");
			});
		};

		const closePopover = () => {
			root.setAttribute("data-state", "closed");
			getPositioners().forEach((p) => {
				p.style.cssText = "display: none !important;";
				p.setAttribute("data-state", "closed");
			});
			const content = root.querySelector<HTMLElement>('[data-part="content"]');
			if (content) {
				content.setAttribute("data-state", "closed");
			}
			const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
			if (trigger) {
				trigger.setAttribute("data-state", "closed");
				trigger.setAttribute("aria-expanded", "false");
			}
			const indicators = root.querySelectorAll<HTMLElement>(
				'[data-part="indicator"]',
			);
			indicators.forEach((i) => {
				i.setAttribute("data-state", "closed");
			});
			(trigger ?? prevFocusRef.current)?.focus();
		};

		if (open) {
			openPopover();
		} else {
			closePopover();
		}
	}, [rootId, open]);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const root = document.getElementById(rootId);
		if (!root) {
			return;
		}

		const isCurrentlyOpen = () => root.getAttribute("data-state") === "open";

		const openPopover = () => {
			prevFocusRef.current = document.activeElement as HTMLElement | null;
			root.setAttribute("data-state", "open");
			const positioners = Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="positioner"]'),
			);
			positioners.forEach((p) => {
				p.style.cssText = "display: block !important;";
				p.setAttribute("data-state", "open");
			});
			const content = root.querySelector<HTMLElement>('[data-part="content"]');
			if (content) {
				content.setAttribute("data-state", "open");
				const focusable = getFocusable(content);
				(focusable[0] ?? content).focus();
			}
			const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
			if (trigger) {
				trigger.setAttribute("data-state", "open");
				trigger.setAttribute("aria-expanded", "true");
			}
			const indicators = root.querySelectorAll<HTMLElement>(
				'[data-part="indicator"]',
			);
			indicators.forEach((i) => {
				i.setAttribute("data-state", "open");
			});
		};

		const closePopover = () => {
			root.setAttribute("data-state", "closed");
			const positioners = Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="positioner"]'),
			);
			positioners.forEach((p) => {
				p.style.cssText = "display: none !important;";
				p.setAttribute("data-state", "closed");
			});
			const content = root.querySelector<HTMLElement>('[data-part="content"]');
			if (content) {
				content.setAttribute("data-state", "closed");
			}
			const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
			if (trigger) {
				trigger.setAttribute("data-state", "closed");
				trigger.setAttribute("aria-expanded", "false");
			}
			const indicators = root.querySelectorAll<HTMLElement>(
				'[data-part="indicator"]',
			);
			indicators.forEach((i) => {
				i.setAttribute("data-state", "closed");
			});
			(trigger ?? prevFocusRef.current)?.focus();
		};

		const handleClick = (e: Event) => {
			const target = (e.target as HTMLElement).closest(
				"[data-part]",
			) as HTMLElement;
			if (!target) return;
			const dataPart = target.getAttribute("data-part");

			if (dataPart === "trigger") {
				const nextOpen = !isCurrentlyOpen();
				if (nextOpen) {
					openPopover();
				} else {
					closePopover();
				}
				handleOpenChangeRef.current?.(nextOpen);
			} else if (dataPart === "close-trigger") {
				closePopover();
				handleOpenChangeRef.current?.(false);
			}
		};

		const handleDocumentPointerDown = (e: Event) => {
			if (!isCurrentlyOpen() || !closeOnInteractOutsideRef.current) return;
			if (root.contains(e.target as Node)) return;
			closePopover();
			handleOpenChangeRef.current?.(false);
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isCurrentlyOpen() || e.key !== "Escape" || !closeOnEscapeRef.current)
				return;
			e.preventDefault();
			closePopover();
			handleOpenChangeRef.current?.(false);
		};

		root.addEventListener("click", handleClick);
		document.addEventListener("mousedown", handleDocumentPointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			root.removeEventListener("click", handleClick);
			document.removeEventListener("mousedown", handleDocumentPointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [rootId]);

	return (
		<div id={rootId} data-state={open ? "open" : "closed"}>
			<Root {...rest} open={open}>
				{children}
			</Root>
		</div>
	);
}

export type {
	InteractivePopoverProps,
	PopoverAnchorProps,
	PopoverCloseTriggerProps,
	PopoverContentProps,
	PopoverContextValue,
	PopoverDescriptionProps,
	PopoverIndicatorProps,
	PopoverPositionerProps,
	PopoverRootProps,
	PopoverStyles,
	PopoverTitleProps,
	PopoverTriggerProps,
};
export {
	Anchor,
	Arrow,
	ArrowTip,
	Body,
	CloseTrigger,
	Content,
	Context,
	Description,
	Footer,
	Header,
	Indicator,
	InteractivePopoverRoot,
	Positioner,
	Root,
	RootProvider,
	Title,
	Trigger,
};
