import { describe, it, expect } from 'vitest'
import { isInAppBrowser } from './inAppBrowser'

describe('isInAppBrowser', () => {
  it('detects Facebook/Messenger in-app browser', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 [FBAN/MessengerForiOS;FBAV/400.0]'
    expect(isInAppBrowser(ua)).toBe(true)
  })

  it('detects Instagram in-app browser', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Instagram 300.0.0.0'
    expect(isInAppBrowser(ua)).toBe(true)
  })

  it('does not flag regular mobile Safari', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    expect(isInAppBrowser(ua)).toBe(false)
  })

  it('does not flag desktop Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(isInAppBrowser(ua)).toBe(false)
  })
})
