import type { StreamingBlobPayloadOutputTypes } from '@smithy/types'
import { Buffer } from 'node:buffer'
import { NextResponse } from 'next/server'
import { r2Get, r2Head, r2Put, r2PutTags } from '@/lib/r2'
import { transcodeBufferToOptimizedImages } from '@/utils/image-convert' // new helper

type ImageFormat = 'avif' | 'webp'

/** Maximum bounding box for width/height. */
const MAX_DIMENSION = 2400
/**
 * Normalize filename and attach requested extension.
 * Stored objects:
 * - images/{attId}/{variant}/{basename}.webp
 * - images/{attId}/{variant}/{basename}.avif
 */
function toKey(attId: string, variant: string, filename: string, format: ImageFormat) {
  const base = filename.replace(/\.[^.]+$/, '') || 'image'
  return `images/${attId}/${variant}/${base}.${format}`
}

/** Very simple Accept header negotiation between AVIF and WebP. */
function chooseFormatFromAccept(accept: string | null): ImageFormat {
  if (accept === null) {
    return 'webp'
  }
  const lower = accept.toLowerCase()
  if (lower.includes('image/avif')) {
    return 'avif'
  }
  if (lower.includes('image/webp')) {
    return 'webp'
  }
  return 'webp'
}

/**
 * Route format: /api/images/{attId}/{variant}/{filename}?src={airtable_temp_url}[&mode=warm]
 *
 * Behavior:
 * 1) On cache hit: serve AVIF/WebP from R2 based on Accept header, fall back to WebP.
 * 2) On cache miss: fetch `src` (Airtable signed URL), downscale to a max dimension,
 *    transcode to both AVIF + WebP, store both in R2, then serve chosen format.
 * 3) On each hit, update object tag `last-access=YYYY-MM-DD` asynchronously for GC.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const params = await context.params
    const path = params?.path ?? []
    const url = new URL(request.url)
    const src = url.searchParams.get('src') ?? ''
    const mode = url.searchParams.get('mode') ?? 'serve' // 'serve' | 'warm'
    const isWarmOnly = mode === 'warm'

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

    const accept = request.headers.get('accept')
    const preferredFormat = chooseFormatFromAccept(accept)

    const webpKey = toKey(attId, variant, filename, 'webp')
    const avifKey = toKey(attId, variant, filename, 'avif')

    // 1) Try to find a cached object (prefer AVIF, fall back to WebP).
    let chosenKey: string | null = null
    let chosenFormat: ImageFormat | null = null

    // First try the preferred format.
    try {
      const key = preferredFormat === 'avif' ? avifKey : webpKey
      await r2Head(key)
      chosenKey = key
      chosenFormat = preferredFormat
    }
    catch {
      // If preferred is missed, no fallback to other one.
    }

    // 2) Cache hit: return immediately (or 204 for warm-only).
    if (chosenKey !== null && chosenFormat) {
      void touchLastAccess(chosenKey) // best-effort, non-blocking

      if (isWarmOnly) {
        // Warm-only calls should not stream the image back.
        return new NextResponse(null, { status: 204 })
      }

      const obj = await r2Get(chosenKey)
      const body = obj.Body

      const headers: Record<string, string> = {
        'Content-Type': chosenFormat === 'avif' ? 'image/avif' : 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }

      // If SDK provides a Web ReadableStream
      if (body?.transformToWebStream) {
        return new NextResponse(
          body.transformToWebStream(),
          { status: 200, headers },
        )
      }

      // If SDK provides a direct byte array
      if (body?.transformToByteArray) {
        const bytes = await body.transformToByteArray()
        return new NextResponse(Buffer.from(bytes), {
          status: 200,
          headers,
        })
      }

      // Fallback: read Node.js Readable stream into a Buffer
      const buf = await nodeReadableToBuffer(body)
      // @ts-expect-error Expected to be Buffer
      return new NextResponse(buf, { status: 200, headers })
    }

    // 3) Miss: require `src` to populate cache.
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

    // Transcode once to both AVIF and WebP, with a bounded max dimension.
    const { avif, webp, converted } = await transcodeBufferToOptimizedImages(original, {
      maxDimension: MAX_DIMENSION,
    })

    // Persist both formats to R2 with long cache headers.
    await Promise.all([
      r2Put(webpKey, webp, 'image/webp', 'public, max-age=31536000, immutable'),
      r2Put(avifKey, avif, 'image/avif', 'public, max-age=31536000, immutable'),
    ])

    // Track access for GC purposes (we can tag only the format we are about to serve).
    const formatToServe: ImageFormat
      = preferredFormat === 'avif' ? 'avif' : 'webp'
    const keyToServe = formatToServe === 'avif' ? avifKey : webpKey
    void touchLastAccess(keyToServe)

    if (isWarmOnly) {
      // Warm-only: successfully populated both variants; nothing to stream back.
      return new NextResponse(null, {
        status: 201,
        headers: {
          'X-Transcoded': String(converted),
        },
      })
    }

    const bytes = formatToServe === 'avif' ? avif : webp
    const contentType = formatToServe === 'avif' ? 'image/avif' : 'image/webp'

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': contentType,
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
