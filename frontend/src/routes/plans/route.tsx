import { StackIcon } from '@phosphor-icons/react/Stack'
import { createFileRoute } from '@tanstack/react-router'

import {
  EntityWorkspaceLayout,
  entityWorkspaceLoader,
} from '@/components/workspace/entity-workspace-layout'
import { queriesListOptions } from '@/lib/queries/queries'
import { plansListOptions } from '@/lib/queries/plans'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { PlanList } from './-components/PlanList'
import {
  PlanWorkspaceProvider,
  usePlanWorkspaceSelectionBase,
} from './-components/plan-workspace-context'

export const Route = createFileRoute('/plans')({
  loader: ({ context }) =>
    entityWorkspaceLoader(
      context.queryClient,
      plansListOptions,
      queriesListOptions,
    ),
  component: () => (
    <EntityWorkspaceLayout
      Provider={PlanWorkspaceProvider}
      useSelection={usePlanWorkspaceSelectionBase}
      listOptions={plansListOptions}
      renderList={({ items, selectedId, onNew }) => (
        <PlanList plans={items} selectedPlanId={selectedId} onNew={onNew} />
      )}
    />
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
