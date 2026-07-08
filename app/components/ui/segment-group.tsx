import SegmentGroupIsland from "../../islands/segment-group";
import { shouldHydrate } from "./island-utils";
import {
	Indicator,
	Item,
	ItemControl,
	ItemHiddenInput,
	ItemText,
	Label,
	Root,
	type RootProps,
	SegmentGroupStructure,
	type SegmentGroupStructureProps,
} from "./segment-group-primitive";

export interface SegmentGroupProps
	extends RootProps,
		Partial<SegmentGroupStructureProps> {
	interactive?: boolean;
}

const SegmentGroupRoot = (props: SegmentGroupProps) => {
	const { interactive, ...rest } = props;

	const hasSignal =
		rest.value !== undefined ||
		rest.defaultValue !== undefined ||
		rest.onValueChange !== undefined;

	if (shouldHydrate(interactive, hasSignal)) {
		return <SegmentGroupIsland {...(rest as any)} />;
	}

	return (
		<Root {...rest}>
			{props.children ||
				(rest.items && <SegmentGroupStructure items={rest.items} />)}
		</Root>
	);
};

export const SegmentGroup = Object.assign(SegmentGroupRoot, {
	Root: SegmentGroupRoot,
	Label: Label,
	Indicator: Indicator,
	Item: Item,
	ItemText: ItemText,
	ItemControl: ItemControl,
	ItemHiddenInput: ItemHiddenInput,
	Items: SegmentGroupStructure,
});

export type { SegmentGroupProps };
export default SegmentGroup;
