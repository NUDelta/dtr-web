export function formatTime(timestamp: number | undefined): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function formatDateTime(timestamp: number | undefined): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}

export function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) {
    return 'no recent run'
  }

  const diffMs = Date.now() - timestamp
  if (diffMs < 60_000) {
    return 'just now'
  }

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  return hours < 48 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
}

export function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined || !Number.isFinite(durationMs)) {
    return '-'
  }

  if (durationMs < 100) {
    return `${(durationMs / 1000).toFixed(2)}s`
  }

  if (durationMs < 1000) {
    return `${(durationMs / 1000).toFixed(1)}s`
  }

  const seconds = Math.round(durationMs / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`
}
