import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBoothStore } from './booth'

describe('useBoothStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts on the intro step with no photos', () => {
    const store = useBoothStore()
    expect(store.step).toBe('intro')
    expect(store.photos).toHaveLength(0)
  })

  it('advances to the frame step once 4 photos are captured', () => {
    const store = useBoothStore()
    store.goTo('capture')
    store.capturePhoto('data:image/png;base64,1')
    store.capturePhoto('data:image/png;base64,2')
    store.capturePhoto('data:image/png;base64,3')
    expect(store.step).toBe('capture')
    store.capturePhoto('data:image/png;base64,4')
    expect(store.step).toBe('frame')
    expect(store.photos).toHaveLength(4)
  })

  it('ignores extra captures beyond 4 photos', () => {
    const store = useBoothStore()
    for (let i = 0; i < 5; i++) store.capturePhoto(`data:image/png;base64,${i}`)
    expect(store.photos).toHaveLength(4)
  })

  it('retake clears photos and returns to capture', () => {
    const store = useBoothStore()
    for (let i = 0; i < 4; i++) store.capturePhoto(`data:image/png;base64,${i}`)
    store.retake()
    expect(store.step).toBe('capture')
    expect(store.photos).toHaveLength(0)
  })

  it('reset restores all defaults', () => {
    const store = useBoothStore()
    store.goTo('frame')
    store.setFilter('sepia')
    store.reset()
    expect(store.step).toBe('intro')
    expect(store.filterId).toBe('normal')
  })
})
