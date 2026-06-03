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
- [Cloudflare R2](https://developers.cloudflare.com/r2/) for image storage, backups, and workflow audit logs
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/workers-kv/) for Airtable records cache and small maintenance state
- [Docker](https://www.docker.com/) for containerization in production

## Caching Architecture

The website implements a two-tier caching system to minimize Airtable API usage:

1. **Data Caching**: Airtable table data is cached in Cloudflare Workers KV through an injected Cloudflare KV Cache Store. A scheduled GitHub Action refreshes the cache every 12 hours, while stale KV data remains available as a fallback during Airtable/API failures. Public reads are cache-only; cache misses do not call Airtable or write KV. KV is reserved for Airtable records cache and small state such as refresh guards and R2 orphan tracking.
2. **Image Caching**: Images are downloaded once from Airtable, transformed into modern optimized formats (e.g., WebP, AVIF), cached in Cloudflare R2, and served from the source-controlled R2 public URL in `src/constants`.

Cron-triggered endpoints require `CICD_SECRET` in production.
Internal ops pages require `OPS_SECRET`.

## Production Environment

DigitalOcean runtime env must include Airtable and Cloudflare API credentials, `CICD_SECRET` for GitHub Actions / cron-triggered endpoints, `OPS_SECRET` for internal ops pages, `TURNSTILE_SECRET_KEY` for bot protection, and `LETTER_SUBSCRIBE_APPS_SCRIPT_URL` for newsletter submissions. Stable non-secret values such as Airtable base ID, Cloudflare account/KV IDs, R2 bucket names, the R2 public URL, R2 cleanup default, and Turnstile site key live in `src/constants`.

GitHub repository secrets should include `CICD_SECRET`.

Airtable backups use the private backup bucket configured in `src/constants/r2.ts`. Runtime image cache objects stay in the runtime R2 bucket under the `images/` prefix and are served through the configured public R2 URL. Backups only include table data plus any cached R2 image keys/public URLs already referenced by those records; they do not duplicate image objects into the backup bucket. The backup endpoint skips repeat runs for the same UTC date unless the manual workflow is dispatched with `force`.

The internal automation audit page at `/audit` uses `OPS_SECRET`, is marked `noindex` through page metadata, and shows CI-driven workflow logs from the backup R2 bucket. Workflow logs use append-free per-run summary objects under `logs/summaries/{workflow}/{date}/` and detail objects under `logs/details/{workflow}/{date}/`; R2 cleanup removes workflow log objects older than 60 days.
