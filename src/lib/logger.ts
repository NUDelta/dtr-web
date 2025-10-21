/**
 * Production-only structured logger with Cloudflare R2 sink.
 * - Console logging and R2 sink toggled by AIRTABLE_LOG=1
 * - Records are newline-delimited JSON for easy aggregation.
 */
import process from 'node:process';
import { appendMonthlyNdjsonLine } from '@/lib/r2-logs';

const isProd = process.env.NODE_ENV === 'production';
const enabled = isProd && process.env.AIRTABLE_LOG === '1';

type LogMeta = Record<string, unknown>;

export function logProd(message: string, meta: LogMeta = {}) {
  if (!enabled) {
    return;
  }

  const record = {
    ts: new Date().toISOString(),
    level: 'info' as const,
    msg: message,
    ...meta,
  };

  // Emit to console
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(record));

  // Fire R2 persistence (await inside try to keep the log durable at very low cadence)
  appendMonthlyNdjsonLine(JSON.stringify(record), record.ts).catch((err) => {
    // Swallow errors so logging never breaks the main flow.
    console.error('[logProd:R2] append failed:', err);
  });
}

/** Useful for measuring durations. */
export function nowMs() {
  return Date.now();
}
