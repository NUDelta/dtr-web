'use client'

import { useEffect, useState } from 'react'

/** Small debounce utility hook */
export const useDebouncedValue = <T>(value: T, delay = 250): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Search state hook: query + debouncedQuery + helpers */
export const useSearchQuery = (initial = '', debounceMs = 300) => {
  const [query, setQuery] = useState(initial)
  const debouncedQuery = useDebouncedValue(query, debounceMs)
  const reset = () => setQuery('')
  return { query, setQuery, debouncedQuery, reset }
}
