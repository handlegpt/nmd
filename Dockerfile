# Use Node.js Alpine for smaller image size
FROM node:18.19-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies with security best practices
RUN npm install --legacy-peer-deps && \
    npm cache clean --force && \
    npm audit --audit-level=moderate

# Copy project files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p assets && \
    mkdir -p .expo/web && \
    mkdir -p .expo/ios && \
    mkdir -p .expo/android && \
    mkdir -p .expo/metro && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 777 .expo

# Switch to non-root user
USER nextjs

# Expose web port
EXPOSE 19006

# Health check for web interface
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:19006 || exit 1

# Start the web development server
CMD ["npm", "start"] 