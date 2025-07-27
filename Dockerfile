# Use specific version for better security
FROM node:18.19-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install only necessary system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    && rm -rf /var/cache/apk/*

# Install Expo CLI globally with specific version
RUN npm install -g @expo/cli@latest && \
    npm cache clean --force

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies with security best practices
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force && \
    # Remove unnecessary files
    rm -rf /root/.npm && \
    rm -rf /root/.cache

# Copy project files (excluding those in .dockerignore)
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p assets && \
    mkdir -p .expo && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose ports for Expo development server
EXPOSE 19000 19001 19002

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:19002 || exit 1

# Start command
CMD ["npm", "start"] 