import { useEffect, useId, useState } from "hono/jsx";
import { Root, type RootProps } from "../components/ui/radio-group-primitive";

function RadioGroupIsland(props: RootProps) {
	const { value: valueProp, defaultValue, onValueChange, id: idProp, ...rest } = props;
	const [value, setValue] = useState(valueProp ?? defaultValue);
    const fallbackId = useId();
    const id = idProp || fallbackId;

	useEffect(() => {
		if (valueProp !== undefined) {
			setValue(valueProp);
		}
	}, [valueProp]);

	const handleValueChange = (newValue: string) => {
		if (valueProp === undefined) {
			setValue(newValue);
		}
		onValueChange?.({ value: newValue });
	};

	useEffect(() => {
		const root = document.getElementById(id);
		if (!root) return;

		const items = root.querySelectorAll('[data-part="item"]');
		const inputs = root.querySelectorAll('input[type="radio"]');

		const syncDom = () => {
			items.forEach((item) => {
				const itemValue = item.getAttribute("data-value");
				const isChecked = itemValue === value;
				item.setAttribute("data-state", isChecked ? "checked" : "unchecked");
				item.setAttribute("aria-checked", isChecked ? "true" : "false");
				item.setAttribute("tabindex", isChecked ? "0" : "-1");

				const text = item.querySelector('[data-part="item-text"]');
				if (text) {
					text.setAttribute("data-state", isChecked ? "checked" : "unchecked");
				}

				const control = item.querySelector('[data-part="item-control"]');
				if (control) {
					control.setAttribute("data-state", isChecked ? "checked" : "unchecked");
				}
			});

			inputs.forEach((input) => {
				const radioInput = input as HTMLInputElement;
				radioInput.checked = radioInput.value === value;
			});
		};

		syncDom();

		const handleClick = (e: MouseEvent) => {
			const item = (e.target as HTMLElement).closest('[data-part="item"]');
			if (item) {
				const isDisabled =
					item.hasAttribute("data-disabled") || rest.disabled || rest.readOnly;
				if (isDisabled) return;

				const newValue = item.getAttribute("data-value");
				if (newValue) {
					handleValueChange(newValue);
				}
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			const activeElement = document.activeElement;
			if (!activeElement || !root.contains(activeElement)) return;

			const currentItem = activeElement.closest('[data-part="item"]');
			if (!currentItem) return;

			const allItems = Array.from(items).filter(
				(item) => !item.hasAttribute("data-disabled"),
			);
			const currentIndex = allItems.indexOf(currentItem);

			let nextIndex = -1;
			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				nextIndex = (currentIndex + 1) % allItems.length;
			} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				nextIndex = (currentIndex - 1 + allItems.length) % allItems.length;
			} else if (e.key === " " || e.key === "Enter") {
				const newValue = currentItem.getAttribute("data-value");
				if (newValue) {
					handleValueChange(newValue);
				}
				e.preventDefault();
				return;
			}

			if (nextIndex !== -1) {
				const nextItem = allItems[nextIndex] as HTMLElement;
				nextItem.focus();
				const newValue = nextItem.getAttribute("data-value");
				if (newValue) {
					handleValueChange(newValue);
				}
				e.preventDefault();
			}
		};

		root.addEventListener("click", handleClick);
		root.addEventListener("keydown", handleKeyDown);

		return () => {
			root.removeEventListener("click", handleClick);
			root.removeEventListener("keydown", handleKeyDown);
		};
	}, [value, rest.disabled, rest.readOnly, id]);

	return <Root {...rest} id={id} value={value} />;
}

export default RadioGroupIsland;
