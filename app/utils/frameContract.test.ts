import { describe, it, expect } from 'vitest'
import {
  STRIP_WIDTH,
  WINDOW_HEIGHT,
  computeStripHeight,
  computeWindows
} from './frameContract'

describe('frameContract geometry', () => {
  it('keeps the 4-shot strip height at 3600 (unchanged from legacy)', () => {
    expect(computeStripHeight(4)).toBe(3600)
  })

  it('shrinks the strip for fewer shots', () => {
    expect(computeStripHeight(3)).toBe(2795)
    expect(computeStripHeight(2)).toBe(1990)
  })

  it('returns one window per shot', () => {
    expect(computeWindows(2)).toHaveLength(2)
    expect(computeWindows(4)).toHaveLength(4)
  })

  it('places the first window at the legacy coordinates', () => {
    const [first] = computeWindows(4)
    expect(first).toEqual({ x: 60, y: 60, width: STRIP_WIDTH - 120, height: WINDOW_HEIGHT })
  })

  it('stacks windows by height + gap', () => {
    const [, second] = computeWindows(4)
    expect(second.y).toBe(60 + WINDOW_HEIGHT + 40)
  })
})
