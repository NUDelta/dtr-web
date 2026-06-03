import { Buffer } from 'node:buffer'
import { CLOUDFLARE_ACCOUNT_ID } from '@/constants/cloudflare'
import { R2_BUCKET, R2_BUCKET_PUBLIC_URL } from '@/constants/r2'
import { SKIP_REMOTE_DATA } from '@/constants/runtime'
import { CloudflareClient } from '@/lib/cloudflare'

if (!SKIP_REMOTE_DATA && (!CLOUDFLARE_ACCOUNT_ID || !R2_BUCKET)) {
  // We intentionally don't throw here to keep dev ergonomics;
  // the route will return a 500 with a clear error message when needed.
  console.error('[ERROR] R2 configuration is missing.')
}

interface R2Body {
  transformToString: (encoding?: BufferEncoding) => Promise<string>
  transformToWebStream: () => ReadableStream<Uint8Array> | null
}

interface R2GetResponse {
  Body: R2Body
  ContentType?: string
  ETag?: string
}

interface R2ListObject {
  Key?: string
  Size?: number
}

interface R2ListResponse {
  Contents?: R2ListObject[]
  NextContinuationToken?: string
}

export class R2ObjectNotFoundError extends Error {
  constructor(key: string) {
    super(`R2 object not found: ${key}`)
    this.name = 'R2ObjectNotFoundError'
  }
}

function getObjectParams() {
  return { account_id: CLOUDFLARE_ACCOUNT_ID }
}

export function buildR2PublicUrl(key: string): string {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `${R2_BUCKET_PUBLIC_URL}/${encodedKey}`
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
    throw new R2ObjectNotFoundError(key)
  }

  return object
}

export async function r2Get(key: string): Promise<R2GetResponse> {
  return r2GetFromBucket(R2_BUCKET, key)
}

export async function r2GetFromBucket(bucket: string, key: string): Promise<R2GetResponse> {
  const response = await CloudflareClient.r2.buckets.objects.get(
    bucket,
    key,
    getObjectParams(),
  )

  return {
    Body: toBody(response),
    ContentType: response.headers.get('content-type') ?? undefined,
    ETag: response.headers.get('etag') ?? undefined,
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
  return r2ListFromBucket(R2_BUCKET, prefix, continuationToken)
}

export async function r2ListFromBucket(
  bucket: string,
  prefix: string,
  continuationToken?: string,
): Promise<R2ListResponse> {
  const page = await CloudflareClient.r2.buckets.objects.list(
    bucket,
    {
      ...getObjectParams(),
      cursor: continuationToken,
      prefix,
      per_page: 1000,
    },
  )

  const cursor = page.result_info.cursor

  return {
    Contents: page.result.map(item => ({
      Key: item.key,
      Size: item.size,
    })),
    NextContinuationToken: typeof cursor === 'string' && cursor.length > 0 ? cursor : undefined,
  }
}

export async function r2Delete(key: string) {
  return r2DeleteFromBucket(R2_BUCKET, key)
}

export async function r2DeleteFromBucket(bucket: string, key: string) {
  return CloudflareClient.r2.buckets.objects.delete(
    bucket,
    key,
    getObjectParams(),
  )
}
