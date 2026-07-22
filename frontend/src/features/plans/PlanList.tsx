import { Badge } from "@/components/ui/badge";
import { EntityListItem } from "@/components/workspace/EntityListItem";
import { EntityListPanel } from "@/components/workspace/EntityListPanel";
import type { Plan } from "@/lib/api-types";

type PlanListProps = {
	plans: Plan[];
};

export function PlanList({ plans }: PlanListProps) {
	return (
		<EntityListPanel
			title="Plans"
			totalCount={plans.length}
			newLinkTo="/plans/new"
			newLinkLabel="New plan"
			emptyMessage="Create a plan to run multiple queries in sequence."
		>
			{plans.map((plan) => (
				<EntityListItem
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
		</EntityListPanel>
	);
}
