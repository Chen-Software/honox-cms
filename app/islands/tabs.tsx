import { useEffect, useRef, useState } from "hono/jsx";
import {
	InteractiveRoot,
	type RootProps,
	type TabsItem,
	TabsStructure,
	type TabsStructureProps,
} from "../components/ui/tabs-primitive";

export interface TabsIslandProps extends RootProps, TabsStructureProps {
	/** Notified after a tab is added; return a `TabsItem` to override the
	 * auto-generated default, or leave void to accept it. */
	onTabAdd?: () => TabsItem | void;
}

export default function TabsIsland(props: TabsIslandProps) {
	const {
		value: valueProp,
		defaultValue,
		onValueChange,
		children,
		items,
		indicator,
		closable,
		editable,
		onTabClose,
		onTabAdd,
		addAriaLabel,
		extra,
		...rest
	} = props;
	const [value, setValue] = useState(valueProp ?? defaultValue);
	const [tabItems, setTabItems] = useState<TabsItem[]>(items ?? []);
	const rootRef = useRef<HTMLDivElement>(null);

	const updateIndicator = (activeTrigger: HTMLElement) => {
		const root = rootRef.current;
		if (!root) return;

		const rect = activeTrigger.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();

		root.style.setProperty("--width", `${rect.width}px`);
		root.style.setProperty("--height", `${rect.height}px`);
		root.style.setProperty("--left", `${rect.left - rootRect.left}px`);
		root.style.setProperty("--top", `${rect.top - rootRect.top}px`);
	};

	// `children` here is a pre-built static subtree (composed via
	// TabsList/TabsTrigger/TabsContent rather than the `items` prop): the
	// same vnode references flow through on every render, so hono/jsx never
	// re-invokes those component functions on state change and context-driven
	// `isSelected` recomputation never happens. Sync selection to the DOM
	// imperatively and synchronously wherever `value` changes, instead of via
	// a `[value]`-keyed effect — don't depend on a re-render to reflect it.
	const syncSelection = (newValue: string | undefined) => {
		const root = rootRef.current;
		if (!root) return;

		let activeTrigger: HTMLElement | null = null;
		for (const trigger of root.querySelectorAll<HTMLElement>(
			'[data-scope="tabs"][data-part="trigger"]',
		)) {
			const isSelected = trigger.getAttribute("data-value") === newValue;
			if (isSelected) activeTrigger = trigger;
			trigger.setAttribute("aria-selected", isSelected ? "true" : "false");
			trigger.tabIndex = isSelected ? 0 : -1;
			if (isSelected) trigger.setAttribute("data-selected", "");
			else trigger.removeAttribute("data-selected");
		}

		for (const content of root.querySelectorAll<HTMLElement>(
			'[data-scope="tabs"][data-part="content"]',
		)) {
			const isSelected = content.getAttribute("data-value") === newValue;
			content.hidden = !isSelected;
			if (isSelected) content.setAttribute("data-selected", "");
			else content.removeAttribute("data-selected");
		}

		if (activeTrigger) updateIndicator(activeTrigger);
	};

	// Closing/adding tabs mutates the list itself, not just which value is
	// selected — that only works through the `items` API, where `TabsStructure`
	// is constructed fresh from this state on every render (unlike a static
	// `children` subtree, a freshly built element genuinely re-renders).
	const handleTabClose = (closedValue: string) => {
		setTabItems((prev) => {
			const closedIndex = prev.findIndex((item) => item.value === closedValue);
			const next = prev.filter((item) => item.value !== closedValue);
			if (value === closedValue && next.length > 0) {
				const neighbor = next[Math.min(closedIndex, next.length - 1)];
				setValue(neighbor.value);
				requestAnimationFrame(() => syncSelection(neighbor.value));
			}
			return next;
		});
		onTabClose?.(closedValue);
	};

	const handleTabAdd = () => {
		const created = onTabAdd?.();
		const newItem: TabsItem = created ?? {
			value: `tab-${Date.now()}`,
			label: `New Tab ${tabItems.length + 1}`,
			content: "",
			closable: true,
		};
		setTabItems((prev) => [...prev, newItem]);
		setValue(newItem.value);
		requestAnimationFrame(() => syncSelection(newItem.value));
	};

	useEffect(() => {
		if (valueProp !== undefined) {
			setValue(valueProp);
			syncSelection(valueProp);
		}
	}, [valueProp]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		requestAnimationFrame(() => syncSelection(value));

		const handleClick = (e: MouseEvent) => {
			const trigger = (e.target as HTMLElement).closest<HTMLElement>(
				'[data-scope="tabs"][data-part="trigger"]',
			);
			if (trigger && !trigger.hasAttribute("data-disabled")) {
				const newValue = trigger.getAttribute("data-value");
				if (newValue) {
					setValue(newValue);
					syncSelection(newValue);
					onValueChange?.(newValue);
				}
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			const trigger = (e.target as HTMLElement).closest<HTMLElement>(
				'[data-scope="tabs"][data-part="trigger"]',
			);
			if (!trigger) return;

			const triggers = Array.from(
				root.querySelectorAll<HTMLElement>(
					'[data-scope="tabs"][data-part="trigger"]:not([data-disabled])',
				),
			);
			const index = triggers.indexOf(trigger);

			let nextIndex = -1;
			if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				nextIndex = (index + 1) % triggers.length;
			} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				nextIndex = (index - 1 + triggers.length) % triggers.length;
			} else if (e.key === "Home") {
				nextIndex = 0;
			} else if (e.key === "End") {
				nextIndex = triggers.length - 1;
			}

			if (nextIndex !== -1) {
				const nextTrigger = triggers[nextIndex];
				nextTrigger.focus();
				if (props.activationMode !== "manual") {
					const newValue = nextTrigger.getAttribute("data-value");
					if (newValue) {
						setValue(newValue);
						syncSelection(newValue);
						onValueChange?.(newValue);
					}
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
		// Attached once at mount: handlers read fresh DOM state per event
		// rather than closed-over `value`, so they never go stale.
	}, []);

	return (
		<InteractiveRoot
			{...rest}
			value={value}
			onValueChange={setValue}
			rootRef={rootRef}
			data-hydrated="true"
		>
			{children || (
				<TabsStructure
					items={tabItems}
					indicator={indicator}
					closable={closable}
					editable={editable}
					onTabClose={handleTabClose}
					onTabAdd={handleTabAdd}
					addAriaLabel={addAriaLabel}
					extra={extra}
				/>
			)}
		</InteractiveRoot>
	);
}
// island
