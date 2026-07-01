import { Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { AuditCategory } from '@/lib/audit-api'

import { AuditEntityListPanel } from '../../-components/AuditEntityListPanel'

type AuditCategoryListProps = {
  categories: AuditCategory[]
  selectedCategoryId: number | null
  getQueryCount: (category: AuditCategory) => number
}

export function AuditCategoryList({
  categories,
  selectedCategoryId,
  getQueryCount,
}: AuditCategoryListProps) {
  const sortedCategories = [...categories].sort((left, right) =>
    left.name.localeCompare(right.name),
  )

  return (
    <AuditEntityListPanel
      title="Categories"
      totalCount={categories.length}
      newLinkTo="/audit/categories"
      newLinkLabel="New category"
      emptyMessage="Create one to organize query metadata."
    >
      {sortedCategories.map((category) => {
        const queryCount = getQueryCount(category)
        const isActive = category.id === selectedCategoryId

        return (
          <SidebarMenuItem key={category.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className="h-auto flex-col items-start gap-1 py-3"
            >
              <Link
                to="/audit/categories/$categoryId"
                params={{ categoryId: category.id }}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="leading-snug">{category.name}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {queryCount} {queryCount === 1 ? 'query' : 'queries'}
                  </Badge>
                </span>
                <span className="line-clamp-2 text-sm font-normal text-muted-foreground">
                  {category.description || 'No description'}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </AuditEntityListPanel>
  )
}
