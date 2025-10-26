import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { Buffer } from 'node:buffer'
import { r2Get, r2Put } from '@/lib/r2'

interface anyBody {
  transformToString?: () => Promise<string>
  on?: (event: string, callback: (chunk?: Buffer) => void) => any
}

/** Convert S3 Body to UTF-8 string (supports Node streams and SDK helpers). */
async function bodyToString(body: GetObjectCommandOutput['Body']): Promise<string> {
  // Some runtimes expose transformToString(); prefer it when available.
  const anyBody: anyBody | undefined = body
  if (anyBody?.transformToString) {
    return anyBody.transformToString()
  }

  // Node Readable fallback
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    anyBody?.on?.('data', (chunk?: Buffer) => chunk && chunks.push(chunk))
    anyBody?.on?.('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    anyBody?.on?.('error', reject)
    // If body is missing/null, treat as empty
    if (!anyBody || !anyBody.on) {
      resolve('')
    }
  })
}

function monthKey(d = new Date()) {
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `logs/${yyyy}/${yyyy}-${mm}.ndjson`
}

/**
 * Append a single NDJSON line to this month's file.
 * NOTE: This is a simple GET->append->PUT. At your 6h cadence, the file stays small and races are unlikely.
 * If you expect heavy concurrency, switch to per-log objects under a monthly prefix instead.
 */
export async function appendMonthlyNdjsonLine(line: string, tsISO?: string) {
  const ts = tsISO !== undefined ? new Date(tsISO) : new Date()
  const key = monthKey(ts)

  let existing = ''
  try {
    const obj = await r2Get(key)
    existing = await bodyToString(obj.Body)
  }
  catch (err: unknown) {
    // If object missing, we'll create it fresh; swallow 404s.
    // @ts-expect-error aws err
    // eslint-disable-next-line ts/no-unsafe-assignment, ts/no-unsafe-member-access
    const status = err?.$metadata?.httpStatusCode ?? err?.$response?.statusCode
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (status && status !== 404) {
      throw err
    }
  }

  const newline = line.endsWith('\n') ? '' : '\n'
  await r2Put(key, existing + line + newline, 'application/x-ndjson', 'no-store')
  return key
}
