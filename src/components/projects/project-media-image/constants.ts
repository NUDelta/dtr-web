export const MIN_ZOOM = 1
export const MAX_ZOOM = 4
export const ZOOM_STEP = 0.5
export const ALIGNMENT_OVERFLOW_THRESHOLD = 64

export const focusableSelectors = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')
