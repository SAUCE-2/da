import { StackIcon } from '@phosphor-icons/react/Stack'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AuditMasterDetailLayout } from '@/components/layout/audit-master-detail-layout'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'
import { auditPlansListOptions } from '@/lib/queries/audit-plans'

import { AuditRouteQueryError } from '../-components/AuditRouteQueryError'
import { AuditPlanList } from './-components/AuditPlanList'
import {
  PlanWorkspaceProvider,
  usePlanWorkspaceSelection,
} from './-components/plan-workspace-context'

function AuditPlansLayoutContent() {
  const { selectedPlanId, selectPlan } = usePlanWorkspaceSelection()
  const { data: plans = [] } = useQuery(auditPlansListOptions())

  return (
    <AuditMasterDetailLayout
      list={
        <AuditPlanList
          plans={plans}
          selectedPlanId={selectedPlanId}
          onNew={() => selectPlan(null)}
        />
      }
      detail={<Outlet />}
    />
  )
}

function AuditPlansLayout() {
  return (
    <PlanWorkspaceProvider>
      <AuditPlansLayoutContent />
    </PlanWorkspaceProvider>
  )
}

export const Route = createFileRoute('/audit/plans')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(auditPlansListOptions()),
      context.queryClient.ensureQueryData(auditQueriesListOptions()),
    ]),
  component: AuditPlansLayout,
  errorComponent: ({ error }) => (
    <AuditRouteQueryError
      error={error}
      fallbackMessage="Unable to load audit plans."
    />
  ),
  staticData: {
    nav: {
      id: 'audit.plans',
      label: 'Plans',
      icon: StackIcon,
      subsectionId: 'config',
      order: 20,
    },
  },
})
