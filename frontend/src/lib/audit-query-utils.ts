import type { AuditQuery } from '@/lib/audit-api'

export function sortQueries(queries: AuditQuery[]) {
  return [...queries].sort((left, right) => left.name.localeCompare(right.name))
}
