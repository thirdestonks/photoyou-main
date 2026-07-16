import { defineStore } from 'pinia'
import { FILTERS } from '../utils/filters'
import { DEFAULT_FRAME_ID } from '../utils/frames'

export type BoothStep = 'intro' | 'capture' | 'frame' | 'result'
export type CaptureMode = 'auto' | 'manual'

const MAX_PHOTOS = 4

export interface BoothState {
  step: BoothStep
  photos: string[]
  filterId: string
  mode: CaptureMode
  selectedFrameId: string
  customFrameDataUrl: string | null
}

export const useBoothStore = defineStore('booth', {
  state: (): BoothState => ({
    step: 'intro',
    photos: [],
    filterId: FILTERS[0].id,
    mode: 'auto',
    selectedFrameId: DEFAULT_FRAME_ID,
    customFrameDataUrl: null
  }),
  actions: {
    goTo(step: BoothStep) {
      this.step = step
    },
    setMode(mode: CaptureMode) {
      this.mode = mode
    },
    setFilter(filterId: string) {
      this.filterId = filterId
    },
    capturePhoto(dataUrl: string) {
      if (this.photos.length >= MAX_PHOTOS) return
      this.photos.push(dataUrl)
      if (this.photos.length >= MAX_PHOTOS) {
        this.step = 'frame'
      }
    },
    setFrame(frameId: string) {
      this.selectedFrameId = frameId
      this.customFrameDataUrl = null
    },
    setCustomFrame(dataUrl: string) {
      this.customFrameDataUrl = dataUrl
    },
    retake() {
      this.photos = []
      this.step = 'capture'
    },
    reset() {
      this.step = 'intro'
      this.photos = []
      this.filterId = FILTERS[0].id
      this.mode = 'auto'
      this.selectedFrameId = DEFAULT_FRAME_ID
      this.customFrameDataUrl = null
    }
  }
})
