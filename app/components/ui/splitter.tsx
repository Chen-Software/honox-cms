import type { JSX } from "hono/jsx";
import { useId } from "hono/jsx";
import SplitterIsland from "../../islands/splitter";
import { Panel, ResizeTrigger, Root } from "./splitter-primitive";

export interface PanelConfig {
	id: string | number;
	content: JSX.Element | string;
	class?: string;
	style?: Record<string, string | number>;
}

export interface SplitterProps {
	// Layout
	orientation?: "horizontal" | "vertical";

	// Panels (required)
	panels: PanelConfig[];

	// Interactivity
	interactive?: boolean;

	// Size management (for interactive mode)
	defaultSize?: { id: string | number; size: number }[];
	size?: { id: string | number; size: number }[];
	onSizeChange?: (sizes: { id: string | number; size: number }[]) => void;

	// Resize trigger customization
	resizeTriggerClass?: string;

	// Styling
	class?: string;
	style?: Record<string, string | number>;
	id?: string;
}

export const Splitter = (props: SplitterProps) => {
	const {
		id: idProp,
		orientation = "horizontal",
		panels,
		interactive = true,
		defaultSize,
		size,
		onSizeChange,
		resizeTriggerClass,
		class: classProp,
		style,
		...rest
	} = props;

	const fallbackId = useId();
	const id = idProp || fallbackId;

	if (interactive) {
		return (
			<SplitterIsland
				id={id}
				orientation={orientation}
				panels={panels}
				defaultSize={defaultSize}
				size={size}
				onSizeChange={onSizeChange}
				class={classProp}
				style={style}
				resizeTriggerClass={resizeTriggerClass}
				{...rest}
			/>
		);
	}

	const panelSizesMap =
		size || defaultSize
			? Object.fromEntries((size || defaultSize)?.map((s) => [s.id, s.size]))
			: Object.fromEntries(panels.map((p) => [p.id, 100 / panels.length]));

	return (
		<Root
			id={id}
			orientation={orientation}
			class={classProp}
			style={style}
			panelSizes={panelSizesMap}
			{...rest}
		>
			{panels.map((panel, index) => (
				<>
					<Panel
						key={panel.id}
						id={panel.id}
						class={panel.class}
						style={panel.style}
					>
						{panel.content}
					</Panel>
					{index < panels.length - 1 && (
						<ResizeTrigger
							key={`${panel.id}-${panels[index + 1].id}`}
							id={`${panel.id}:${panels[index + 1].id}`}
							class={resizeTriggerClass}
						/>
					)}
				</>
			))}
		</Root>
	);
};
