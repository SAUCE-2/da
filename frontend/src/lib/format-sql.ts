import prettier from 'prettier/standalone'
import * as sqlPlugin from 'prettier-plugin-sql-cst'

export type FormatSqlResult = {
  sql: string
  formatted: boolean
}

export const SQL_FORMAT_OPTIONS = {
  parser: 'plpgsql' as const,
  plugins: [sqlPlugin],
  printWidth: 80,
  sqlExperimentalPlpgsql: true,
  sqlTypeCase: 'lower' as const,
}

/** Mirrors backend AuditQuerySqlRenderer.trimFragmentBoundaries. */
export function trimFragmentBoundaries(sql: string): string {
  return sql
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^(?:[\t ]*\n)+/, '')
    .replace(/\n[\t \n]*$/, '')
}

/**
 * Attempt PL/pgSQL layout formatting on a complete SQL string. Falls back to
 * boundary trimming when the parser cannot handle the input (common for Oracle
 * audit SQL). Use on concatenated preview/history SQL, not individual sections.
 */
export async function formatSql(sql: string): Promise<FormatSqlResult> {
  const trimmed = trimFragmentBoundaries(sql)
  if (!trimmed.trim()) {
    return { sql: trimmed, formatted: false }
  }

  try {
    const result = await prettier.format(trimmed, SQL_FORMAT_OPTIONS)
    return { sql: result, formatted: true }
  } catch {
    return { sql: trimmed, formatted: false }
  }
}

/**
 * Format raw rendered SQL for display in preview or Plan 04 run-history UI.
 * Execution should use backend-rendered raw SQL from AuditQuerySqlRenderer.
 */
export async function formatRenderedSqlForDisplay(
  sql: string,
): Promise<FormatSqlResult> {
  return formatSql(sql)
}
