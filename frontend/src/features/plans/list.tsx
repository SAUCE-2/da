import { Badge } from "@/components/ui/badge";
import { ListSidebar } from "@/components/workspace/list/sidebar";
import { ListSidebarItem } from "@/components/workspace/list/sidebar-item";
import type { Plan } from "@/lib/api-types";

type PlanListProps = {
	plans: Plan[];
};

export function PlanList({ plans }: PlanListProps) {
	return (
		<ListSidebar
			title="Plans"
			totalCount={plans.length}
			newLinkTo="/plans/new"
			newLinkLabel="New plan"
			emptyMessage="Create a plan to run multiple queries in sequence."
		>
			{plans.map((plan) => (
				<ListSidebarItem
					key={plan.id}
					to="/plans/$planId"
					params={{ planId: plan.id }}
					title={plan.name}
					description={plan.description || "No description"}
					badge={
						<Badge variant="secondary" className="shrink-0">
							{plan.items.length} queries
						</Badge>
					}
				/>
			))}
		</ListSidebar>
	);
}
