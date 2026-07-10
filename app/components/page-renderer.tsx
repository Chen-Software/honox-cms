import { css } from "styled-system/css";
import {
	Alert,
	AlertIcon,
	Badge,
	Button,
	Card,
	Checkbox,
	Collapsible,
	Combobox,
	Dialog,
	Drawer,
	Heading,
	Stack,
	Text,
} from "./ui";

interface ComponentBlock {
	type: string;
	[key: string]: any;
}

interface PageRendererProps {
	content: ComponentBlock[];
}

function RenderBlock({ block }: { block: ComponentBlock }) {
	const { type, ...props } = block;

	switch (type) {
		case "stack": {
			const { children, ...stackProps } = props;
			return (
				<Stack {...stackProps}>
					<PageRenderer content={children} />
				</Stack>
			);
		}
		case "button": {
			const { text, ...buttonProps } = props;
			return <Button {...buttonProps}>{text}</Button>;
		}
		case "badge": {
			const { text, ...badgeProps } = props;
			return <Badge {...badgeProps}>{text}</Badge>;
		}
		case "alert": {
			const { title, description, status, variant, ...alertProps } = props;
			return (
				<Alert
					title={title}
					description={description}
					status={status}
					variant={variant}
					indicator={<AlertIcon />}
					{...alertProps}
				/>
			);
		}
		case "heading": {
			const { text, ...headingProps } = props;
			return <Heading {...headingProps}>{text}</Heading>;
		}
		case "text": {
			const { content, ...textProps } = props;
			return <Text {...textProps}>{content}</Text>;
		}
		case "card": {
			const {
				title,
				description,
				body,
				image,
				imagePosition,
				children,
				...cardProps
			} = props;
			return (
				<Card
					title={title}
					description={description}
					body={body}
					image={image}
					imagePosition={imagePosition}
					{...cardProps}
				>
					{children && <PageRenderer content={children} />}
				</Card>
			);
		}
		case "checkbox": {
			const {
				label,
				checked,
				disabled,
				invalid,
				size,
				colorPalette,
				...checkboxProps
			} = props;
			return (
				<Checkbox
					interactive
					checked={checked}
					disabled={disabled}
					invalid={invalid}
					size={size}
					colorPalette={colorPalette}
					{...checkboxProps}
				>
					{label}
				</Checkbox>
			);
		}
		case "collapsible": {
			const {
				triggerText,
				showIndicator,
				indicatorPlacement,
				open,
				disabled,
				children,
				...collapsibleProps
			} = props;
			const trigger = triggerText || "Toggle";
			const indicator = showIndicator ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class={css({
						transition: "transform 0.2s",
						"[data-state=open] &": { transform: "rotate(180deg)" },
					})}
				>
					<title>Chevron Down</title>
					<path d="m6 9 6 6 6-6" />
				</svg>
			) : undefined;

			return (
				<Collapsible
					interactive
					trigger={trigger}
					indicator={indicator}
					indicatorPlacement={indicatorPlacement}
					defaultOpen={open}
					disabled={disabled}
					content={<div>{children && <PageRenderer content={children} />}</div>}
					{...collapsibleProps}
				/>
			);
		}
		case "combobox": {
			const { label, placeholder, items, ...comboboxProps } = props;
			return (
				<Combobox
					interactive
					label={label}
					placeholder={placeholder}
					items={items || []}
					{...comboboxProps}
				/>
			);
		}
		case "dialog": {
			const {
				title,
				description,
				triggerText,
				confirmText,
				cancelText,
				role,
				children,
				...dialogProps
			} = props;
			const trigger = triggerText ? (
				<Button variant="outline">{triggerText}</Button>
			) : undefined;
			const confirm = confirmText ? <Button>{confirmText}</Button> : undefined;
			const cancel = cancelText ? (
				<Button variant="outline">{cancelText}</Button>
			) : undefined;

			return (
				<Dialog
					interactive
					title={title}
					description={description}
					trigger={trigger}
					confirm={confirm}
					cancel={cancel}
					role={role}
					{...dialogProps}
				>
					{children && <PageRenderer content={children} />}
				</Dialog>
			);
		}
		case "drawer": {
			const {
				title,
				description,
				triggerText,
				confirmText,
				cancelText,
				children,
				...drawerProps
			} = props;
			const trigger = triggerText ? (
				<Button variant="outline">{triggerText}</Button>
			) : undefined;
			const confirm = confirmText ? <Button>{confirmText}</Button> : undefined;
			const cancel = cancelText ? (
				<Button variant="outline">{cancelText}</Button>
			) : undefined;

			return (
				<Drawer
					interactive
					title={title}
					description={description}
					trigger={trigger}
					confirm={confirm}
					cancel={cancel}
					{...drawerProps}
				>
					{children && <PageRenderer content={children} />}
				</Drawer>
			);
		}
		default:
			return (
				<div>
					Unknown component type: {type}
					<pre>{JSON.stringify(props, null, 2)}</pre>
				</div>
			);
	}
}

export function PageRenderer({ content }: PageRendererProps) {
	if (!content || !Array.isArray(content)) return null;

	return (
		<>
			{content.map((block, index) => (
				<RenderBlock key={`${block.type}-${index}`} block={block} />
			))}
		</>
	);
}
