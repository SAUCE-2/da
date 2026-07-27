import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/FileMagnifyingGlass";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RouteErrorPanel } from "@/components/workspace/error-panel";
import { ListDetailLayout } from "@/components/workspace/list/detail-layout";
import { categoriesListOptions } from "@/features/categories/server-state";
import { QueryList } from "@/features/queries/list";
import { queriesListOptions } from "@/features/queries/server-state";

function QueriesLayout() {
	const { data: queries = [] } = useQuery(queriesListOptions());

	return (
		<ListDetailLayout list={<QueryList queries={queries} />}>
			<Outlet />
		</ListDetailLayout>
	);
}

export const Route = createFileRoute("/queries")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(queriesListOptions()),
			context.queryClient.ensureQueryData(categoriesListOptions()),
		]),
	component: QueriesLayout,
	errorComponent: ({ error }) => (
		<RouteErrorPanel error={error} fallbackMessage="Unable to load queries." />
	),
	staticData: {
		nav: {
			id: "queries",
			label: "Queries",
			icon: FileMagnifyingGlassIcon,
			subsectionId: "config",
			order: 10,
		},
	},
});
