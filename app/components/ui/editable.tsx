import type { JSX } from "hono/jsx";
import EditableIsland from "../../islands/editable";
import {
	Area,
	CancelTrigger,
	Content,
	Context,
	Control,
	EditTrigger,
	Input,
	Label,
	Preview,
	Root as RootPrimitive,
	type RootProps,
	RootProvider,
	SubmitTrigger,
} from "./editable-primitive";
import { shouldHydrate } from "./island-utils";

export interface EditableProps extends RootProps {
	interactive?: boolean; // keep — forces island hydration (default true)
	label?: JSX.Element | string;
	children?: JSX.Element; // custom compound composition; defaults to preview/input/controls
}

function Root(props: EditableProps) {
	const { interactive, label, children, ...rest } = props;

	// `Content` is built fresh inside each render path (island or static)
	// rather than here: HonoX rebuilds an island's `children` from a
	// serialised HTML snapshot on hydration instead of by re-invoking JSX, so
	// passing an already-built composition through as `children` breaks
	// reactivity on later state updates (see the doc comment on `Content` in
	// editable-primitive.tsx).
	if (shouldHydrate(interactive, true)) {
		return (
			<EditableIsland {...rest} label={label}>
				{children}
			</EditableIsland>
		);
	}

	return (
		<RootPrimitive {...rest}>
			<Content label={label}>{children}</Content>
		</RootPrimitive>
	);
}

function Editable(props: EditableProps) {
	return <Root {...props} />;
}

const EditableComponent = Object.assign(Editable, {
	Root,
	RootProvider,
	Label,
	Area,
	Preview,
	Input,
	Control,
	EditTrigger,
	SubmitTrigger,
	CancelTrigger,
	Context,
});

export {
	Area,
	CancelTrigger,
	Context,
	Control,
	EditableComponent as Editable,
	EditTrigger,
	Input,
	Label,
	Preview,
	Root,
	RootProvider,
	SubmitTrigger,
};

export default EditableComponent;
