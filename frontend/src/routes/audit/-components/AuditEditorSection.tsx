import type { ReactNode } from 'react'

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
    <section className="border-b">
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-medium">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}
