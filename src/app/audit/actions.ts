'use server'

import { redirect } from 'next/navigation'
import { getOpsSecret } from '@/constants/secrets'
import {
  AUDIT_PATH,
  isEqualSecret,
  readAuditSession,
  setAuditSessionCookie,
  shouldRefreshAuditSession,
} from '@/lib/audit/session'
import { verifyTurnstileToken } from '@/lib/turnstile'

export async function authenticateAudit(formData: FormData) {
  const secret = getOpsSecret()
  const token = formData.get('token')
  const remember = formData.get('remember') === 'on'
  const turnstileToken = formData.get('cf-turnstile-response')

  const turnstile = await verifyTurnstileToken(
    typeof turnstileToken === 'string' ? turnstileToken : undefined,
  )

  if (!turnstile.success) {
    redirect(`${AUDIT_PATH}?auth=challenge`)
  }

  if (
    secret === undefined
    || typeof token !== 'string'
    || !isEqualSecret(token, secret)
  ) {
    redirect(`${AUDIT_PATH}?auth=failed`)
  }

  await setAuditSessionCookie(secret, remember)
  redirect(AUDIT_PATH)
}

export async function refreshAuditSession() {
  const secret = getOpsSecret()
  if (secret === undefined) {
    return
  }

  const session = await readAuditSession(secret)
  if (session !== undefined && shouldRefreshAuditSession(session)) {
    await setAuditSessionCookie(secret, true)
  }
}
