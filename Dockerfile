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
ARG CLOUDFLARE_API_TOKEN
ARG CICD_SECRET
ARG OPS_SECRET
ARG TURNSTILE_SECRET_KEY
ARG LETTER_SUBSCRIBE_APPS_SCRIPT_URL

# Set environment variables for the build process
ENV AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
ENV CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
ENV CICD_SECRET=${CICD_SECRET}
ENV OPS_SECRET=${OPS_SECRET}
ENV TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
ENV LETTER_SUBSCRIBE_APPS_SCRIPT_URL=${LETTER_SUBSCRIBE_APPS_SCRIPT_URL}

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
