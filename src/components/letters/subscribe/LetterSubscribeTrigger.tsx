import { CheckCircle2, MailPlus } from 'lucide-react'

interface LetterSubscribeTriggerProps {
  hasSubscribed: boolean
  onOpen: () => void
  open: boolean
  formId: string
}

export default function LetterSubscribeTrigger({
  hasSubscribed,
  onOpen,
  open,
  formId,
}: LetterSubscribeTriggerProps) {
  if (hasSubscribed) {
    return (
      <div className="not-prose flex w-full sm:w-auto sm:justify-end">
        <p
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow-sm"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          Thanks, you&apos;re subscribed.
        </p>
      </div>
    )
  }

  return (
    <div className="not-prose flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-yellow-400 hover:bg-yellow-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 sm:w-auto"
        aria-expanded={open}
        aria-controls={formId}
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-yellow-200 text-yellow-900">
          <MailPlus size={16} aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          Subscribe for future letters
        </span>
      </button>

      <p className="px-1 pb-2 md:pb-1 text-xs text-slate-500 sm:max-w-72 sm:text-right">
        Get an email when the next annual letter is published.
      </p>
    </div>
  )
}
