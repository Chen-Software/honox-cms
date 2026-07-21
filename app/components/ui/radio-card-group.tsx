import type { JSX } from "hono/jsx";
import RadioCardGroupIsland from "../../islands/radio-card-group";
import { shouldHydrate } from "./island-utils";
import {
	GroupContent,
	Indicator,
	Item,
	ItemControl,
	ItemHiddenInput,
	ItemText,
	Label,
	type RadioCardGroupItem,
	Root,
	type RootProps,
} from "./radio-card-group-primitive";

interface RadioCardGroupProps extends RootProps {
	items?: (string | RadioCardGroupItem)[];
	label?: string | JSX.Element;
	interactive?: boolean;
}

const RadioCardGroupRoot = (props: RadioCardGroupProps) => {
	const { items, label, interactive, children, ...rest } = props;

	const hasSignal =
		rest.value !== undefined ||
		rest.defaultValue !== undefined ||
		rest.onValueChange !== undefined;

	// Items and label go to the island as serialisable props, not JSX
	// children: HonoX renders island children into a data-hono-template
	// outside Root's provider, which would strip variant classes after
	// hydration. GroupContent renders them inside the provider on both paths.
	if (shouldHydrate(interactive, hasSignal)) {
		return (
			<RadioCardGroupIsland {...rest} items={items} label={label}>
				{children}
			</RadioCardGroupIsland>
		);
	}

	return (
		<Root {...rest}>
			<GroupContent items={items} label={label}>
				{children}
			</GroupContent>
		</Root>
	);
};

const RadioCardGroup = Object.assign(RadioCardGroupRoot, {
	Root: Root,
	Label: Label,
	Item: Item,
	ItemText: ItemText,
	ItemControl: ItemControl,
	ItemHiddenInput: ItemHiddenInput,
	Indicator: Indicator,
});

export type { RadioCardGroupItem, RadioCardGroupProps };
export { RadioCardGroup };
