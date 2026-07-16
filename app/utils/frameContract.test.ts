import { describe, it, expect } from 'vitest'
import { STRIP_WIDTH, STRIP_HEIGHT, FRAME_WINDOWS } from './frameContract'

describe('frameContract', () => {
  it('defines exactly 4 photo windows', () => {
    expect(FRAME_WINDOWS).toHaveLength(4)
  })

  it('keeps every window inside the strip bounds', () => {
    for (const win of FRAME_WINDOWS) {
      expect(win.x + win.width).toBeLessThanOrEqual(STRIP_WIDTH)
      expect(win.y + win.height).toBeLessThanOrEqual(STRIP_HEIGHT)
    }
  })

  it('stacks windows top to bottom without overlap', () => {
    for (let i = 0; i < FRAME_WINDOWS.length - 1; i++) {
      const current = FRAME_WINDOWS[i]
      const next = FRAME_WINDOWS[i + 1]
      expect(current.y + current.height).toBeLessThanOrEqual(next.y)
    }
  })
})
