import type { LetterSubscribeResponse } from '@/lib/letters/subscribe'
import { NextResponse } from 'next/server'
import { LETTER_SUBSCRIBE_APPS_SCRIPT_URL } from '@/lib/consts'
import { letterSubscribePayloadSchema } from '@/lib/letters/subscribe'

const GENERIC_SUBSCRIBE_ERROR = 'Unable to subscribe right now. Please try again in a moment.'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as unknown
  const parsed = letterSubscribePayloadSchema.safeParse(body)

  if (!parsed.success) {
    const response: LetterSubscribeResponse = {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Enter a valid email address.',
    }

    return NextResponse.json(response, { status: 400 })
  }

  if (LETTER_SUBSCRIBE_APPS_SCRIPT_URL.length === 0) {
    console.error('[letters/subscribe] Missing LETTER_SUBSCRIBE_APPS_SCRIPT_URL environment variable')

    const response: LetterSubscribeResponse = {
      ok: false,
      error: GENERIC_SUBSCRIBE_ERROR,
    }

    return NextResponse.json(response, { status: 500 })
  }

  try {
    const upstreamResponse = await fetch(LETTER_SUBSCRIBE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({ email: parsed.data.email }),
      cache: 'no-store',
    })

    if (!upstreamResponse.ok) {
      const upstreamBody = await upstreamResponse.text().catch(() => '')

      console.error('[letters/subscribe] Upstream request failed', {
        status: upstreamResponse.status,
        body: upstreamBody.slice(0, 500),
      })

      const response: LetterSubscribeResponse = {
        ok: false,
        error: GENERIC_SUBSCRIBE_ERROR,
      }

      return NextResponse.json(response, { status: 502 })
    }

    const response: LetterSubscribeResponse = { ok: true }
    return NextResponse.json(response)
  }
  catch (error) {
    console.error('[letters/subscribe] Request failed', error)

    const response: LetterSubscribeResponse = {
      ok: false,
      error: GENERIC_SUBSCRIBE_ERROR,
    }

    return NextResponse.json(response, { status: 502 })
  }
}
