import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type AuditEntityListItemProps = {
  to: string
  params: Record<string, number>
  title: string
  description: string
  badge: ReactNode
  isActive: boolean
}

export function AuditEntityListItem({
  to,
  params,
  title,
  description,
  badge,
  isActive,
}: AuditEntityListItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="h-auto flex-col items-start gap-1 py-3"
      >
        <Link to={to} params={params}>
          <span className="flex w-full items-start justify-between gap-3">
            <span className="leading-snug">{title}</span>
            {badge}
          </span>
          <span className="line-clamp-2 text-sm font-normal text-muted-foreground">
            {description}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
