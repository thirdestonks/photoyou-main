const IN_APP_BROWSER_PATTERN = /FBAN|FBAV|Instagram|Line\//i

export function isInAppBrowser(userAgent: string = navigator.userAgent): boolean {
  return IN_APP_BROWSER_PATTERN.test(userAgent)
}

export function isAndroid(userAgent: string = navigator.userAgent): boolean {
  return /Android/i.test(userAgent)
}

/**
 * Builds an Android `intent://` URL that asks the OS to open `targetUrl` in a
 * specific browser package, falling back to `targetUrl` itself if that
 * browser isn't installed. Has no iOS equivalent — Apple's WebKit sandboxing
 * blocks in-app browsers from launching another browser app.
 */
export function buildAndroidIntentUrl(targetUrl: string, androidPackage: string): string {
  const { protocol, host, pathname, search, hash } = new URL(targetUrl)
  const scheme = protocol.replace(':', '')
  const rest = `${host}${pathname}${search}${hash}`
  return `intent://${rest}#Intent;scheme=${scheme};package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`
}
