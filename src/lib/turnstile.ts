import {
  TURNSTILE_SECRET_KEY,
} from '@/lib/consts'

const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileSiteverifyResponse {
  'success'?: boolean
  'error-codes'?: string[]
}

export interface TurnstileVerificationResult {
  success: boolean
  errorCodes: string[]
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileVerificationResult> {
  if (TURNSTILE_SECRET_KEY.length === 0) {
    return { success: false, errorCodes: ['missing-secret'] }
  }

  if (token === undefined || token.length === 0) {
    return { success: false, errorCodes: ['missing-token'] }
  }

  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  })

  if (remoteIp !== undefined && remoteIp.length > 0) {
    body.set('remoteip', remoteIp)
  }

  const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
    method: 'POST',
    body,
    cache: 'no-store',
  })

  if (!response.ok) {
    return { success: false, errorCodes: [`siteverify-http-${response.status}`] }
  }

  const payload = await response.json().catch(() => null) as TurnstileSiteverifyResponse | null
  return {
    success: payload?.success === true,
    errorCodes: payload?.['error-codes'] ?? [],
  }
}

export function getRequestIp(request: Request): string | undefined {
  return (
    request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? undefined
  )
}
