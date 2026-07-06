import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/FileMagnifyingGlass'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MasterDetailLayout } from '@/components/layout/master-detail-layout'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { QueryList } from './-components/QueryList'
import {
  QueryWorkspaceProvider,
  useQueryWorkspaceSelection,
} from './-components/query-workspace-context'

function QueriesLayoutContent() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()

  const { data: queries = [] } = useQuery(queriesListOptions())

  return (
    <MasterDetailLayout
      list={
        <QueryList
          queries={queries}
          selectedQueryId={selectedQueryId}
          onNew={() => selectQuery(null)}
        />
      }
      detail={<Outlet />}
    />
  )
}

function QueriesLayout() {
  return (
    <QueryWorkspaceProvider>
      <QueriesLayoutContent />
    </QueryWorkspaceProvider>
  )
}

export const Route = createFileRoute('/queries')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(queriesListOptions()),
      context.queryClient.ensureQueryData(categoriesListOptions()),
    ]),
  component: QueriesLayout,
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
