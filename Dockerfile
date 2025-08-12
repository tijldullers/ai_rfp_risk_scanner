
# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (use npm instead of yarn to avoid workspace conflicts)
COPY app/package.json ./app/

# Remove any conflicting lock files and install with npm instead 
RUN rm -f app/yarn.lock app/package-lock.json

# Install app dependencies with npm (more reliable in Docker)
WORKDIR /app/app
RUN npm install --production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/app/node_modules ./app/node_modules
COPY . .

# Set up environment for build (fix legacy env format)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Generate Prisma client in the app directory
WORKDIR /app/app
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096 --expose-gc"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/app/public ./app/public

# Set the correct permission for prerender cache
RUN mkdir -p .next app/.next
RUN chown nextjs:nodejs .next app/.next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app/.next/static ./app/.next/static

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/app/prisma ./app/prisma
COPY --from=builder --chown=nextjs:nodejs /app/app/node_modules/.prisma ./app/node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "app/server.js"]

