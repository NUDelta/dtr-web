import type { LetterSubscribeResponse } from '@/lib/letters/subscribe'
import { letterSubscribeResponseSchema } from '@/lib/letters/subscribe'

export const DEFAULT_SUBSCRIBE_ERROR = 'Unable to subscribe right now. Please try again in a moment.'

export function getErrorMessage(errors: unknown[]) {
  for (const error of errors) {
    if (typeof error === 'string' && error.length > 0) {
      return error
    }

    if (
      typeof error === 'object'
      && error !== null
      && 'message' in error
      && typeof error.message === 'string'
      && error.message.length > 0
    ) {
      return error.message
    }
  }

  return null
}

export async function parseSubscribeResponse(response: Response): Promise<LetterSubscribeResponse> {
  const payload = await response.json().catch(() => null) as unknown
  const parsed = letterSubscribeResponseSchema.safeParse(payload)

  if (parsed.success) {
    return parsed.data
  }

  return {
    ok: false,
    error: DEFAULT_SUBSCRIBE_ERROR,
  }
}
