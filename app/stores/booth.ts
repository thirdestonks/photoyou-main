import { defineStore } from 'pinia'
import { FILTERS } from '../utils/filters'
import { DEFAULT_FRAME_ID } from '../utils/frames'

export type BoothStep = 'intro' | 'capture' | 'frame' | 'result'
export type CaptureMode = 'auto' | 'manual'
export type ShotCount = 2 | 3 | 4
export type TimerSeconds = 3 | 5 | 10

export interface BoothState {
  step: BoothStep
  photos: string[]
  filterId: string
  mode: CaptureMode
  selectedFrameId: string
  customFrameDataUrl: string | null
  shotCount: ShotCount
  timerSeconds: TimerSeconds
}

export const useBoothStore = defineStore('booth', {
  state: (): BoothState => ({
    step: 'intro',
    photos: [],
    filterId: FILTERS[0].id,
    mode: 'auto',
    selectedFrameId: DEFAULT_FRAME_ID,
    customFrameDataUrl: null,
    shotCount: 4,
    timerSeconds: 5
  }),
  actions: {
    goTo(step: BoothStep) {
      this.step = step
    },
    setMode(mode: CaptureMode) {
      this.mode = mode
    },
    setShotCount(shotCount: ShotCount) {
      this.shotCount = shotCount
    },
    setTimerSeconds(timerSeconds: TimerSeconds) {
      this.timerSeconds = timerSeconds
    },
    setFilter(filterId: string) {
      this.filterId = filterId
    },
    capturePhoto(dataUrl: string) {
      if (this.photos.length >= this.shotCount) return
      this.photos.push(dataUrl)
      if (this.photos.length >= this.shotCount) {
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
      this.shotCount = 4
      this.timerSeconds = 5
    }
  }
})
