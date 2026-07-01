import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatRenderedSqlForDisplay } from '@/lib/format-sql'
import { cn } from '@/lib/utils'

type FormattedSqlDisplayProps = {
  sql: string
  emptyMessage?: string
  className?: string
}

/**
 * Displays raw rendered SQL with optional PL/pgSQL formatting.
 * Use for preview panels and Plan 04 run-history views. Execution must use
 * backend AuditQuerySqlRenderer output, not this formatted display text.
 */
export function FormattedSqlDisplay({
  sql,
  emptyMessage = '-- No SQL to display.',
  className,
}: FormattedSqlDisplayProps) {
  const [displaySql, setDisplaySql] = useState(sql)
  const [formatted, setFormatted] = useState<boolean | null>(null)
  const [isFormatting, setIsFormatting] = useState(false)

  useEffect(() => {
    if (!sql.trim()) {
      setDisplaySql(sql)
      setFormatted(null)
      setIsFormatting(false)
      return
    }

    let cancelled = false
    setIsFormatting(true)

    void formatRenderedSqlForDisplay(sql).then((result) => {
      if (cancelled) {
        return
      }
      setDisplaySql(result.sql)
      setFormatted(result.formatted)
      setIsFormatting(false)
    })

    return () => {
      cancelled = true
    }
  }, [sql])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Card className="bg-muted/50 shadow-none">
        <CardContent className="relative max-h-[420px] overflow-auto p-4">
          {isFormatting ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <pre className="font-mono text-sm whitespace-pre-wrap">
              {displaySql || emptyMessage}
            </pre>
          )}
        </CardContent>
      </Card>
      {isFormatting ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-3" />
          <span>Formatting...</span>
        </div>
      ) : formatted === false && sql.trim() ? (
        <Alert>
          <AlertDescription>
            Could not fully format — unsupported syntax. Showing trimmed SQL.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
