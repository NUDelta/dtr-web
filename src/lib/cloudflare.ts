import Cloudflare from 'cloudflare'
import { CLOUDFLARE_API_KEY } from './consts'

function createCloudflareClient() {
  // Small sanity check to avoid silent auth issues
  if (CLOUDFLARE_API_KEY === '') {
    throw new Error('Missing CLOUDFLARE_API_TOKEN environment variable')
  }

  const client = new Cloudflare({
    apiToken: CLOUDFLARE_API_KEY,
  })

  return client
}

export const CloudflareClient = createCloudflareClient()
