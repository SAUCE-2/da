import { Badge } from '@/components/ui/badge'
import type { Query } from '@/lib/api'
import { sortQueries } from '@/lib/query-utils'

import { EntityListItem } from '@/components/workspace/EntityListItem'
import { EntityListPanel } from '@/components/workspace/EntityListPanel'

type QueryListProps = {
  queries: Query[]
  selectedQueryId: number | null
  onNew: () => void
}

export function QueryList({
  queries,
  selectedQueryId,
  onNew,
}: QueryListProps) {
  const sortedQueries = sortQueries(queries)

  return (
    <EntityListPanel
      title="Queries"
      totalCount={queries.length}
      newLinkTo="/queries"
      onNew={onNew}
      newLinkLabel="New query"
      emptyMessage="Create a query to define a reusable SQL audit check."
    >
      {sortedQueries.map((query) => (
        <EntityListItem
          key={query.id}
          to="/queries/$queryId"
          params={{ queryId: query.id }}
          title={query.name}
          description={query.description || 'No description'}
          isActive={query.id === selectedQueryId}
          badge={
            <Badge
              variant={query.active ? 'secondary' : 'outline'}
              className="shrink-0"
            >
              {query.active ? 'Active' : 'Inactive'}
            </Badge>
          }
        />
      ))}
    </EntityListPanel>
  )
}
