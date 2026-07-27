import { createFileRoute } from "@tanstack/react-router";

import { CategoryEditor } from "@/features/categories/editor";

export const Route = createFileRoute("/categories/new")({
	component: () => <CategoryEditor entityId={null} />,
});
