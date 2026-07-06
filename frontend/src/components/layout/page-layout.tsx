import type { ReactNode } from 'react'

type PageLayoutProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  const hasHeader = title || description || actions

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {hasHeader ? (
        <header className="flex shrink-0 items-start justify-between gap-4 border-b p-3">
          <div className="flex min-w-0 flex-col gap-1">
            {title ? <h1 className="text-xl font-medium">{title}</h1> : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
