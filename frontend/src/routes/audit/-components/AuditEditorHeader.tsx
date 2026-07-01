import type { ReactNode } from 'react'

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type AuditEditorHeaderProps = {
  title: string
  description: string
  actions: ReactNode
}

export function AuditEditorHeader({
  title,
  description,
  actions,
}: AuditEditorHeaderProps) {
  return (
    <div className="sticky top-0 z-10 shrink-0 border-b bg-background">
      <Card className="ring-0">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <CardAction>{actions}</CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
