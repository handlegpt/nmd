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

# Install additional dependencies for new features
RUN npx expo install expo-clipboard expo-sharing

# Install nodemailer and server dependencies for email functionality
RUN npm install nodemailer@^6.9.7 express@^4.18.2 cors@^2.8.5

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

# Set default email configuration (can be overridden with --build-arg)
ENV EXPO_PUBLIC_RESEND_FROM=noreply@nomadnow.app
ENV EXPO_PUBLIC_FROM_NAME=NomadNow

# Build the production web app with webpack
# Pass sensitive environment variables to the build process
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_GOOGLE_CLIENT_ID
ARG EXPO_PUBLIC_GOOGLE_CLIENT_SECRET
ARG EXPO_PUBLIC_GOOGLE_REDIRECT_URI
ARG EXPO_PUBLIC_SMTP_USER
ARG EXPO_PUBLIC_SMTP_PASS
ARG EXPO_PUBLIC_EMAILJS_SERVICE_ID
ARG EXPO_PUBLIC_EMAILJS_TEMPLATE_ID
ARG EXPO_PUBLIC_EMAILJS_USER_ID

# Set environment variables (sensitive ones from ARG, others have defaults)
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_GOOGLE_CLIENT_ID=$EXPO_PUBLIC_GOOGLE_CLIENT_ID
ENV EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=$EXPO_PUBLIC_GOOGLE_CLIENT_SECRET
ENV EXPO_PUBLIC_GOOGLE_REDIRECT_URI=$EXPO_PUBLIC_GOOGLE_REDIRECT_URI
ENV EXPO_PUBLIC_APP_NAME=NomadNow
ENV EXPO_PUBLIC_APP_DOMAIN=nomadnow.app
ENV EXPO_PUBLIC_APP_VERSION=1.0.0
ENV EXPO_PUBLIC_SMTP_USER=$EXPO_PUBLIC_SMTP_USER
ENV EXPO_PUBLIC_SMTP_PASS=$EXPO_PUBLIC_SMTP_PASS
ENV EXPO_PUBLIC_EMAILJS_SERVICE_ID=$EXPO_PUBLIC_EMAILJS_SERVICE_ID
ENV EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=$EXPO_PUBLIC_EMAILJS_TEMPLATE_ID
ENV EXPO_PUBLIC_EMAILJS_USER_ID=$EXPO_PUBLIC_EMAILJS_USER_ID

RUN NODE_ENV=production npx expo export --platform web

# Install serve for static file serving
RUN npm install -g serve

# Expose ports
EXPOSE 19006 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:19006/ || exit 1

# Set up startup script permissions
RUN chmod +x /app/start.sh

# Start both servers
CMD ["/app/start.sh"] 