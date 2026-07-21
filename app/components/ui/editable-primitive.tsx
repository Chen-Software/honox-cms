import { cx } from "design-system/css";
import type { EditableVariantProps } from "design-system/recipes";
import { editable } from "design-system/recipes";
import {
	type Child,
	createContext,
	type JSX,
	type PropsWithChildren,
	useContext,
	useId,
} from "hono/jsx";

type EditableStyles = ReturnType<typeof editable>;

export type EditableActivationMode = "focus" | "dblclick" | "click" | "none";
export type EditableSubmitMode = "enter" | "blur" | "both" | "none";
export type EditablePlaceholder = string | { edit: string; preview: string };

export interface EditableTranslations {
	edit?: string;
	submit?: string;
	cancel?: string;
	input?: string;
}

const defaultTranslations: Required<EditableTranslations> = {
	edit: "Edit",
	submit: "Submit",
	cancel: "Cancel",
	input: "Edit value",
};

export interface EditableContextValue {
	value: string;
	editing: boolean;
	empty: boolean;
	valueText: string;
	disabled?: boolean;
	readOnly?: boolean;
	invalid?: boolean;
	required?: boolean;
	autoResize?: boolean;
	activationMode: EditableActivationMode;
	submitMode: EditableSubmitMode;
	selectOnFocus: boolean;
	placeholder?: { edit?: string; preview?: string };
	translations: Required<EditableTranslations>;
	maxLength?: number;
	name?: string;
	form?: string;
	styles: EditableStyles;
	ids: {
		area: string;
		label: string;
		preview: string;
		input: string;
		editTrigger: string;
		submitTrigger: string;
		cancelTrigger: string;
		control: string;
	};
	/** Enters edit mode. No-op until hydrated. */
	edit: () => void;
	/** Exits edit mode, discarding changes. No-op until hydrated. */
	cancel: () => void;
	/** Exits edit mode, committing changes. No-op until hydrated. */
	submit: () => void;
	/** Sets the value directly (e.g. from the input's onChange). No-op until hydrated. */
	setValue: (value: string) => void;
}

const EditableContext = createContext<EditableContextValue | null>(null);

export const useEditableContext = () => useContext(EditableContext);

export interface RootProps extends EditableVariantProps, PropsWithChildren {
	class?: string;
	id?: string;
	value?: string;
	defaultValue?: string;
	edit?: boolean;
	defaultEdit?: boolean;
	/** @default "focus" */
	activationMode?: EditableActivationMode;
	/** @default "both" */
	submitMode?: EditableSubmitMode;
	/** @default true */
	selectOnFocus?: boolean;
	autoResize?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: EditablePlaceholder;
	maxLength?: number;
	name?: string;
	form?: string;
	translations?: EditableTranslations;
	onValueChange?: (details: { value: string }) => void;
	onValueCommit?: (details: { value: string }) => void;
	onValueRevert?: (details: { value: string }) => void;
	onEditChange?: (details: { edit: boolean }) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onEdit?: () => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onCancel?: () => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onSubmit?: () => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onSetValue?: (value: string) => void;
	rootRef?: unknown;
	[key: string]: unknown;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = editable.splitVariantProps(props);
	const {
		children,
		class: classProp,
		id: idProp,
		value: valueProp,
		defaultValue,
		edit: editProp,
		defaultEdit,
		activationMode = "focus",
		submitMode = "both",
		selectOnFocus = true,
		autoResize,
		disabled,
		readOnly,
		required,
		invalid,
		placeholder,
		maxLength,
		name,
		form,
		translations,
		onEdit,
		onCancel,
		onSubmit,
		onSetValue,
		rootRef,
		// Consumed only by the interactive island — dropped here so they never
		// leak onto the root `<div>` as unknown DOM attributes.
		onValueChange: _onValueChange,
		onValueCommit: _onValueCommit,
		onValueRevert: _onValueRevert,
		onEditChange: _onEditChange,
		...rest
	} = localProps;

	const styles = editable(variantProps);
	const autoId = useId();
	const id = idProp || autoId;
	const value = valueProp ?? defaultValue ?? "";
	const editing = editProp ?? defaultEdit ?? false;
	const empty = value.trim() === "";
	const placeholderText =
		typeof placeholder === "string"
			? { edit: placeholder, preview: placeholder }
			: placeholder;
	const valueText = empty ? (placeholderText?.preview ?? "") : value;

	const contextValue: EditableContextValue = {
		value,
		editing,
		empty,
		valueText,
		disabled,
		readOnly,
		invalid,
		required,
		autoResize,
		activationMode,
		submitMode,
		selectOnFocus,
		placeholder: placeholderText,
		translations: { ...defaultTranslations, ...translations },
		maxLength,
		name,
		form,
		styles,
		ids: {
			area: `editable::${id}::area`,
			label: `editable::${id}::label`,
			preview: `editable::${id}::preview`,
			input: `editable::${id}::input`,
			editTrigger: `editable::${id}::edit-trigger`,
			submitTrigger: `editable::${id}::submit-trigger`,
			cancelTrigger: `editable::${id}::cancel-trigger`,
			control: `editable::${id}::control`,
		},
		edit: onEdit ?? (() => {}),
		cancel: onCancel ?? (() => {}),
		submit: onSubmit ?? (() => {}),
		setValue: onSetValue ?? (() => {}),
	};

	return (
		<EditableContext.Provider value={contextValue}>
			<div
				ref={rootRef as never}
				id={id}
				class={cx(styles.root, classProp)}
				data-scope="editable"
				data-part="root"
				data-disabled={disabled ? "" : undefined}
				{...rest}
			>
				{children}
			</div>
		</EditableContext.Provider>
	);
}

export function RootProvider(props: RootProps) {
	return <Root {...props} />;
}

export interface AreaProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Area(props: AreaProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	return (
		<div
			id={context?.ids.area}
			class={cx(styles.area, classProp)}
			data-scope="editable"
			data-part="area"
			data-focus={context?.editing ? "" : undefined}
			data-disabled={context?.disabled ? "" : undefined}
			data-placeholder-shown={context?.empty ? "" : undefined}
			style={context?.autoResize ? { display: "inline-grid" } : undefined}
			{...rest}
		>
			{children}
		</div>
	);
}

export interface LabelProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Label(props: LabelProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: a <label> has no tabIndex and isn't independently keyboard-reachable; this onClick only mirrors the browser's own native label-click-focuses-control behavior
		<label
			id={context?.ids.label}
			for={context?.ids.input}
			class={cx(styles.label, classProp)}
			data-scope="editable"
			data-part="label"
			data-focus={context?.editing ? "" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-required={context?.required ? "" : undefined}
			onClick={() => {
				if (context?.editing) return;
				document.getElementById(context?.ids.preview ?? "")?.focus({
					preventScroll: true,
				});
			}}
			{...rest}
		>
			{children}
		</label>
	);
}

export interface PreviewProps {
	class?: string;
	[key: string]: unknown;
}

export function Preview(props: PreviewProps) {
	const { class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	const interactive = !(context?.disabled || context?.readOnly);
	return (
		// biome-ignore lint/a11y/useSemanticElements: preview sits next to the input in the same area slot; Ark UI renders it as a plain element with role="button" too
		<span
			id={context?.ids.preview}
			role="button"
			class={cx(styles.preview, classProp)}
			data-scope="editable"
			data-part="preview"
			data-placeholder-shown={context?.empty ? "" : undefined}
			data-readonly={context?.readOnly ? "" : undefined}
			data-disabled={context?.disabled ? "" : undefined}
			aria-disabled={context?.disabled ? "true" : undefined}
			aria-invalid={context?.invalid ? "true" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-autoresize={context?.autoResize ? "" : undefined}
			aria-label={context?.translations.edit}
			hidden={context?.autoResize ? undefined : context?.editing}
			tabIndex={interactive ? 0 : undefined}
			onClick={() => {
				if (context?.activationMode === "click") context.edit();
			}}
			onFocus={() => {
				if (context?.activationMode === "focus") context.edit();
			}}
			onDoubleClick={() => {
				if (context?.activationMode === "dblclick") context.edit();
			}}
			onKeyDown={(e) => {
				if (
					(e.key === "Enter" || e.key === " ") &&
					(context?.activationMode === "click" ||
						context?.activationMode === "dblclick")
				) {
					e.preventDefault();
					context.edit();
				}
			}}
			style={
				context?.autoResize
					? {
							whiteSpace: "pre",
							gridArea: "1 / 1 / auto / auto",
							visibility: context.editing ? "hidden" : undefined,
							overflow: "hidden",
							textOverflow: "ellipsis",
						}
					: undefined
			}
			{...rest}
		>
			{context?.valueText}
		</span>
	);
}

export interface InputProps {
	class?: string;
	[key: string]: unknown;
}

export function Input(props: InputProps) {
	const { class: classProp, onKeyDown, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	const editing = context?.editing ?? false;
	const autoResize = context?.autoResize;
	const submitOnEnter =
		context?.submitMode === "enter" || context?.submitMode === "both";
	const submitOnBlur =
		context?.submitMode === "blur" || context?.submitMode === "both";

	return (
		<input
			id={context?.ids.input}
			type="text"
			name={context?.name}
			form={context?.form}
			aria-label={context?.translations.input}
			class={cx(styles.input, classProp)}
			data-scope="editable"
			data-part="input"
			hidden={autoResize ? undefined : !editing}
			placeholder={context?.placeholder?.edit}
			maxLength={context?.maxLength}
			required={context?.required}
			disabled={context?.disabled}
			data-disabled={context?.disabled ? "" : undefined}
			readOnly={context?.readOnly}
			data-readonly={context?.readOnly ? "" : undefined}
			aria-invalid={context?.invalid ? "true" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-autoresize={autoResize ? "" : undefined}
			// Controlled `value` (not `defaultValue`) — hono/jsx's SSR renderer
			// serialises `defaultValue` as a dead attribute that never reaches the
			// live DOM property, so the field would render empty on first paint.
			value={context?.value ?? ""}
			size={autoResize ? 1 : undefined}
			onChange={(e) => {
				context?.setValue((e.currentTarget as HTMLInputElement).value);
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					context?.cancel();
					e.preventDefault();
				} else if (
					e.key === "Enter" &&
					submitOnEnter &&
					!e.shiftKey &&
					!(e as unknown as { metaKey?: boolean }).metaKey
				) {
					context?.submit();
					e.preventDefault();
				}
				(onKeyDown as ((e: typeof e) => void) | undefined)?.(e);
			}}
			onBlur={(e) => {
				if (!submitOnBlur) return;
				const next = (e as FocusEvent).relatedTarget as HTMLElement | null;
				if (
					next?.closest('[data-part="submit-trigger"]') ||
					next?.closest('[data-part="cancel-trigger"]')
				) {
					return;
				}
				context?.submit();
			}}
			style={
				autoResize
					? {
							gridArea: "1 / 1 / auto / auto",
							visibility: !editing ? "hidden" : undefined,
						}
					: undefined
			}
			{...rest}
		/>
	);
}

export interface ControlProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Control(props: ControlProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	return (
		<div
			id={context?.ids.control}
			class={cx(styles.control, classProp)}
			data-scope="editable"
			data-part="control"
			{...rest}
		>
			{children}
		</div>
	);
}

export interface EditTriggerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function EditTrigger(props: EditTriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	const triggerProps = {
		type: "button" as const,
		id: context?.ids.editTrigger,
		"data-scope": "editable",
		"data-part": "edit-trigger",
		"aria-label": context?.translations.edit,
		hidden: context?.editing,
		disabled: context?.disabled,
		onClick: () => context?.edit(),
		...rest,
	};
	return (
		<button class={cx(styles.editTrigger, classProp)} {...triggerProps}>
			{children}
		</button>
	);
}

export interface SubmitTriggerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function SubmitTrigger(props: SubmitTriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	const triggerProps = {
		type: "button" as const,
		id: context?.ids.submitTrigger,
		"data-scope": "editable",
		"data-part": "submit-trigger",
		"aria-label": context?.translations.submit,
		hidden: !context?.editing,
		disabled: context?.disabled,
		onClick: () => context?.submit(),
		...rest,
	};
	return (
		<button class={cx(styles.submitTrigger, classProp)} {...triggerProps}>
			{children}
		</button>
	);
}

export interface CancelTriggerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function CancelTrigger(props: CancelTriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useEditableContext();
	const styles = context?.styles ?? editable();
	const triggerProps = {
		type: "button" as const,
		id: context?.ids.cancelTrigger,
		"data-scope": "editable",
		"data-part": "cancel-trigger",
		"aria-label": context?.translations.cancel,
		hidden: !context?.editing,
		disabled: context?.disabled,
		onClick: () => context?.cancel(),
		...rest,
	};
	return (
		<button class={cx(styles.cancelTrigger, classProp)} {...triggerProps}>
			{children}
		</button>
	);
}

export function Context(props: {
	children: (context: EditableContextValue | null) => Child;
}) {
	const context = useEditableContext();
	return props.children(context);
}

const DefaultEditIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<title>Edit</title>
		<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
	</svg>
);

const DefaultSubmitIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<title>Save</title>
		<path d="M20 6 9 17l-5-5" />
	</svg>
);

const DefaultCancelIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<title>Cancel</title>
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
);

export interface ContentProps extends PropsWithChildren {
	label?: JSX.Element | string;
}

/**
 * Renders the label, preview/input area, and edit/submit/cancel controls for
 * the default (non-compound) `<Editable>` API.
 *
 * Lives in the primitive — rather than being built once by the smart wrapper
 * and threaded through as the interactive island's `children` — because
 * HonoX rebuilds an island's `children` from a serialised HTML snapshot on
 * hydration instead of by re-invoking JSX, and reconciling that reconstructed
 * tree against a freshly re-rendered one on a later state update overflows
 * hono/jsx's diff (`RangeError: Maximum call stack size exceeded`). Calling
 * `Content` from inside the island's own render (see islands/editable.tsx)
 * produces an ordinary vnode tree each render instead, side-stepping this.
 */
export function Content(props: ContentProps) {
	return (
		<>
			{props.label && <Label>{props.label}</Label>}
			<Area>
				<Preview />
				<Input />
			</Area>
			<Control>
				<EditTrigger>
					<DefaultEditIcon />
				</EditTrigger>
				<SubmitTrigger>
					<DefaultSubmitIcon />
				</SubmitTrigger>
				<CancelTrigger>
					<DefaultCancelIcon />
				</CancelTrigger>
			</Control>
			{props.children}
		</>
	);
}

export type { EditableStyles };
