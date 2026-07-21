import { useEffect, useRef, useState } from "hono/jsx";
import { Root, type RootProps } from "../components/ui/clipboard-primitive";

export interface ClipboardIslandProps extends RootProps {}

function createOffscreenNode(doc: Document, text: string) {
	const node = doc.createElement("pre");
	Object.assign(node.style, {
		width: "1px",
		height: "1px",
		position: "fixed",
		top: "5px",
	});
	node.textContent = text;
	return node;
}

// Mirrors Ark UI's clipboard fallback: the async Clipboard API requires a
// secure context, so older browsers (and http:// dev origins) fall back to
// selecting an off-screen node and running the legacy execCommand copy.
function writeToClipboard(value: string): Promise<void> {
	if (navigator.clipboard?.writeText) {
		return navigator.clipboard.writeText(value);
	}
	if (!document.body) return Promise.reject(new Error("No document body"));

	const node = createOffscreenNode(document, value);
	document.body.appendChild(node);
	const selection = window.getSelection();
	if (!selection) {
		document.body.removeChild(node);
		return Promise.reject(new Error("Selection API unavailable"));
	}
	selection.removeAllRanges();
	const range = document.createRange();
	range.selectNodeContents(node);
	selection.addRange(range);
	document.execCommand("copy");
	selection.removeAllRanges();
	document.body.removeChild(node);
	return Promise.resolve();
}

// Reflects `copied` onto the already-mounted DOM by hand. `Label`/`Control`/
// `Input`/`Trigger`/`Indicator` are composed as children of this island's
// `<Root>`, and HonoX rebuilds an island's children from a serialised HTML
// snapshot on hydration (attributes only — event handlers and closures don't
// survive that round-trip), so they never re-render when this island's own
// state changes. Root itself isn't affected — the island renders it directly,
// so its `data-copied` stays reactive on its own.
function applyCopiedState(root: HTMLElement, copied: boolean, label: string) {
	for (const el of root.querySelectorAll<HTMLElement>(
		'[data-part="control"], [data-part="trigger"], [data-part="label"], [data-part="input"]',
	)) {
		if (copied) el.setAttribute("data-copied", "");
		else el.removeAttribute("data-copied");
	}
	for (const el of root.querySelectorAll<HTMLElement>(
		"[data-copied-variant]",
	)) {
		const isCopiedVariant = el.getAttribute("data-copied-variant") === "true";
		el.hidden = isCopiedVariant !== copied;
	}
	root
		.querySelector('[data-part="trigger"]')
		?.setAttribute("aria-label", label);
}

export default function ClipboardIsland(props: ClipboardIslandProps) {
	const {
		value: valueProp,
		defaultValue,
		disabled,
		timeout = 3000,
		translations,
		onValueChange,
		onStatusChange,
		children,
		...rest
	} = props;

	const [value, setValueState] = useState(valueProp ?? defaultValue ?? "");
	const [copied, setCopied] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const triggerLabel =
		translations?.triggerLabel ??
		((c: boolean) => (c ? "Copied to clipboard" : "Copy to clipboard"));

	useEffect(() => {
		if (valueProp !== undefined) setValueState(valueProp);
	}, [valueProp]);

	// Input's displayed value is also frozen children markup — push updates
	// through by hand, same reasoning as `applyCopiedState`.
	useEffect(() => {
		const input = rootRef.current?.querySelector<HTMLInputElement>(
			'[data-part="input"]',
		);
		if (input) input.value = value;
	}, [value]);

	useEffect(() => {
		return () => {
			if (revertTimer.current) clearTimeout(revertTimer.current);
		};
	}, []);

	const markCopied = () => {
		const root = rootRef.current;
		if (!root) return;
		if (revertTimer.current) clearTimeout(revertTimer.current);
		setCopied(true);
		applyCopiedState(root, true, triggerLabel(true));
		onStatusChange?.({ copied: true });
		revertTimer.current = setTimeout(() => {
			setCopied(false);
			applyCopiedState(root, false, triggerLabel(false));
		}, timeout);
	};

	// Exposed via `Context`'s `copy()` for consumers building their own
	// composition on top of the primitives.
	const copy = () => {
		if (disabled || !value) return;
		writeToClipboard(value)
			.then(markCopied)
			.catch(() => {});
	};

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const handleClick = (e: MouseEvent) => {
			if ((e.target as HTMLElement).closest('[data-part="trigger"]')) copy();
		};

		// Manually selecting the input's text and pressing Ctrl/Cmd+C also
		// counts as "copied" feedback, mirroring Ark UI's clipboard machine —
		// the browser already performed the copy, so this only updates the UI.
		const handleCopyEvent = (e: Event) => {
			if ((e.target as HTMLElement).closest('[data-part="input"]'))
				markCopied();
		};

		const handleFocusIn = (e: FocusEvent) => {
			const input = (e.target as HTMLElement).closest<HTMLInputElement>(
				'[data-part="input"]',
			);
			input?.select();
		};

		root.addEventListener("click", handleClick);
		root.addEventListener("copy", handleCopyEvent);
		root.addEventListener("focusin", handleFocusIn);

		return () => {
			root.removeEventListener("click", handleClick);
			root.removeEventListener("copy", handleCopyEvent);
			root.removeEventListener("focusin", handleFocusIn);
		};
	}, [value, disabled, timeout, onStatusChange, triggerLabel]);

	const handleSetValue = (next: string) => {
		if (valueProp === undefined) setValueState(next);
		onValueChange?.({ value: next });
	};

	return (
		<Root
			{...rest}
			rootRef={rootRef}
			value={value}
			disabled={disabled}
			copied={copied}
			translations={translations}
			onCopy={copy}
			onSetValue={handleSetValue}
			data-hydrated="true"
		>
			{children}
		</Root>
	);
}
