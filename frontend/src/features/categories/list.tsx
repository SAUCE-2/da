import pluralize from "pluralize";
import { Badge } from "@/components/ui/badge";
import { ListSidebar } from "@/components/workspace/list/sidebar";
import { ListSidebarItem } from "@/components/workspace/list/sidebar-item";
import type { Category } from "@/lib/api-types";

type CategoryListProps = {
	categories: Category[];
	getQueryCount: (category: Category) => number;
};

export function CategoryList({ categories, getQueryCount }: CategoryListProps) {
	const sortedCategories = [...categories].sort((left, right) =>
		left.name.localeCompare(right.name),
	);

	return (
		<ListSidebar
			title="Categories"
			totalCount={categories.length}
			newLinkTo="/categories/new"
			newLinkLabel="New category"
			emptyMessage="Create one to organize audit queries."
		>
			{sortedCategories.map((category) => {
				const queryCount = getQueryCount(category);

				return (
					<ListSidebarItem
						key={category.id}
						to="/categories/$categoryId"
						params={{ categoryId: category.id }}
						title={category.name}
						description={category.description || "No description"}
						badge={
							<Badge variant="secondary" className="shrink-0">
								{queryCount} {pluralize("query", queryCount)}
							</Badge>
						}
					/>
				);
			})}
		</ListSidebar>
	);
}
