# Use Node.js 18 Alpine image for smaller size and security
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl nginx

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Install Supabase client and fix package versions
RUN npm install @supabase/supabase-js@^2.39.0

# Copy source code
COPY . .

# Install TypeScript and other required dependencies
RUN npx expo install typescript@^5.3.0

# Fix expo-camera version compatibility
RUN npx expo install expo-camera@~14.1.3

# Clean npm cache and verify installation
RUN npm cache clean --force && npm ls expo-camera

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

# Build the production web app
RUN npm run build

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /app/web-build; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    location /_expo/ { \
        proxy_pass http://localhost:19006; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/http.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 