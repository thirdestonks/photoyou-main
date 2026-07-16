import { STRIP_WIDTH, STRIP_HEIGHT, FRAME_WINDOWS } from './frameContract'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export async function compositeStrip(photos: string[], frameSrc: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = STRIP_WIDTH
  canvas.height = STRIP_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  ctx.fillStyle = '#f2e9d8'
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT)

  // Frame draws first as a background layer, then photos draw on top at their
  // fixed windows — the photos act as a stencil over whatever the frame is.
  // This means built-in frames (authored with transparent window cutouts)
  // and arbitrary custom uploads (fully opaque, no cutouts) both work: the
  // photos are always visible, and the frame shows through everywhere else.
  const frameImage = await loadImage(frameSrc)
  ctx.drawImage(frameImage, 0, 0, STRIP_WIDTH, STRIP_HEIGHT)

  const photoImages = await Promise.all(photos.map(loadImage))
  photoImages.forEach((img, i) => {
    const win = FRAME_WINDOWS[i]
    if (!win) return
    ctx.drawImage(img, win.x, win.y, win.width, win.height)
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export strip'))
    }, 'image/png')
  })
}
