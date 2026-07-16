import InteractiveTabsIsland from "../../islands/tabs";
import { shouldHydrate } from "./island-utils";
import {
	AddTrigger,
	Content,
	Indicator,
	type RootProps as InteractiveRootProps,
	List,
	Root,
	TabsStructure,
	type TabsStructureProps,
	Trigger,
} from "./tabs-primitive";

type TabsItemFromPrimitive = import("./tabs-primitive").TabsItem;

interface TabsProps extends InteractiveRootProps, TabsStructureProps {
	interactive?: boolean;
}

const TabsRoot = (props: TabsProps) => {
	const {
		interactive,
		children,
		items,
		indicator,
		closable,
		editable,
		onTabClose,
		onTabAdd,
		addAriaLabel,
		extra,
		...rootProps
	} = props;

	const hasSignal =
		rootProps.value !== undefined ||
		rootProps.defaultValue !== undefined ||
		rootProps.onValueChange !== undefined ||
		closable !== undefined ||
		editable !== undefined ||
		onTabClose !== undefined ||
		onTabAdd !== undefined;

	if (shouldHydrate(interactive, hasSignal)) {
		return (
			<InteractiveTabsIsland
				{...rootProps}
				items={items}
				indicator={indicator}
				closable={closable}
				editable={editable}
				onTabClose={onTabClose}
				onTabAdd={onTabAdd}
				addAriaLabel={addAriaLabel}
				extra={extra}
			>
				{children}
			</InteractiveTabsIsland>
		);
	}

	return (
		<Root {...rootProps}>
			{children || (
				<TabsStructure
					items={items ?? []}
					indicator={indicator}
					closable={closable}
					editable={editable}
					onTabClose={onTabClose}
					onTabAdd={onTabAdd}
					addAriaLabel={addAriaLabel}
					extra={extra}
				/>
			)}
		</Root>
	);
};

export const Tabs = TabsRoot;
export type { TabsItemFromPrimitive as TabsItem, TabsProps };
export {
	AddTrigger as TabsAddTrigger,
	Content as TabsContent,
	Indicator as TabsIndicator,
	List as TabsList,
	Trigger as TabsTrigger,
};

export default Tabs;
