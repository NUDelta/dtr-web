'use client'

import { useEffect } from 'react'
import { refreshAuditSession } from '@/app/audit/actions'

interface AuditSessionRefresherProps {
  enabled: boolean
}

export default function AuditSessionRefresher({
  enabled,
}: AuditSessionRefresherProps) {
  useEffect(() => {
    if (enabled) {
      void refreshAuditSession()
    }
  }, [enabled])

  return null
}
