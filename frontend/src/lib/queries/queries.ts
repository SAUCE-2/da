import { queryOptions } from '@tanstack/react-query'

import {
  listQueries,
  previewQuery,
  type Query,
  type QueryPreview,
  type QueryPreviewRequest,
} from '@/lib/api'

import { queryKeys } from './keys'
import { OPTIMISTIC_ID } from './mutations'

export const queriesListOptions = () =>
  queryOptions({
    queryKey: queryKeys.list(),
    queryFn: async () => (await listQueries()) as Query[],
    staleTime: 60_000,
  })

export const queryPreviewOptions = (
  id: number | null,
  request: QueryPreviewRequest = {},
) =>
  queryOptions({
    queryKey: queryKeys.preview(id, request),
    queryFn: async () => {
      if (id === null) {
        throw new Error('A saved query is required to load a preview.')
      }

      return (await previewQuery(id, request)) as QueryPreview
    },
    enabled: id !== null && id !== OPTIMISTIC_ID,
    staleTime: 0,
  })
