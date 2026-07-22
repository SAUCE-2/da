import { StackIcon } from "@phosphor-icons/react/Stack";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { MasterDetailLayout } from "@/components/workspace/MasterDetailLayout";
import { RouteQueryError } from "@/components/workspace/RouteQueryError";
import { PlanList } from "@/features/plans/PlanList";
import { plansListOptions } from "@/features/plans/plan-server-state";
import { queriesListOptions } from "@/features/queries/query-server-state";

function PlansLayout() {
	const { data: plans = [] } = useQuery(plansListOptions());

	return (
		<MasterDetailLayout list={<PlanList plans={plans} />}>
			<Outlet />
		</MasterDetailLayout>
	);
}

export const Route = createFileRoute("/plans")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(plansListOptions()),
			context.queryClient.ensureQueryData(queriesListOptions()),
		]),
	component: PlansLayout,
	errorComponent: ({ error }) => (
		<RouteQueryError error={error} fallbackMessage="Unable to load plans." />
	),
	staticData: {
		nav: {
			id: "plans",
			label: "Plans",
			icon: StackIcon,
			subsectionId: "config",
			order: 20,
		},
	},
});
