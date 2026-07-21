import { css } from "design-system/css";
import { createRoute } from "honox/factory";
import {
	AbsoluteCenter,
	Alert,
	AlertIcon,
	Anchor,
	Avatar,
	Badge,
	Breadcrumb,
	Button,
	ButtonGroup,
	Card,
	Carousel,
	Checkbox,
	Clipboard,
	CloseButton,
	Code,
	Collapsible,
	ColorPicker,
	Combobox,
	DatePicker,
	Dialog,
	Drawer,
	Dropdown,
	Editable,
	Field,
	Fieldset,
	FileUpload,
	Grid,
	Group,
	Heading,
	HoverCard,
	IconButton,
	Loader,
	PaginatedTable,
	Pagination,
	Popover,
	Progress,
	RadioCardGroup,
	RadioGroup,
	Search,
	SegmentGroup,
	Select,
	Skeleton,
	Slider,
	Spinner,
	Splitter,
	Stack,
	Switch,
	Table,
	Tabs,
	TagsInput,
	Text,
	Textarea,
	Toast,
	ToggleGroup,
	Tooltip,
} from "../components/ui";

const items = [
	{ label: "React", value: "react" },
	{ label: "Solid", value: "solid" },
	{ label: "Svelte", value: "svelte" },
	{ label: "Vue", value: "vue" },
	{ label: "Hono", value: "hono" },
];

const carouselPalettes = ["blue", "purple", "orange", "cyan", "red", "green"];

function carouselSlides(count: number, height = "56") {
	return Array.from({ length: count }, (_, i) => (
		<div
			class={css({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "full",
				height,
				borderRadius: "l3",
				p: "6",
				textAlign: "center",
				color: "white",
				bg: `${carouselPalettes[i % carouselPalettes.length]}.9`,
			})}
		>
			<Heading size="xl" class={css({ fontWeight: "bold" })}>
				Slide {i + 1}
			</Heading>
			<Text size="sm" class={css({ mt: "2", maxW: "xs", opacity: "0.9" })}>
				Interactive Hono/JSX Carousel component in full action.
			</Text>
		</div>
	));
}

const customShowcaseSlides = [
	<div
		class={css({
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			width: "full",
			height: "64",
			borderRadius: "l3",
			p: "8",
			textAlign: "center",
			color: "white",
			bg: "blue.9",
		})}
	>
		<Badge colorPalette="blue" variant="solid" class={css({ mb: "3" })}>
			FEATURED
		</Badge>
		<Heading
			size="2xl"
			class={css({ fontWeight: "extrabold", tracking: "tight" })}
		>
			Real-Time Analytics
		</Heading>
		<Text size="md" class={css({ mt: "3", maxW: "md", opacity: "0.9" })}>
			Pulse delivers live data and dashboards with sub-second streaming latency
			straight to your team.
		</Text>
	</div>,
	<div
		class={css({
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			width: "full",
			height: "64",
			borderRadius: "l3",
			p: "8",
			textAlign: "center",
			color: "white",
			bg: "purple.9",
		})}
	>
		<Badge colorPalette="purple" variant="solid" class={css({ mb: "3" })}>
			SMART ALERTS
		</Badge>
		<Heading
			size="2xl"
			class={css({ fontWeight: "extrabold", tracking: "tight" })}
		>
			AI-Powered Detection
		</Heading>
		<Text size="md" class={css({ mt: "3", maxW: "md", opacity: "0.9" })}>
			Smart anomaly detection notifies your engineering team of regressions
			before they break production.
		</Text>
	</div>,
	<div
		class={css({
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			width: "full",
			height: "64",
			borderRadius: "l3",
			p: "8",
			textAlign: "center",
			color: "white",
			bg: "orange.9",
		})}
	>
		<Badge colorPalette="orange" variant="solid" class={css({ mb: "3" })}>
			COLLABORATIVE
		</Badge>
		<Heading
			size="2xl"
			class={css({ fontWeight: "extrabold", tracking: "tight" })}
		>
			Unified Team Workspaces
		</Heading>
		<Text size="md" class={css({ mt: "3", maxW: "md", opacity: "0.9" })}>
			Share annotated charts, leave interactive comments, and build custom
			workspaces with ease.
		</Text>
	</div>,
];

export default createRoute((c) => {
	const name = c.req.query("name") ?? "Design System";
	return c.render(
		<div class={css({ bg: "bg.canvas", minH: "screen", color: "fg.default" })}>
			<title>Artefact — Modern UI Suite</title>

			{/* Beautiful Header */}
			<header
				class={css({
					borderBottomWidth: "1px",
					borderColor: { _light: "white.a4", _dark: "black.a4" },
					bg: { _light: "white.a7", _dark: "black.a7" },
					backdropFilter: "blur(20px) saturate(180%)",
					boxShadow: {
						_light:
							"inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 4px 30px rgba(0, 0, 0, 0.03)",
						_dark:
							"inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 4px 30px rgba(0, 0, 0, 0.2)",
					},
					position: "sticky",
					top: "0",
					zIndex: "10",
				})}
			>
				<div
					class={css({
						maxW: "6xl",
						mx: "auto",
						px: "6",
						py: "4",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					})}
				>
					<Stack direction="horizontal" gap="3" align="center">
						<Avatar
							name="Artefact UI"
							size="sm"
							variant="solid"
							colorPalette="blue"
						/>
						<Heading
							as="h1"
							class={css({
								fontSize: "lg",
								fontWeight: "bold",
								tracking: "tight",
							})}
						>
							Artefact UI
						</Heading>
					</Stack>

					<nav
						class={css({
							display: "flex",
							gap: { base: "3", md: "6" },
							alignItems: "center",
						})}
					>
						<Anchor
							href="/blog"
							variant="plain"
							class={css({
								display: { base: "none", md: "block" },
								textStyle: "sm",
								fontWeight: "medium",
							})}
						>
							Blog
						</Anchor>
						<Anchor
							href="/docs"
							variant="plain"
							class={css({
								display: { base: "none", md: "block" },
								textStyle: "sm",
								fontWeight: "medium",
							})}
						>
							Docs
						</Anchor>
						<Anchor
							href="/pages/product-landing"
							variant="plain"
							class={css({
								display: { base: "none", md: "block" },
								textStyle: "sm",
								fontWeight: "medium",
							})}
						>
							Pulse Landing Page
						</Anchor>
						<Anchor
							href="/admin"
							variant="plain"
							class={css({
								display: { base: "none", md: "block" },
								textStyle: "sm",
								fontWeight: "medium",
							})}
						>
							Sveltia CMS
						</Anchor>
						<Button
							variant="solid"
							colorPalette="blue"
							size="sm"
							interactive
							onclick="window.scrollTo({top: document.getElementById('hub').offsetTop - 80, behavior: 'smooth'})"
						>
							Explore Hub
						</Button>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<section
				class={css({
					py: "16",
					px: "6",
					bgGradient: "to-b",
					from: "bg.default",
					to: "bg.canvas",
				})}
			>
				<div class={css({ maxW: "4xl", mx: "auto", textAlign: "center" })}>
					<Badge
						size="lg"
						colorPalette="blue"
						variant="surface"
						class={css({ mb: "4" })}
					>
						HonoX Hono/JSX Components
					</Badge>
					<Heading
						as="h1"
						class={css({
							fontSize: { base: "4xl", md: "5xl" },
							fontWeight: "extrabold",
							tracking: "tight",
							lineHeight: "tight",
						})}
					>
						A beautifully engineered, accessible component suite.
					</Heading>
					<Text
						size="lg"
						class={css({ mt: "4", color: "fg.muted", maxW: "2xl", mx: "auto" })}
					>
						A complete 3-tier design system built for HonoX, PandaCSS, and
						Sveltia CMS. Fast, lightweight, and fully accessible, following
						standard user habits.
					</Text>

					<div
						class={css({
							mt: "8",
							display: "flex",
							gap: "4",
							justify: "center",
						})}
					>
						<Button
							size="lg"
							variant="solid"
							colorPalette="blue"
							interactive
							onclick="window.scrollTo({top: document.getElementById('carousel-showcase').offsetTop - 80, behavior: 'smooth'})"
						>
							View Showcase
						</Button>
						<Button
							size="lg"
							variant="outline"
							interactive
							onclick="window.scrollTo({top: document.getElementById('hub').offsetTop - 80, behavior: 'smooth'})"
						>
							Component Hub
						</Button>
					</div>
				</div>
			</section>

			{/* Tabs Showcase Section */}
			<section
				id="tabs-showcase"
				class={css({ py: "12", px: "6", maxW: "5xl", mx: "auto" })}
			>
				<div class={css({ textAlign: "center", mb: "8" })}>
					<Heading as="h2" size="3xl" class={css({ fontWeight: "bold" })}>
						Tabs Showcase
					</Heading>
					<Text size="md" class={css({ color: "fg.muted", mt: "2" })}>
						Re-implemented completely in pure Hono/JSX with sliding indicators,
						manual/automatic focus activation, and full keyboard navigation
						support.
					</Text>
				</div>

				<div
					class={css({
						bg: "bg.default",
						p: "6",
						borderRadius: "l3",
						border: "1px solid",
						borderColor: "border",
					})}
				>
					<Tabs
						defaultValue="features"
						interactive
						variant="enclosed"
						size="md"
					>
						<Tabs.List class={css({ mb: "4" })}>
							<Tabs.Trigger value="features">⚡ Key Features</Tabs.Trigger>
							<Tabs.Trigger value="pricing">💎 Pricing Plans</Tabs.Trigger>
							<Tabs.Trigger value="tech-stack">🛠️ Technology Stack</Tabs.Trigger>
							<Tabs.Indicator />
						</Tabs.List>

						<Tabs.Content value="features">
							<Grid columns={{ base: 1, md: 3 }} gap="6">
								<Card
									title="Lightning Fast"
									description="SSR by default with minimal static footprint. Hydrates only when interaction is required."
								>
									<Badge
										colorPalette="green"
										variant="subtle"
										class={css({ mt: "2" })}
									>
										Zero JS Option
									</Badge>
								</Card>
								<Card
									title="Completely Accessible"
									description="Following WAI-ARIA standards exactly. Fully keyboard navigable with roving tabIndex and aria states."
								>
									<Badge
										colorPalette="blue"
										variant="subtle"
										class={css({ mt: "2" })}
									>
										A11y Compliant
									</Badge>
								</Card>
								<Card
									title="Stunning Design"
									description="Sliding indicator transitions and pixel-perfect layouts mapped to modern user habits."
								>
									<Badge
										colorPalette="purple"
										variant="subtle"
										class={css({ mt: "2" })}
									>
										Panda CSS
									</Badge>
								</Card>
							</Grid>
						</Tabs.Content>

						<Tabs.Content value="pricing">
							<Grid
								columns={{ base: 1, md: 2 }}
								gap="6"
								class={css({ maxW: "3xl", mx: "auto" })}
							>
								<Card
									title="Starter"
									description="Perfect for side projects and individual developers looking to prototype fast."
								>
									<div
										class={css({
											mt: "4",
											display: "flex",
											alignItems: "baseline",
										})}
									>
										<Heading
											size="3xl"
											class={css({ fontWeight: "extrabold" })}
										>
											$0
										</Heading>
										<Text size="sm" class={css({ color: "fg.muted", ml: "1" })}>
											/month
										</Text>
									</div>
									<Button
										variant="outline"
										colorPalette="blue"
										size="sm"
										class={css({ mt: "4", width: "full" })}
									>
										Get Started
									</Button>
								</Card>
								<Card
									title="Pro"
									description="Comprehensive features, unlimited pages, analytics integration, and dedicated priority support."
								>
									<div
										class={css({
											mt: "4",
											display: "flex",
											alignItems: "baseline",
										})}
									>
										<Heading
											size="3xl"
											class={css({ fontWeight: "extrabold" })}
										>
											$29
										</Heading>
										<Text size="sm" class={css({ color: "fg.muted", ml: "1" })}>
											/month
										</Text>
									</div>
									<Button
										variant="solid"
										colorPalette="blue"
										size="sm"
										class={css({ mt: "4", width: "full" })}
									>
										Upgrade to Pro
									</Button>
								</Card>
							</Grid>
						</Tabs.Content>

						<Tabs.Content value="tech-stack">
							<Card
								title="Modern Web Stack"
								description="Engineered from the ground up for maximum production readiness and speed."
							>
								<Stack gap="4" class={css({ mt: "4" })}>
									<div
										class={css({
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										})}
									>
										<Text size="sm" class={css({ fontWeight: "bold" })}>
											HonoX Meta-Framework
										</Text>
										<Badge colorPalette="orange">Fast &amp; Server-First</Badge>
									</div>
									<div
										class={css({
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										})}
									>
										<Text size="sm" class={css({ fontWeight: "bold" })}>
											Panda CSS
										</Text>
										<Badge colorPalette="yellow">Zero Runtime CSS-in-JS</Badge>
									</div>
									<div
										class={css({
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										})}
									>
										<Text size="sm" class={css({ fontWeight: "bold" })}>
											Bun Tooling
										</Text>
										<Badge colorPalette="pink">Next-Gen Speed</Badge>
									</div>
								</Stack>
							</Card>
						</Tabs.Content>
					</Tabs>
				</div>
			</section>

			{/* Featured Carousel Section */}
			<section
				id="carousel-showcase"
				class={css({ py: "12", px: "6", maxW: "5xl", mx: "auto" })}
			>
				<div class={css({ textAlign: "center", mb: "8" })}>
					<Heading as="h2" size="3xl" class={css({ fontWeight: "bold" })}>
						Featured Carousel Implementation
					</Heading>
					<Text size="md" class={css({ color: "fg.muted", mt: "2" })}>
						Demonstrating our robust Hono/JSX implementation of Ark UI's Slider
						Carousel. Swipeable, autoplay-ready, and fully accessible.
					</Text>
				</div>

				<Grid
					columns={{ base: 1, md: 2 }}
					gap="8"
					class={css({ alignItems: "center" })}
				>
					<Card
						title="Interactive Autoplay Carousel"
						description="Autoplay triggers, custom dots, and hover-to-pause."
						class={css({ height: "full" })}
					>
						<div class={css({ mt: "4" })}>
							<Carousel
								interactive
								slides={customShowcaseSlides}
								autoplay={{ delay: 3000 }}
								pauseOnHover
								loop
								showAutoplayTrigger
								colorPalette="blue"
							/>
						</div>
					</Card>

					<Card
						title="Multi-Slide Looping Carousel"
						description="Displaying 3 slides per page with a rich, responsive grid."
						class={css({ height: "full" })}
					>
						<div class={css({ mt: "4" })}>
							<Carousel
								interactive
								slides={carouselSlides(6, "40")}
								slidesPerPage={2}
								spacing="12px"
								loop
								colorPalette="purple"
							/>
						</div>
					</Card>
				</Grid>
			</section>

			{/* Interactive Component Hub */}
			<section
				id="hub"
				class={css({
					py: "16",
					px: "6",
					bg: "bg.default",
					borderTopWidth: "1px",
					borderBottomWidth: "1px",
					borderColor: "border",
				})}
			>
				<div class={css({ maxW: "6xl", mx: "auto" })}>
					<div class={css({ textAlign: "center", mb: "10" })}>
						<Heading as="h2" size="3xl" class={css({ fontWeight: "bold" })}>
							Interactive Component Hub
						</Heading>
						<Text size="md" class={css({ color: "fg.muted", mt: "2" })}>
							Explore the rich features of the Artefact UI component system
							grouped by usage category.
						</Text>
					</div>

					<div
						class={css({
							display: "flex",
							flexDirection: "column",
							gap: "16",
							mt: "10",
						})}
					>
						<div>
							<Heading
								as="h3"
								size="xl"
								class={css({
									mb: "6",
									fontWeight: "semibold",
									borderBottom: "1px solid",
									borderColor: "border.default",
									pb: "2",
								})}
							>
								Form Controls
							</Heading>
							<div class={css({ mt: "2" })}>
								<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
									{/* Switch */}
									<Card
										title="Switch Control"
										description="Sleek toggle buttons"
									>
										<Stack gap="4" align="flex-start" class={css({ mt: "2" })}>
											<Switch size="sm">Small Toggle</Switch>
											<Switch size="md" interactive defaultChecked>
												Medium Interactive
											</Switch>
											<Switch size="lg" colorPalette="blue" interactive>
												Large Blue Accent
											</Switch>
										</Stack>
									</Card>

									{/* Checkbox */}
									<Card
										title="Checkbox Group"
										description="Support for normal and indeterminate states"
									>
										<Stack gap="4" align="flex-start" class={css({ mt: "2" })}>
											<Checkbox size="sm">Small Checkbox</Checkbox>
											<Checkbox size="md" checked="indeterminate">
												Indeterminate State
											</Checkbox>
											<Checkbox
												size="lg"
												colorPalette="green"
												interactive
												defaultChecked
											>
												Large Interactive
											</Checkbox>
										</Stack>
									</Card>

									{/* Slider */}
									<Card title="Slider" description="Adjustable numeric values">
										<Stack gap="4" class={css({ mt: "2", width: "full" })}>
											<Slider
												label="Single Thumb"
												defaultValue={45}
												showValueText
												class={css({ width: "full" })}
											/>
											<Slider
												label="Range Selection"
												defaultValue={[15, 75]}
												showValueText
												class={css({ width: "full" })}
											/>
										</Stack>
									</Card>

									{/* RadioGroup */}
									<Card
										title="Radio Group"
										description="Mutually exclusive choices"
									>
										<div class={css({ mt: "2" })}>
											<RadioGroup
												interactive
												defaultValue="solid"
												items={[
													{ label: "Solid", value: "solid" },
													{ label: "Liquid", value: "liquid" },
													{ label: "Gas", value: "gas" },
												]}
											/>
										</div>
									</Card>

									{/* RadioCardGroup */}
									<Card
										title="Radio Card Group"
										description="Card-style exclusive choices"
									>
										<Stack gap="6" class={css({ mt: "2", width: "full" })}>
											<RadioCardGroup
												interactive
												label="Outline"
												defaultValue="pro"
												items={[
													{ label: "Hobby", value: "hobby" },
													{ label: "Pro", value: "pro" },
													{ label: "Enterprise", value: "enterprise" },
												]}
											/>
											<RadioCardGroup
												interactive
												label="Subtle"
												variant="subtle"
												defaultValue="monthly"
												items={[
													{ label: "Monthly", value: "monthly" },
													{ label: "Yearly", value: "yearly" },
												]}
											/>
											<RadioCardGroup
												interactive
												label="Surface"
												variant="surface"
												defaultValue="standard"
												items={[
													{ label: "Standard", value: "standard" },
													{ label: "Express", value: "express" },
													{
														label: "Overnight",
														value: "overnight",
														disabled: true,
													},
												]}
											/>
											<RadioCardGroup
												interactive
												label="Solid"
												variant="solid"
												defaultValue="dark"
												items={[
													{ label: "Light", value: "light" },
													{ label: "Dark", value: "dark" },
													{ label: "System", value: "system" },
												]}
											/>
										</Stack>
									</Card>

									{/* SegmentGroup */}
									<Card
										title="Segment Group"
										description="Sliding selection controls"
									>
										<div class={css({ mt: "2" })}>
											<SegmentGroup
												fitted
												defaultValue="weekly"
												items={[
													{ label: "Weekly", value: "weekly" },
													{ label: "Monthly", value: "monthly" },
													{ label: "Yearly", value: "yearly" },
												]}
											/>
										</div>
									</Card>

									{/* TagsInput */}
									<Card
										title="Tags Input"
										description="Add and remove keyword tags"
									>
										<div class={css({ mt: "2" })}>
											<TagsInput
												interactive
												label="Interests"
												defaultValue={["Hono", "Vite", "Panda"]}
											/>
										</div>
									</Card>

									{/* Field */}
									<Card
										title="Field"
										description="Labeled input with live validation"
									>
										<div class={css({ mt: "2" })}>
											<Field
												interactive
												label="Username"
												defaultValue="ab"
												validator={(value: string) =>
													value.length >= 3 || "Must be at least 3 characters"
												}
											/>
										</div>
									</Card>

									{/* Textarea */}
									<Card
										title="Textarea"
										description="Multi-line input with live validation"
									>
										<div class={css({ mt: "2" })}>
											<Textarea
												interactive
												label="Bio"
												defaultValue="Too short"
												validator={(value: string) =>
													value.length >= 20 ||
													"Tell us a bit more (20 characters min)"
												}
											/>
										</div>
									</Card>
								</Grid>
							</div>
						</div>

						<div>
							<Heading
								as="h3"
								size="xl"
								class={css({
									mb: "6",
									fontWeight: "semibold",
									borderBottom: "1px solid",
									borderColor: "border.default",
									pb: "2",
								})}
							>
								Complex Pickers
							</Heading>
							<div class={css({ mt: "2" })}>
								<Grid columns={{ base: 1, md: 2 }} gap="6">
									{/* DatePicker */}
									<Card
										title="Date Picker"
										description="Advanced date and range pickers"
										class={css({ overflow: "visible" })}
									>
										<Stack gap="4" class={css({ mt: "2", width: "full" })}>
											<DatePicker
												interactive
												label="Pick a single date"
												selectionMode="single"
											/>
											<DatePicker
												interactive
												label="Pick a date range"
												selectionMode="range"
												colorPalette="purple"
											/>
										</Stack>
									</Card>

									{/* Combobox & Select */}
									<Card
										title="Dropdown Selection"
										description="Accessible selects & autocomplete comboboxes"
										class={css({ overflow: "visible" })}
									>
										<Stack gap="4" class={css({ mt: "2", width: "full" })}>
											<Select
												items={items}
												label="Framework Selection"
												placeholder="Select a framework"
												allowClear
											/>
											<Combobox
												interactive
												items={items}
												label="Searchable Combobox"
												placeholder="Type to search..."
											/>
										</Stack>
									</Card>

									{/* ColorPicker */}
									<Card
										title="Color Picker"
										description="Full color spectrum selector"
										class={css({ overflow: "visible" })}
									>
										<div
											class={css({
												mt: "2",
												display: "flex",
												justify: "center",
											})}
										>
											<ColorPicker
												interactive
												trigger
												defaultValue="#3b82f6"
												label="Pick Theme Color"
											/>
										</div>
									</Card>

									{/* FileUpload */}
									<Card
										title="File Upload"
										description="Drag-and-drop zone with validation rules"
									>
										<div class={css({ mt: "2" })}>
											<FileUpload
												label="Upload Images"
												name="images"
												accept="image/*"
												maxFiles={2}
												dropzoneText="Drag and drop or browse files"
											/>
										</div>
									</Card>
								</Grid>
							</div>
						</div>

						<div>
							<Heading
								as="h3"
								size="xl"
								class={css({
									mb: "6",
									fontWeight: "semibold",
									borderBottom: "1px solid",
									borderColor: "border.default",
									pb: "2",
								})}
							>
								Overlays &amp; Navigation
							</Heading>
							<div class={css({ mt: "2" })}>
								<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
									{/* Popover */}
									<Card
										title="Popover & Tooltip"
										description="Contextual info boxes"
										class={css({ overflow: "visible" })}
									>
										<Stack gap="4" align="flex-start" class={css({ mt: "2" })}>
											<Popover
												interactive
												trigger={
													<Button variant="outline">Trigger Popover</Button>
												}
												title="Quick Info"
												body="Popovers are perfect for showing detailed rich context on-click."
											/>
											<Tooltip content="Nice and accessible!" showArrow asChild>
												<Button variant="outline">Hover Tooltip</Button>
											</Tooltip>
										</Stack>
									</Card>

									{/* Dialog & Drawer */}
									<Card
										title="Modals & Drawers"
										description="Overlay focus-trapped panels"
									>
										<Stack gap="4" align="flex-start" class={css({ mt: "2" })}>
											<Dialog
												trigger={
													<Button variant="solid" colorPalette="blue">
														Open Modal
													</Button>
												}
												title="Delete Workspace"
												description="Are you absolutely sure you want to delete this workspace?"
												body="This action is irreversible and all your data will be permanently wiped."
												cancel={<Button variant="outline">Cancel</Button>}
												confirm={<Button colorPalette="red">Delete</Button>}
											/>
											<Drawer
												trigger={
													<Button variant="outline">
														Open Settings Drawer
													</Button>
												}
												title="Project Settings"
												description="Configure workspace properties"
												body={
													<div
														class={css({
															display: "flex",
															flexDirection: "column",
															gap: "4",
														})}
													>
														<Text size="sm" class={css({ color: "fg.muted" })}>
															Manage your database connections, member access
															levels, and billing preferences directly here.
														</Text>
														<PaginatedTable
															url="/api/posts/index.json"
															dataKey="posts"
															columns={[
																{ header: "Title", key: "title" },
																{ header: "Author", key: "author" },
																{ header: "Date", key: "date" },
															]}
															pageSize={3}
														/>
													</div>
												}
												cancel={<Button variant="outline">Dismiss</Button>}
												confirm={
													<Button colorPalette="blue">Save Changes</Button>
												}
												footer={
													<Button
														variant="outline"
														colorPalette="blue"
														interactive
														onclick="window.dispatchEvent(new CustomEvent('paginated-table:reload'))"
													>
														Reload Table
													</Button>
												}
											/>
										</Stack>
									</Card>

									{/* Dropdown */}
									<Card
										title="Action Dropdowns"
										description="Nestable action list triggers"
										class={css({ overflow: "visible" })}
									>
										<div class={css({ mt: "2" })}>
											<Dropdown
												trigger={
													<Button variant="outline">Workspace Actions</Button>
												}
												items={[
													{
														type: "item",
														label: "View Profile",
														value: "profile",
													},
													{
														type: "item",
														label: "Billing",
														value: "billing",
													},
													{ type: "separator" },
													{
														type: "submenu",
														label: "Invite Members",
														items: [
															{
																type: "item",
																label: "via Email",
																value: "email",
															},
															{
																type: "item",
																label: "via Secret Link",
																value: "link",
															},
														],
													},
												]}
											/>
										</div>
									</Card>

									{/* HoverCard */}
									<Card
										title="Hover Card"
										description="Information popup on hover"
										class={css({ overflow: "visible" })}
									>
										<div class={css({ mt: "2", position: "relative" })}>
											<HoverCard
												showArrow
												trigger={
													<Text
														class={css({
															cursor: "default",
															textDecoration: "underline",
															textDecorationStyle: "dotted",
														})}
													>
														Hover for Author Details
													</Text>
												}
												title="About Jules"
												description="Senior UI designer and front-end architect specializing in HonoX suites."
											/>
										</div>
									</Card>

									{/* Collapsible */}
									<Card
										title="Collapsible Content"
										description="Smooth accordion sections"
									>
										<div class={css({ mt: "2" })}>
											<Collapsible
												trigger={
													<Button variant="outline" size="sm">
														Toggle Details
													</Button>
												}
												content={
													<div
														class={css({
															bg: "bg.subtle",
															p: "3",
															borderRadius: "md",
															mt: "2",
														})}
													>
														<Text size="sm">
															Our accessible focus trap and keyboard navigation
															works cleanly across all devices.
														</Text>
													</div>
												}
											/>
										</div>
									</Card>

									{/* Breadcrumb */}
									<Card
										title="Breadcrumb"
										description="Navigational hierarchies"
									>
										<div class={css({ mt: "2" })}>
											<Breadcrumb
												items={[
													{ label: "Home", href: "/" },
													{ label: "Library", href: "/library" },
													{ label: "Showcase" },
												]}
											/>
										</div>
									</Card>
								</Grid>
							</div>
						</div>

						<div>
							<Heading
								as="h3"
								size="xl"
								class={css({
									mb: "6",
									fontWeight: "semibold",
									borderBottom: "1px solid",
									borderColor: "border.default",
									pb: "2",
								})}
							>
								Feedback &amp; Utilities
							</Heading>
							<div class={css({ mt: "2" })}>
								<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
									{/* Progress */}
									<Card
										title="Progress Bars"
										description="Linear and circular progress loaders"
									>
										<Stack gap="4" class={css({ mt: "2", width: "full" })}>
											<Progress
												label="Uploading Data"
												value={72}
												showValueText
											/>
											<Progress
												label="Processing"
												type="circular"
												value={null}
											/>
										</Stack>
									</Card>

									{/* Skeleton & Alert */}
									<Card
										title="Skeletons & Alerts"
										description="Feedback and placeholder widgets"
									>
										<Stack gap="4" class={css({ mt: "2" })}>
											<Skeleton shape="text" noOfLines={2} gap="2" />
											<Alert
												status="success"
												variant="surface"
												title="Successfully synchronized"
												description="All changes are fully persistent in local store."
												indicator={AlertIcon()}
											/>
										</Stack>
									</Card>

									{/* Clipboard & Toast */}
									<Card
										title="Clipboard & Toast"
										description="Interactive user feedback utilities"
									>
										<Stack gap="4" class={css({ mt: "2" })}>
											<Clipboard
												label="Clone Command"
												value="git clone https://github.com/honojs/honox"
											/>
											<Toast.Toaster />
											<Button
												variant="outline"
												size="sm"
												interactive
												onclick="window.dispatchEvent(new CustomEvent('park-ui:toast:create', { detail: { id: Math.random().toString(36).substring(2, 9), title: 'Task Dispatched', description: 'Interactive component action logged.', closable: true, type: 'success' } }))"
											>
												Dispatch Toast
											</Button>
										</Stack>
									</Card>

									{/* Editable */}
									<Card
										title="Editable"
										description="Click to edit inline, in place"
									>
										<Stack
											direction="vertical"
											gap="4"
											class={css({ mt: "2" })}
										>
											<Editable
												label="Project name"
												defaultValue="Artefact UI Suite"
											/>
											<Editable
												label="Description"
												placeholder="Add a description…"
											/>
										</Stack>
									</Card>
								</Grid>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Beautiful Footer */}
			<footer
				class={css({
					bg: "bg.canvas",
					borderTopWidth: "1px",
					borderColor: "border",
					py: "12",
					px: "6",
				})}
			>
				<div
					class={css({
						maxW: "6xl",
						mx: "auto",
						display: "flex",
						flexDirection: { base: "column", md: "row" },
						justify: "space-between",
						align: "center",
						gap: "6",
					})}
				>
					<Stack direction="horizontal" gap="3" align="center">
						<Avatar
							name="Artefact UI"
							size="xs"
							variant="solid"
							colorPalette="blue"
						/>
						<Text size="sm" class={css({ fontWeight: "semibold" })}>
							© 2025 Artefact UI Suite. All rights reserved.
						</Text>
					</Stack>

					<Stack direction="horizontal" gap="6">
						<Anchor
							href="https://honox.dev"
							target="_blank"
							variant="underline"
							colorPalette="blue"
							class={css({ textStyle: "sm" })}
						>
							HonoX Docs
						</Anchor>
						<Anchor
							href="https://panda-css.com"
							target="_blank"
							variant="underline"
							colorPalette="purple"
							class={css({ textStyle: "sm" })}
						>
							PandaCSS Docs
						</Anchor>
						<Anchor
							href="https://park-ui.com"
							target="_blank"
							variant="underline"
							colorPalette="green"
							class={css({ textStyle: "sm" })}
						>
							Park UI
						</Anchor>
					</Stack>
				</div>
			</footer>
		</div>,
	);
});
