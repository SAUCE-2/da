import { DragDropProvider } from '@dnd-kit/react'
import { useSortable, isSortable } from '@dnd-kit/react/sortable'
import { DotsSixVerticalIcon } from '@phosphor-icons/react/DotsSixVertical'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SortableListProps<T extends { clientId: string }> = {
  items: T[]
  onReorder: (fromIndex: number, toIndex: number) => void
  renderItem: (
    item: T,
    index: number,
    dragHandle: ReactNode,
  ) => ReactNode
  className?: string
}

export function SortableList<T extends { clientId: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return
        }

        const { source } = event.operation

        if (isSortable(source) && source.initialIndex !== source.index) {
          onReorder(source.initialIndex, source.index)
        }
      }}
    >
      <div className={className}>{items.map(renderSortableItem)}</div>
    </DragDropProvider>
  )

  function renderSortableItem(item: T, index: number) {
    return (
      <SortableRow key={item.clientId} id={item.clientId} index={index}>
        {(dragHandle) => renderItem(item, index, dragHandle)}
      </SortableRow>
    )
  }
}

function SortableRow({
  id,
  index,
  children,
}: {
  id: string
  index: number
  children: (dragHandle: ReactNode) => ReactNode
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index })

  const dragHandle = (
    <button
      type="button"
      ref={handleRef}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Drag to reorder"
    >
      <DotsSixVerticalIcon className="size-4" />
    </button>
  )

  return (
    <div ref={ref} className={cn(isDragging && 'opacity-60')}>
      {children(dragHandle)}
    </div>
  )
}
