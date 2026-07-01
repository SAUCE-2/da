import { describe, expect, it } from 'vitest'

import { formatSql, trimFragmentBoundaries } from './format-sql'

describe('formatSql', () => {
  it('trims fragment boundaries when formatting fails on Oracle syntax', async () => {
    const input =
      '\nSELECT a FROM t1, t2 WHERE t1.id (+) = t2.id\n\n'

    const result = await formatSql(input)

    expect(result.formatted).toBe(false)
    expect(result.sql).toBe(trimFragmentBoundaries(input))
  })

  it('formats valid SQL with the plpgsql parser', async () => {
    const input = 'select id, name from client where id = 1'

    const result = await formatSql(input)

    expect(result.formatted).toBe(true)
    expect(result.sql).toContain('SELECT')
    expect(result.sql).toContain('FROM')
  })
})

describe('trimFragmentBoundaries', () => {
  it('normalizes line endings and trims blank edges', () => {
    expect(trimFragmentBoundaries('\r\n\nFRAGMENT_A\n  DETAIL_A\n\n  \n')).toBe(
      'FRAGMENT_A\n  DETAIL_A',
    )
  })
})
