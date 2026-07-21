import { cx } from "design-system/css";
import {
	type RadioCardGroupVariantProps,
	radioCardGroup,
} from "design-system/recipes";
import {
	createContext,
	type JSX,
	type PropsWithChildren,
	useContext,
	useId,
} from "hono/jsx";

type RadioCardGroupStyles = ReturnType<typeof radioCardGroup>;

interface RadioCardGroupContextValue {
	styles: RadioCardGroupStyles;
	value?: string;
	onValueChange?: (details: { value: string }) => void;
	id: string;
	name?: string;
	disabled?: boolean;
	readOnly?: boolean;
}

const RadioCardGroupContext = createContext<RadioCardGroupContextValue | null>(
	null,
);

const useRadioCardGroupContext = () => {
	const context = useContext(RadioCardGroupContext);
	if (!context) {
		if (typeof window === "undefined") {
			return {
				id: "ssr-radio-card-group",
				styles: radioCardGroup({}),
			} as RadioCardGroupContextValue;
		}
		throw new Error(
			"useRadioCardGroupContext must be used within a RadioCardGroup.Root",
		);
	}
	return context;
};

interface RootProps extends RadioCardGroupVariantProps, PropsWithChildren {
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
	const [variantProps, localProps] = radioCardGroup.splitVariantProps(props);
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

	const styles = radioCardGroup(variantProps);
	const fallbackId = useId();
	const id = idProp || fallbackId;

	const contextValue: RadioCardGroupContextValue = {
		styles,
		value: value ?? defaultValue,
		onValueChange,
		id,
		name,
		disabled,
		readOnly,
	};

	return (
		<RadioCardGroupContext.Provider value={contextValue}>
			<div
				id={id}
				ref={rootRef as any}
				role="radiogroup"
				class={cx(styles.root, className)}
				data-disabled={disabled ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-scope="radio-card-group"
				data-part="root"
				{...rest}
			>
				{children}
			</div>
		</RadioCardGroupContext.Provider>
	);
}

interface LabelProps extends PropsWithChildren {
	class?: string;
}

function Label(props: LabelProps) {
	const context = useRadioCardGroupContext();
	return (
		<span
			class={cx(context.styles.label, props.class)}
			data-scope="radio-card-group"
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
	const context = useRadioCardGroupContext();
	const isChecked = context.value === value;
	const isDisabled = disabled || context.disabled;

	return (
		<ItemContext.Provider value={{ value, disabled: isDisabled }}>
			<label
				class={cx(context.styles.item, className)}
				role="radio"
				aria-checked={isChecked}
				data-scope="radio-card-group"
				data-part="item"
				data-value={value}
				data-state={isChecked ? "checked" : "unchecked"}
				data-disabled={isDisabled ? "" : undefined}
				tabIndex={isChecked && !isDisabled ? 0 : -1}
				{...rest}
			>
				{children}
			</label>
		</ItemContext.Provider>
	);
}

interface ItemTextProps extends PropsWithChildren {
	class?: string;
}

function ItemText(props: ItemTextProps) {
	const context = useRadioCardGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<span
			class={cx(context.styles.itemText, props.class)}
			data-scope="radio-card-group"
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
	const context = useRadioCardGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<div
			class={cx(context.styles.itemControl, props.class)}
			data-scope="radio-card-group"
			data-part="item-control"
			data-state={isChecked ? "checked" : "unchecked"}
			data-disabled={item?.disabled ? "" : undefined}
		>
			{props.children}
		</div>
	);
}

function ItemHiddenInput() {
	const context = useRadioCardGroupContext();
	const item = useContext(ItemContext);
	const isChecked = context.value === item?.value;

	return (
		<input
			type="radio"
			aria-hidden="true"
			tabIndex={-1}
			checked={isChecked}
			disabled={item?.disabled}
			name={context.name || context.id}
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
	const context = useRadioCardGroupContext();
	return (
		<div
			class={cx(context.styles.indicator, props.class)}
			data-scope="radio-card-group"
			data-part="indicator"
		/>
	);
}

interface RadioCardGroupItem {
	value: string;
	label: string | JSX.Element;
	disabled?: boolean;
	invalid?: boolean;
}

interface GroupContentProps extends PropsWithChildren {
	items?: (string | RadioCardGroupItem)[];
	label?: string | JSX.Element;
}

/**
 * Renders the label, item cards, and indicator for the items-driven API.
 *
 * Lives in the primitive so both the static wrapper and the island render
 * items inside Root's context provider. Islands must not receive items as
 * JSX children: HonoX serialises island children into a data-hono-template
 * rendered outside the provider, so non-default variant classes would be
 * lost on hydration.
 */
function GroupContent(props: GroupContentProps) {
	return (
		<>
			{props.label && <Label>{props.label}</Label>}
			{props.items?.map((item) => {
				const normalisedItem =
					typeof item === "string" ? { value: item, label: item } : item;
				return (
					<Item
						key={normalisedItem.value}
						value={normalisedItem.value}
						disabled={normalisedItem.disabled}
						invalid={normalisedItem.invalid}
					>
						<ItemText>{normalisedItem.label}</ItemText>
						<ItemControl />
						<ItemHiddenInput />
					</Item>
				);
			})}
			<Indicator />
			{props.children}
		</>
	);
}

export type {
	GroupContentProps,
	ItemControlProps,
	ItemProps,
	ItemTextProps,
	LabelProps,
	RadioCardGroupItem,
	RootProps,
};

export {
	GroupContent,
	Indicator,
	Item,
	ItemControl,
	ItemHiddenInput,
	ItemText,
	Label,
	Root,
	useRadioCardGroupContext,
};
