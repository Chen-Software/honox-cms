import {
	createContext,
	type PropsWithChildren,
	useContext,
	useId,
} from "hono/jsx";
import { cx } from "styled-system/css";
import { type RadioGroupVariantProps, radioGroup } from "styled-system/recipes";

type RadioGroupStyles = ReturnType<typeof radioGroup>;

interface RadioGroupContextValue {
	styles: RadioGroupStyles;
	value?: string;
	onValueChange?: (details: { value: string }) => void;
	id: string;
	disabled?: boolean;
	readOnly?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const useRadioGroupContext = () => {
	const context = useContext(RadioGroupContext);
	if (!context) {
		if (typeof window === "undefined") {
			return {
				id: "ssr-radio-group",
				styles: radioGroup({}),
			} as RadioGroupContextValue;
		}
		throw new Error(
			"useRadioGroupContext must be used within a RadioGroup.Root",
		);
	}
	return context;
};

interface RootProps extends RadioGroupVariantProps, PropsWithChildren {
	defaultValue?: string;
	value?: string;
	onValueChange?: (details: { value: string }) => void;
	id?: string;
	name?: string;
	disabled?: boolean;
	readOnly?: boolean;
	rootRef?: { current: HTMLDivElement | null };
	class?: string;
}

function Root(props: RootProps) {
	const [variantProps, localProps] = radioGroup.splitVariantProps(props);
	const {
		children,
		value,
		defaultValue,
		onValueChange,
		id: idProp,
		name,
		disabled,
		readOnly,
		rootRef,
		class: className,
		...rest
	} = localProps;

	const styles = radioGroup(variantProps);
	const fallbackId = useId();
	const id = idProp || fallbackId;

	const contextValue: RadioGroupContextValue = {
		styles,
		value: value ?? defaultValue,
		onValueChange,
		id,
		disabled,
		readOnly,
	};

	return (
		<RadioGroupContext.Provider value={contextValue}>
			<div
				id={id}
				ref={rootRef as any}
				role="radiogroup"
				class={cx(styles.root, className)}
				data-disabled={disabled ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-scope="radio-group"
				data-part="root"
				{...rest}
			>
				{children}
			</div>
		</RadioGroupContext.Provider>
	);
}

interface LabelProps extends PropsWithChildren {
	class?: string;
}

function Label(props: LabelProps) {
	const context = useRadioGroupContext();
	return (
		<span
			class={cx(context.styles.label, props.class)}
			data-scope="radio-group"
			data-part="label"
		>
			{props.children}
		</span>
	);
}

interface ItemProps extends PropsWithChildren {
	value: string;
	disabled?: boolean;
	invalid?: boolean;
	class?: string;
}

const ItemContext = createContext<{ value: string; disabled?: boolean } | null>(
	null,
);

function Item(props: ItemProps) {
	const { value, disabled, children, class: className, ...rest } = props;
	const context = useRadioGroupContext();
	const isChecked = context.value === value;
	const isDisabled = disabled || context.disabled;

	return (
		<ItemContext.Provider value={{ value, disabled: isDisabled }}>
			<div
				class={cx(context.styles.item, className)}
				role="radio"
				aria-checked={isChecked}
				data-scope="radio-group"
				data-part="item"
				data-value={value}
				data-state={isChecked ? "checked" : "unchecked"}
				data-disabled={isDisabled ? "" : undefined}
				tabIndex={isChecked && !isDisabled ? 0 : -1}
				{...rest}
			>
				{children}
			</div>
		</ItemContext.Provider>
	);
}

interface ItemTextProps extends PropsWithChildren {
	class?: string;
}

function ItemText(props: ItemTextProps) {
	const context = useRadioGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<span
			class={cx(context.styles.itemText, props.class)}
			data-scope="radio-group"
			data-part="item-text"
			data-state={isChecked ? "checked" : "unchecked"}
			data-disabled={item?.disabled ? "" : undefined}
		>
			{props.children}
		</span>
	);
}

interface ItemControlProps extends PropsWithChildren {
	class?: string;
}

function ItemControl(props: ItemControlProps) {
	const context = useRadioGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<div
			class={cx(context.styles.itemControl, props.class)}
			data-scope="radio-group"
			data-part="item-control"
			data-state={isChecked ? "checked" : "unchecked"}
			data-disabled={item?.disabled ? "" : undefined}
		>
			{props.children}
		</div>
	);
}

function ItemHiddenInput() {
	const context = useRadioGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<input
			type="radio"
			aria-hidden="true"
			tabIndex={-1}
			checked={isChecked}
			disabled={item?.disabled}
			name={context.id}
			value={item?.value}
			style={{
				border: "0px",
				clip: "rect(0px, 0px, 0px, 0px)",
				height: "1px",
				margin: "-1px",
				overflow: "hidden",
				padding: "0px",
				position: "absolute",
				width: "1px",
				whiteSpace: "nowrap",
				wordWrap: "normal",
			}}
		/>
	);
}

function Indicator(props: { class?: string }) {
	const context = useRadioGroupContext();
	return (
		<div
			class={cx(context.styles.indicator, props.class)}
			data-scope="radio-group"
			data-part="indicator"
		/>
	);
}

export type {
	ItemControlProps,
	ItemProps,
	ItemTextProps,
	LabelProps,
	RootProps,
};

export {
	Indicator,
	Item,
	ItemControl,
	ItemHiddenInput,
	ItemText,
	Label,
	Root,
	useRadioGroupContext,
};
