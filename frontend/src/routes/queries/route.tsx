import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/FileMagnifyingGlass'
import { createFileRoute } from '@tanstack/react-router'

import {
  EntityWorkspaceLayout,
  entityWorkspaceLoader,
} from '@/components/workspace/entity-workspace-layout'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { QueryList } from './-components/QueryList'
import {
  QueryWorkspaceProvider,
  useQueryWorkspaceSelectionBase,
} from './-components/query-workspace-context'

export const Route = createFileRoute('/queries')({
  loader: ({ context }) =>
    entityWorkspaceLoader(
      context.queryClient,
      queriesListOptions,
      categoriesListOptions,
    ),
  component: () => (
    <EntityWorkspaceLayout
      Provider={QueryWorkspaceProvider}
      useSelection={useQueryWorkspaceSelectionBase}
      listOptions={queriesListOptions}
      renderList={({ items, selectedId, onNew }) => (
        <QueryList
          queries={items}
          selectedQueryId={selectedId}
          onNew={onNew}
        />
      )}
    />
  ),
  errorComponent: ({ error }) => (
    <RouteQueryError
      error={error}
      fallbackMessage="Unable to load queries."
    />
  ),
  staticData: {
    nav: {
      id: 'queries',
      label: 'Queries',
      icon: FileMagnifyingGlassIcon,
      subsectionId: 'config',
      order: 10,
    },
  },
})
