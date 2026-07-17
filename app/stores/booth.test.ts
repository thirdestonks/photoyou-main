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

  it('defaults to 4 shots and a 5s timer', () => {
    const store = useBoothStore()
    expect(store.shotCount).toBe(4)
    expect(store.timerSeconds).toBe(5)
  })

  it('advances to the frame step once shotCount photos are captured (default 4)', () => {
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

  it('advances at 2 photos when shotCount is 2, ignoring extras', () => {
    const store = useBoothStore()
    store.setShotCount(2)
    store.goTo('capture')
    store.capturePhoto('data:image/png;base64,1')
    expect(store.step).toBe('capture')
    store.capturePhoto('data:image/png;base64,2')
    expect(store.step).toBe('frame')
    store.capturePhoto('data:image/png;base64,3')
    expect(store.photos).toHaveLength(2)
  })

  it('advances at 3 photos when shotCount is 3', () => {
    const store = useBoothStore()
    store.setShotCount(3)
    store.goTo('capture')
    for (let i = 0; i < 3; i++) store.capturePhoto(`data:image/png;base64,${i}`)
    expect(store.step).toBe('frame')
    expect(store.photos).toHaveLength(3)
  })

  it('setTimerSeconds updates the timer', () => {
    const store = useBoothStore()
    store.setTimerSeconds(3)
    expect(store.timerSeconds).toBe(3)
  })

  it('retake clears photos and returns to capture', () => {
    const store = useBoothStore()
    for (let i = 0; i < 4; i++) store.capturePhoto(`data:image/png;base64,${i}`)
    store.retake()
    expect(store.step).toBe('capture')
    expect(store.photos).toHaveLength(0)
  })

  it('reset restores all defaults including shotCount and timerSeconds', () => {
    const store = useBoothStore()
    store.goTo('frame')
    store.setFilter('sepia')
    store.setShotCount(2)
    store.setTimerSeconds(10)
    store.reset()
    expect(store.step).toBe('intro')
    expect(store.filterId).toBe('normal')
    expect(store.shotCount).toBe(4)
    expect(store.timerSeconds).toBe(5)
  })
})
