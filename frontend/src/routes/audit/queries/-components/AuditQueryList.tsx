import { Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { AuditQuery } from '@/lib/audit-api'

import { AuditEntityListPanel } from '../../-components/AuditEntityListPanel'
import { sortQueries } from './query-form'

type AuditQueryListProps = {
  queries: AuditQuery[]
  selectedQueryId: number | null
}

export function AuditQueryList({
  queries,
  selectedQueryId,
}: AuditQueryListProps) {
  const sortedQueries = sortQueries(queries)

  return (
    <AuditEntityListPanel
      title="Queries"
      totalCount={queries.length}
      newLinkTo="/audit/queries"
      newLinkLabel="New query"
      emptyMessage="Create one to start building reusable metadata."
    >
      {sortedQueries.map((query) => {
        const isActive = query.id === selectedQueryId

        return (
          <SidebarMenuItem key={query.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className="h-auto flex-col items-start gap-1 py-3"
            >
              <Link
                to="/audit/queries/$queryId"
                params={{ queryId: query.id }}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="leading-snug">{query.name}</span>
                  <Badge
                    variant={query.active ? 'secondary' : 'outline'}
                    className="shrink-0"
                  >
                    {query.active ? 'Active' : 'Inactive'}
                  </Badge>
                </span>
                <span className="line-clamp-2 text-sm font-normal text-muted-foreground">
                  {query.description || 'No description'}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </AuditEntityListPanel>
  )
}
