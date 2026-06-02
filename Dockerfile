FROM node:lts-alpine AS base

# Stage 1: deps
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments for sensitive configuration
ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID
ARG CLOUDFLARE_API_KEY
ARG CLOUDFLARE_ACCOUNT_ID
ARG CLOUDFLARE_KV_NAMESPACE_ID
ARG R2_BUCKET
ARG R2_BACKUP_BUCKET
ARG NEXT_PUBLIC_R2_BUCKET_PUBLIC_URL
ARG R2_CLEANUP_MAX_AGE_DAYS
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Set environment variables for the build process
ENV AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
ENV AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}
ENV CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
ENV CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
ENV CLOUDFLARE_KV_NAMESPACE_ID=${CLOUDFLARE_KV_NAMESPACE_ID}
ENV R2_BUCKET=${R2_BUCKET}
ENV R2_BACKUP_BUCKET=${R2_BACKUP_BUCKET}
ENV NEXT_PUBLIC_R2_BUCKET_PUBLIC_URL=${NEXT_PUBLIC_R2_BUCKET_PUBLIC_URL}
ENV R2_CLEANUP_MAX_AGE_DAYS=${R2_CLEANUP_MAX_AGE_DAYS}
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

RUN corepack enable pnpm && pnpm run build

# Stage 3: runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# copy standalone build output and public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
