import { cx } from "design-system/css";
import type { ToastVariantProps } from "design-system/recipes";
import { toast as toastRecipe } from "design-system/recipes";
import type { Child, PropsWithChildren } from "hono/jsx";
import {
	cloneElement,
	createContext,
	useContext,
	useEffect,
	useRef,
} from "hono/jsx";
import { Spinner } from "./spinner";

type ToastStyles = ReturnType<typeof toastRecipe>;
export type SwipeDirection = "up" | "down" | "left" | "right";

interface ToastContextValue {
	styles?: ToastStyles;
	toast?: {
		id: string;
		title?: string;
		description?: string;
		type?: "info" | "success" | "warning" | "error" | "loading";
		duration?: number;
		closable?: boolean;
		action?: {
			label: string;
			onClick: () => void;
		};
	};
	dismiss?: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToastContext = () => {
	const context = useContext(ToastContext);
	return context;
};

export interface RootProps extends ToastVariantProps, PropsWithChildren {
	class?: string;
	type?: string;
	toast?: ToastContextValue["toast"];
	dismiss?: ToastContextValue["dismiss"];
	/**
	 * Direction of pointer swipe that dismisses the toast.
	 * @default "right"
	 */
	swipeDirection?: SwipeDirection;
	/**
	 * Distance in pixels the pointer must travel before a swipe dismisses the toast.
	 * @default 50
	 */
	swipeThreshold?: number;
	/** Receives the underlying DOM node (mount and unmount). */
	rootRef?: (el: HTMLDivElement | null) => void;
	[key: string]: unknown;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = toastRecipe.splitVariantProps(props);
	const {
		children,
		class: classProp,
		toast,
		dismiss,
		swipeDirection = "right",
		swipeThreshold = 50,
		onKeyDown,
		rootRef: externalRef,
		...rest
	} = localProps as RootProps & {
		onKeyDown?: (e: KeyboardEvent) => void;
	};

	const resolvedType = (variantProps.type as string) || toast?.type || "info";
	const styles = toastRecipe({ ...variantProps, type: resolvedType });
	const nodeRef = useRef<HTMLDivElement | null>(null);

	const setRef = (el: HTMLDivElement | null) => {
		nodeRef.current = el;
		if (typeof externalRef === "function") externalRef(el);
	};

	const handleDismiss = () => {
		if (toast?.id && dismiss) dismiss(toast.id);
	};

	// Swipe-to-dismiss: track the pointer directly on the DOM node and drive
	// the recipe's `--x`/`--y` translate custom properties. Release past
	// `swipeThreshold` plays its own fly-out transition (independent of the
	// `_closed` keyframe, which is reserved for timed/programmatic dismissal)
	// so the exit continues naturally from wherever the drag left off.
	useEffect(() => {
		const node = nodeRef.current;
		if (!node || !dismiss || !toast?.id) return;
		const id = toast.id;
		const axis =
			swipeDirection === "left" || swipeDirection === "right" ? "x" : "y";
		const sign =
			swipeDirection === "right" || swipeDirection === "down" ? 1 : -1;

		let start: { x: number; y: number } | null = null;
		let dragging = false;

		const onPointerDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			if ((e.target as HTMLElement).closest("button")) return;
			start = { x: e.clientX, y: e.clientY };
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!start) return;
			const dx = e.clientX - start.x;
			const dy = e.clientY - start.y;
			const delta = axis === "x" ? dx : dy;

			if (!dragging) {
				if (Math.abs(delta) < 4 || Math.sign(delta || 1) !== sign) return;
				dragging = true;
				node.setPointerCapture(e.pointerId);
				node.setAttribute("data-swipe", "move");
			}

			const clamped = sign > 0 ? Math.max(0, delta) : Math.min(0, delta);
			node.style.setProperty("--x", axis === "x" ? `${clamped}px` : "0");
			node.style.setProperty("--y", axis === "y" ? `${clamped}px` : "0");
		};

		const endDrag = (e: PointerEvent) => {
			if (!dragging) {
				start = null;
				return;
			}
			if (node.hasPointerCapture(e.pointerId)) {
				node.releasePointerCapture(e.pointerId);
			}
			const dx = e.clientX - (start?.x ?? e.clientX);
			const dy = e.clientY - (start?.y ?? e.clientY);
			const delta = axis === "x" ? dx : dy;
			dragging = false;
			start = null;

			if (Math.abs(delta) > swipeThreshold) {
				node.setAttribute("data-swipe", "end");
				node.dataset.swipeDismissed = "true";
				node.style.setProperty("--x", axis === "x" ? `${sign * 100}%` : "0");
				node.style.setProperty("--y", axis === "y" ? `${sign * 100}%` : "0");
				node.style.opacity = "0";
				let done = false;
				const finish = () => {
					if (done) return;
					done = true;
					node.removeEventListener("transitionend", finish);
					dismiss(id);
				};
				node.addEventListener("transitionend", finish, { once: true });
				window.setTimeout(finish, 250);
			} else {
				node.setAttribute("data-swipe", "cancel");
				node.style.removeProperty("--x");
				node.style.removeProperty("--y");
			}
		};

		node.addEventListener("pointerdown", onPointerDown);
		node.addEventListener("pointermove", onPointerMove);
		node.addEventListener("pointerup", endDrag);
		node.addEventListener("pointercancel", endDrag);
		return () => {
			node.removeEventListener("pointerdown", onPointerDown);
			node.removeEventListener("pointermove", onPointerMove);
			node.removeEventListener("pointerup", endDrag);
			node.removeEventListener("pointercancel", endDrag);
		};
	}, [dismiss, toast?.id, swipeDirection, swipeThreshold]);

	return (
		<ToastContext.Provider value={{ styles, toast, dismiss }}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: role/aria-live are computed from `resolvedType` so the linter can't see the element is already an accessible status/alert region; tabIndex+onKeyDown add Escape-to-dismiss on top of that role */}
			<div
				data-scope="toast"
				data-part="root"
				data-type={resolvedType}
				data-state="open"
				data-swipe-direction={swipeDirection}
				role={resolvedType === "error" ? "alert" : "status"}
				aria-live={resolvedType === "error" ? "assertive" : "polite"}
				aria-atomic="true"
				tabIndex={0}
				class={cx(styles.root, classProp)}
				ref={setRef}
				onKeyDown={(e: KeyboardEvent) => {
					onKeyDown?.(e);
					if (e.defaultPrevented) return;
					if (e.key === "Escape") handleDismiss();
				}}
				{...rest}
			>
				{children}
			</div>
		</ToastContext.Provider>
	);
}

export interface TitleProps extends PropsWithChildren {
	class?: string;
}

export function Title(props: TitleProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useToastContext();
	const styles = context?.styles || toastRecipe();
	const content = children ?? context?.toast?.title;

	return (
		<div
			data-scope="toast"
			data-part="title"
			class={cx(styles.title, classProp)}
			{...rest}
		>
			{content}
		</div>
	);
}

export interface DescriptionProps extends PropsWithChildren {
	class?: string;
}

export function Description(props: DescriptionProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useToastContext();
	const styles = context?.styles || toastRecipe();
	const content = children ?? context?.toast?.description;

	return (
		<div
			data-scope="toast"
			data-part="description"
			class={cx(styles.description, classProp)}
			{...rest}
		>
			{content}
		</div>
	);
}

export interface ActionTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	onClick?: (e: unknown) => void;
}

export function ActionTrigger(props: ActionTriggerProps) {
	const { children, class: classProp, asChild, onClick, ...rest } = props;
	const context = useToastContext();
	const styles = context?.styles || toastRecipe();

	const content = children ?? context?.toast?.action?.label;

	const triggerProps = {
		"data-scope": "toast",
		"data-part": "action-trigger",
		class: cx(styles.actionTrigger, classProp),
		onClick: (e: unknown) => {
			if (onClick) onClick(e);
			if (context?.toast?.action?.onClick) {
				context.toast.action.onClick();
			}
			if (context?.toast?.id && context.dismiss) {
				context.dismiss(context.toast.id);
			}
		},
		...rest,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as Record<string, unknown>;
		const childProps = (child.props as Record<string, unknown>) || {};
		return cloneElement(child as Parameters<typeof cloneElement>[0], {
			...triggerProps,
			class: cx(triggerProps.class, childProps.class as string),
		});
	}

	return (
		<button type="button" {...triggerProps}>
			{content}
		</button>
	);
}

export interface CloseTriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	onClick?: (e: unknown) => void;
}

export function CloseTrigger(props: CloseTriggerProps) {
	const { children, class: classProp, asChild, onClick, ...rest } = props;
	const context = useToastContext();
	const styles = context?.styles || toastRecipe();

	const triggerProps = {
		"data-scope": "toast",
		"data-part": "close-trigger",
		class: cx(styles.closeTrigger, classProp),
		onClick: (e: unknown) => {
			if (onClick) onClick(e);
			if (context?.toast?.id && context.dismiss) {
				context.dismiss(context.toast.id);
			}
		},
		...rest,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as Record<string, unknown>;
		const childProps = (child.props as Record<string, unknown>) || {};
		return cloneElement(child as Parameters<typeof cloneElement>[0], {
			...triggerProps,
			class: cx(triggerProps.class, childProps.class as string),
		});
	}

	return (
		<button type="button" aria-label="Close" {...triggerProps}>
			{children}
		</button>
	);
}

const ICONS: Record<string, () => Child> = {
	loading: () => <Spinner size="sm" />,
	success: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
		</svg>
	),
	error: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="15" y1="9" x2="9" y2="15" />
			<line x1="9" y1="9" x2="15" y2="15" />
		</svg>
	),
	warning: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	),
	info: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	),
};

export interface IndicatorProps extends PropsWithChildren {
	class?: string;
}

export function Indicator(props: IndicatorProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useToastContext();
	const styles = context?.styles || toastRecipe();
	const type = context?.toast?.type || "info";

	const iconContent = children ?? (ICONS[type] ?? ICONS.info)();

	return (
		<div
			data-scope="toast"
			data-part="indicator"
			data-type={type}
			class={cx(styles.indicator, classProp)}
			{...rest}
		>
			{iconContent}
		</div>
	);
}

export const Context = (props: {
	children: (context: ToastContextValue | null) => unknown;
}) => {
	const context = useToastContext();
	return props.children(context);
};
