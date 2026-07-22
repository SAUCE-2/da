import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/FileMagnifyingGlass";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { MasterDetailLayout } from "@/components/workspace/MasterDetailLayout";
import { RouteQueryError } from "@/components/workspace/RouteQueryError";
import { categoriesListOptions } from "@/features/categories/category-server-state";
import { QueryList } from "@/features/queries/QueryList";
import { queriesListOptions } from "@/features/queries/query-server-state";

function QueriesLayout() {
	const { data: queries = [] } = useQuery(queriesListOptions());

	return (
		<MasterDetailLayout list={<QueryList queries={queries} />}>
			<Outlet />
		</MasterDetailLayout>
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
		<RouteQueryError error={error} fallbackMessage="Unable to load queries." />
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
