import { createFileRoute } from "@tanstack/react-router";

import { PlanEditor } from "@/features/plans/editor";

export const Route = createFileRoute("/plans/$planId")({
	params: {
		parse: (params) => ({
			planId: Number(params.planId),
		}),
		stringify: (params) => ({
			planId: String(params.planId),
		}),
	},
	component: EditPlanPage,
});

function EditPlanPage() {
	const { planId } = Route.useParams();
	return <PlanEditor key={planId} entityId={planId} />;
}
