import { StackIcon } from '@phosphor-icons/react/Stack'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { plansListOptions } from '@/lib/queries/plans'
import { queriesListOptions } from '@/lib/queries/queries'

import { PlanList } from './-components/PlanList'
import {
  PlanWorkspaceProvider,
  usePlanWorkspaceSelectionBase,
} from './-components/plan-workspace-context'

function PlansWorkspace() {
  const { selectedId, selectEntity } = usePlanWorkspaceSelectionBase()
  const { data: plans = [] } = useQuery(plansListOptions())

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          collapsible="none"
          className="md:w-[min(300px,30%)] md:min-w-[260px] border-r"
        >
          <PlanList
            plans={plans}
            selectedPlanId={selectedId}
            onNew={() => selectEntity(null)}
          />
        </Sidebar>
        <SidebarInset className="min-h-0 overflow-hidden">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export const Route = createFileRoute('/plans')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(plansListOptions()),
      context.queryClient.ensureQueryData(queriesListOptions()),
    ]),
  component: () => (
    <PlanWorkspaceProvider>
      <PlansWorkspace />
    </PlanWorkspaceProvider>
  ),
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
