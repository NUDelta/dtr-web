const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

/**
 * Formats storage-size counters for audit summaries and UI chips.
 */
export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B'
  }

  let size = value
  let unitIndex = 0
  while (size >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formatted = size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)
  return `${formatted} ${BYTE_UNITS[unitIndex]}`
}
