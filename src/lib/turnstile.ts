import { TURNSTILE_SECRET_KEY } from '@/constants/cloudflare'

const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_SITEVERIFY_TIMEOUT_MS = 8_000

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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TURNSTILE_SITEVERIFY_TIMEOUT_MS)

  try {
    const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      body,
      cache: 'no-store',
      signal: controller.signal,
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
  catch (error) {
    return {
      success: false,
      errorCodes: [error instanceof Error ? error.name : 'siteverify-error'],
    }
  }
  finally {
    clearTimeout(timeout)
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
