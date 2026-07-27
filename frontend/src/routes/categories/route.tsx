import { TagIcon } from "@phosphor-icons/react/Tag";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RouteErrorPanel } from "@/components/workspace/error-panel";
import { ListDetailLayout } from "@/components/workspace/list/detail-layout";
import { CategoryList } from "@/features/categories/list";
import { categoriesListOptions } from "@/features/categories/server-state";
import { useCategoryQueryCounts } from "@/features/categories/use-query-counts";
import { queriesListOptions } from "@/features/queries/server-state";

function CategoriesLayout() {
	const { data: categories = [] } = useQuery(categoriesListOptions());
	const getQueryCount = useCategoryQueryCounts();

	return (
		<ListDetailLayout
			list={
				<CategoryList categories={categories} getQueryCount={getQueryCount} />
			}
		>
			<Outlet />
		</ListDetailLayout>
	);
}

export const Route = createFileRoute("/categories")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(categoriesListOptions()),
			context.queryClient.ensureQueryData(queriesListOptions()),
		]),
	component: CategoriesLayout,
	errorComponent: ({ error }) => (
		<RouteErrorPanel
			error={error}
			fallbackMessage="Unable to load categories."
		/>
	),
	staticData: {
		nav: {
			id: "categories",
			label: "Categories",
			icon: TagIcon,
			subsectionId: "config",
			order: 30,
		},
	},
});
