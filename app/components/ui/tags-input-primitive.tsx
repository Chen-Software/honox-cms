import type { PropsWithChildren } from "hono/jsx";
import { createContext, useContext, useId } from "hono/jsx";
import { cx } from "styled-system/css";
import type { TagsInputVariantProps } from "styled-system/recipes";
import { tagsInput } from "styled-system/recipes";

type TagsInputStyles = ReturnType<typeof tagsInput>;

interface TagsInputContextValue {
	styles: TagsInputStyles;
	value: string[];
	inputValue?: string;
	disabled?: boolean;
	readOnly?: boolean;
	invalid?: boolean;
	name?: string;
}

const TagsInputContext = createContext<TagsInputContextValue | null>(null);

export const useTagsInputContext = () => {
	const context = useContext(TagsInputContext);
	return context;
};

export interface RootProps extends TagsInputVariantProps, PropsWithChildren {
	value?: string[];
	defaultValue?: string[];
	inputValue?: string;
	defaultInputValue?: string;
	disabled?: boolean;
	readOnly?: boolean;
	invalid?: boolean;
	class?: string;
	id?: string;
	name?: string;
	dir?: "ltr" | "rtl";
	onValueChange?: (details: { value: string[] }) => void;
	onInputValueChange?: (details: { inputValue: string }) => void;
	label?: string;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = tagsInput.splitVariantProps(props);
	const {
		children,
		value: valueProp,
		defaultValue = [],
		inputValue: inputValueProp,
		defaultInputValue = "",
		disabled,
		readOnly,
		invalid,
		class: classProp,
		id: idProp,
		name,
		onValueChange,
		onInputValueChange,
		label,
		...restProps
	} = localProps;

	const styles = tagsInput(variantProps);
	const fallbackId = useId();
	const id = idProp || `tags-input-root-${fallbackId}`;

	const value = valueProp ?? defaultValue;
	const inputValue = inputValueProp ?? defaultInputValue;

	const contextValue: TagsInputContextValue = {
		styles,
		value,
		inputValue,
		disabled,
		readOnly,
		invalid,
		name,
	};

	return (
		<TagsInputContext.Provider value={contextValue}>
			<div
				id={id}
				data-scope="tags-input"
				data-part="root"
				data-disabled={disabled ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-invalid={invalid ? "" : undefined}
				class={cx(styles.root, classProp)}
				{...restProps}
			>
				{children}
			</div>
		</TagsInputContext.Provider>
	);
}

export function Label(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	if (!context) return null;
	const { styles, disabled, invalid, readOnly } = context;
	return (
		<label
			data-part="label"
			data-disabled={disabled ? "" : undefined}
			data-invalid={invalid ? "" : undefined}
			data-readonly={readOnly ? "" : undefined}
			class={cx(styles?.label, classProp)}
			{...rest}
		>
			{children}
		</label>
	);
}

export function Control(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	if (!context) return <div {...rest}>{children}</div>;
	const { styles, disabled, invalid, readOnly } = context;
	return (
		<div
			data-part="control"
			data-disabled={disabled ? "" : undefined}
			data-invalid={invalid ? "" : undefined}
			data-readonly={readOnly ? "" : undefined}
			class={cx(styles?.control, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

export function Input(props: { class?: string; placeholder?: string } & any) {
	const { class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	if (!context) return <input {...rest} />;
	const { styles, disabled, invalid, readOnly, inputValue } = context;
	return (
		<input
			data-part="input"
			data-disabled={disabled ? "" : undefined}
			data-invalid={invalid ? "" : undefined}
			data-readonly={readOnly ? "" : undefined}
			disabled={disabled}
			readOnly={readOnly}
			value={inputValue}
			class={cx(styles?.input, classProp)}
			{...rest}
		/>
	);
}

interface ItemContextValue {
	index: number;
	value: string;
	disabled?: boolean;
}

const ItemContext = createContext<ItemContextValue | null>(null);

export const useItemContext = () => {
	const context = useContext(ItemContext);
	if (!context) {
		throw new Error("useItemContext must be used within a TagsInput Item");
	}
	return context;
};

export interface ItemProps extends PropsWithChildren {
	index: number;
	value: string;
	disabled?: boolean;
	class?: string;
}

export function Item(props: ItemProps) {
	const { children, index, value, disabled, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;

	const itemContextValue = {
		index,
		value,
		disabled,
	};

	return (
		<ItemContext.Provider value={itemContextValue}>
			<div
				data-part="item"
				data-index={index}
				data-value={value}
				data-disabled={disabled ? "" : undefined}
				class={cx(styles?.item, classProp)}
				{...rest}
			>
				{children}
			</div>
		</ItemContext.Provider>
	);
}

export function ItemPreview(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;
	const { index, value, disabled } = useItemContext();
	return (
		<div
			data-part="item-preview"
			data-index={index}
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(styles?.itemPreview, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

export function ItemText(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;
	const { index, value, disabled } = useItemContext();
	return (
		<span
			data-part="item-text"
			data-index={index}
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(styles?.itemText, classProp)}
			{...rest}
		>
			{children || value}
		</span>
	);
}

export function ItemInput(props: { class?: string } & any) {
	const { class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;
	const { index, value, disabled } = useItemContext();
	return (
		<input
			data-part="item-input"
			data-index={index}
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(styles?.itemInput, classProp)}
			style={{ display: "none" }}
			{...rest}
		/>
	);
}

const XIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		style={{ width: "1em", height: "1em" }}
	>
		<title>Close</title>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

export function ItemDeleteTrigger(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;
	const { index, value, disabled } = useItemContext();
	return (
		<button
			type="button"
			data-part="item-delete-trigger"
			data-index={index}
			data-value={value}
			data-disabled={disabled ? "" : undefined}
			class={cx(styles?.itemDeleteTrigger, classProp)}
			{...rest}
		>
			{children || <XIcon />}
		</button>
	);
}

export function ClearTrigger(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useTagsInputContext();
	const styles = context?.styles;
	const disabled = context?.disabled;
	return (
		<button
			type="button"
			data-part="clear-trigger"
			data-disabled={disabled ? "" : undefined}
			class={cx(styles?.clearTrigger, classProp)}
			{...rest}
		>
			{children || <XIcon />}
		</button>
	);
}

export function HiddenInput(props: { name?: string } & any) {
	const { name, ...rest } = props;
	const context = useTagsInputContext();
	const value = context?.value ?? [];
	const contextName = context?.name;
	return (
		<input
			type="hidden"
			name={name || contextName}
			value={value.join(",")}
			data-part="hidden-input"
			{...rest}
		/>
	);
}

export function Items(props: { class?: string }) {
	const context = useTagsInputContext();
	const value = context?.value ?? [];
	return (
		<>
			{value.map((item, index) => (
				<Item key={`${item}-${index}`} index={index} value={item} {...props}>
					<ItemPreview>
						<ItemText />
						<ItemDeleteTrigger />
					</ItemPreview>
					<ItemInput />
				</Item>
			))}
		</>
	);
}
