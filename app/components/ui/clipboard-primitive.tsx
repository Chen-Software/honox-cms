import { cx } from "design-system/css";
import type { ClipboardVariantProps } from "design-system/recipes";
import { clipboard } from "design-system/recipes";
import {
	type Child,
	cloneElement,
	createContext,
	type PropsWithChildren,
	useContext,
	useId,
} from "hono/jsx";

type ClipboardStyles = ReturnType<typeof clipboard>;

export interface ClipboardTranslations {
	triggerLabel?: (copied: boolean) => string;
}

const defaultTranslations: Required<ClipboardTranslations> = {
	triggerLabel: (copied) =>
		copied ? "Copied to clipboard" : "Copy to clipboard",
};

export interface ClipboardContextValue {
	value: string;
	copied: boolean;
	disabled?: boolean;
	inputId: string;
	translations: Required<ClipboardTranslations>;
	styles: ClipboardStyles;
	/** Copies `value` to the clipboard. No-op until hydrated. */
	copy: () => void;
	/** Sets `value` on an uncontrolled root. No-op until hydrated. */
	setValue: (value: string) => void;
}

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

export const useClipboardContext = () => useContext(ClipboardContext);

export interface RootProps extends ClipboardVariantProps, PropsWithChildren {
	class?: string;
	id?: string;
	value?: string;
	defaultValue?: string;
	disabled?: boolean;
	/** @default 3000 */
	timeout?: number;
	translations?: ClipboardTranslations;
	onValueChange?: (details: { value: string }) => void;
	onStatusChange?: (details: { copied: boolean }) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	copied?: boolean;
	/** Driven by the interactive island; ignored when set by hand. */
	onCopy?: () => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onSetValue?: (value: string) => void;
	rootRef?: unknown;
	[key: string]: unknown;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = clipboard.splitVariantProps(props);
	const {
		children,
		class: classProp,
		id: idProp,
		value: valueProp,
		defaultValue,
		disabled,
		copied = false,
		translations,
		onCopy,
		onSetValue,
		rootRef,
		// Consumed only by the interactive island — dropped here so they never
		// leak onto the root `<div>` as unknown DOM attributes.
		timeout: _timeout,
		onValueChange: _onValueChange,
		onStatusChange: _onStatusChange,
		...rest
	} = localProps;

	const styles = clipboard(variantProps);
	const autoId = useId();
	const id = idProp || autoId;
	const value = valueProp ?? defaultValue ?? "";

	const contextValue: ClipboardContextValue = {
		value,
		copied,
		disabled,
		inputId: `clipboard::${id}::input`,
		translations: { ...defaultTranslations, ...translations },
		styles,
		copy: onCopy ?? (() => {}),
		setValue: onSetValue ?? (() => {}),
	};

	return (
		<ClipboardContext.Provider value={contextValue}>
			<div
				ref={rootRef as never}
				id={id}
				class={cx(styles.root, classProp)}
				data-scope="clipboard"
				data-part="root"
				data-copied={copied ? "" : undefined}
				data-disabled={disabled ? "" : undefined}
				{...rest}
			>
				{children}
			</div>
		</ClipboardContext.Provider>
	);
}

export function RootProvider(props: RootProps) {
	return <Root {...props} />;
}

export interface LabelProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Label(props: LabelProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useClipboardContext();
	const styles = context?.styles ?? clipboard();
	return (
		<label
			for={context?.inputId}
			class={cx(styles.label, classProp)}
			data-scope="clipboard"
			data-part="label"
			data-copied={context?.copied ? "" : undefined}
			{...rest}
		>
			{children}
		</label>
	);
}

export interface ControlProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Control(props: ControlProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useClipboardContext();
	const styles = context?.styles ?? clipboard();
	return (
		<div
			class={cx(styles.control, classProp)}
			data-scope="clipboard"
			data-part="control"
			data-copied={context?.copied ? "" : undefined}
			{...rest}
		>
			{children}
		</div>
	);
}

export interface InputProps {
	class?: string;
	[key: string]: unknown;
}

export function Input(props: InputProps) {
	const { class: classProp, ...rest } = props;
	const context = useClipboardContext();
	const styles = context?.styles ?? clipboard();
	return (
		<input
			id={context?.inputId}
			type="text"
			readOnly
			// A controlled `value` (not `defaultValue`) — hono/jsx's SSR renderer
			// serialises `defaultValue` as a dead attribute that never reaches the
			// live DOM property, so the field would render empty on first paint.
			value={context?.value ?? ""}
			class={cx(styles.input, classProp)}
			data-scope="clipboard"
			data-part="input"
			data-copied={context?.copied ? "" : undefined}
			data-readonly="true"
			onFocus={(e) => {
				(e.currentTarget as HTMLInputElement).select();
			}}
			// Manually selecting the text and pressing Ctrl/Cmd+C also counts
			// as "copied" feedback, mirroring Ark UI's clipboard machine.
			onCopy={() => context?.copy()}
			{...rest}
		/>
	);
}

export interface TriggerProps extends PropsWithChildren {
	class?: string;
	asChild?: boolean;
	[key: string]: unknown;
}

export function Trigger(props: TriggerProps) {
	const { children, class: classProp, asChild, ...rest } = props;
	const context = useClipboardContext();
	const styles = context?.styles ?? clipboard();
	const copied = context?.copied ?? false;
	const translations = context?.translations ?? defaultTranslations;

	const triggerProps = {
		type: "button",
		disabled: context?.disabled,
		"aria-label": translations.triggerLabel(copied),
		"data-scope": "clipboard",
		"data-part": "trigger",
		"data-copied": copied ? "" : undefined,
		onClick: () => context?.copy(),
		...rest,
	};

	if (asChild && typeof children === "object" && children !== null) {
		const child = children as any;
		return cloneElement(child, {
			...triggerProps,
			class: cx(styles.trigger, classProp, child.props?.class),
		});
	}

	return (
		<button class={cx(styles.trigger, classProp)} {...triggerProps}>
			{children}
		</button>
	);
}

export interface IndicatorProps extends PropsWithChildren {
	class?: string;
	/** Content shown once the value has been copied. */
	copied?: Child;
	[key: string]: unknown;
}

// Renders *both* the default and copied content as sibling nodes (toggled via
// `hidden`) instead of conditionally rendering one or the other. Indicator is
// composed as a child of the interactive island's `<Root>`, and HonoX
// rehydrates an island's children from a serialised HTML snapshot rather than
// by re-invoking this component — so post-hydration copy clicks can only
// flip a `hidden` attribute the island's own listener already knows how to
// find (`data-copied-variant`), they can't re-run this function to pick a
// different `content` value.
export function Indicator(props: IndicatorProps) {
	const { children, copied: copiedContent, class: classProp, ...rest } = props;
	const context = useClipboardContext();
	const styles = context?.styles ?? clipboard();
	const isCopied = context?.copied ?? false;

	const variantProps = (variant: boolean) => ({
		"data-scope": "clipboard",
		"data-part": "indicator",
		"data-copied-variant": variant ? "true" : "false",
		"data-copied": isCopied ? "" : undefined,
		hidden: variant !== isCopied,
		...rest,
	});

	return (
		<>
			<div class={cx(styles.indicator, classProp)} {...variantProps(false)}>
				{children}
			</div>
			<div class={cx(styles.indicator, classProp)} {...variantProps(true)}>
				{copiedContent}
			</div>
		</>
	);
}

export interface CopyTextProps extends Omit<IndicatorProps, "copied"> {
	copied?: Child;
}

/** Convenience `Indicator` that swaps between "Copy" / "Copied" text. */
export function CopyText(props: CopyTextProps) {
	const { children = "Copy", copied = "Copied", ...rest } = props;
	return (
		<Indicator copied={copied} {...rest}>
			{children}
		</Indicator>
	);
}

export function Context(props: {
	children: (context: ClipboardContextValue | null) => Child;
}) {
	const context = useClipboardContext();
	return props.children(context);
}

export type { ClipboardStyles };
