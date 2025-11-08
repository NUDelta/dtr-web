'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  headingLevel = 2,
  children,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true)
  }, [])

  // Lock body scrolling
  useEffect(() => {
    if (!mounted || !open) {
      return
    }
    const body = document.body
    const originalOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = originalOverflow
    }
  }, [mounted, open])

  // Focus management + ESC / Tab trap
  useEffect(() => {
    if (!mounted || !open) {
      return
    }
    const dialogEl = dialogRef.current
    if (!dialogEl) {
      return
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // Initial focus: try to find the first focusable element, otherwise focus the dialog
    const focusable = dialogEl.querySelectorAll<HTMLElement>(
      focusableSelectors,
    )
    const first = focusable[0] ?? dialogEl
    first.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const nodes = dialogEl.querySelectorAll<HTMLElement>(
          focusableSelectors,
        )
        if (!nodes.length) {
          return
        }

        const firstEl = nodes[0]
        const lastEl = nodes[nodes.length - 1]

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstEl) {
            event.preventDefault()
            lastEl.focus()
          }
        }
        else {
          // Tab
          if (document.activeElement === lastEl) {
            event.preventDefault()
            firstEl.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      // Return focus back
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [mounted, open, onClose])

  if (!mounted) {
    return null
  }
  if (typeof document === 'undefined') {
    return null
  }

  const HeadingTag = `h${Math.min(
    Math.max(headingLevel, 1),
    6,
  )}` as keyof React.JSX.IntrinsicElements

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title !== undefined ? titleId : undefined}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white p-4 shadow-xl"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b pb-3">
              <div>
                {title !== undefined && (
                  <HeadingTag
                    id={titleId}
                    className="text-base font-semibold leading-tight"
                  >
                    {title}
                  </HeadingTag>
                )}
                {subtitle !== undefined && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-1 text-gray-500 hover:bg-black/5 hover:text-gray-800"
              >
                ×
              </button>
            </header>

            <div
              id={descriptionId}
              className="mt-3 max-h-[60vh] overflow-y-auto text-sm"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
