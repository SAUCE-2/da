import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMatch, useNavigate } from '@tanstack/react-router'
import type { ResolveParams } from '@tanstack/router-core'
import type { FileRouteTypes } from '@/routeTree.gen'

type RouteId = FileRouteTypes['id']
type RouteTo = FileRouteTypes['to']

type WorkspaceContextValue = {
  selectedId: number | null
  selectEntity: (id: number | null) => void
}

type WorkspaceConfig<
  TDetailRoute extends RouteId,
  TIndexRoute extends RouteTo,
  TParamName extends keyof ResolveParams<TDetailRoute>,
> = {
  detailRoute: TDetailRoute
  indexRoute: TIndexRoute
  paramName: TParamName
  hookErrorMessage: string
}

export function createWorkspaceContext<
  TDetailRoute extends RouteId,
  TIndexRoute extends RouteTo,
  TParamName extends keyof ResolveParams<TDetailRoute>,
>({
  detailRoute,
  indexRoute,
  paramName,
  hookErrorMessage,
}: WorkspaceConfig<TDetailRoute, TIndexRoute, TParamName>) {
  const WorkspaceContext =
    createContext<WorkspaceContextValue | null>(null)

  function WorkspaceProvider({ children }: { children: ReactNode }) {
    const match = useMatch({
      from: detailRoute,
      shouldThrow: false,
    })
    const navigate = useNavigate()
    const params = match?.params as ResolveParams<TDetailRoute> | undefined
    const rawParam = params?.[paramName]
    const urlEntityId =
      rawParam !== undefined && rawParam !== null && rawParam !== ''
        ? Number(rawParam)
        : null

    const [selectionOverride, setSelectionOverride] = useState<
      number | null | undefined
    >(undefined)
    const [prevUrlEntityId, setPrevUrlEntityId] = useState(urlEntityId)

    if (urlEntityId !== prevUrlEntityId) {
      setPrevUrlEntityId(urlEntityId)
      setSelectionOverride(undefined)
    }

    const selectedId =
      selectionOverride !== undefined ? selectionOverride : urlEntityId

    const selectEntity = useCallback(
      (id: number | null) => {
        setSelectionOverride(id)
        if (urlEntityId !== null) {
          void navigate({ to: indexRoute, replace: true })
        }
      },
      [urlEntityId, navigate, indexRoute],
    )

    const value = useMemo(
      () => ({
        selectedId,
        selectEntity,
      }),
      [selectedId, selectEntity],
    )

    return (
      <WorkspaceContext.Provider value={value}>
        {children}
      </WorkspaceContext.Provider>
    )
  }

  function useWorkspaceSelection() {
    const context = useContext(WorkspaceContext)

    if (!context) {
      throw new Error(hookErrorMessage)
    }

    return context
  }

  return {
    Provider: WorkspaceProvider,
    useSelection: useWorkspaceSelection,
  }
}
