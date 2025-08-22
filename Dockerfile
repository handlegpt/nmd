# Use Node.js Alpine for smaller image size and security
FROM node:18.19-alpine

# Set working directory
WORKDIR /app

# Install system dependencies with security updates
RUN apk add --no-cache --update \
    curl \
    git \
    bash \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for Expo CLI)
RUN npm install && \
    npm cache clean --force

# Copy project files (excluding .dockerignore contents)
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p assets && \
    mkdir -p .expo/web && \
    mkdir -p .expo/ios && \
    mkdir -p .expo/android && \
    mkdir -p .expo/metro && \
    chmod +x start.sh && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 777 .expo

# Switch to non-root user
USER nextjs

# Set environment variables for Expo
ENV EXPO_WEB_PORT=19006
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV NODE_ENV=development

# Google OAuth Environment Variables
ENV EXPO_PUBLIC_GOOGLE_CLIENT_ID=""
ENV EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=""
ENV EXPO_PUBLIC_GOOGLE_REDIRECT_URI="https://nomad.now/auth/callback"
ENV EXPO_PUBLIC_GOOGLE_DEV_REDIRECT_URI="http://localhost:19006/auth/callback"

# Supabase Environment Variables (for production)
ENV EXPO_PUBLIC_SUPABASE_URL=""
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=""

# App Configuration
ENV EXPO_PUBLIC_APP_NAME="NomadNow"
ENV EXPO_PUBLIC_APP_DOMAIN="nomad.now"
ENV EXPO_PUBLIC_APP_VERSION="1.0.0"

# Expose web port
EXPOSE 19006

# Health check for web interface
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:19006 || exit 1

# Start the web development server using the start script
CMD ["./start.sh"] 