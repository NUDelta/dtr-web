# DTR Website

Website for the Design, Technology, and Research (DTR) program at Northwestern University. View live at [http://dtr.northwestern.edu/](https://dtr.northwestern.edu/).

## Setup

1. Make sure you have [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/installation#using-corepack) (recommend install with corepack) installed.
2. Clone the repository, and change the `.env.example` file to `.env`, filling in the required environment variables.
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
- [Airtable](https://airtable.com/) and [Airtable API](https://airtable.com/api)

## Caching Architecture

The website implements a two-tier caching system to minimize Airtable API usage:

1. **Data Caching**: Airtable table data is cached using Next.js `use cache` with automatic revalidation based on `cacheLife` (new feature from Next.js 16, default 12 hours).
2. **Image Caching**: Images are downloaded once from Airtable and cached in Cloudflare R2 Bucket with hash-based invalidation and long-term caching headers.
