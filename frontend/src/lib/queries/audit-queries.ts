import { queryOptions } from '@tanstack/react-query'

import {
  listAuditQueryVersions,
  listAuditQueries,
  previewAuditQuery,
  type AuditQueryPreviewRequest,
} from '@/lib/audit-api'

import { auditQueryKeys } from './audit-keys'
import { OPTIMISTIC_ID } from './audit-mutations'

export const auditQueriesListOptions = () =>
  queryOptions({
    queryKey: auditQueryKeys.list(),
    queryFn: listAuditQueries,
    staleTime: 60_000,
  })

export const auditQueryVersionsOptions = (id: number | null) =>
  queryOptions({
    queryKey: auditQueryKeys.versions(id),
    queryFn: () => {
      if (id === null) {
        throw new Error('A saved audit query is required to load versions.')
      }
      return listAuditQueryVersions(id)
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })

export const auditQueryPreviewOptions = (
  id: number | null,
  request: AuditQueryPreviewRequest = {},
) =>
  queryOptions({
    queryKey: auditQueryKeys.preview(id, request),
    queryFn: () => {
      if (id === null) {
        throw new Error('A saved audit query is required to load a preview.')
      }

      return previewAuditQuery(id, request)
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })
