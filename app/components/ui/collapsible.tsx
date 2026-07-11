import type { JSX } from "hono/jsx";
import { cloneElement } from "hono/jsx";
import CollapsibleIsland from "../../islands/collapsible";
import {
	Content,
	Indicator,
	Root as RootPrimitive,
	Trigger,
} from "./collapsible-primitive";
import { shouldHydrate } from "./island-utils";

interface CollapsibleProps {
	/**
	 * The trigger element or string.
	 * If a string is provided, it will be wrapped in a button.
	 */
	trigger: JSX.Element | string;
	/**
	 * The content to be shown/hidden.
	 */
	content: JSX.Element;
	/**
	 * Optional indicator element (e.g. a chevron).
	 */
	indicator?: JSX.Element;
	/**
	 * Where to place the indicator relative to the trigger content.
	 * @default "end"
	 */
	indicatorPlacement?: "start" | "end";
	/**
	 * Whether the collapsible is open (controlled).
	 */
	open?: boolean;
	/**
	 * Whether the collapsible is open by default (uncontrolled).
	 */
	defaultOpen?: boolean;
	/**
	 * Callback for when the open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Whether the collapsible is disabled.
	 */
	disabled?: boolean;
	/**
	 * Whether to enable interactivity (hydration).
	 * @default true
	 */
	interactive?: boolean;
	/**
	 * Root element class name.
	 */
	class?: string;
	/**
	 * Trigger element class name.
	 */
	triggerClass?: string;
	/**
	 * Content element class name.
	 */
	contentClass?: string;
	/**
	 * Indicator element class name.
	 */
	indicatorClass?: string;
	/**
	 * ID for the collapsible.
	 */
	id?: string;
}

function Collapsible(props: CollapsibleProps) {
	const {
		trigger,
		content,
		indicator,
		indicatorPlacement = "end",
		interactive,
		onOpenChange,
		open,
		defaultOpen,
		disabled,
		class: classProp,
		triggerClass,
		contentClass,
		indicatorClass,
		id,
		...rest
	} = props;

	const isInteractive = shouldHydrate(interactive, true);

	const rootProps = {
		...rest,
		id,
		class: classProp,
		open,
		onOpenChange: onOpenChange
			? (details: { open: boolean }) => onOpenChange(details.open)
			: undefined,
		disabled,
		defaultOpen,
	};

	const Root = isInteractive ? (CollapsibleIsland as any) : RootPrimitive;

	const triggerElement =
		typeof trigger === "string" ? (
			<button type="button">{trigger}</button>
		) : (
			trigger
		);

	const triggerWithIndicator = indicator
		? cloneElement(triggerElement as any, {
				children: (
					<>
						{indicatorPlacement === "start" && (
							<Indicator class={indicatorClass}>{indicator}</Indicator>
						)}
						{(triggerElement as any).props?.children}
						{indicatorPlacement === "end" && (
							<Indicator class={indicatorClass}>{indicator}</Indicator>
						)}
					</>
				),
			})
		: triggerElement;

	return (
		<Root {...rootProps}>
			<Trigger asChild class={triggerClass}>
				{triggerWithIndicator}
			</Trigger>
			<Content class={contentClass}>{content}</Content>
		</Root>
	);
}

export { Collapsible, type CollapsibleProps };
export default Collapsible;
