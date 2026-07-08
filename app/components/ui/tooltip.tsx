import TooltipIsland from "../../islands/tooltip";
import { shouldHydrate } from "./island-utils";
import {
	TooltipBase,
	type TooltipBaseProps,
	type TooltipRootProps,
} from "./tooltip-primitive";

export interface TooltipProps extends TooltipRootProps {
	/**
	 * Whether the tooltip should be interactive (hydrated as an island).
	 * Defaults to true if not explicitly set to false.
	 */
	interactive?: boolean;
}

/**
 * A high-level Tooltip component for common use cases.
 */
export function Tooltip(props: TooltipBaseProps & { interactive?: boolean }) {
	const { interactive, ...rest } = props;

	const isInteractive = shouldHydrate(interactive, true);

	if (isInteractive) {
		return <TooltipIsland {...rest} />;
	}

	return <TooltipBase {...rest} />;
}
