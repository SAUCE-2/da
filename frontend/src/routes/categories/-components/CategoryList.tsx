import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/api'
import { sortCategories } from '@/lib/category-utils'
import { pluralize } from '@/lib/utils'

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
  const sortedCategories = sortCategories(categories)

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
                {queryCount} {pluralize(queryCount, 'query')}
              </Badge>
            }
          />
        )
      })}
    </EntityListPanel>
  )
}
