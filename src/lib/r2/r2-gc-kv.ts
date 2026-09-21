import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/constants/cloudflare'
import { CloudflareClient } from '@/lib/cloudflare'

function isCloudflareErrorWithStatus(
  error: unknown,
): error is { status: number } {
  return (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && typeof error.status === 'number'
  )
}

export async function readKvText(key: string): Promise<string | undefined> {
  try {
    const response = await CloudflareClient.kv.namespaces.values.get(
      key,
      { account_id: CLOUDFLARE_ACCOUNT_ID, namespace_id: CLOUDFLARE_KV_NAMESPACE_ID },
    )
    const text = await response.text()
    return text.length > 0 ? text : undefined
  }
  catch (error) {
    if (isCloudflareErrorWithStatus(error) && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function writeKvJson(
  key: string,
  value: unknown,
): Promise<void> {
  await CloudflareClient.kv.namespaces.values.update(
    key,
    {
      account_id: CLOUDFLARE_ACCOUNT_ID,
      namespace_id: CLOUDFLARE_KV_NAMESPACE_ID,
      value: JSON.stringify(value),
    },
  )
}
