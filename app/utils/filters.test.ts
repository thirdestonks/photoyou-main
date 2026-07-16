import { describe, it, expect } from 'vitest'
import { FILTERS, getFilterById } from './filters'

describe('filters', () => {
  it('includes a normal (no-op) filter first', () => {
    expect(FILTERS[0].id).toBe('normal')
    expect(FILTERS[0].cssFilter).toBe('none')
  })

  it('has unique ids', () => {
    const ids = FILTERS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('falls back to the first filter for an unknown id', () => {
    expect(getFilterById('does-not-exist')).toEqual(FILTERS[0])
  })
})
