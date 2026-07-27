import { createFileRoute } from "@tanstack/react-router";

import { PlanEditor } from "@/features/plans/editor";
import { planDetailOptions } from "@/features/plans/server-state";

export const Route = createFileRoute("/plans/$planId")({
	params: {
		parse: (params) => ({
			planId: Number(params.planId),
		}),
		stringify: (params) => ({
			planId: String(params.planId),
		}),
	},
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(planDetailOptions(params.planId)),
	component: EditPlanPage,
});

function EditPlanPage() {
	const { planId } = Route.useParams();
	return <PlanEditor key={planId} entityId={planId} />;
}
