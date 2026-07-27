import { Badge } from "@/components/ui/badge";
import { ListSidebar } from "@/components/workspace/list/sidebar";
import { ListSidebarItem } from "@/components/workspace/list/sidebar-item";
import type { Query } from "@/lib/api-types";

type QueryListProps = {
	queries: Query[];
};

export function QueryList({ queries }: QueryListProps) {
	const sortedQueries = [...queries].sort((left, right) =>
		left.name.localeCompare(right.name),
	);

	return (
		<ListSidebar
			title="Queries"
			totalCount={queries.length}
			newLinkTo="/queries/new"
			newLinkLabel="New query"
			emptyMessage="Create a query to define a reusable SQL audit check."
		>
			{sortedQueries.map((query) => (
				<ListSidebarItem
					key={query.id}
					to="/queries/$queryId"
					params={{ queryId: query.id }}
					title={query.name}
					description={query.description || "No description"}
					badge={
						<Badge
							variant={query.active ? "secondary" : "outline"}
							className="shrink-0"
						>
							{query.active ? "Active" : "Inactive"}
						</Badge>
					}
				/>
			))}
		</ListSidebar>
	);
}
