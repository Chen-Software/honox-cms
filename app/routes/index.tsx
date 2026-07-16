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
	TabsContent,
	TabsIndicator,
	TabsList,
	TabsTrigger,
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
					borderColor: "border",
					bg: "bg.default",
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

					<nav class={css({ display: "flex", gap: "6", alignItems: "center" })}>
						<Anchor
							href="/blog"
							variant="plain"
							class={css({ textStyle: "sm", fontWeight: "medium" })}
						>
							Blog
						</Anchor>
						<Anchor
							href="/pages/product-landing"
							variant="plain"
							class={css({ textStyle: "sm", fontWeight: "medium" })}
						>
							Pulse Landing Page
						</Anchor>
						<Anchor
							href="/admin"
							variant="plain"
							class={css({ textStyle: "sm", fontWeight: "medium" })}
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

					<Tabs interactive colorPalette="blue" defaultValue="forms">
						<TabsList>
							<TabsTrigger value="forms">Form Controls</TabsTrigger>
							<TabsTrigger value="pickers">Complex Pickers</TabsTrigger>
							<TabsTrigger value="overlays">
								Overlays &amp; Navigation
							</TabsTrigger>
							<TabsTrigger value="feedback">
								Feedback &amp; Utilities
							</TabsTrigger>
							<TabsIndicator />
						</TabsList>
						<TabsContent value="forms">
							<div class={css({ mt: "6" })}>
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
								</Grid>
							</div>
						</TabsContent>
						<TabsContent value="pickers">
							<div class={css({ mt: "6" })}>
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
						</TabsContent>
						<TabsContent value="overlays">
							<div class={css({ mt: "6" })}>
								<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
									{/* Popover */}
									<Card
										title="Popover & Tooltip"
										description="Contextual info boxes"
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
												body="Manage your database connections, member access levels, and billing preferences directly here."
												cancel={<Button variant="outline">Dismiss</Button>}
												confirm={
													<Button colorPalette="blue">Save Changes</Button>
												}
											/>
										</Stack>
									</Card>

									{/* Dropdown */}
									<Card
										title="Action Dropdowns"
										description="Nestable action list triggers"
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
						</TabsContent>
						<TabsContent value="feedback">
							<div class={css({ mt: "6" })}>
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
								</Grid>
							</div>
						</TabsContent>
					</Tabs>
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
