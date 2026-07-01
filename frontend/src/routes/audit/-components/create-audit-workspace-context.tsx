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
    const urlEntityId = rawParam ? Number(rawParam) : null

    const [selectedId, setSelectedId] = useState<number | null>(null)

    useEffect(() => {
      if (urlEntityId !== null) {
        setSelectedId(urlEntityId)
      }
    }, [urlEntityId])

    function selectEntity(id: number | null) {
      setSelectedId(id)
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
