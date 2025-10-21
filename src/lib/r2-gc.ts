/**
 * R2 garbage collector for long-unaccessed images.
 * - We rely on the object tag `last-access=YYYY-MM-DD` (written by the image API).
 * - If the tag is missing, fallback to LastModified.
 * - A throttle ("run at most every X hours") prevents frequent scans in ISR.
 */
import { Buffer } from 'node:buffer';
import { r2Delete, r2Get, r2GetTags, r2List, r2Put } from '@/lib/r2';

const STATE_KEY = 'gc/last-run.json'; // stores {"lastRun":"2025-10-20T00:00:00.000Z"}
const PREFIX_DEFAULT = 'images/';

interface GCOptions {
  prefix?: string;
  /** Delete objects older than this many days since last access */
  maxAgeDays?: number;
  /** Throttle: only run if last run is older than this many hours */
  minIntervalHours?: number;
  /** Safety cap: maximum number of deletions per run to bound work */
  maxDeletePerRun?: number;
}

function parseYMD(ymd: string): number | null {
  const [y, m, d] = ymd.split('-').map(x => Number.parseInt(x, 10));
  if (!y || !m || !d) {
    return null;
  }
  return Date.UTC(y, m - 1, d, 0, 0, 0);
}

function daysSince(tsMs: number) {
  return (Date.now() - tsMs) / (1000 * 60 * 60 * 24);
}

async function getLastRun(): Promise<Date | null> {
  try {
    const obj = await r2Get(STATE_KEY);
    if (!obj.Body) {
      return null;
    };
    const text = await obj.Body.transformToString('utf-8');
    const json = JSON.parse(text) as { lastRun: string };
    const dt = new Date(json.lastRun);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  catch {
    return null;
  }
}

async function setLastRun(now = new Date()) {
  const payload = Buffer.from(JSON.stringify({ lastRun: now.toISOString() }), 'utf8');
  await r2Put(STATE_KEY, payload, 'application/json', 'no-store');
}

/**
 * Scan and delete old objects under `prefix`.
 * Returns summary counts for observability.
 */
export async function runR2CleanupOnce(opts: GCOptions = {}) {
  const prefix = opts.prefix ?? PREFIX_DEFAULT;
  const maxAgeDays = opts.maxAgeDays ?? 45;
  const maxDeletePerRun = opts.maxDeletePerRun ?? 250;

  let token: string | undefined;
  let scanned = 0;
  let deleted = 0;

  do {
    const page = await r2List(prefix, token);
    token = page.NextContinuationToken;

    for (const obj of page.Contents || []) {
      if (obj.Key === undefined) {
        continue;
      }
      scanned++;

      let lastAccessMs: number | null = null;

      try {
        const tags = await r2GetTags(obj.Key);
        const ymd = (tags.TagSet || []).find(t => t.Key === 'last-access')?.Value;
        if (ymd !== undefined) {
          const ts = parseYMD(ymd);
          if (ts !== null) {
            lastAccessMs = ts;
          }
        }
      }
      catch {
        // ignore tag read failures
      }

      if (lastAccessMs === null && obj.LastModified) {
        lastAccessMs = obj.LastModified.getTime();
      }
      if (lastAccessMs === null) {
        continue;
      }

      const age = daysSince(lastAccessMs);
      if (age > maxAgeDays) {
        try {
          await r2Delete(obj.Key);
          deleted++;
          if (deleted >= maxDeletePerRun) {
            return { scanned, deleted, capped: true };
          }
        }
        catch {
          // ignore delete failure; proceed
        }
      }
    }
  } while (token !== undefined);

  return { scanned, deleted, capped: false };
}

/**
 * Throttled entrypoint for ISR hooks.
 * - Only runs if the last run is older than `minIntervalHours` (defaults to 24h).
 * - Writes STATE_KEY before the scan to reduce concurrent duplications.
 */
export async function maybeRunR2CleanupFromISR(opts: GCOptions = {}) {
  const minIntervalHours = opts.minIntervalHours ?? 24;
  const last = await getLastRun();
  if (last) {
    const hours = (Date.now() - last.getTime()) / (1000 * 60 * 60);
    if (hours < minIntervalHours) {
      return { skipped: true, reason: `last run ${hours.toFixed(1)}h ago` };
    }
  }

  // Best-effort: mark as run NOW to reduce parallel invocations.
  await setLastRun(new Date());

  const res = await runR2CleanupOnce(opts);
  return { skipped: false, ...res };
}
