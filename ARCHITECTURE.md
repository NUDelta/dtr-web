# Architecture

## Overview

DTR Web is a Next.js app running on DigitalOcean App Platform, with Airtable as the content source and Cloudflare used for cache storage, image/object storage, maintenance logs, and bot protection.

The public site is rendered by Next.js with ISR, currently using a one hour revalidation window for Airtable-backed public pages while the Airtable cache is refreshed by GitHub Actions every twelve hours.

The app does not run on Cloudflare Workers. Cloudflare is used through the Cloudflare TypeScript API client from the DigitalOcean-hosted server.

## Configuration

Stable non-secret identifiers live in `src/constants`, including the Airtable base ID, Cloudflare account ID, KV namespace ID, R2 bucket names, R2 public URL, Turnstile site key, and cleanup defaults.

Runtime secrets stay in environment variables, including `AIRTABLE_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CICD_SECRET`, `OPS_SECRET`, `TURNSTILE_SECRET_KEY`, and `LETTER_SUBSCRIBE_APPS_SCRIPT_URL`.

`SKIP_REMOTE_DATA=1` is a local-only escape hatch for builds or development sessions that do not have Airtable or Cloudflare credentials.

## Cloudflare Client

All server-side Cloudflare API calls go through `src/lib/cloudflare.ts`, which creates one Cloudflare SDK client using `CLOUDFLARE_API_TOKEN`.

The app talks to Cloudflare through the public Cloudflare API, not Worker bindings, because the production runtime is DigitalOcean rather than a Worker.

## Workers KV

Workers KV stores Airtable record cache envelopes under the `airtable-cache:` prefix, with fresh and stale timestamps kept in the JSON value and a physical KV TTL used for cleanup.

The Airtable cache store lives in `src/lib/airtable/cloudflare-kv-cache.ts` and is injected into `ts-airtable`, so normal data reads try KV first before falling back to Airtable.

The `ts-airtable` method-level record cache is intentionally disabled; `src/lib/airtable/airtable.ts` owns the all-record cache key and explicitly normalizes image attachment URLs to R2 before writing rows to KV.

Scheduled refreshes use `/api/airtable-refresh`, called by `.github/workflows/airtable-refresh.yml`, to refresh specific Airtable tables, update KV cache entries, and write per-table refresh state.

Refresh and backup guard keys are also stored in KV, but they are best-effort locks because Workers KV does not provide compare-and-set semantics; GitHub Actions concurrency is the main serializer.

Maintenance logs are written as separate KV entries with date-based key prefixes such as `airtable-refresh-log`, `airtable-backup-log`, `r2-gc-log`, and `airtable-log`.

## R2 Images

Optimized Airtable images are stored in the runtime R2 bucket configured in `src/constants/r2.ts`, under keys like `images/{attachmentId}/{variant}/{basename}.webp` and `images/{attachmentId}/{variant}/{basename}.avif`.

`src/lib/image-cache.ts` fetches short-lived Airtable attachment URLs on cache misses, transcodes the image with Sharp, uploads WebP and AVIF variants to R2, and returns the stable public R2 URL.

If image transcoding fails after the Airtable file has been fetched, the image cache stores the original bytes under `images/{attachmentId}/original/{filename}` and returns that R2 URL instead of keeping the short-lived Airtable URL in cache.

When a later refresh sees an attachment that only has an original fallback in R2, the image cache can read that original object and retry WebP and AVIF generation without needing the Airtable signed URL to still be valid.

The public R2 domain is allowed in `next.config.ts` because those URLs are passed to `next/image` in people and project views.

## R2 Backups

Airtable backups use a separate private R2 backup bucket configured in `src/constants/r2.ts`.

`/api/airtable-backup`, called by `.github/workflows/airtable-backup.yml`, writes table snapshots under `backups/airtable/{date}/`, writes a manifest, and records references to any already-cached R2 image variants without copying image objects into the backup bucket.

The backup process also archives recent maintenance logs into the backup bucket under `backups/logs/{date}/`.

## R2 Cleanup

`/api/r2-gc`, called by `.github/workflows/r2-gc.yml`, scans the runtime image prefix and compares each object key against the current Airtable records stored in Workers KV.

The cleanup job stores its last-run marker in the runtime R2 bucket at `gc/last-run.json` to avoid scanning too often.

The cleanup job treats the Airtable KV cache as the source of truth for live image references; R2 object metadata such as last-modified time is not used for deletion decisions.

Live image references include WebP and AVIF keys for each image attachment, and include an original fallback key only while cached site data is still pointing at that fallback URL.

The cleanup job stores orphan tracking state in Workers KV at `r2-gc:orphan-state`, records the first time each unreferenced image object was seen, and deletes only after that object has stayed absent from live references for fifteen days.

If any required Airtable table cache is missing or cannot be parsed, the cleanup job skips deletion for that run so a cache outage cannot turn live images into false orphans.

The cleanup job has a deletion cap per run so a single invocation cannot remove an unbounded number of objects.

The cleanup job writes normal run diagnostics under `r2-gc-log` and orphan-state diagnostics under `r2-gc-orphan-log`, both of which are visible through the automation audit tooling and can be archived by backup jobs.

## Automation Audit Page

The internal audit page at `/audit` reads recent CI-driven KV log entries and backup-bucket log archive manifests.

Access to the audit page is protected by `OPS_SECRET` and a Turnstile challenge, and the page is marked `noindex`.

## Turnstile

The public Turnstile site key is source-controlled because it is safe to expose in HTML.

The Turnstile secret key stays in runtime environment variables and is used by `src/lib/turnstile.ts` to verify tokens against Cloudflare Siteverify before accepting newsletter submissions or ops login attempts.

## GitHub Actions

GitHub Actions control the scheduled maintenance cadence instead of letting unpredictable user traffic decide when expensive refresh work happens.

The refresh workflow runs every twelve hours and calls one table at a time to reduce timeout and quota risk.

The backup workflow runs weekly by default and can be manually forced.

The R2 cleanup workflow runs daily and uses `CICD_SECRET` to call the protected endpoint.

## Failure Behavior

Public pages can serve stale KV data for an extended window if Airtable or Cloudflare writes fail.

Image cache misses can fall back to the original Airtable attachment URL if R2 upload or image transcoding fails during attachment transformation.

Maintenance logging is best effort and intentionally does not block refresh, backup, or cleanup work.

## Current Boundaries

Cloudflare stores cache, objects, backups, logs, and Turnstile verification state, but application routing and rendering remain in Next.js on DigitalOcean.

If the site later moves to Cloudflare Workers, the main migration work is replacing Cloudflare public API calls with Worker KV and R2 bindings while keeping the same key and object layout.
