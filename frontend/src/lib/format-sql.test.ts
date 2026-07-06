import { describe, expect, it } from 'vitest'

import { trimFragmentBoundaries } from './format-sql'

describe('trimFragmentBoundaries', () => {
  it('normalizes line endings and trims blank edges', () => {
    expect(trimFragmentBoundaries('\r\n\nFRAGMENT_A\n  DETAIL_A\n\n  \n')).toBe(
      'FRAGMENT_A\n  DETAIL_A',
    )
  })
})
