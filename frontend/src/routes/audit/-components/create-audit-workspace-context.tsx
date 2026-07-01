import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useMatch, useNavigate } from '@tanstack/react-router'

type AuditWorkspaceContextValue = {
  selectedId: number | null
  selectEntity: (id: number | null) => void
}

type AuditWorkspaceConfig = {
  detailRoute: string
  indexRoute: string
  paramName: string
  hookErrorMessage: string
}

export function createAuditWorkspaceContext({
  detailRoute,
  indexRoute,
  paramName,
  hookErrorMessage,
}: AuditWorkspaceConfig) {
  const AuditWorkspaceContext =
    createContext<AuditWorkspaceContextValue | null>(null)

  function AuditWorkspaceProvider({ children }: { children: ReactNode }) {
    const match = useMatch({
      from: detailRoute,
      shouldThrow: false,
    })
    const navigate = useNavigate()
    const urlEntityId = match?.params[paramName]
      ? Number(match.params[paramName])
      : null

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
