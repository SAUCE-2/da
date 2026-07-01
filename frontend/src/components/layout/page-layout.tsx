import type { ReactNode } from 'react'

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PageLayoutProps = {
  title?: string
  description?: string
  actions?: ReactNode
  maxWidth?: '5xl' | 'none'
  children: ReactNode
}

export function PageLayout({
  title,
  description,
  actions,
  maxWidth = '5xl',
  children,
}: PageLayoutProps) {
  const hasHeader = title || description || actions

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-6 p-6',
          maxWidth === '5xl' && 'max-w-5xl',
        )}
      >
        {hasHeader ? (
          <Card className="rounded-none border-0 shadow-none ring-0">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                {title ? (
                  <CardTitle className="text-xl">{title}</CardTitle>
                ) : null}
                {description ? (
                  <CardDescription>{description}</CardDescription>
                ) : null}
              </div>
              {actions ? <CardAction>{actions}</CardAction> : null}
            </CardHeader>
          </Card>
        ) : null}
        {children}
      </div>
    </div>
  )
}
