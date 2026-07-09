import { useEffect, useRef } from "hono/jsx";

/**
 * Shared accessibility + behavior layer for overlay components
 * (Dialog, Drawer, and any future modal-like surface).
 *
 * Keeps a SINGLE source of truth for:
 *  - the stack of currently-open overlay roots (so nested overlays — including a
 *    Dialog opened from within a Drawer — cooperate on `inert` and focus trapping)
 *  - the focus-trap / Escape / scroll-lock / focus-return effect
 *  - click delegation (trigger / backdrop / close-trigger / action-trigger)
 *  - accessible-name tree scan (used by `Content` to wire `aria-labelledby` /
 *    `aria-describedby` only when the corresponding Title / Description is present)
 *
 * Primitives must render `data-part="content"`, `data-part="trigger"`,
 * `data-part="backdrop"`, `data-part="positioner"`, `data-part="close-trigger"`,
 * `data-part="action-trigger"`, `data-part="title"`, `data-part="description"`
 * for the behavior layer and detection to work.
 */

// Selector for focusable elements inside an overlay's content.
const FOCUSABLE_SELECTOR =
	"a[href],area[href],button:not([disabled]),input:not([disabled])," +
	"select:not([disabled]),textarea:not([disabled]),iframe:not([disabled])," +
	'object:not([disabled]),embed,[tabindex]:not([tabindex="-1"]),' +
	'[contenteditable]:not([contenteditable="false"])';

/**
 * Stack of currently-open overlay root elements (topmost = last).
 * Drives focus trapping (only the topmost handles keys) and the `inert` math
 * so a nested overlay correctly disables the page AND its parent.
 */
export const openOverlayRoots: HTMLElement[] = [];

/** Query focusable descendants of `container`, excluding hidden/disabled ones. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
	return Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
	).filter(
		(el) =>
			!el.hasAttribute("disabled") &&
			(el.offsetParent !== null || el === document.activeElement),
	);
}

/**
 * Inert every sibling along the ancestor chain of each open overlay,
 * except the path to an overlay and except ancestors of any open overlay.
 * Recomputes the whole document so closing one overlay restores the rest.
 */
export function applyInert() {
	document
		.querySelectorAll<HTMLElement>("[inert]")
		.forEach((el) => (el.inert = false));
	for (const root of openOverlayRoots) {
		const path = new Set<HTMLElement>();
		let p: HTMLElement | null = root;
		while (p && p !== document.body) {
			path.add(p);
			p = p.parentElement;
		}
		let node: HTMLElement | null = root.parentElement;
		while (node && node !== document.body) {
			for (const sib of Array.from(node.children)) {
				if (path.has(sib as HTMLElement)) continue;
				const protects = openOverlayRoots.some(
					(r) => sib === r || sib.contains(r),
				);
				if (!protects) (sib as HTMLElement).inert = true;
			}
			node = node.parentElement;
		}
	}
}

/**
 * Recursively check whether a `<Title>` / `<Description>` component instance
 * (by function reference) exists in the rendered children tree. Used by `Content`
 * to decide whether to wire `aria-labelledby` / `aria-describedby` — and avoid
 * pointing those attributes at non-existent elements when the part is omitted.
 *
 * Detection is by component TYPE reference (not by a `data-part` prop), because
 * the `data-part` marker is applied inside the component's render and is NOT
 * present on the component element's props at the point `Content` inspects them.
 */
export function hasPart(node: unknown, cmp: Function): boolean {
	if (node == null || typeof node !== "object") return false;
	if (Array.isArray(node)) return node.some((c) => hasPart(c, cmp));
	const el = node as { type?: unknown; props?: { children?: unknown } };
	if (el.type === cmp) return true;
	if (el.props?.children != null) return hasPart(el.props.children, cmp);
	return false;
}

export interface OverlayOptions {
	/** Ref holding the overlay root element (the wrapping `<div id=...>`). */
	rootRef: { current: HTMLElement | null };
	/** Whether the overlay is currently open. */
	open: boolean;
	/** Close when Escape is pressed. Default: true. */
	closeOnEscape: boolean;
	/** Close when the backdrop is clicked / interaction occurs outside. Default: true. */
	closeOnInteractOutside: boolean;
	/** Notifies the owner of an open/close request originating from behavior (Escape / outside click). */
	onChange: (open: boolean) => void;
	/** Element to focus when the overlay opens. Defaults to the first focusable. */
	initialFocusEl?: () => HTMLElement | null;
	/** Element to focus when the overlay closes. Defaults to the trigger. */
	finalFocusEl?: () => HTMLElement | null;
}

/**
 * Full overlay behavior: click delegation (open/close via `data-part`) +
 * accessibility layer (focus trap, Escape, inert background, scroll lock,
 * focus return to trigger on close). Runs whenever `open` or the gate props change.
 */
export function useOverlay(opts: OverlayOptions) {
	const {
		rootRef,
		open,
		closeOnEscape,
		closeOnInteractOutside,
		onChange,
		initialFocusEl,
		finalFocusEl,
	} = opts;

	// Keep the latest onChange in a ref so the click + behavior effects (which
	// depend on stable signals, not on `onChange` identity) never go stale.
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// --- Click delegation (open / close). Backdrop dismiss is gated by
	// closeOnInteractOutside. Re-attaches when the gate flips. ---
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const getElements = () => ({
			positioners: Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="positioner"]'),
			),
			backdrops: Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="backdrop"]'),
			),
			contents: Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="content"]'),
			),
		});

		const hide = () => {
			const { positioners, backdrops, contents } = getElements();
			root.setAttribute("data-state", "closed");
			positioners.forEach((p) => {
				p.style.cssText =
					"display: none !important; visibility: hidden !important;";
				p.setAttribute("data-state", "closed");
			});
			backdrops.forEach((b) => {
				b.style.cssText =
					"display: none !important; visibility: hidden !important;";
				b.setAttribute("data-state", "closed");
			});
			contents.forEach((c) => {
				c.setAttribute("data-state", "closed");
				c.style.cssText =
					"display: none !important; visibility: hidden !important;";
			});
		};

		const show = () => {
			const { positioners, backdrops, contents } = getElements();
			root.setAttribute("data-state", "open");
			positioners.forEach((p) => {
				p.style.cssText =
					"display: flex !important; visibility: visible !important;";
				p.setAttribute("data-state", "open");
			});
			backdrops.forEach((b) => {
				b.style.cssText =
					"display: block !important; visibility: visible !important;";
				b.setAttribute("data-state", "open");
			});
			contents.forEach((c) => {
				c.setAttribute("data-state", "open");
				c.style.cssText =
					"display: flex !important; visibility: visible !important;";
			});
		};

		const handleClick = (e: Event) => {
			const target = (e.target as HTMLElement).closest(
				"[data-part]",
			) as HTMLElement;
			if (!target) return;
			const dataPart = target.getAttribute("data-part");

			if (dataPart === "backdrop" || dataPart === "positioner") {
				// Only close if we clicked EXACTLY on the backdrop/positioner, not its children (Content)
				if (closeOnInteractOutside && e.target === target) {
					hide();
					onChangeRef.current(false);
				}
			} else if (dataPart === "trigger") {
				const currentOpen = root.getAttribute("data-state") === "open";
				const nextOpen = !currentOpen;
				if (nextOpen) show();
				else hide();
				onChangeRef.current(nextOpen);
			} else if (
				dataPart === "close-trigger" ||
				dataPart === "action-trigger"
			) {
				hide();
				onChangeRef.current(false);
			}
		};

		root.addEventListener("click", handleClick);
		return () => {
			root.removeEventListener("click", handleClick);
		};
	}, [closeOnInteractOutside]);

	// --- Accessibility behavior layer: focus trap, Escape, inert background,
	// scroll lock, focus return to trigger on close. Runs whenever `open` changes. ---
	useEffect(() => {
		if (!open) return;
		const root = rootRef.current;
		if (!root) return;
		const content = root.querySelector<HTMLElement>('[data-part="content"]');
		if (!content) return;

		const prevFocus = document.activeElement as HTMLElement | null;
		openOverlayRoots.push(root);
		applyInert();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		// Move focus into the overlay (initialFocusEl > first focusable > content)
		const focusables = getFocusable(content);
		(initialFocusEl?.() ?? focusables[0] ?? content).focus();

		const onKeyDown = (e: KeyboardEvent) => {
			// Only the topmost (most recently opened) overlay handles keys
			if (openOverlayRoots[openOverlayRoots.length - 1] !== root) return;

			if (e.key === "Escape") {
				if (closeOnEscape) {
					e.preventDefault();
					onChangeRef.current(false);
				}
				return;
			}
			if (e.key === "Tab") {
				const f = getFocusable(content);
				if (f.length === 0) {
					e.preventDefault();
					content.focus();
					return;
				}
				const first = f[0];
				const last = f[f.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		window.addEventListener("keydown", onKeyDown, true);

		return () => {
			window.removeEventListener("keydown", onKeyDown, true);
			const i = openOverlayRoots.indexOf(root);
			if (i !== -1) openOverlayRoots.splice(i, 1);
			applyInert();
			if (openOverlayRoots.length === 0)
				document.body.style.overflow = prevOverflow;
			// Return focus to the trigger (or finalFocusEl) on close
			(finalFocusEl?.() ?? prevFocus)?.focus?.();
		};
	}, [open, closeOnEscape, initialFocusEl, finalFocusEl]);
}
