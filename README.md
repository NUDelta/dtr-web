# DTR Website

Website for the Design, Technology, and Research (DTR) program at Northwestern University. View live at [http://dtr.northwestern.edu/](https://dtr.northwestern.edu/).

## Setup

1. Make sure you have [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/installation#using-corepack) (recommend install with corepack) installed.
2. Clone the repository, and copy the `.env.example` file and rename it to `.env`, filling in the required environment variables.
3. Run `pnpm install` to install packages.

## Running Code Locally

### Local Development

To develop locally, run `pnpm dev` and navigate to `localhost:3000` in your browser. Changes in code will automatically cause the website to be re-built and update the browser.

### Testing Production Build Locally

To test a production build:

```bash
pnpm build
pnpm start
```

Once started, navigate to `localhost:8080` in your browser.

## Development Process and Pushing to Production

We use [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform/) to host [https://dtr.northwestern.edu/](https://dtr.northwestern.edu/). It is configured to re-build the website whenever changes are pushed to the `main` branch of this repository. Because of that, we recommend you create a new branch when you have changes that you want to make, and create a pull request to merge into `main` once they are completed and tested.

## Technologies used

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Airtable](https://airtable.com/) and [Airtable TS](https://airtable.zla.app) for content management
- [Cloudflare R2](https://developers.cloudflare.com/r2/) for image storage and caching
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/workers-kv/) for data caching
- [Docker](https://www.docker.com/) for containerization in production

## Caching Architecture

The website implements a two-tier caching system to minimize Airtable API usage:

1. **Data Caching**: Airtable table data is cached using [Airtable TS](https://airtable.zla.app)'s built-in caching interface and an injected Cloudflare KV Cache Store. A scheduled GitHub Action refreshes the cache every 12 hours, while stale KV data remains available as a fallback during Airtable/API failures.
2. **Image Caching**: Images are downloaded once from Airtable, transformed into modern optimized formats (e.g., WebP, AVIF), cached in Cloudflare R2, and served from `NEXT_PUBLIC_R2_BUCKET_PUBLIC_URL`.

Cron-triggered endpoints require `CICD_SECRET` in production.
Internal ops pages require `OPS_SECRET`.
Legacy endpoint-specific secrets are only retained as migration fallbacks.

## Production Environment

DigitalOcean runtime env must include Airtable credentials, Cloudflare API/KV credentials, R2 bucket names, `CICD_SECRET` for GitHub Actions / cron-triggered endpoints, and `OPS_SECRET` for internal ops pages.

GitHub repository secrets should include `CICD_SECRET`. The workflows still fall back to the older endpoint-specific secrets during migration.

Airtable backups require `R2_BACKUP_BUCKET`, a private R2 bucket. Runtime image cache objects stay in `R2_BUCKET` under the `images/` prefix and are served through the configured public R2 URL. Backups only include table data plus any cached R2 image keys/public URLs already referenced by those records; they do not duplicate image objects into the backup bucket. The backup endpoint skips repeat runs for the same UTC date unless the manual workflow is dispatched with `force`.

The internal ops audit page at `/ops/airtable-refresh-logs` uses `OPS_SECRET`, is marked `noindex` through page metadata, and shows recent KV logs plus log snapshots archived under `backups/logs/` in `R2_BACKUP_BUCKET`.
