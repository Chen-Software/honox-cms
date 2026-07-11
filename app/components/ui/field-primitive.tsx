import {
	type Child,
	createContext,
	useContext,
	useEffect,
	useId,
	useState,
} from "hono/jsx";
import { cx } from "styled-system/css";
import type { FieldVariantProps } from "styled-system/recipes";
import { field } from "styled-system/recipes";

export interface FieldContextValue {
	id: string;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	required?: boolean;
	value?: string;
	onValueChange?: (value: string) => void;
	minLength?: number;
	labelId: string;
	helperTextId: string;
	errorTextId: string;
	hasHelperText: boolean;
	hasErrorText: boolean;
	errorText?: string;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends FieldVariantProps {
	children?: Child;
	class?: string;
	id?: string;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	required?: boolean;
	label?: Child;
	helperText?: Child;
	errorText?: Child;
	value?: string;
	onValueChange?: (value: string) => void;
	minLength?: number;
	validator?: ValidatorFn | string;
	validatorSource?: string;
	interactive?: boolean;
	defaultValue?: string;
	[key: string]: unknown;
}

export const useFieldContext = () => useContext(FieldContext);

export type ValidatorFn = (value: string) => boolean | string;

const resolveValidator = (
	validator?: ValidatorFn | string,
): ValidatorFn | undefined => {
	if (typeof validator !== "string") return validator;
	// Function props don't survive island hydration (JSON.stringify silently
	// drops them), so components/ui/{field,textarea}.tsx also send a
	// `validatorSource` string alongside the live `validator` function. Only
	// the browser ever hits this branch post-hydration, once `validator`
	// itself has been dropped — never during SSR, since Workers-style
	// runtimes disallow dynamic code generation. The source must not close
	// over any outer variables, since it's rebuilt with no lexical scope.
	return new Function(`return (${validator})`)() as ValidatorFn;
};

export const validateField = (
	value: string | undefined,
	minLength?: number,
	validator?: ValidatorFn | string,
) => {
	let isInvalid = false;
	let errorText: string | undefined;
	const resolvedValidator = resolveValidator(validator);

	if (resolvedValidator && value !== undefined) {
		const result = resolvedValidator(value);
		if (result === false) {
			isInvalid = true;
		} else if (typeof result === "string") {
			isInvalid = true;
			errorText = result;
		}
	} else if (minLength !== undefined && value !== undefined && value !== "") {
		if (value.length < minLength) {
			isInvalid = true;
			errorText = `Must be at least ${minLength} characters`;
		}
	}

	return { isInvalid, errorText };
};

export function FieldRoot(props: FieldProps) {
	const [variantProps, localProps] = field.splitVariantProps(props);
	const {
		children,
		class: classProp,
		id: idProp,
		disabled = props.disabled,
		invalid: invalidProp = props.invalid,
		readOnly = props.readOnly,
		required = props.required,
		label,
		helperText,
		errorText: errorTextProp,
		value: valueProp,
		onValueChange,
		minLength,
		validator,
		validatorSource,
		interactive: _interactive,
		defaultValue,
		...restProps
	} = localProps;
	const effectiveValidator = validator ?? validatorSource;

	const [internalValue, setInternalValue] = useState(valueProp ?? defaultValue);

	// Sync internal state if props change (for controlled components)
	useEffect(() => {
		if (valueProp !== undefined) {
			setInternalValue(valueProp);
		}
	}, [valueProp]);

	const value =
		valueProp !== undefined ? valueProp : (internalValue ?? defaultValue);

	const autoId = useId();
	const id = idProp || autoId;
	const styles = field(variantProps);

	// Compute validation - use defaultValue for initial SSR render
	const initialValue =
		valueProp !== undefined ? valueProp : (defaultValue ?? "");
	let { isInvalid, errorText } = validateField(
		initialValue,
		minLength,
		effectiveValidator,
	);

	if (invalidProp !== undefined) {
		isInvalid = invalidProp;
	}

	const handleValueChange = (newValue: string) => {
		if (valueProp === undefined) {
			setInternalValue(newValue);
		}
		onValueChange?.(newValue);
	};

	const contextValue: FieldContextValue = {
		id,
		disabled,
		invalid: isInvalid,
		readOnly,
		required,
		value,
		onValueChange: handleValueChange,
		minLength,
		labelId: `field::${id}::label`,
		helperTextId: `field::${id}::helper-text`,
		errorTextId: `field::${id}::error-text`,
		hasHelperText: !!helperText,
		hasErrorText: !!(errorTextProp || errorText),
		errorText:
			errorText ||
			(typeof errorTextProp === "string" ? errorTextProp : undefined),
	};

	const describedBy = [
		contextValue.hasHelperText ? contextValue.helperTextId : null,
		isInvalid && contextValue.hasErrorText ? contextValue.errorTextId : null,
	]
		.filter(Boolean)
		.join(" ");

	const isChildrenEmpty =
		children === undefined ||
		children === null ||
		(typeof children === "string" && children.trim() === "") ||
		(Array.isArray(children) &&
			children.every(
				(child) =>
					child === undefined ||
					child === null ||
					(typeof child === "string" && child.trim() === ""),
			));

	const { class: restClass, ...otherRestProps } = restProps;

	return (
		<FieldContext.Provider value={contextValue}>
			<div
				class={cx(styles.root, classProp)}
				data-disabled={disabled ? "" : undefined}
				data-invalid={isInvalid ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-required={required ? "" : undefined}
				{...(!isChildrenEmpty
					? (otherRestProps as Record<string, unknown>)
					: {})}
			>
				{label && <FieldLabel>{label}</FieldLabel>}
				{!isChildrenEmpty ? (
					children
				) : (
					<input
						id={id}
						disabled={disabled}
						{...((readOnly ? { readOnly: "" } : {}) as Record<string, unknown>)}
						required={required}
						aria-invalid={isInvalid ? "true" : undefined}
						aria-describedby={describedBy || undefined}
						value={value}
						defaultValue={defaultValue}
						onInput={(e) => {
							handleValueChange((e.target as HTMLInputElement).value);
						}}
						class={cx(styles.input, restClass as string)}
						{...(otherRestProps as Record<string, unknown>)}
					/>
				)}
				{helperText && <FieldHelperText>{helperText}</FieldHelperText>}
				<FieldErrorText />
			</div>
		</FieldContext.Provider>
	);
}

export function FieldLabel(props: {
	children?: Child;
	class?: string;
	for?: string;
	[key: string]: unknown;
}) {
	const context = useFieldContext();
	const styles = field();
	const { children, class: classProp, for: forProp, ...rest } = props;
	return (
		<label
			id={context?.labelId}
			for={forProp || context?.id}
			data-disabled={context?.disabled ? "" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-readonly={context?.readOnly ? "" : undefined}
			data-required={context?.required ? "" : undefined}
			class={cx(styles.label, classProp)}
			{...(rest as Record<string, unknown>)}
		>
			{children}
			{context?.required && <FieldRequiredIndicator />}
		</label>
	);
}

export function FieldHelperText(props: { children?: Child; class?: string }) {
	const context = useFieldContext();
	const styles = field();
	return (
		<div
			id={context?.helperTextId}
			class={cx(styles.helperText, props.class)}
			data-disabled={context?.disabled ? "" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-readonly={context?.readOnly ? "" : undefined}
			data-required={context?.required ? "" : undefined}
		>
			{props.children}
		</div>
	);
}

export function FieldErrorText(props: { children?: Child; class?: string }) {
	const context = useFieldContext();
	const styles = field();
	if (context?.invalid) {
		return (
			<div
				id={context?.errorTextId}
				class={cx(styles.errorText, props.class)}
				data-disabled={context?.disabled ? "" : undefined}
				data-invalid={context?.invalid ? "" : undefined}
				data-readonly={context?.readOnly ? "" : undefined}
				data-required={context?.required ? "" : undefined}
			>
				{props.children || context.errorText}
			</div>
		);
	}
	return null;
}

export function FieldRequiredIndicator(props: {
	children?: Child;
	class?: string;
}) {
	const context = useFieldContext();
	const styles = field();
	return (
		<span
			aria-hidden="true"
			class={cx(styles.requiredIndicator, props.class)}
			data-disabled={context?.disabled ? "" : undefined}
			data-invalid={context?.invalid ? "" : undefined}
			data-readonly={context?.readOnly ? "" : undefined}
			data-required={context?.required ? "" : undefined}
		>
			{props.children || "*"}
		</span>
	);
}

export function InteractiveField(props: FieldProps) {
	return <FieldRoot {...props} />;
}
