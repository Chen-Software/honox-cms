import { useEffect, useRef, useState, useId } from "hono/jsx";
import {
	Root,
	Label,
	Control,
	Input,
	Items,
	HiddenInput,
	type RootProps,
} from "../components/ui/tags-input-primitive";

export interface TagsInputIslandProps extends RootProps {
	onValueChange?: (details: { value: string[] }) => void;
	onInputValueChange?: (details: { inputValue: string }) => void;
	label?: string;
}

export default function TagsInputIsland(props: TagsInputIslandProps) {
	const {
		value: valueProp,
		defaultValue = [],
		inputValue: inputValueProp,
		defaultInputValue = "",
		onValueChange,
		onInputValueChange,
		children,
		id: idProp,
		label,
		...rest
	} = props;

	const [value, setValue] = useState<string[]>(valueProp ?? defaultValue);
	const [inputValue, setInputValue] = useState(
		inputValueProp ?? defaultInputValue,
	);

	const fallbackId = useId();
	const rootId = idProp || `tags-input-root-${fallbackId}`;

	const valueRef = useRef<string[]>(value);
	const inputValueRef = useRef<string>(inputValue);

	useEffect(() => {
		if (valueProp !== undefined) {
			setValue(valueProp);
			valueRef.current = valueProp;
		}
	}, [valueProp]);

	useEffect(() => {
		if (inputValueProp !== undefined) {
			setInputValue(inputValueProp);
			inputValueRef.current = inputValueProp;
		}
	}, [inputValueProp]);

	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) return;

		const input = root.querySelector<HTMLInputElement>('[data-part="input"]');
		if (!input) return;

		const handleInputChange = (e: Event) => {
			const target = e.target as HTMLInputElement;
			const newValue = target.value;
			setInputValue(newValue);
			inputValueRef.current = newValue;
			onInputValueChange?.({ inputValue: newValue });
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				const newValue = inputValueRef.current.trim();
				if (newValue && !valueRef.current.includes(newValue)) {
					const nextValue = [...valueRef.current, newValue];
					setValue(nextValue);
					valueRef.current = nextValue;
					setInputValue("");
					inputValueRef.current = "";
					onValueChange?.({ value: nextValue });
					onInputValueChange?.({ inputValue: "" });
				}
			} else if (e.key === "Backspace" && !inputValueRef.current && valueRef.current.length > 0) {
				const nextValue = valueRef.current.slice(0, -1);
				setValue(nextValue);
				valueRef.current = nextValue;
				onValueChange?.({ value: nextValue });
			}
		};

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Handle delete trigger
			const deleteTrigger = target.closest<HTMLElement>('[data-part="item-delete-trigger"]');
			if (deleteTrigger) {
				const index = Number(deleteTrigger.getAttribute("data-index"));
				if (!isNaN(index)) {
					const nextValue = [...valueRef.current];
					nextValue.splice(index, 1);
					setValue(nextValue);
					valueRef.current = nextValue;
					onValueChange?.({ value: nextValue });
				}
				return;
			}

			// Handle clear trigger
			const clearTrigger = target.closest<HTMLElement>('[data-part="clear-trigger"]');
			if (clearTrigger) {
				setValue([]);
				valueRef.current = [];
				onValueChange?.({ value: [] });
				return;
			}

			// Focus input if clicking on control but not on a tag
			const control = target.closest<HTMLElement>('[data-part="control"]');
			if (control && !target.closest('[data-part="item"]')) {
				input.focus();
			}
		};

		input.addEventListener("input", handleInputChange);
		input.addEventListener("keydown", handleKeyDown);
		root.addEventListener("click", handleClick);

		return () => {
			input.removeEventListener("input", handleInputChange);
			input.removeEventListener("keydown", handleKeyDown);
			root.removeEventListener("click", handleClick);
		};
	}, [rootId, onValueChange, onInputValueChange]);

	return (
		<Root
			{...rest}
			id={rootId}
			value={value}
			inputValue={inputValue}
			data-interactive="true"
		>
			{children || (
				<>
					{label && <Label>{label}</Label>}
					<Control>
						<Items />
						<Input />
					</Control>
					<HiddenInput />
				</>
			)}
		</Root>
	);
}
