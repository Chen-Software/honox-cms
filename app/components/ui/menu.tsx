import type { JSX } from "hono/jsx";
import { cx } from "styled-system/css";
import { type MenuVariantProps, menu } from "styled-system/recipes";
import InteractiveMenuRoot from "../../islands/menu";
import { shouldHydrate } from "./island-utils";
// Import primitive components from menu-primitive
import {
	MenuCheckboxItem as CheckboxItem,
	MenuContent as Content,
	MenuItem as Item,
	MenuItemGroupLabel as ItemGroupLabel,
	MenuItemIndicator as ItemIndicator,
	MenuItemText as ItemText,
	MenuPositioner as Positioner,
	MenuRadioItemGroup as RadioItemGroup,
	MenuRoot as RootPrimitive,
	MenuSeparator as Separator,
	MenuTrigger as Trigger,
} from "./menu-primitive";

// ============= Flattened API Types =============

type MenuItemType =
	| "item"
	| "separator"
	| "checkbox"
	| "radio"
	| "radio-group"
	| "submenu"
	| "group";

interface BaseMenuItem {
	type?: MenuItemType;
	disabled?: boolean;
	class?: string;
}

interface MenuItemItem extends BaseMenuItem {
	type?: "item";
	label: string;
	value: string;
	icon?: JSX.Element;
	indicator?: JSX.Element;
}

interface MenuSeparatorItem extends BaseMenuItem {
	type: "separator";
}

interface MenuCheckboxItem extends BaseMenuItem {
	type: "checkbox";
	label: string;
	value: string;
	checked?: boolean;
	icon?: JSX.Element;
}

interface MenuRadioItem extends BaseMenuItem {
	type: "radio";
	label: string;
	value: string;
	checked?: boolean;
	icon?: JSX.Element;
}

interface MenuRadioGroupItem extends BaseMenuItem {
	type: "radio-group";
	value: string;
	label?: string;
	items: MenuRadioItem[];
}

interface MenuSubmenuItem extends BaseMenuItem {
	type: "submenu";
	label: string;
	icon?: JSX.Element;
	items: (MenuItemItem | MenuSeparatorItem | MenuCheckboxItem)[];
}

type MenuItem =
	| MenuItemItem
	| MenuSeparatorItem
	| MenuCheckboxItem
	| MenuRadioItem
	| MenuRadioGroupItem
	| MenuSubmenuItem;

interface MenuProps extends MenuVariantProps {
	trigger?: JSX.Element;
	items?: MenuItem[];
	defaultOpen?: boolean;
	interactive?: boolean;
	class?: string;
	contentClass?: string;
	positionerClass?: string;
	children?: any;
}

// ============= Rendering Functions =============

function renderMenuItem(item: MenuItem, index: number): JSX.Element {
	switch (item.type) {
		case "separator":
			return <Separator key={index} />;

		case "checkbox": {
			const checkboxItem = item as MenuCheckboxItem;
			return (
				<CheckboxItem
					key={checkboxItem.value}
					value={checkboxItem.value}
					checked={checkboxItem.checked}
					disabled={checkboxItem.disabled}
				>
					{checkboxItem.icon && (
						<ItemIndicator>{checkboxItem.icon}</ItemIndicator>
					)}
					<ItemText>{checkboxItem.label}</ItemText>
				</CheckboxItem>
			);
		}

		case "radio-group": {
			const radioGroup = item as MenuRadioGroupItem;
			return (
				<RadioItemGroup key={radioGroup.value} value={radioGroup.value}>
					{radioGroup.label && (
						<ItemGroupLabel>{radioGroup.label}</ItemGroupLabel>
					)}
					{radioGroup.items.map((radioItem, idx) =>
						renderMenuItem(radioItem, idx),
					)}
				</RadioItemGroup>
			);
		}

		case "submenu": {
			const submenuItem = item as MenuSubmenuItem;
			return (
				<div key={index}>
					<ItemText>
						{submenuItem.label} (submenu not supported in simplified API)
					</ItemText>
				</div>
			);
		}

		default: {
			const menuItem = item as MenuItemItem;
			return (
				<Item
					key={menuItem.value}
					value={menuItem.value}
					disabled={menuItem.disabled}
				>
					{menuItem.icon && <ItemIndicator>{menuItem.icon}</ItemIndicator>}
					<ItemText>{menuItem.label}</ItemText>
					{menuItem.indicator}
				</Item>
			);
		}
	}
}

// ============= Flattened Menu Component =============

function MenuRoot(props: MenuProps) {
	const {
		trigger,
		items,
		defaultOpen = false,
		interactive,
		class: classProp,
		contentClass,
		positionerClass,
		children,
		...variantProps
	} = props;

	const styles = menu(variantProps);

	if (shouldHydrate(interactive, true)) {
		return (
			<InteractiveMenuRoot open={defaultOpen}>
				{trigger && <Trigger asChild>{trigger}</Trigger>}
				{children}
				{items && (
					<Positioner class={cx(styles.positioner, positionerClass)}>
						<Content class={cx(styles.content, contentClass)}>
							{items.map((item, index) => renderMenuItem(item, index))}
						</Content>
					</Positioner>
				)}
			</InteractiveMenuRoot>
		);
	}

	return (
		<RootPrimitive open={defaultOpen}>
			{trigger && <Trigger asChild>{trigger}</Trigger>}
			{children}
			{items && (
				<Positioner class={cx(styles.positioner, positionerClass)}>
					<Content class={cx(styles.content, contentClass)}>
						{items.map((item, index) => renderMenuItem(item, index))}
					</Content>
				</Positioner>
			)}
		</RootPrimitive>
	);
}

// ============= Exports =============

export const Menu = Object.assign(MenuRoot, {
	Root: MenuRoot,
	Trigger: Trigger,
	Positioner: Positioner,
	Content: Content,
	Item: Item,
	CheckboxItem: CheckboxItem,
	Separator: Separator,
	ItemText: ItemText,
	ItemIndicator: ItemIndicator,
	ItemGroupLabel: ItemGroupLabel,
	RadioItemGroup: RadioItemGroup,
});

export {
	type BaseMenuItem,
	Menu as default,
	type MenuCheckboxItem,
	type MenuItem,
	type MenuItemItem,
	type MenuItemType,
	type MenuProps,
	type MenuRadioGroupItem,
	type MenuRadioItem,
	type MenuSeparatorItem,
	type MenuSubmenuItem,
};
