import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar'

type EntityListPanelProps = {
  title: string
  totalCount: number
  newLinkTo: string
  newLinkLabel: string
  onNew?: () => void
  emptyMessage: string
  children: ReactNode
}

export function EntityListPanel({
  title,
  totalCount,
  newLinkTo,
  newLinkLabel,
  onNew,
  emptyMessage,
  children,
}: EntityListPanelProps) {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between gap-3 p-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-medium">{title}</h2>
            <Badge variant="secondary">{totalCount} total</Badge>
          </div>
          <Button type="button" size="sm" asChild>
            <Link to={newLinkTo} onClick={() => onNew?.()}>
              {newLinkLabel}
            </Link>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {totalCount === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No {title.toLowerCase()} yet</EmptyTitle>
              <EmptyDescription>{emptyMessage}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>{children}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </>
  )
}
