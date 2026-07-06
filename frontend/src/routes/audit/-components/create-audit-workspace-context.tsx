import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useMatch, useNavigate } from '@tanstack/react-router'
import type { ResolveParams } from '@tanstack/router-core'
import type { FileRouteTypes } from '@/routeTree.gen'

type RouteId = FileRouteTypes['id']
type RouteTo = FileRouteTypes['to']

type AuditWorkspaceContextValue = {
  selectedId: number | null
  selectEntity: (id: number | null) => void
}

type AuditWorkspaceConfig<
  TDetailRoute extends RouteId,
  TIndexRoute extends RouteTo,
  TParamName extends keyof ResolveParams<TDetailRoute>,
> = {
  detailRoute: TDetailRoute
  indexRoute: TIndexRoute
  paramName: TParamName
  hookErrorMessage: string
}

export function createAuditWorkspaceContext<
  TDetailRoute extends RouteId,
  TIndexRoute extends RouteTo,
  TParamName extends keyof ResolveParams<TDetailRoute>,
>({
  detailRoute,
  indexRoute,
  paramName,
  hookErrorMessage,
}: AuditWorkspaceConfig<TDetailRoute, TIndexRoute, TParamName>) {
  const AuditWorkspaceContext =
    createContext<AuditWorkspaceContextValue | null>(null)

  function AuditWorkspaceProvider({ children }: { children: ReactNode }) {
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

    useEffect(() => {
      setSelectionOverride(undefined)
    }, [urlEntityId])

    const selectedId =
      selectionOverride !== undefined ? selectionOverride : urlEntityId

    function selectEntity(id: number | null) {
      setSelectionOverride(id)
      if (urlEntityId !== null) {
        void navigate({ to: indexRoute, replace: true })
      }
    }

    return (
      <AuditWorkspaceContext.Provider
        value={{
          selectedId,
          selectEntity,
        }}
      >
        {children}
      </AuditWorkspaceContext.Provider>
    )
  }

  function useAuditWorkspaceSelection() {
    const context = useContext(AuditWorkspaceContext)

    if (!context) {
      throw new Error(hookErrorMessage)
    }

    return context
  }

  return {
    Provider: AuditWorkspaceProvider,
    useSelection: useAuditWorkspaceSelection,
  }
}
