import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVerticalIcon } from '@phosphor-icons/react/DotsSixVertical'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SortableListProps<T extends { clientId: string }> = {
  items: T[]
  onReorder: (activeId: string, overId: string) => void
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.clientId)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>{items.map(renderSortableItem)}</div>
      </SortableContext>
    </DndContext>
  )

  function renderSortableItem(item: T, index: number) {
    return (
      <SortableRow key={item.clientId} id={item.clientId}>
        {(dragHandle) => renderItem(item, index, dragHandle)}
      </SortableRow>
    )
  }
}

function SortableRow({
  id,
  children,
}: {
  id: string
  children: (dragHandle: ReactNode) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragHandle = (
    <button
      type="button"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <DotsSixVerticalIcon className="size-4" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-60')}
    >
      {children(dragHandle)}
    </div>
  )
}
