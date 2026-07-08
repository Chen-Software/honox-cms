import ToggleGroupIsland from "../../islands/toggle-group";
import { shouldHydrate } from "./island-utils";
import {
	Item,
	Root,
	type RootProps,
	ToggleGroupStructure,
	type ToggleGroupStructureProps,
} from "./toggle-group-primitive";

export interface ToggleGroupProps
	extends RootProps,
		Partial<ToggleGroupStructureProps> {
	interactive?: boolean;
}

const ToggleGroupRoot = (props: ToggleGroupProps) => {
	const { interactive, ...rest } = props;

	const hasSignal =
		rest.value !== undefined ||
		rest.defaultValue !== undefined ||
		rest.onValueChange !== undefined;

	if (shouldHydrate(interactive, hasSignal)) {
		return <ToggleGroupIsland {...(rest as any)} />;
	}

	return (
		<Root {...rest}>
			{props.children ||
				(rest.items && <ToggleGroupStructure items={rest.items} />)}
		</Root>
	);
};

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
	Root: ToggleGroupRoot,
	Item: Item,
});

export type { ToggleGroupProps };
export default ToggleGroup;
