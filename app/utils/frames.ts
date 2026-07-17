export interface FrameDecoration {
  glyph: string
}

export interface BuiltInFrame {
  id: string
  label: string
  color: string
  decoration?: FrameDecoration
}

export const BUILT_IN_FRAMES: BuiltInFrame[] = [
  { id: 'red', label: 'Red', color: '#c1443a' },
  { id: 'teal', label: 'Teal', color: '#2f7a71' },
  { id: 'pink-heart', label: 'Pink Heart', color: '#d9668c', decoration: { glyph: '♥' } },
  { id: 'yellow-star', label: 'Yellow Star', color: '#e0a72e', decoration: { glyph: '★' } }
]

export const DEFAULT_FRAME_ID = BUILT_IN_FRAMES[0].id

export type ResolvedFrame =
  | { kind: 'builtin'; frame: BuiltInFrame }
  | { kind: 'custom'; dataUrl: string }

export function resolveFrame(
  selectedFrameId: string,
  customFrameDataUrl: string | null
): ResolvedFrame {
  if (customFrameDataUrl) return { kind: 'custom', dataUrl: customFrameDataUrl }
  const frame = BUILT_IN_FRAMES.find((f) => f.id === selectedFrameId) ?? BUILT_IN_FRAMES[0]
  return { kind: 'builtin', frame }
}
