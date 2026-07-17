import { describe, it, expect } from 'vitest'
import { BUILT_IN_FRAMES, DEFAULT_FRAME_ID, resolveFrame } from './frames'

describe('frames', () => {
  it('exposes four built-in frames with colors', () => {
    expect(BUILT_IN_FRAMES).toHaveLength(4)
    expect(BUILT_IN_FRAMES.every((f) => /^#[0-9a-f]{6}$/i.test(f.color))).toBe(true)
  })

  it('defaults to the first frame id', () => {
    expect(DEFAULT_FRAME_ID).toBe(BUILT_IN_FRAMES[0].id)
  })

  it('resolves a built-in when no custom upload is present', () => {
    const resolved = resolveFrame('teal', null)
    expect(resolved).toEqual({ kind: 'builtin', frame: BUILT_IN_FRAMES[1] })
  })

  it('prefers a custom upload over the selected id', () => {
    const resolved = resolveFrame('teal', 'data:image/png;base64,xyz')
    expect(resolved).toEqual({ kind: 'custom', dataUrl: 'data:image/png;base64,xyz' })
  })

  it('falls back to the first frame for an unknown id', () => {
    const resolved = resolveFrame('nope', null)
    expect(resolved).toEqual({ kind: 'builtin', frame: BUILT_IN_FRAMES[0] })
  })
})
