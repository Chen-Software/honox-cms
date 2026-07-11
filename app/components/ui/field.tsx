import FieldIsland from "../../islands/field";
import {
	type FieldProps as BaseFieldProps,
	FieldRoot,
} from "./field-primitive";
import { shouldHydrate } from "./island-utils";

export interface FieldProps extends BaseFieldProps {
	interactive?: boolean;
	defaultValue?: string;
}

/**
 * A highly production-ready flattened Field component ported to Hono/JSX.
 * It provides support for validation, helper text, error text, and label styling.
 */
export function Field(props: FieldProps) {
	const {
		interactive,
		onValueChange,
		value,
		defaultValue,
		validator,
		minLength,
	} = props;

	const hasSignal =
		onValueChange !== undefined ||
		value !== undefined ||
		defaultValue !== undefined ||
		validator !== undefined ||
		minLength !== undefined;
	const isInteractive = shouldHydrate(interactive, hasSignal);

	if (isInteractive) {
		// Function props don't survive island hydration (they're dropped by
		// JSON.stringify), so also send the validator across as source text —
		// FieldRoot falls back to reconstructing it from `validatorSource`
		// once `validator` itself has been stripped on the client.
		return (
			<FieldIsland
				{...props}
				validatorSource={
					typeof validator === "function" ? validator.toString() : validator
				}
			/>
		);
	}

	return <FieldRoot {...props} />;
}

export default Field;
