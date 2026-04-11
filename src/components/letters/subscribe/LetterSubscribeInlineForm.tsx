import type { useLetterSubscribe } from './useLetterSubscribe'
import { getErrorMessage } from './utils'

interface LetterSubscribeInlineFormProps {
  subscribe: ReturnType<typeof useLetterSubscribe>
}

export default function LetterSubscribeInlineForm({
  subscribe,
}: LetterSubscribeInlineFormProps) {
  const {
    clearSubmitError,
    closeForm,
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
    <form
      id={formId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      aria-hidden={!open}
      className={[
        'items-center gap-2 overflow-hidden',
        'sm:flex sm:transition-opacity sm:duration-300 sm:ease-in-out',
        open
          ? 'flex flex-1 sm:flex-none sm:max-w-xs sm:opacity-100 pointer-events-auto'
          : 'hidden sm:max-w-0 sm:opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <form.Field
        name="email"
        validators={{
          onChange: emailSchema,
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
            : undefined

          return (
            <div className="relative flex min-w-0 flex-1">
              <label htmlFor={emailId} className="sr-only">
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
                placeholder="your@email.com"
                className={`w-44 min-w-0 text-sm px-2.5 py-1 border rounded-md outline-none transition-shadow focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 ${
                  hasFieldError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200/60'
                    : 'border-slate-300'
                }`}
              />

              {hasFieldError && (
                <p
                  id={fieldErrorId}
                  className="absolute top-full left-0 mt-1 rounded bg-white/95 px-1 text-[11px] text-red-500 shadow-sm"
                >
                  {fieldError}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={state => ({
        canSubmit: state.canSubmit,
        email: state.values.email,
        isSubmitting: state.isSubmitting,
      })}
      >
        {({ canSubmit, email, isSubmitting }) => {
          const submitDisabled = email.trim().length === 0 || !canSubmit || isSubmitting

          return (
            <>
              <button
                type="submit"
                disabled={submitDisabled}
                className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 cursor-pointer border-none"
              >
                {isSubmitting ? 'Sending…' : 'Subscribe'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="sm:hidden text-sm text-slate-400 bg-transparent border-none cursor-pointer px-1 p-0 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Close subscribe form"
              >
                ✕
              </button>
            </>
          )
        }}
      </form.Subscribe>

      {submitError !== null && (
        <p
          id={formMessageId}
          role="alert"
          className="sr-only"
        >
          {submitError}
        </p>
      )}
    </form>
  )
}
