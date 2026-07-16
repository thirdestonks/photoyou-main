import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function crc32(buf) {
  const table = crc32.table ?? (crc32.table = (() => {
    const t = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      }
      t[n] = c
    }
    return t
  })())
  let crc = 0xffffffff
  for (const byte of buf) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

// Rounded-rect hit test: clamp the point to the "core" rect (inset by
// radius on each side), then check the clamped point is within `radius`
// of the original point. Points in the straight edges/center always pass
// (one clamp axis lands exactly on the point); only corners get cut.
function inRoundedRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false
  const nearestX = Math.min(Math.max(x, rx + radius), rx + rw - radius)
  const nearestY = Math.min(Math.max(y, ry + radius), ry + rh - radius)
  const dx = x - nearestX
  const dy = y - nearestY
  return dx * dx + dy * dy <= radius * radius
}

// Icon: teal background, a cream photo-strip shape (with 3 dividers, like
// the app's 4-shot strip) and a small yellow sparkle accent — matches the
// app's own palette/motifs instead of a flat placeholder square.
function pixelColor(x, y, size) {
  const TEAL = [47, 122, 113]
  const CREAM = [242, 233, 216]
  const YELLOW = [224, 167, 46]

  const sw = size * 0.42
  const sh = size * 0.74
  const sx = (size - sw) / 2
  const sy = (size - sh) / 2
  const radius = size * 0.06

  if (inRoundedRect(x, y, sx, sy, sw, sh, radius)) {
    const relY = (y - sy) / sh
    const isDivider = [0.25, 0.5, 0.75].some((f) => Math.abs(relY - f) < 0.02)
    if (!isDivider) return CREAM
  }

  const starCx = size * 0.24
  const starCy = size * 0.22
  const dx = Math.abs(x - starCx)
  const dy = Math.abs(y - starCy)
  const wideArm = dx / (size * 0.1) + dy / (size * 0.032) <= 1
  const tallArm = dx / (size * 0.032) + dy / (size * 0.1) <= 1
  if (wideArm || tallArm) return YELLOW

  return TEAL
}

function makeIconPng(size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: RGB

  const rowLen = size * 3 + 1
  const raw = Buffer.alloc(rowLen * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLen
    raw[rowStart] = 0 // filter type: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelColor(x, y, size)
      const px = rowStart + 1 + x * 3
      raw[px] = r
      raw[px + 1] = g
      raw[px + 2] = b
    }
  }
  const idat = deflateSync(raw)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', makeIconPng(192))
writeFileSync('public/icons/icon-512.png', makeIconPng(512))
console.log('Generated public/icons/icon-192.png and icon-512.png')
