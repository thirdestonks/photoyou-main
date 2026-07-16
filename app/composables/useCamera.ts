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

  function captureFrame(cssFilter: string): string | null {
    const video = videoRef.value
    if (!video || !isReady.value) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.filter = cssFilter
    // Mirror horizontally so the saved photo matches the mirrored live preview
    // (selfie-style, like looking in a mirror) rather than the raw camera feed.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  }

  onBeforeUnmount(() => stop())

  return { videoRef, error, isReady, start, stop, captureFrame }
}
