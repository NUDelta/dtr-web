import Cloudflare from 'cloudflare'
import { CLOUDFLARE_API_TOKEN } from '@/constants/cloudflare'
import { SKIP_REMOTE_DATA } from '@/constants/runtime'

function createCloudflareClient() {
  // Small sanity check to avoid silent auth issues
  if (CLOUDFLARE_API_TOKEN === '' && !SKIP_REMOTE_DATA) {
    throw new Error('Missing CLOUDFLARE_API_TOKEN environment variable')
  }

  const client = new Cloudflare({
    apiToken: CLOUDFLARE_API_TOKEN || 'skip-remote-data',
  })

  return client
}

export const CloudflareClient = createCloudflareClient()
