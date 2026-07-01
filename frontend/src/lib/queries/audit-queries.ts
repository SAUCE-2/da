import { queryOptions } from '@tanstack/react-query'

import { getAuditQueryPreview, listAuditQueries } from '@/lib/audit-api'

import { auditQueryKeys } from './audit-keys'
import { OPTIMISTIC_ID } from './audit-mutations'

export const auditQueriesListOptions = () =>
  queryOptions({
    queryKey: auditQueryKeys.list(),
    queryFn: listAuditQueries,
    staleTime: 60_000,
  })

export const auditQueryPreviewOptions = (id: number | null) =>
  queryOptions({
    queryKey: auditQueryKeys.preview(id),
    queryFn: () => {
      if (id === null) {
        throw new Error('A saved audit query is required to load a preview.')
      }

      return getAuditQueryPreview(id)
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })
