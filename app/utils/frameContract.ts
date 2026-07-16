export const STRIP_WIDTH = 1200
export const STRIP_HEIGHT = 3600

const MARGIN = 60
const GAP = 40
const FOOTER_HEIGHT = 300
const WINDOW_WIDTH = STRIP_WIDTH - MARGIN * 2
const WINDOW_HEIGHT = (STRIP_HEIGHT - MARGIN * 2 - GAP * 3 - FOOTER_HEIGHT) / 4

export interface FrameWindow {
  x: number
  y: number
  width: number
  height: number
}

export const FRAME_WINDOWS: FrameWindow[] = Array.from({ length: 4 }, (_, i) => ({
  x: MARGIN,
  y: MARGIN + i * (WINDOW_HEIGHT + GAP),
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT
}))
