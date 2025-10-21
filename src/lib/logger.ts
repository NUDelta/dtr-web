/**
 * Production-only structured logger.
 * - Silent unless NODE_ENV=production AND AIRTABLE_LOG=1.
 * - Emits newline-delimited JSON for easy aggregation.
 */
import process from 'node:process';

const isProd = process.env.NODE_ENV === 'production';
const enabled = isProd && process.env.AIRTABLE_LOG === '1';

type LogMeta = Record<string, unknown>;

export function logProd(message: string, meta: LogMeta = {}) {
  if (!enabled) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      msg: message,
      ...meta,
    }),
  );
}

/** Useful for measuring durations. */
export function nowMs() {
  return Date.now();
}
