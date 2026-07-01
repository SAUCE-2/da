import { FormattedSqlDisplay } from '@/components/formatted-sql-display'

type SqlPreviewProps = {
  sql: string
}

export function SqlPreview({ sql }: SqlPreviewProps) {
  return (
    <FormattedSqlDisplay
      sql={sql}
      emptyMessage="-- No default-enabled sections to render."
    />
  )
}
