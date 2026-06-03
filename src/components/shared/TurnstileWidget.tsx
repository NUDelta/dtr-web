'use client'

import { useEffect, useRef } from 'react'

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileRenderOptions {
  'sitekey': string
  'action'?: string
  'size'?: 'normal' | 'compact' | 'flexible'
  'theme'?: 'auto' | 'light' | 'dark'
  'callback'?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  siteKey: string
  action: string
  resetSignal: number
  onTokenChange: (token: string) => void
  className?: string
  size?: 'normal' | 'compact' | 'flexible'
}

let turnstileScriptPromise: Promise<void> | undefined

async function loadTurnstileScript(): Promise<void> {
  if (window.turnstile !== undefined) {
    return
  }

  if (turnstileScriptPromise !== undefined) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript !== null) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true })
    document.head.append(script)
  })

  return turnstileScriptPromise
}

export default function TurnstileWidget({
  siteKey,
  action,
  resetSignal,
  onTokenChange,
  className,
  size = 'compact',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (siteKey.length === 0) {
      return undefined
    }

    let cancelled = false

    void loadTurnstileScript()
      .then(() => {
        if (
          cancelled
          || containerRef.current === null
          || window.turnstile === undefined
          || widgetIdRef.current !== null
        ) {
          return
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          'sitekey': siteKey,
          'action': action,
          'size': size,
          'theme': 'auto',
          'callback': onTokenChange,
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => onTokenChange(''),
        })
      })
      .catch(() => onTokenChange(''))

    return () => {
      cancelled = true
      if (widgetIdRef.current !== null && window.turnstile !== undefined) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [action, onTokenChange, siteKey, size])

  useEffect(() => {
    if (widgetIdRef.current !== null && window.turnstile !== undefined) {
      window.turnstile.reset(widgetIdRef.current)
      onTokenChange('')
    }
  }, [onTokenChange, resetSignal])

  if (siteKey.length === 0) {
    return null
  }

  return <div ref={containerRef} className={className} />
}
