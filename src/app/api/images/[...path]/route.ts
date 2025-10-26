import type { StreamingBlobPayloadOutputTypes } from '@smithy/types'
import { Buffer } from 'node:buffer'
import { NextResponse } from 'next/server'
import { r2Get, r2Head, r2Put, r2PutTags } from '@/lib/r2'
import { transcodeBufferToWebp } from '@/utils/image-convert'

function toWebpKey(attId: string, variant: string, filename: string) {
  // Normalize filename to `.webp` extension; keep original basename for readability.
  const safeName = filename.replace(/\.[^.]+$/, '') || 'image'
  return `images/${attId}/${variant}/${safeName}.webp`
}

/**
 * Route format: /api/images/{attId}/{variant}/{filename}?src={airtable_temp_url}
 * - `attId` is the stable Airtable attachment id (e.g., "attXXXXXXXX")
 * - `variant` prevents collisions across sizes ("full"/"thumb"/"large", etc.)
 * - `filename` is cosmetic; the stored object ends with `.webp`
 *
 * Behavior:
 * 1) On cache hit: serve from R2
 * 2) On cache miss: fetch `src` (Airtable signed URL), transcode to WebP (sharp), store to R2, then serve
 * 3) On each hit, update object tag `last-access=YYYY-MM-DD` asynchronously for GC
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const params = await context.params
    const path = params?.path ?? []
    const src = new URL(request.url).searchParams.get('src') ?? ''

    if (path.length < 3) {
      return NextResponse.json(
        { error: 'Invalid path. Expected: /api/images/{attId}/{variant}/{filename}?src=...' },
        { status: 400 },
      )
    }

    const [attId, variant, ...rest] = path
    const filename = decodeURIComponent(rest.join('/'))
    if (!attId || !variant || !filename) {
      return NextResponse.json({ error: 'Missing params.' }, { status: 400 })
    }

    const key = toWebpKey(attId, variant, filename)

    // 1) Check existence in R2
    let exists = true
    try {
      await r2Head(key)
    }
    catch {
      exists = false
    }

    // 2) Serve on hit
    if (exists) {
      void touchLastAccess(key) // best-effort, non-blocking

      const obj = await r2Get(key)
      const body = obj.Body

      // If SDK provides a Web ReadableStream
      if (body?.transformToWebStream) {
        return new NextResponse(body.transformToWebStream(), {
          status: 200,
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }

      // If SDK provides a direct byte array
      if (body?.transformToByteArray) {
        const bytes = await body.transformToByteArray()
        return new NextResponse(Buffer.from(bytes), {
          status: 200,
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }

      // Fallback: read Node.js Readable stream into a Buffer
      const buf = await nodeReadableToBuffer(body)
      // @ts-expect-error Expected to be Buffer
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // 3) Miss: require `src` to populate cache
    if (!src) {
      return NextResponse.json(
        { error: 'Cache miss and no `src` provided.' },
        { status: 404 },
      )
    }

    const upstream = await fetch(src)
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch source image: ${upstream.status}` },
        { status: upstream.status },
      )
    }

    const original = Buffer.from(await upstream.arrayBuffer())

    // Transcode to WebP using sharp-only pipeline
    const { buffer: webp, converted } = await transcodeBufferToWebp(original)

    // Persist to R2 with long cache headers
    await r2Put(key, webp, 'image/webp', 'public, max-age=31536000, immutable')
    void touchLastAccess(key)

    // @ts-expect-error Expected to be Buffer
    return new NextResponse(webp, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Transcoded': String(converted),
      },
    })
  }
  catch (err) {
    console.error('[images] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Convert a Node.js Readable stream to a single Buffer. */
async function nodeReadableToBuffer(stream: StreamingBlobPayloadOutputTypes | undefined): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    if (stream === undefined) {
      return resolve(Buffer.alloc(0))
    }
    if (typeof stream === 'object' && stream !== null && 'on' in stream) {
      const readableStream = stream as {
        on: (event: string, handler: (...args: any[]) => void) => void
        once: (event: string, handler: (...args: any[]) => void) => void
      }
      readableStream.on('data', (c: Buffer) => chunks.push(c))
      readableStream.once('end', () => resolve(Buffer.concat(chunks)))
      readableStream.once('error', reject)
    }
    else {
      reject(new Error('Stream is not a Node.js Readable'))
    }
  })
}

/** Best-effort access tracking via object tag `last-access=YYYY-MM-DD`. */
async function touchLastAccess(key: string) {
  try {
    const today = new Date()
    const y = today.getUTCFullYear()
    const m = String(today.getUTCMonth() + 1).padStart(2, '0')
    const d = String(today.getUTCDate()).padStart(2, '0')
    await r2PutTags(key, { 'last-access': `${y}-${m}-${d}` })
  }
  catch {
    // non-fatal
  }
}
