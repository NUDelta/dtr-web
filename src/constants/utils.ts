import process from 'node:process'

/**
 * Reads a non-empty environment variable.
 *
 * Empty strings are treated as unset so callers can distinguish intentionally
 * configured values from missing deployment configuration.
 *
 * @param key - Environment variable name to read.
 * @returns The configured value, or `undefined` when it is missing or empty.
 */
export function getEnvValue(key: string): string | undefined {
  const value = process.env[key]
  return value !== undefined && value.length > 0 ? value : undefined
}
