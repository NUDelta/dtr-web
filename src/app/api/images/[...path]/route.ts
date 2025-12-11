import type { StreamingBlobPayloadOutputTypes } from '@smithy/types'
import { Buffer } from 'node:buffer'
import { NextResponse } from 'next/server'
import { buildImageObjectKey } from '@/lib/image-cache'
import { r2Get, r2Head } from '@/lib/r2'

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
 * Route format: /api/images/{attId}/{variant}/{filename}
 *
 * Normal behaviour:
 * 1) On cache hit: serve AVIF/WebP from R2 based on Accept header, fall back to the other format.
 * 2) On cache miss: return a default placeholder image.
 *
 * Newer code paths (via `transformAttachment`) never send `src` to the client
 * and expect R2 to already be warm by the time this route is hit.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const params = await context.params
    const path = params?.path ?? []

    if (path.length < 3) {
      return NextResponse.json(
        { error: 'Invalid path. Expected: /api/images/{attId}/{variant}/{filename}' },
        { status: 400 },
      )
    }

    const [attId, variantRaw, ...rest] = path
    const filename = decodeURIComponent(rest.join('/'))
    if (!attId || !variantRaw || !filename) {
      return NextResponse.json({ error: 'Missing params.' }, { status: 400 })
    }

    const variant = variantRaw as ImageVariant
    const accept = request.headers.get('accept')
    const preferredFormat = chooseFormatFromAccept(accept)
    const otherFormat: ImageFormat = preferredFormat === 'avif' ? 'webp' : 'avif'

    const tryHead = async (
      format: ImageFormat,
    ): Promise<{ key: string, format: ImageFormat } | null> => {
      const key = await buildImageObjectKey(attId, variant, filename, format)
      try {
        await r2Head(key)
        return { key, format }
      }
      catch {
        return null
      }
    }

    let chosenKey: string | null = null
    let chosenFormat: ImageFormat | null = null

    // 1) Try preferred format
    const preferred = await tryHead(preferredFormat)
    if (preferred) {
      chosenKey = preferred.key
      chosenFormat = preferred.format
    }
    else {
      // 2) Try the other format
      const fallback = await tryHead(otherFormat)
      if (fallback) {
        chosenKey = fallback.key
        chosenFormat = fallback.format
      }
      else {
        // 3) Fallback to a default image
        chosenKey = `images/default-pic.${preferredFormat ?? 'webp'}`
        chosenFormat = preferredFormat ?? 'webp'

        console.warn(`[images] Cache miss for attId=${attId}, filename=${filename}. Serving default image.`)
      }
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
  catch (err) {
    console.error('[images] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Convert a Node.js Readable stream to a single Buffer. */
async function nodeReadableToBuffer(
  stream: StreamingBlobPayloadOutputTypes | undefined,
): Promise<Buffer> {
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
