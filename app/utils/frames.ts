export interface BoothFrame {
  id: string
  label: string
  src: string
}

export const BUILT_IN_FRAMES: BoothFrame[] = [
  { id: 'red', label: 'Red', src: '/frames/red.svg' },
  { id: 'teal', label: 'Teal', src: '/frames/teal.svg' },
  { id: 'pink-heart', label: 'Pink Heart', src: '/frames/pink-heart.svg' },
  { id: 'yellow-star', label: 'Yellow Star', src: '/frames/yellow-star.svg' }
]

export const DEFAULT_FRAME_ID = BUILT_IN_FRAMES[0].id

export function getFrameSrc(id: string): string | undefined {
  return BUILT_IN_FRAMES.find((f) => f.id === id)?.src
}

export function resolveFrameSrc(
  selectedFrameId: string,
  customFrameDataUrl: string | null
): string {
  return customFrameDataUrl ?? getFrameSrc(selectedFrameId) ?? BUILT_IN_FRAMES[0].src
}
