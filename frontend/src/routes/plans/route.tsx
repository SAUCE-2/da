import { StackIcon } from '@phosphor-icons/react/Stack'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MasterDetailLayout } from '@/components/layout/master-detail-layout'
import { queriesListOptions } from '@/lib/queries/queries'
import { plansListOptions } from '@/lib/queries/plans'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { PlanList } from './-components/PlanList'
import {
  PlanWorkspaceProvider,
  usePlanWorkspaceSelection,
} from './-components/plan-workspace-context'

function PlansLayoutContent() {
  const { selectedPlanId, selectPlan } = usePlanWorkspaceSelection()
  const { data: plans = [] } = useQuery(plansListOptions())

  return (
    <MasterDetailLayout
      list={
        <PlanList
          plans={plans}
          selectedPlanId={selectedPlanId}
          onNew={() => selectPlan(null)}
        />
      }
      detail={<Outlet />}
    />
  )
}

function PlansLayout() {
  return (
    <PlanWorkspaceProvider>
      <PlansLayoutContent />
    </PlanWorkspaceProvider>
  )
}

export const Route = createFileRoute('/plans')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(plansListOptions()),
      context.queryClient.ensureQueryData(queriesListOptions()),
    ]),
  component: PlansLayout,
  errorComponent: ({ error }) => (
    <RouteQueryError
      error={error}
      fallbackMessage="Unable to load plans."
    />
  ),
  staticData: {
    nav: {
      id: 'plans',
      label: 'Plans',
      icon: StackIcon,
      subsectionId: 'config',
      order: 20,
    },
  },
})
