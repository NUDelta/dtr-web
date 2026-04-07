'use client'

import type { DirectoryStatus } from './types'
import { useEffect, useMemo, useState } from 'react'
import { useSearchQuery } from '@/hooks/useSearch'
import {
  deriveSIGDirectoryItems,
  filterSIGDirectoryItems,
  getSIGCountsByStatus,
  getVisibleProjectCount,
} from './utils'

export const useProjectsDirectory = (sigs: SIG[]) => {
  const [status, setStatus] = useState<DirectoryStatus>('Active')
  const { query, setQuery, debouncedQuery, reset } = useSearchQuery('', 300)

  const directoryItems = useMemo(
    () => deriveSIGDirectoryItems(sigs),
    [sigs],
  )

  useEffect(() => {
    document.title = `Projects | DTR — ${status}`
  }, [status])

  const countsByStatus = useMemo(
    () => getSIGCountsByStatus(directoryItems),
    [directoryItems],
  )

  const filteredSigs = useMemo(
    () => filterSIGDirectoryItems(directoryItems, status, debouncedQuery),
    [directoryItems, status, debouncedQuery],
  )

  const visibleProjectCount = useMemo(
    () => filteredSigs.reduce((count, sig) => count + getVisibleProjectCount(sig, status), 0),
    [filteredSigs, status],
  )

  return {
    status,
    setStatus,
    countsByStatus,
    filteredSigs,
    visibleProjectCount,
    query,
    setQuery,
    debouncedQuery,
    reset,
  }
}
