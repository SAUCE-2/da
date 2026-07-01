import type { ReactNode } from 'react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type AuditEditorSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function AuditEditorSection({
  title,
  description,
  action,
  children,
}: AuditEditorSectionProps) {
  return (
    <Card className="ring-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
