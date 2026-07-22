import { css } from "design-system/css";
import { Button, Dropdown } from "./ui";
import {
	ALL_LOCALES,
	LOCALE_NAMES,
	localeToggleUrl,
} from "../lib/i18n";

const GlobeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		style={{ flexShrink: 0 }}
	>
		<circle cx="12" cy="12" r="10" />
		<line x1="2" y1="12" x2="22" y2="12" />
		<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		style={{ flexShrink: 0 }}
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
);

interface LanguageSwitcherProps {
	currentPath: string;
	currentLocale: string;
}

export function LanguageSwitcher({
	currentPath,
	currentLocale,
}: LanguageSwitcherProps) {
	return (
		<Dropdown
			interactive={true}
			placement="bottom-end"
			trigger={
				<Button
					variant="outline"
					size="sm"
					class={css({
						display: "inline-flex",
						alignItems: "center",
						gap: "1.5",
						px: "3",
						py: "1.5",
						height: "9",
						borderRadius: "lg",
						cursor: "pointer",
						borderColor: { _light: "gray.3", _dark: "gray.8" },
						bg: "transparent",
						color: "fg.default",
						transition: "all 0.2s",
						_hover: {
							bg: "bg.subtle",
							borderColor: "blue.5",
						},
					})}
				>
					<GlobeIcon />
					<span class={css({ display: { base: "none", sm: "inline" } })}>
						{LOCALE_NAMES[currentLocale] ?? currentLocale}
					</span>
					<span class={css({ display: { base: "inline", sm: "none" } })}>
						{currentLocale.toUpperCase()}
					</span>
					<ChevronDownIcon />
				</Button>
			}
		>
			<Dropdown.Positioner placement="bottom-end">
				<Dropdown.Content
					class={css({
						minWidth: "40",
						py: "1.5",
						px: "1",
						borderRadius: "xl",
						borderWidth: "1px",
						borderColor: "border",
						bg: "bg.default",
						boxShadow: "lg",
						zIndex: "50",
					})}
				>
					{ALL_LOCALES.map((locale) => {
						const isCurrent = locale === currentLocale;
						const toggleUrl = localeToggleUrl(
							currentPath,
							currentLocale,
							locale,
						);
						return (
							<Dropdown.Item
								key={locale}
								asChild
								class={css({
									borderRadius: "md",
									bg: isCurrent ? "blue.subtle!" : "transparent",
									color: isCurrent ? "blue.11!" : "fg.default!",
									fontWeight: isCurrent ? "semibold" : "normal",
									cursor: "pointer",
									px: "2.5",
									py: "2",
									display: "flex",
									alignItems: "center",
									width: "full",
									_hover: {
										bg: isCurrent ? "blue.subtle!" : "bg.subtle!",
										color: isCurrent ? "blue.11!" : "fg.default!",
									},
								})}
							>
								<a
									href={toggleUrl}
									class={css({
										display: "flex",
										alignItems: "center",
										width: "full",
										gap: "2.5",
										textDecoration: "none",
										color: "inherit",
									})}
								>
									{isCurrent ? (
										<span
											class={css({
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												color: "blue.11",
												flexShrink: 0,
												width: "4",
												height: "4",
											})}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="3"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<polyline points="20 6 9 17 4 12" />
											</svg>
										</span>
									) : (
										<span
											class={css({ width: "4", height: "4", flexShrink: 0 })}
										/>
									)}
									<span class={css({ fontSize: "sm" })}>
										{LOCALE_NAMES[locale] ?? locale}
									</span>
								</a>
							</Dropdown.Item>
						);
					})}
				</Dropdown.Content>
			</Dropdown.Positioner>
		</Dropdown>
	);
}
