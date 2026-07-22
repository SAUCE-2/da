import { TagIcon } from "@phosphor-icons/react/Tag";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { MasterDetailLayout } from "@/components/workspace/MasterDetailLayout";
import { RouteQueryError } from "@/components/workspace/RouteQueryError";
import { CategoryList } from "@/features/categories/CategoryList";
import { categoriesListOptions } from "@/features/categories/category-server-state";
import { useCategoryQueryCounts } from "@/features/categories/use-category-query-counts";
import { queriesListOptions } from "@/features/queries/query-server-state";

function CategoriesLayout() {
	const { data: categories = [] } = useQuery(categoriesListOptions());
	const getQueryCount = useCategoryQueryCounts();

	return (
		<MasterDetailLayout
			list={
				<CategoryList categories={categories} getQueryCount={getQueryCount} />
			}
		>
			<Outlet />
		</MasterDetailLayout>
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
		<RouteQueryError
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
