import { createFileRoute } from "@tanstack/react-router";

import { PlanEditor } from "@/features/plans/editor";

export const Route = createFileRoute("/plans/new")({
	component: () => <PlanEditor entityId={null} />,
});
