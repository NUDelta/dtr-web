import type { ImageViewerLifecycleOptions } from './types'
import { useEffect } from 'react'
import { focusableSelectors } from './constants'

export function useImageViewerLifecycle({
  dialogRef,
  onClose,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  open,
  triggerRef,
}: ImageViewerLifecycleOptions) {
  useEffect(() => {
    if (!open) {
      return
    }

    const body = document.body
    const originalOverflow = body.style.overflow
    const triggerButton = triggerRef.current
    body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      else if (event.key === 'Tab') {
        trapDialogFocus(event, dialogRef.current)
      }
      else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        onZoomIn()
      }
      else if (event.key === '-') {
        event.preventDefault()
        onZoomOut()
      }
      else if (event.key === '0') {
        event.preventDefault()
        onResetZoom()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerButton?.focus()
    }
  }, [dialogRef, onClose, onResetZoom, onZoomIn, onZoomOut, open, triggerRef])
}

function trapDialogFocus(event: KeyboardEvent, dialog: HTMLDivElement | null) {
  if (dialog === null) {
    return
  }

  const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelectors))
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
