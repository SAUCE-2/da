import { Badge } from '@/components/ui/badge'
import type { AuditCategory } from '@/lib/audit-api'
import { sortCategories } from '@/lib/audit-category-utils'
import { pluralize } from '@/lib/utils'

import { AuditEntityListItem } from '../../-components/AuditEntityListItem'
import { AuditEntityListPanel } from '../../-components/AuditEntityListPanel'

type AuditCategoryListProps = {
  categories: AuditCategory[]
  selectedCategoryId: number | null
  getQueryCount: (category: AuditCategory) => number
  onNew: () => void
}

export function AuditCategoryList({
  categories,
  selectedCategoryId,
  getQueryCount,
  onNew,
}: AuditCategoryListProps) {
  const sortedCategories = sortCategories(categories)

  return (
    <AuditEntityListPanel
      title="Categories"
      totalCount={categories.length}
      newLinkTo="/audit/categories"
      onNew={onNew}
      newLinkLabel="New category"
      emptyMessage="Create one to organize audit queries."
    >
      {sortedCategories.map((category) => {
        const queryCount = getQueryCount(category)

        return (
          <AuditEntityListItem
            key={category.id}
            to="/audit/categories/$categoryId"
            params={{ categoryId: category.id }}
            title={category.name}
            description={category.description || 'No description'}
            isActive={category.id === selectedCategoryId}
            badge={
              <Badge variant="secondary" className="shrink-0">
                {queryCount} {pluralize(queryCount, 'query')}
              </Badge>
            }
          />
        )
      })}
    </AuditEntityListPanel>
  )
}
