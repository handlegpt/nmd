# Multi-stage build - Build stage
FROM node:20-alpine AS builder

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and lock file (keep package-lock.json for security)
COPY package*.json ./
COPY package-lock.json ./

# Environment variables will be passed via docker-compose

# Install all dependencies (including dev dependencies for build)
# Use npm ci for reproducible builds and better security
RUN npm ci && npm cache clean --force

# Copy source code (excluding files in .dockerignore)
COPY . .

# Build application with environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create public directory and copy files if they exist
RUN mkdir -p public
COPY --from=builder /app/public ./public

# Copy environment example file
COPY --from=builder /app/env.example ./env.example

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3011

ENV PORT 3011
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Health check with proper timeout and retries
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3011/api/health || exit 1

CMD ["node", "server.js"] 