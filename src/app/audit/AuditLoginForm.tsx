'use client'

import { LoaderCircle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'

interface AuditLoginFormProps {
  action: (formData: FormData) => void | Promise<void>
  auth?: string
  turnstileSiteKey: string
}

function LoginError({ auth }: { auth?: string }) {
  if (auth === 'failed') {
    return (
      <p id="audit-login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        Invalid ops token.
      </p>
    )
  }

  if (auth === 'challenge') {
    return (
      <p id="audit-login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        Complete the verification challenge.
      </p>
    )
  }

  return null
}

function AuditLoginFields({
  auth,
  submitted,
  turnstileSiteKey,
}: Pick<AuditLoginFormProps, 'auth' | 'turnstileSiteKey'> & {
  submitted: boolean
}) {
  const { pending } = useFormStatus()
  const isSubmitting = pending || submitted
  const hasTokenError = auth === 'failed'
  const hasAuthMessage = auth === 'failed' || auth === 'challenge'

  return (
    <>
      <LoginError auth={auth} />
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
        Ops token
        <input
          className="h-12 rounded-xl border border-neutral-200 bg-white px-3 text-base text-neutral-950 shadow-xs outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/50 disabled:cursor-wait disabled:bg-neutral-50"
          name="token"
          placeholder="OPS_SECRET"
          type="password"
          disabled={isSubmitting}
          autoComplete="off"
          aria-invalid={hasTokenError}
          aria-describedby={hasAuthMessage ? 'audit-login-error' : undefined}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          className="size-4 rounded border-neutral-300 accent-neutral-950"
          name="remember"
          type="checkbox"
          disabled={isSubmitting}
        />
        Remember me for 60 days
      </label>
      <div
        className="cf-turnstile min-h-16"
        data-action="audit-login"
        data-sitekey={turnstileSiteKey}
      />
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-wait disabled:bg-neutral-700 disabled:shadow-none"
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
      >
        {isSubmitting
          ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          : <ShieldCheck className="size-4" aria-hidden="true" />}
        {isSubmitting ? 'Authenticating...' : 'View audit console'}
      </button>
      <p
        className="min-h-5 text-sm font-medium text-neutral-600 transition-opacity duration-200"
        aria-live="polite"
      >
        {isSubmitting ? 'Checking the token and verification challenge...' : ''}
      </p>
    </>
  )
}

export default function AuditLoginForm({
  action,
  auth,
  turnstileSiteKey,
}: AuditLoginFormProps) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <form
      action={action}
      className="mt-6 flex flex-col gap-4"
      onSubmit={() => setSubmitted(true)}
    >
      <AuditLoginFields
        auth={auth}
        submitted={submitted}
        turnstileSiteKey={turnstileSiteKey}
      />
    </form>
  )
}
