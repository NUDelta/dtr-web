# DTR Website

Website for the Design, Technology, and Research (DTR) program at Northwestern University. View live at [http://dtr.northwestern.edu/](https://dtr.northwestern.edu/).

## Setup

1. Make sure you have [Node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.
2. Clone the repository, and create a `.env` file with the following:

   ```env
   AIRTABLE_API_KEY=<api-key-for-airtable>
   AIRTABLE_BASE_ID=<base-id-for-airtable>
   AIRTABLE_LOG=1  # Enable Airtable logging in production (1 to enable, 0 to disable)

   R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
   R2_ACCESS_KEY_ID="<access-key-id-for-r2>"
   R2_SECRET_ACCESS_KEY="<secret-access-key-for-r2>"
   R2_BUCKET="<bucket-name-for-r2>"
   R2_CLEANUP_MAX_AGE_DAYS="45"  # Max age in days for R2 cleanup (default: 45)
   ```

3. Run `yarn install` to install packages.

## Running Code Locally

### Local Development

To develop locally, run `yarn dev` and navigate to `localhost:3000` in your browser. Changes in code will automatically cause the website to be re-built and update the browser.

### Testing Production Build Locally

To test a production build:

```bash
yarn build
yarn start
```

Once started, navigate to `localhost:8080` in your browser.

## Development Process and Pushing to Production

We use [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform/) to host [https://dtr.northwestern.edu/](https://dtr.northwestern.edu/). It is configured to re-build the website whenever changes are pushed to the `main` branch of this repository. Because of that, we recommend you create a new branch when you have changes that you want to make, and create a pull request to merge into `main` once they are completed and tested.

## Technologies used

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Airtable](https://airtable.com/) and [Airtable API](https://airtable.com/api)

## Caching Architecture

The website implements a two-tier caching system to minimize Airtable API usage:

1. **Data Caching**: Airtable table data is cached using Next.js `use cache` with automatic revalidation based on `cacheLife` (new feature from Next.js 16, default 12 hours).
2. **Image Caching**: Images are downloaded once from Airtable and cached in Cloudflare R2 Bucket with hash-based invalidation and long-term caching headers.
