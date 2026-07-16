import { ref, onBeforeUnmount, type Ref } from 'vue'

export interface UseCameraResult {
  videoRef: Ref<HTMLVideoElement | null>
  error: Ref<string | null>
  isReady: Ref<boolean>
  start: () => Promise<void>
  stop: () => void
  captureFrame: (cssFilter: string) => string | null
}

export function useCamera(): UseCameraResult {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const error = ref<string | null>(null)
  const isReady = ref(false)
  let stream: MediaStream | null = null

  async function start() {
    error.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        await videoRef.value.play()
      }
      isReady.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Camera unavailable'
      isReady.value = false
    }
  }

  function stop() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    isReady.value = false
  }

  // Matches the viewfinder's `aspect-[3/4]` container (CaptureScreen.vue) so
  // the captured photo is a WYSIWYG match for what was actually posed for in
  // the live preview, instead of the camera's full raw, uncropped frame.
  const CAPTURE_ASPECT = 3 / 4

  function captureFrame(cssFilter: string): string | null {
    const video = videoRef.value
    if (!video || !isReady.value) return null

    // Crop the raw video frame to CAPTURE_ASPECT (centered), the same way
    // the CSS `object-cover` viewfinder crops what's shown live — otherwise
    // the saved photo includes far more of the room than the user saw.
    const videoRatio = video.videoWidth / video.videoHeight
    let sx = 0
    let sy = 0
    let sw = video.videoWidth
    let sh = video.videoHeight
    if (videoRatio > CAPTURE_ASPECT) {
      sw = video.videoHeight * CAPTURE_ASPECT
      sx = (video.videoWidth - sw) / 2
    } else {
      sh = video.videoWidth / CAPTURE_ASPECT
      sy = (video.videoHeight - sh) / 2
    }

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.filter = cssFilter
    // Mirror horizontally so the saved photo matches the mirrored live preview
    // (selfie-style, like looking in a mirror) rather than the raw camera feed.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  }

  onBeforeUnmount(() => stop())

  return { videoRef, error, isReady, start, stop, captureFrame }
}
