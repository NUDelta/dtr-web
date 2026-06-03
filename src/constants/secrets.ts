import { Buffer } from 'node:buffer'
import { timingSafeEqual } from 'node:crypto'
import { getEnvValue } from './utils'

/**
 * Compares two secret strings without leaking early-exit timing differences.
 *
 * This should be used for bearer-style route tokens and internal operator
 * tokens before granting access to privileged maintenance surfaces.
 *
 * @param actual - User-supplied token value.
 * @param expected - Server-configured token value.
 * @returns `true` only when both strings match exactly.
 */
export function isEqualSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.byteLength === expectedBuffer.byteLength
    && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

/**
 * Shared secret for machine-triggered maintenance endpoints.
 *
 * This token is intended for GitHub Actions or CI/CD automation only. It must
 * remain environment-backed because it grants access to cache refresh, backup,
 * and cleanup jobs.
 *
 * @returns The configured CI/CD secret, or `undefined` when not configured.
 */
export function getCicdSecret(): string | undefined {
  return getEnvValue('CICD_SECRET')
}

/**
 * Shared secret for human-operated internal tools.
 *
 * This token is separate from the CI/CD token so operational audit pages can be
 * rotated independently from automated maintenance jobs.
 *
 * @returns The configured operations secret, or `undefined` when not configured.
 */
export function getOpsSecret(): string | undefined {
  return getEnvValue('OPS_SECRET')
}
