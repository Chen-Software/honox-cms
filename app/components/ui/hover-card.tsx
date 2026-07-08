import type { JSX } from "hono/jsx";
import { css } from "styled-system/css";
import HoverCardIsland from "../../islands/hover-card";
import {
	HoverCardArrow as Arrow,
	HoverCardContent as Content,
	type HoverCardRootProps,
	HoverCardPositioner as Positioner,
	HoverCardRoot as RootPrimitive,
	HoverCardTrigger as Trigger,
} from "./hover-card-primitive";
import { shouldHydrate } from "./island-utils";
import { Text } from "./text";

interface HoverCardProps extends HoverCardRootProps {
	interactive?: boolean; // keep — forces island hydration (default true)
	trigger?: JSX.Element; // rendered asChild inside HoverCardTrigger
	showArrow?: boolean; // default false (matches the home-page "Basic" demo)
	title?: string | JSX.Element; // convenience — rendered as bold Text
	description?: string | JSX.Element; // convenience — rendered as muted Text
	content?: JSX.Element; // full custom body; overrides title/description
}

function Root(props: HoverCardProps) {
	const { interactive, ...rest } = props;
	if (shouldHydrate(interactive, true)) return <HoverCardIsland {...rest} />;
	return <RootPrimitive {...rest} />;
}

function HoverCard(props: HoverCardProps) {
	const {
		interactive,
		trigger,
		showArrow = false,
		title,
		description,
		content,
		...rest
	} = props;

	const body = content ?? (
		<>
			{title && <Text fontWeight="bold">{title}</Text>}
			{description && (
				<Text size="sm" class={css({ color: "fg.muted", mt: "1" })}>
					{description}
				</Text>
			)}
		</>
	);

	return (
		<Root {...rest} interactive={interactive}>
			{trigger && <Trigger asChild>{trigger}</Trigger>}
			<Positioner>
				<Content>
					{showArrow && <Arrow />}
					{body}
				</Content>
			</Positioner>
		</Root>
	);
}

export { HoverCard, type HoverCardProps };
export default HoverCard;
