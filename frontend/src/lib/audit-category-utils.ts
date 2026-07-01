import type { AuditCategory, AuditQuery } from '@/lib/audit-api'
import { sortByName } from '@/lib/utils'

export function sortCategories(categories: AuditCategory[]) {
  return sortByName(categories, (category) => category.name)
}

export function buildDerivedQueryCounts(queries: AuditQuery[]) {
  const counts = new Map<number, number>()

  for (const query of queries) {
    for (const category of query.categories) {
      counts.set(category.id, (counts.get(category.id) ?? 0) + 1)
    }
  }

  return counts
}

export function getCategoryQueryCount(
  category: AuditCategory,
  derivedCounts: Map<number, number>,
) {
  return typeof category.queryCount === 'number'
    ? category.queryCount
    : (derivedCounts.get(category.id) ?? 0)
}
