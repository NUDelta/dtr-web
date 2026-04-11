'use client'

import { useRef, useState } from 'react'

const APPS_SCRIPT_URL
  = 'https://script.google.com/macros/s/AKfycbxevdtm_cTmBNb-v0hUFQTMPCuHaTz4WSpN9sAATfVfGTsJxavToynppDv4Qs8KO3ffeQ/exec'

export default function LetterSubscribe() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  function toggle() {
    setOpen((prev) => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      return !prev
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = inputRef.current?.value?.trim() ?? ''
    if (!email) {
      return
    }
    setStatus('sending')
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams({ email }),
    })
      .then(() => { setStatus('done') })
      .catch(() => { setStatus('error') })
  }

  if (status === 'done') {
    return <span className="text-sm text-slate-400">✓ subscribed!</span>
  }

  return (
    // On mobile when open: w-full so it wraps to its own row below the heading
    // On sm+: auto width, stays inline
    <div className={`flex items-center gap-2 ${open ? 'w-full sm:w-auto' : ''}`}>

      {/* Toggle button
          Mobile: visible when closed, hidden when open (✕ lives inside the form instead)
          Desktop: always visible, shows ✕ when open */}
      <button
        onClick={toggle}
        aria-expanded={open}
        className={`${open ? 'hidden sm:flex' : 'flex'} items-center gap-1 text-sm text-slate-400 hover:text-yellow-600 transition-colors bg-transparent border-none cursor-pointer p-0`}
      >
        {open
          ? '✕'
          : (
              <>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="1" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M1 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                subscribe
              </>
            )}
      </button>

      {/* Form
          Mobile: hidden when closed, full-width flex row when open
          Desktop: always in DOM, slide-out via max-width animation */}
      <form
        onSubmit={handleSubmit}
        aria-hidden={!open}
        className={[
          'items-center gap-2 overflow-hidden',
          'sm:flex sm:transition-all sm:duration-300 sm:ease-in-out',
          open
            ? 'flex flex-1 sm:flex-none sm:max-w-xs sm:opacity-100 pointer-events-auto'
            : 'hidden sm:max-w-0 sm:opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Cancel button inside form — mobile only */}
        <button
          type="button"
          onClick={toggle}
          className="sm:hidden text-sm text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer px-1 p-0"
        >
          ✕
        </button>
        <input
          ref={inputRef}
          type="email"
          required
          placeholder="your@email.com"
          className="w-44 text-sm px-2.5 py-1 border border-slate-300 rounded-md outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 transition-shadow"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md whitespace-nowrap transition-colors disabled:opacity-60 cursor-pointer border-none"
        >
          {status === 'sending' ? 'Sending…' : 'Subscribe'}
        </button>
        {status === 'error' && (
          <span className="text-xs text-red-500">Try again.</span>
        )}
      </form>
    </div>
  )
}
