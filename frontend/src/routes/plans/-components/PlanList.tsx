import { Badge } from '@/components/ui/badge'
import type { Plan } from '@/lib/api'

import { EntityListItem } from '@/components/workspace/EntityListItem'
import { EntityListPanel } from '@/components/workspace/EntityListPanel'

type PlanListProps = {
  plans: Plan[]
  selectedPlanId: number | null
  onNew: () => void
}

export function PlanList({
  plans,
  selectedPlanId,
  onNew,
}: PlanListProps) {
  return (
    <EntityListPanel
      title="Plans"
      totalCount={plans.length}
      newLinkTo="/plans"
      onNew={onNew}
      newLinkLabel="New plan"
      emptyMessage="Create a plan to run multiple queries in sequence."
    >
      {plans.map((plan) => (
        <EntityListItem
          key={plan.id}
          to="/plans/$planId"
          params={{ planId: plan.id }}
          title={plan.name}
          description={plan.description || 'No description'}
          isActive={plan.id === selectedPlanId}
          badge={
            <Badge variant="secondary" className="shrink-0">
              {plan.items.length} queries
            </Badge>
          }
        />
      ))}
    </EntityListPanel>
  )
}
