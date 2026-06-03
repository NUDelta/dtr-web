import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import process from 'node:process'
import { cookies } from 'next/headers'
import { isEqualSecret } from '@/constants/secrets'

export const AUDIT_PATH = '/audit'
const AUDIT_AUTH_COOKIE = 'dtr_audit_auth'
const AUDIT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 6
const AUDIT_REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 60
const AUDIT_REMEMBER_REFRESH_WINDOW_SECONDS = 60 * 60 * 24 * 7

interface AuditSessionPayload {
  exp: number
  remember: boolean
  v: 1
}

export interface AuditSession {
  expiresAt: number
  remember: boolean
}

function signAuditPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update('audit-session')
    .update(payload)
    .digest('hex')
}

function encodeAuditPayload(payload: AuditSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodeAuditPayload(payload: string): AuditSessionPayload | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AuditSessionPayload>
    if (
      parsed.v !== 1
      || typeof parsed.exp !== 'number'
      || !Number.isFinite(parsed.exp)
      || typeof parsed.remember !== 'boolean'
    ) {
      return undefined
    }

    return {
      exp: parsed.exp,
      remember: parsed.remember,
      v: 1,
    }
  }
  catch {
    return undefined
  }
}

function createAuditSessionCookieValue(secret: string, remember: boolean, now = Date.now()): string {
  const maxAgeSeconds = remember
    ? AUDIT_REMEMBER_MAX_AGE_SECONDS
    : AUDIT_SESSION_MAX_AGE_SECONDS
  const payload = encodeAuditPayload({
    exp: now + maxAgeSeconds * 1000,
    remember,
    v: 1,
  })

  return `${payload}.${signAuditPayload(payload, secret)}`
}

function parseAuditSessionCookie(value: string, secret: string, now = Date.now()): AuditSession | undefined {
  const [payload, signature] = value.split('.')
  if (
    payload === undefined
    || signature === undefined
    || !isEqualSecret(signature, signAuditPayload(payload, secret))
  ) {
    return undefined
  }

  const parsed = decodeAuditPayload(payload)
  if (parsed === undefined || parsed.exp <= now) {
    return undefined
  }

  return {
    expiresAt: parsed.exp,
    remember: parsed.remember,
  }
}

export function shouldRefreshAuditSession(session: AuditSession, now = Date.now()): boolean {
  return (
    session.remember
    && session.expiresAt - now <= AUDIT_REMEMBER_REFRESH_WINDOW_SECONDS * 1000
  )
}

export async function readAuditSession(secret: string): Promise<AuditSession | undefined> {
  const cookieStore = await cookies()
  const value = cookieStore.get(AUDIT_AUTH_COOKIE)?.value
  return value === undefined ? undefined : parseAuditSessionCookie(value, secret)
}

export async function setAuditSessionCookie(secret: string, remember: boolean): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(
    AUDIT_AUTH_COOKIE,
    createAuditSessionCookieValue(secret, remember),
    {
      httpOnly: true,
      maxAge: remember ? AUDIT_REMEMBER_MAX_AGE_SECONDS : AUDIT_SESSION_MAX_AGE_SECONDS,
      path: AUDIT_PATH,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
  )
}
