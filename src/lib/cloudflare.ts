import Cloudflare from 'cloudflare'
import { CLOUDFLARE_API_KEY, SKIP_REMOTE_DATA } from './consts'

function createCloudflareClient() {
  // Small sanity check to avoid silent auth issues
  if (CLOUDFLARE_API_KEY === '' && !SKIP_REMOTE_DATA) {
    throw new Error('Missing CLOUDFLARE_API_KEY environment variable')
  }

  const client = new Cloudflare({
    apiToken: CLOUDFLARE_API_KEY || 'skip-remote-data',
  })

  return client
}

export const CloudflareClient = createCloudflareClient()
