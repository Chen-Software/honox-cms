import type { ComponentBlock } from "./block-types";
import { renderBlocks } from "./page-registry";

interface PageRendererProps {
	content: ComponentBlock[];
}

// Public entry point. The block → component mapping and the recursive
// rendering logic live in `./page-registry`; this file is intentionally thin
// so the public contract (signature, null-on-empty, keying) stays in one place.
export function PageRenderer({ content }: PageRendererProps) {
	if (!content || !Array.isArray(content)) return null;

	return <>{renderBlocks(content)}</>;
}
