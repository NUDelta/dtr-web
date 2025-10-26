FROM node:lts-alpine AS base

# Stage 1: deps
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments for sensitive configuration
ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID
ARG AIRTABLE_LOG
ARG R2_ENDPOINT
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ARG R2_BUCKET
ARG R2_CLEANUP_MAX_AGE_DAYS
ARG R2_CRON_SECRET

# Set environment variables for the build process
ENV AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
ENV AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}
ENV AIRTABLE_LOG=${AIRTABLE_LOG}
ENV R2_ENDPOINT=${R2_ENDPOINT}
ENV R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
ENV R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
ENV R2_BUCKET=${R2_BUCKET}
ENV R2_CLEANUP_MAX_AGE_DAYS=${R2_CLEANUP_MAX_AGE_DAYS}
ENV R2_CRON_SECRET=${R2_CRON_SECRET}

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
