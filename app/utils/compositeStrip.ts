import { STRIP_WIDTH, computeStripHeight, computeWindows } from './frameContract'
import type { ResolvedFrame } from './frames'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

// Like CSS `object-fit: cover`: crops the source (centered) to match the
// destination's aspect ratio before scaling, so photos always fill their
// window without stretching — regardless of the camera's native resolution.
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const sourceRatio = img.width / img.height
  const destRatio = dw / dh

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (sourceRatio > destRatio) {
    sw = img.height * destRatio
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / destRatio
    sy = (img.height - sh) / 2
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

const FOOTER_TEXT = 'POCKET BOOTH · made by Thirde ♥'
const CAPTION_COLOR = '#f2e9d8'

export async function compositeStrip(photos: string[], frame: ResolvedFrame): Promise<Blob> {
  const count = photos.length
  const stripHeight = computeStripHeight(count)

  const canvas = document.createElement('canvas')
  canvas.width = STRIP_WIDTH
  canvas.height = stripHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // Background layer. Photos draw on top at their windows, so the margins/gaps
  // filled here form the visible borders (no cutouts needed).
  if (frame.kind === 'custom') {
    const frameImage = await loadImage(frame.dataUrl)
    // Stretch-to-fit the dynamic strip size.
    ctx.drawImage(frameImage, 0, 0, STRIP_WIDTH, stripHeight)
  } else {
    ctx.fillStyle = frame.frame.color
    ctx.fillRect(0, 0, STRIP_WIDTH, stripHeight)
    if (frame.frame.decoration) {
      ctx.fillStyle = CAPTION_COLOR
      ctx.font = '90px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(frame.frame.decoration.glyph, 1080, 140)
    }
  }

  const photoImages = await Promise.all(photos.map(loadImage))
  const windows = computeWindows(count)
  photoImages.forEach((img, i) => {
    const win = windows[i]
    if (!win) return
    drawImageCover(ctx, img, win.x, win.y, win.width, win.height)
  })

  // Footer caption, anchored to the bottom of the (dynamic) strip.
  ctx.fillStyle = CAPTION_COLOR
  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(FOOTER_TEXT, STRIP_WIDTH / 2, stripHeight - 150)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export strip'))
    }, 'image/png')
  })
}
