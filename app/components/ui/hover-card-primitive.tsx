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
import { hoverCard } from "styled-system/recipes";

type HoverCardStyles = ReturnType<typeof hoverCard>;

export interface HoverCardContextValue {
	id: string;
	open: boolean;
	styles: HoverCardStyles;
	lazyMount?: boolean;
	unmountOnExit?: boolean;
	hasOpenedRef?: { current: boolean };
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

export const useHoverCardContext = () => {
	const context = useContext(HoverCardContext);
	return context;
};

export interface HoverCardRootProps extends PropsWithChildren {
	id?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (details: { open: boolean }) => void;
	openDelay?: number;
	closeDelay?: number;
	lazyMount?: boolean;
	unmountOnExit?: boolean;
}

export function Root(props: HoverCardRootProps) {
	const {
		id: idProp,
		open = false,
		children,
		lazyMount,
		unmountOnExit,
	} = props;
	const autoId = useId();
	const id = idProp || autoId;
	const styles = hoverCard();
	const hasOpenedRef = useRef(open);
	if (open) {
		hasOpenedRef.current = true;
	}

	return (
		<HoverCardContext.Provider
			value={{ id, open, styles, lazyMount, unmountOnExit, hasOpenedRef }}
		>
			{children}
		</HoverCardContext.Provider>
	);
}

export function RootProvider(props: HoverCardRootProps) {
	return <Root {...props} />;
}

export interface HoverCardTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

export function Trigger(props: HoverCardTriggerProps) {
	const { children, class: classProp, asChild, ...restProps } = props;
	const context = useHoverCardContext();
	const id = context?.id;
	const open = context?.open;
	const styles = context?.styles || hoverCard();

	const triggerProps = {
		id: id ? `hover-card-trigger-${id}` : undefined,
		"aria-haspopup": "dialog",
		"aria-expanded": open ? "true" : "false",
		"aria-controls": open && id ? `hover-card-content-${id}` : undefined,
		"data-state": open ? "open" : "closed",
		"data-scope": "hover-card",
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
		<div class={cx(styles.trigger, classProp)} {...triggerProps}>
			{children}
		</div>
	);
}

export interface HoverCardPositionerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Positioner(props: HoverCardPositionerProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useHoverCardContext();
	const open = context?.open;
	const styles = context?.styles || hoverCard();
	const lazyMount = context?.lazyMount;
	const unmountOnExit = context?.unmountOnExit;
	const hasOpenedRef = context?.hasOpenedRef;

	if (open && hasOpenedRef) {
		hasOpenedRef.current = true;
	}

	const shouldRender =
		!lazyMount || open || (hasOpenedRef?.current && !unmountOnExit);

	if (!shouldRender) {
		return null;
	}

	return (
		<div
			class={cx(
				styles.positioner,
				classProp,
				!open && css({ display: "none" }),
			)}
			data-state={open ? "open" : "closed"}
			data-scope="hover-card"
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

export interface HoverCardContentProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Content(props: HoverCardContentProps) {
	const { children, class: classProp, ...restProps } = props;
	const context = useHoverCardContext();
	const id = context?.id;
	const open = context?.open;
	const styles = context?.styles || hoverCard();
	const lazyMount = context?.lazyMount;
	const unmountOnExit = context?.unmountOnExit;
	const hasOpenedRef = context?.hasOpenedRef;

	if (open && hasOpenedRef) {
		hasOpenedRef.current = true;
	}

	const shouldRender =
		!lazyMount || open || (hasOpenedRef?.current && !unmountOnExit);

	if (!shouldRender) {
		return null;
	}

	return (
		<div
			id={id ? `hover-card-content-${id}` : undefined}
			role="dialog"
			class={cx(styles.content, classProp)}
			data-state={open ? "open" : "closed"}
			data-scope="hover-card"
			data-part="content"
			{...restProps}
		>
			{children}
		</div>
	);
}

export function Arrow(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...restProps } = props;
	const context = useHoverCardContext();
	const styles = context?.styles || hoverCard();
	return (
		<div
			class={cx(styles.arrow, classProp)}
			data-scope="hover-card"
			data-part="arrow"
			{...restProps}
		>
			{children || <ArrowTip />}
		</div>
	);
}

export function ArrowTip(props: { class?: string }) {
	const { class: classProp, ...restProps } = props;
	const context = useHoverCardContext();
	const styles = context?.styles || hoverCard();
	return (
		<div
			class={cx(styles.arrowTip, classProp)}
			data-scope="hover-card"
			data-part="arrow-tip"
			{...restProps}
		/>
	);
}

export function Context(props: {
	children: (context: HoverCardContextValue | null) => any;
}) {
	const context = useHoverCardContext();
	return props.children(context);
}

export function InteractiveHoverCardRoot(props: HoverCardRootProps) {
	const {
		open: openProp,
		children,
		id: idProp,
		openDelay = 600,
		closeDelay = 300,
		defaultOpen = false,
		onOpenChange,
		lazyMount,
		unmountOnExit,
		...rest
	} = props;
	const [isOpen, setIsOpen] = useState(openProp ?? defaultOpen);
	const isControlled = openProp !== undefined;
	const open = isControlled ? openProp : isOpen;

	const fallbackId = useId();
	const rootId = idProp || `hover-card-${fallbackId}`;
	const rootRef = useRef<HTMLDivElement>(null);
	const openTimerRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);

	const handleOpenChangeRef = useRef<(nextOpen: boolean) => void>(() => {});
	useEffect(() => {
		handleOpenChangeRef.current = (nextOpen: boolean) => {
			if (!isControlled) {
				setIsOpen(nextOpen);
			}
			onOpenChange?.({ open: nextOpen });
		};
	}, [isControlled, onOpenChange]);

	const handleOpen = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
		if (openTimerRef.current) return;

		openTimerRef.current = window.setTimeout(() => {
			handleOpenChangeRef.current(true);
			openTimerRef.current = null;
		}, openDelay);
	};

	const handleClose = () => {
		if (openTimerRef.current) {
			clearTimeout(openTimerRef.current);
			openTimerRef.current = null;
		}
		if (closeTimerRef.current) return;

		closeTimerRef.current = window.setTimeout(() => {
			handleOpenChangeRef.current(false);
			closeTimerRef.current = null;
		}, closeDelay);
	};

	useEffect(() => {
		if (typeof document === "undefined") return;

		const root = document.getElementById(rootId);
		if (!root) return;

		const getPositioners = () =>
			Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="positioner"]'),
			);

		const openHoverCard = () => {
			root.setAttribute("data-state", "open");
			getPositioners().forEach((p) => {
				p.style.setProperty("display", "block", "important");
				p.setAttribute("data-state", "open");
			});
			const content = root.querySelector<HTMLElement>('[data-part="content"]');
			if (content) {
				content.setAttribute("data-state", "open");
			}
			const trigger = root.querySelector<HTMLElement>('[data-part="trigger"]');
			if (trigger) {
				trigger.setAttribute("data-state", "open");
				trigger.setAttribute("aria-expanded", "true");
			}
		};

		const closeHoverCard = () => {
			root.setAttribute("data-state", "closed");
			getPositioners().forEach((p) => {
				p.style.setProperty("display", "none", "important");
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
		};

		if (open) {
			openHoverCard();
		} else {
			closeHoverCard();
		}
	}, [rootId, open]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const trigger = root.querySelector('[data-part="trigger"]');
		const content = root.querySelector('[data-part="content"]');

		const onMouseEnter = () => {
			handleOpen();
		};
		const onMouseLeave = () => {
			handleClose();
		};

		if (trigger) {
			trigger.addEventListener("mouseenter", onMouseEnter);
			trigger.addEventListener("mouseleave", onMouseLeave);
		}

		if (content) {
			content.addEventListener("mouseenter", onMouseEnter);
			content.addEventListener("mouseleave", onMouseLeave);
		}

		// If the pointer is already over the trigger at hydration time, open.
		if (trigger?.matches(":hover")) {
			handleOpen();
		}

		return () => {
			if (trigger) {
				trigger.removeEventListener("mouseenter", onMouseEnter);
				trigger.removeEventListener("mouseleave", onMouseLeave);
			}
			if (content) {
				content.removeEventListener("mouseenter", onMouseEnter);
				content.removeEventListener("mouseleave", onMouseLeave);
			}
			if (openTimerRef.current) clearTimeout(openTimerRef.current);
			if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		};
	}, [openDelay, closeDelay]);

	return (
		<div
			id={rootId}
			ref={rootRef}
			data-state={open ? "open" : "closed"}
			style={{ position: "relative", display: "inline-block" }}
		>
			<Root
				{...rest}
				id={idProp}
				open={open}
				lazyMount={lazyMount}
				unmountOnExit={unmountOnExit}
			>
				{children}
			</Root>
		</div>
	);
}
