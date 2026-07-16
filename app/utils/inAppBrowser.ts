const IN_APP_BROWSER_PATTERN = /FBAN|FBAV|Instagram|Line\//i

export function isInAppBrowser(userAgent: string = navigator.userAgent): boolean {
  return IN_APP_BROWSER_PATTERN.test(userAgent)
}
