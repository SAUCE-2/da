import type { QueryKey } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { ComponentType, ReactNode } from 'react'
import { Outlet } from '@tanstack/react-router'

import { MasterDetailLayout } from '@/components/layout/master-detail-layout'

type EntityWorkspaceLayoutProps = {
  Provider: ComponentType<{ children: ReactNode }>
  useSelection: () => {
    selectedId: number | null
    selectEntity: (id: number | null) => void
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listOptions: () => any
  renderList: (props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[]
    selectedId: number | null
    onNew: () => void
  }) => ReactNode
}

export function EntityWorkspaceLayout({
  Provider,
  useSelection,
  listOptions,
  renderList,
}: EntityWorkspaceLayoutProps) {
  function LayoutContent() {
    const { selectedId, selectEntity } = useSelection()
    const { data: items = [] } = useQuery(listOptions())

    return (
      <MasterDetailLayout
        list={renderList({
          items: items as never[],
          selectedId,
          onNew: () => selectEntity(null),
        })}
        detail={<Outlet />}
      />
    )
  }

  return (
    <Provider>
      <LayoutContent />
    </Provider>
  )
}

export function entityWorkspaceLoader(
  queryClient: {
    ensureQueryData: (options: { queryKey: QueryKey }) => Promise<unknown>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...options: Array<() => any>
) {
  return Promise.all(
    options.map((getOptions) => queryClient.ensureQueryData(getOptions())),
  )
}
