export interface BoothFilter {
  id: string
  label: string
  cssFilter: string
}

export const FILTERS: BoothFilter[] = [
  { id: 'normal', label: 'Normal', cssFilter: 'none' },
  { id: 'noir', label: 'Noir', cssFilter: 'grayscale(1) contrast(1.1)' },
  { id: 'sepia', label: 'Sepia', cssFilter: 'sepia(0.8)' },
  { id: 'film', label: 'Film', cssFilter: 'contrast(1.15) saturate(1.2) brightness(0.95)' },
  { id: 'glow', label: 'Glow', cssFilter: 'brightness(1.1) saturate(1.3) blur(0.3px)' }
]

export function getFilterById(id: string): BoothFilter {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0]
}
