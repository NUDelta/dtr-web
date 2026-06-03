'use client'

import { useSyncExternalStore } from 'react'
import {
  formatDateTime,
  formatTime,
} from './format'

interface LocalTimeProps {
  mode: 'dateTime' | 'time'
  timestamp?: number
}

function subscribe(): () => void {
  return () => {}
}

export default function LocalTime({
  mode,
  timestamp,
}: LocalTimeProps) {
  const label = useSyncExternalStore(
    subscribe,
    () => mode === 'dateTime' ? formatDateTime(timestamp) : formatTime(timestamp),
    () => '-',
  )

  if (timestamp === undefined || !Number.isFinite(timestamp)) {
    return '-'
  }

  return (
    <time dateTime={new Date(timestamp).toISOString()}>
      {label}
    </time>
  )
}
