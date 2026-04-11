import type { useLetterSubscribe } from './useLetterSubscribe'
import { Modal } from '@/components/shared'
import { getErrorMessage } from './utils'

interface LetterSubscribeDialogProps {
  subscribe: ReturnType<typeof useLetterSubscribe>
}

export default function LetterSubscribeDialog({
  subscribe,
}: LetterSubscribeDialogProps) {
  const {
    closeForm,
    clearSubmitError,
    emailId,
    emailSchema,
    fieldErrorId,
    form,
    formId,
    formMessageId,
    inputRef,
    open,
    submitError,
  } = subscribe

  return (
    <Modal
      open={open}
      onClose={closeForm}
      title="Subscribe to future letters"
      subtitle="We’ll only email you when a new annual letter is published."
    >
      <form
        id={formId}
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="email"
          validators={{
            onBlur: emailSchema,
            onSubmit: emailSchema,
          }}
        >
          {(field) => {
            const fieldError = getErrorMessage(field.state.meta.errors)
            const hasFieldError = fieldError !== null
            const hasSubmitError = submitError !== null
            const describedByIds: string[] = []

            if (hasFieldError) {
              describedByIds.push(fieldErrorId)
            }

            if (hasSubmitError) {
              describedByIds.push(formMessageId)
            }

            const describedBy = describedByIds.length > 0
              ? describedByIds.join(' ')
              : formMessageId

            return (
              <div className="space-y-2">
                <label htmlFor={emailId} className="block text-sm font-medium text-slate-900">
                  Email address
                </label>

                <input
                  ref={inputRef}
                  id={emailId}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  spellCheck={false}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    if (submitError !== null) {
                      clearSubmitError()
                    }
                    field.handleChange(event.target.value)
                  }}
                  aria-invalid={hasFieldError ? true : undefined}
                  aria-describedby={describedBy}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base outline-none transition-shadow focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                />

                {hasFieldError && (
                  <p id={fieldErrorId} className="text-xs text-red-600">
                    {fieldError}
                  </p>
                )}
              </div>
            )
          }}
        </form.Field>

        {submitError !== null
          ? (
              <p id={formMessageId} role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )
          : (
              <p id={formMessageId} className="text-sm text-slate-500">
                Use the address where you’d like future annual letters delivered.
              </p>
            )}

        <form.Subscribe selector={state => state.isSubmitting}>
          {isSubmitting => (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}
