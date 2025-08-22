# Use Node.js 18 Alpine image for smaller size and security
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Install Supabase client with compatible version
RUN npm install @supabase/supabase-js@2.38.4

# Fix Metro bundler compatibility issues
RUN npm install --save-dev metro-config metro-resolver

# Force reinstall to ensure proper module resolution
RUN rm -rf node_modules/@supabase && npm install

# Copy source code
COPY . .

# Install TypeScript and other required dependencies
RUN npx expo install typescript@^5.3.0

# Fix expo-camera version compatibility
RUN npx expo install expo-camera@~14.1.3

# Clean npm cache and verify installation
RUN npm cache clean --force && npm ls expo-camera

# Verify Metro configuration
RUN node -e "console.log('Metro config loaded successfully'); require('./metro.config.js');"

# Set production environment variables
ENV NODE_ENV=production
ENV EXPO_WEB_OPTIMIZE=true
ENV EXPO_WEB_MINIFY=true
ENV EXPO_DEBUG=false
ENV EXPO_WEB_BUNDLE_ANALYZER=false
ENV EXPO_WEB_SOURCE_MAPS=false
ENV EXPO_WEB_CACHE=true
ENV EXPO_WEB_COMPRESS=true
ENV EXPO_WEB_GZIP=true

# Build the production web app with webpack
RUN NODE_ENV=production npx expo export --platform web

# Install serve for static file serving
RUN npm install -g serve

# Expose port
EXPOSE 19006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:19006/ || exit 1

# Start static file server
CMD ["serve", "-s", "web-build", "-l", "19006"] 