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
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-yellow-600 transition-colors bg-transparent border-none cursor-pointer p-0"
        aria-expanded={open}
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

      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <input
          ref={inputRef}
          type="email"
          required
          placeholder="your@email.com"
          className="text-sm px-2.5 py-1 border border-slate-300 rounded-md w-44 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 transition-shadow"
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
