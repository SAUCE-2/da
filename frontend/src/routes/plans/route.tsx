import { StackIcon } from "@phosphor-icons/react/Stack";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RouteErrorPanel } from "@/components/workspace/error-panel";
import { ListDetailLayout } from "@/components/workspace/list/detail-layout";
import { PlanList } from "@/features/plans/list";
import { plansListOptions } from "@/features/plans/server-state";
import { queriesListOptions } from "@/features/queries/server-state";

function PlansLayout() {
	const { data: plans = [] } = useQuery(plansListOptions());

	return (
		<ListDetailLayout list={<PlanList plans={plans} />}>
			<Outlet />
		</ListDetailLayout>
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
		<RouteErrorPanel error={error} fallbackMessage="Unable to load plans." />
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
