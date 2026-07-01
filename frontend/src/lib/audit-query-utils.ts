import type { AuditQuery } from '@/lib/audit-api'
import { sortByName } from '@/lib/utils'

export function sortQueries(queries: AuditQuery[]) {
  return sortByName(queries, (query) => query.name)
}
