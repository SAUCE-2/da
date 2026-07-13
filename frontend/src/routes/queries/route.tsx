import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/FileMagnifyingGlass'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { QueryList } from './-components/QueryList'
import {
  QueryWorkspaceProvider,
  useQueryWorkspaceSelectionBase,
} from './-components/query-workspace-context'

function QueriesWorkspace() {
  const { selectedId, selectEntity } = useQueryWorkspaceSelectionBase()
  const { data: queries = [] } = useQuery(queriesListOptions())

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          collapsible="none"
          className="md:w-[min(300px,30%)] md:min-w-[260px] border-r"
        >
          <QueryList
            queries={queries}
            selectedQueryId={selectedId}
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

export const Route = createFileRoute('/queries')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(queriesListOptions()),
      context.queryClient.ensureQueryData(categoriesListOptions()),
    ]),
  component: () => (
    <QueryWorkspaceProvider>
      <QueriesWorkspace />
    </QueryWorkspaceProvider>
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
