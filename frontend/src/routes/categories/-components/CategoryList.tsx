import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/api'
import pluralize from 'pluralize'

import { EntityListItem } from '@/components/workspace/EntityListItem'
import { EntityListPanel } from '@/components/workspace/EntityListPanel'

type CategoryListProps = {
  categories: Category[]
  selectedCategoryId: number | null
  getQueryCount: (category: Category) => number
  onNew: () => void
}

export function CategoryList({
  categories,
  selectedCategoryId,
  getQueryCount,
  onNew,
}: CategoryListProps) {
  const sortedCategories = [...categories].sort((left, right) =>
    left.name.localeCompare(right.name),
  )

  return (
    <EntityListPanel
      title="Categories"
      totalCount={categories.length}
      newLinkTo="/categories"
      onNew={onNew}
      newLinkLabel="New category"
      emptyMessage="Create one to organize audit queries."
    >
      {sortedCategories.map((category) => {
        const queryCount = getQueryCount(category)

        return (
          <EntityListItem
            key={category.id}
            to="/categories/$categoryId"
            params={{ categoryId: category.id }}
            title={category.name}
            description={category.description || 'No description'}
            isActive={category.id === selectedCategoryId}
            badge={
              <Badge variant="secondary" className="shrink-0">
                {queryCount} {pluralize('query', queryCount)}
              </Badge>
            }
          />
        )
      })}
    </EntityListPanel>
  )
}
