import { getEnvValue } from './utils'

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
