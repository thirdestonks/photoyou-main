import { describe, it, expect } from 'vitest'
import { readFileAsDataUrl } from './dataUrl'

describe('readFileAsDataUrl', () => {
  it('resolves a data URL string for a file', async () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const result = await readFileAsDataUrl(file)
    expect(result).toMatch(/^data:text\/plain/)
  })
})
