export const STRIP_WIDTH = 1200

const MARGIN = 60
const GAP = 40
const FOOTER_HEIGHT = 300

// Window height is fixed; the strip's total height is what changes with count.
// Derived from the legacy 4-window layout: (3600 - 120 margins - 120 gaps - 300 footer) / 4.
export const WINDOW_HEIGHT = 765

export interface FrameWindow {
  x: number
  y: number
  width: number
  height: number
}

export function computeStripHeight(count: number): number {
  return MARGIN * 2 + FOOTER_HEIGHT + count * WINDOW_HEIGHT + (count - 1) * GAP
}

export function computeWindows(count: number): FrameWindow[] {
  return Array.from({ length: count }, (_, i) => ({
    x: MARGIN,
    y: MARGIN + i * (WINDOW_HEIGHT + GAP),
    width: STRIP_WIDTH - MARGIN * 2,
    height: WINDOW_HEIGHT
  }))
}
