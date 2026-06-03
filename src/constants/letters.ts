import { getEnvValue } from './utils'

/**
 * Google Apps Script endpoint for letter subscription submissions.
 *
 * This URL can grant write access to the backing sheet/script, so it remains
 * environment-backed even though it is not displayed to users.
 */
export const LETTER_SUBSCRIBE_APPS_SCRIPT_URL
  = getEnvValue('LETTER_SUBSCRIBE_APPS_SCRIPT_URL') ?? ''
