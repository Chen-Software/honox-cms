import type { JSX } from "hono/jsx";
import { css } from "styled-system/css";
import PopoverIsland from "../../islands/popover";
import { IconButton } from "./button";
import { shouldHydrate } from "./island-utils";
import {
	PopoverArrow as Arrow,
	PopoverArrowTip as ArrowTip,
	PopoverBody as Body,
	PopoverCloseTrigger as CloseTrigger,
	PopoverContent as Content,
	PopoverDescription as Description,
	PopoverFooter as Footer,
	PopoverHeader as Header,
	type PopoverRootProps,
	PopoverPositioner as Positioner,
	PopoverRoot as RootPrimitive,
	PopoverTitle as Title,
	PopoverTrigger as Trigger,
} from "./popover-primitive";

interface PopoverProps extends PopoverRootProps {
	interactive?: boolean; // keep — forces island hydration (default true)
	trigger?: JSX.Element; // rendered asChild inside PopoverTrigger
	showArrow?: boolean; // render Arrow + ArrowTip (default true)
	title?: string | JSX.Element;
	description?: string | JSX.Element;
	body?: string | JSX.Element;
	footer?: string | JSX.Element;
	closable?: boolean; // render CloseTrigger (default true)
	closeIcon?: JSX.Element; // custom close icon; defaults to built-in X
	children?: JSX.Element; // extra content after body
}

function Root(props: PopoverProps) {
	const { interactive, ...rest } = props;

	if (shouldHydrate(interactive, true)) {
		return <PopoverIsland {...rest} />;
	}

	return <RootPrimitive {...rest} />;
}

const DefaultCloseIcon = () => (
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
	>
		<title>Close</title>
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
);

function Popover(props: PopoverProps) {
	const {
		interactive,
		trigger,
		showArrow = true,
		title,
		description,
		body,
		footer,
		closable = true,
		closeIcon,
		children,
		...rest
	} = props;

	return (
		<Root {...rest} interactive={interactive}>
			{trigger && <Trigger asChild>{trigger}</Trigger>}
			<Positioner>
				<Content>
					{showArrow && (
						<Arrow>
							<ArrowTip />
						</Arrow>
					)}
					{closable && (
						<CloseTrigger asChild>
							<IconButton
								variant="plain"
								size="sm"
								aria-label="Close"
								class={css({ position: "absolute", top: "2", right: "2" })}
							>
								{closeIcon ?? <DefaultCloseIcon />}
							</IconButton>
						</CloseTrigger>
					)}
					{(title || description) && (
						<Header>
							{title && <Title>{title}</Title>}
							{description && <Description>{description}</Description>}
						</Header>
					)}
					{body && <Body>{body}</Body>}
					{children}
					{footer && <Footer>{footer}</Footer>}
				</Content>
			</Positioner>
		</Root>
	);
}

export { Popover, type PopoverProps };
export default Popover;
