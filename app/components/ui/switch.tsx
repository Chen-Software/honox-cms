import SwitchIsland from "../../islands/switch";
import { shouldHydrate } from "./island-utils";
import {
	Switch as SwitchPrimitive,
	type SwitchProps as SwitchPrimitiveProps,
} from "./switch-primitive";

export interface SwitchProps extends SwitchPrimitiveProps {
	interactive?: boolean;
	defaultChecked?: boolean;
}

export function Switch(props: SwitchProps) {
	const { interactive, onCheckedChange, checked, defaultChecked } = props;

	const hasSignal =
		onCheckedChange !== undefined ||
		checked !== undefined ||
		defaultChecked !== undefined;
	const isInteractive = shouldHydrate(interactive, hasSignal);

	if (isInteractive) {
		return <SwitchIsland {...props} />;
	}

	return <SwitchPrimitive {...props} />;
}
