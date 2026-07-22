import { createFileRoute } from "@tanstack/react-router";

import { PlanEditor } from "@/features/plans/PlanEditor";

export const Route = createFileRoute("/plans/new")({
	component: () => <PlanEditor entityId={null} />,
});
