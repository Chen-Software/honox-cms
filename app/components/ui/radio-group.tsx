import type { JSX } from "hono/jsx";
import RadioGroupIsland from "../../islands/radio-group";
import {
	Indicator,
	Item,
	ItemControl,
	ItemHiddenInput,
	ItemText,
	Label,
	Root,
	type RootProps,
} from "./radio-group-primitive";

interface RadioGroupItem {
	value: string;
	label: string | JSX.Element;
	disabled?: boolean;
	invalid?: boolean;
}

interface RadioGroupProps extends RootProps {
	items?: (string | RadioGroupItem)[];
	label?: string | JSX.Element;
	interactive?: boolean;
}

const RadioGroupRoot = (props: RadioGroupProps) => {
	const { items, label, interactive, ...rest } = props;

	const Component = interactive ? RadioGroupIsland : Root;

	return (
		<Component {...rest}>
			{label && <Label>{label}</Label>}
			{items?.map((item) => {
				const normalizedItem =
					typeof item === "string" ? { value: item, label: item } : item;
				return (
					<Item
						key={normalizedItem.value}
						value={normalizedItem.value}
						disabled={normalizedItem.disabled}
						invalid={normalizedItem.invalid}
					>
						<ItemControl />
						<ItemText>{normalizedItem.label}</ItemText>
						<ItemHiddenInput />
					</Item>
				);
			})}
			<Indicator />
			{rest.children}
		</Component>
	);
};

const RadioGroup = Object.assign(RadioGroupRoot, {
	Root: Root,
	Label: Label,
	Item: Item,
	ItemText: ItemText,
	ItemControl: ItemControl,
	ItemHiddenInput: ItemHiddenInput,
	Indicator: Indicator,
});

export type { RadioGroupItem, RadioGroupProps };
export { RadioGroup };
