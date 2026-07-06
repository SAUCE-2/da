import { Badge } from '@/components/ui/badge'
import type { AuditPlan } from '@/lib/audit-api'

import { AuditEntityListItem } from '../../-components/AuditEntityListItem'
import { AuditEntityListPanel } from '../../-components/AuditEntityListPanel'

type AuditPlanListProps = {
  plans: AuditPlan[]
  selectedPlanId: number | null
  onNew: () => void
}

export function AuditPlanList({
  plans,
  selectedPlanId,
  onNew,
}: AuditPlanListProps) {
  return (
    <AuditEntityListPanel
      title="Plans"
      totalCount={plans.length}
      newLinkTo="/audit/plans"
      onNew={onNew}
      newLinkLabel="New plan"
      emptyMessage="Create a plan to run multiple queries in sequence against a target."
    >
      {plans.map((plan) => (
        <AuditEntityListItem
          key={plan.id}
          to="/audit/plans/$planId"
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
    </AuditEntityListPanel>
  )
}
