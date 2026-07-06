import type { Query } from '@/lib/api'
import { sortByName } from '@/lib/utils'

export function sortQueries(queries: Query[]) {
  return sortByName(queries, (query) => query.name)
}
