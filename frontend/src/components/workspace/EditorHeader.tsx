import type { ReactNode } from 'react'

type EditorHeaderProps = {
  title: string
  actions: ReactNode
}

export function EditorHeader({ title, actions }: EditorHeaderProps) {
  return (
    <header className="sticky top-0 z-10 shrink-0 border-b bg-background p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-xl font-medium">{title}</h2>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
    </header>
  )
}
