import { Badge } from '@/components/ui/badge'
import type { AuditQuery } from '@/lib/audit-api'
import { sortQueries } from '@/lib/audit-query-utils'

import { AuditEntityListItem } from '../../-components/AuditEntityListItem'
import { AuditEntityListPanel } from '../../-components/AuditEntityListPanel'

type AuditQueryListProps = {
  queries: AuditQuery[]
  selectedQueryId: number | null
  onNew: () => void
}

export function AuditQueryList({
  queries,
  selectedQueryId,
  onNew,
}: AuditQueryListProps) {
  const sortedQueries = sortQueries(queries)

  return (
    <AuditEntityListPanel
      title="Queries"
      totalCount={queries.length}
      newLinkTo="/audit/queries"
      onNew={onNew}
      newLinkLabel="New query"
      emptyMessage="Create one to start building reusable metadata."
    >
      {sortedQueries.map((query) => (
        <AuditEntityListItem
          key={query.id}
          to="/audit/queries/$queryId"
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
    </AuditEntityListPanel>
  )
}
