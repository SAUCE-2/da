import { queryOptions } from '@tanstack/react-query'

import {
  listQueryVersions,
  listQueries,
  previewQuery,
  type QueryPreviewRequest,
} from '@/lib/api'

import { queryKeys } from './keys'
import { OPTIMISTIC_ID } from './mutations'

export const queriesListOptions = () =>
  queryOptions({
    queryKey: queryKeys.list(),
    queryFn: listQueries,
    staleTime: 60_000,
  })

export const queryVersionsOptions = (id: number | null) =>
  queryOptions({
    queryKey: queryKeys.versions(id),
    queryFn: () => {
      if (id === null) {
        throw new Error('A saved query is required to load versions.')
      }
      return listQueryVersions(id)
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })

export const queryPreviewOptions = (
  id: number | null,
  request: QueryPreviewRequest = {},
) =>
  queryOptions({
    queryKey: queryKeys.preview(id, request),
    queryFn: () => {
      if (id === null) {
        throw new Error('A saved query is required to load a preview.')
      }

      return previewQuery(id, request)
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })
