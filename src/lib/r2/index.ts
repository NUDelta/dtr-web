import { Buffer } from 'node:buffer'
import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  R2_BUCKET,
  SKIP_REMOTE_DATA,
} from '@/lib/consts'

if (!SKIP_REMOTE_DATA && (!CLOUDFLARE_ACCOUNT_ID || !R2_BUCKET)) {
  // We intentionally don't throw here to keep dev ergonomics;
  // the route will return a 500 with a clear error message when needed.
  console.error('[ERROR] R2 configuration environment variables are missing.')
}

interface R2Body {
  transformToString: (encoding?: BufferEncoding) => Promise<string>
  transformToWebStream: () => ReadableStream<Uint8Array> | null
}

interface R2GetResponse {
  Body: R2Body
  ContentType?: string
  ETag?: string
  LastModified?: Date
}

interface R2ListObject {
  Key?: string
  LastModified?: Date
  Size?: number
}

interface R2ListResponse {
  Contents?: R2ListObject[]
  NextContinuationToken?: string
}

function getObjectParams() {
  return { account_id: CLOUDFLARE_ACCOUNT_ID }
}

function toBody(response: Response): R2Body {
  return {
    async transformToString(encoding = 'utf-8') {
      if (encoding !== 'utf-8' && encoding !== 'utf8') {
        const bytes = new Uint8Array(await response.arrayBuffer())
        return Buffer.from(bytes).toString(encoding)
      }

      return response.text()
    },
    transformToWebStream() {
      return response.body
    },
  }
}

export async function r2Head(key: string) {
  const page = await CloudflareClient.r2.buckets.objects.list(
    R2_BUCKET,
    {
      ...getObjectParams(),
      prefix: key,
      per_page: 1,
    },
  )
  const object = page.result.find(item => item.key === key)
  if (object === undefined) {
    throw new Error(`R2 object not found: ${key}`)
  }

  return object
}

export async function r2Get(key: string): Promise<R2GetResponse> {
  const response = await CloudflareClient.r2.buckets.objects.get(
    R2_BUCKET,
    key,
    getObjectParams(),
  )

  const lastModified = response.headers.get('last-modified')

  return {
    Body: toBody(response),
    ContentType: response.headers.get('content-type') ?? undefined,
    ETag: response.headers.get('etag') ?? undefined,
    LastModified: lastModified !== null ? new Date(lastModified) : undefined,
  }
}

export async function r2Put(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  cacheControl = 'public, max-age=31536000, immutable',
) {
  return r2PutToBucket(R2_BUCKET, key, body, contentType, cacheControl)
}

export async function r2PutToBucket(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  cacheControl = 'public, max-age=31536000, immutable',
) {
  return CloudflareClient.r2.buckets.objects.upload(
    bucket,
    key,
    body,
    getObjectParams(),
    {
      headers: {
        'Cache-Control': cacheControl,
        'Content-Type': contentType,
      },
    },
  )
}

export async function r2List(prefix: string, continuationToken?: string): Promise<R2ListResponse> {
  const page = await CloudflareClient.r2.buckets.objects.list(
    R2_BUCKET,
    {
      ...getObjectParams(),
      cursor: continuationToken,
      prefix,
      per_page: 1000,
    },
  )

  return {
    Contents: page.result.map(item => ({
      Key: item.key,
      LastModified: item.last_modified !== undefined ? new Date(item.last_modified) : undefined,
      Size: item.size,
    })),
    NextContinuationToken: page.result_info.cursor,
  }
}

export async function r2Delete(key: string) {
  return CloudflareClient.r2.buckets.objects.delete(
    R2_BUCKET,
    key,
    getObjectParams(),
  )
}
