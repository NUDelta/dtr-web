import { Mail, MailCheck, X } from 'lucide-react'

interface LetterSubscribeTriggerProps {
  hasSubscribed: boolean
  onOpen: () => void
  onClose: () => void
  open: boolean
  formId: string
}

export default function LetterSubscribeTrigger({
  hasSubscribed,
  onOpen,
  onClose,
  open,
  formId,
}: LetterSubscribeTriggerProps) {
  if (hasSubscribed) {
    return (
      <span
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-1 text-sm text-slate-400"
      >
        <MailCheck size={14} aria-hidden="true" className="shrink-0" />
        Subscribed!
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={open ? onClose : onOpen}
      aria-expanded={open}
      aria-controls={formId}
      className={`${open ? 'hidden sm:flex' : 'flex'} items-center gap-1 text-sm text-slate-400 hover:text-yellow-600 transition-colors bg-transparent border-none cursor-pointer p-0`}
    >
      {open
        ? <X size={14} aria-hidden="true" className="shrink-0" />
        : (
            <>
              <Mail size={14} aria-hidden="true" className="shrink-0" />
              Subscribe
            </>
          )}
    </button>
  )
}
