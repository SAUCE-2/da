/** Mirrors backend AuditQuerySqlRenderer.trimFragmentBoundaries. */
export function trimFragmentBoundaries(sql: string): string {
  return sql
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^(?:[\t ]*\n)+/, '')
    .replace(/\n[\t \n]*$/, '')
}
