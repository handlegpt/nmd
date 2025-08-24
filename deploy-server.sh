#!/bin/bash

# Server deployment script for NomadNow
# Only need to pass sensitive information as build arguments

echo "🚀 Building NomadNow for server deployment..."

# Build with only sensitive environment variables
docker build \
  --build-arg EXPO_PUBLIC_SUPABASE_URL="$EXPO_PUBLIC_SUPABASE_URL" \
  --build-arg EXPO_PUBLIC_SUPABASE_ANON_KEY="$EXPO_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg EXPO_PUBLIC_GOOGLE_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_CLIENT_ID" \
  --build-arg EXPO_PUBLIC_GOOGLE_CLIENT_SECRET="$EXPO_PUBLIC_GOOGLE_CLIENT_SECRET" \
  --build-arg EXPO_PUBLIC_GOOGLE_REDIRECT_URI="$EXPO_PUBLIC_GOOGLE_REDIRECT_URI" \
  --build-arg EXPO_PUBLIC_SMTP_USER="$EXPO_PUBLIC_SMTP_USER" \
  --build-arg EXPO_PUBLIC_SMTP_PASS="$EXPO_PUBLIC_SMTP_PASS" \
  --build-arg EXPO_PUBLIC_EMAILJS_SERVICE_ID="$EXPO_PUBLIC_EMAILJS_SERVICE_ID" \
  --build-arg EXPO_PUBLIC_EMAILJS_TEMPLATE_ID="$EXPO_PUBLIC_EMAILJS_TEMPLATE_ID" \
  --build-arg EXPO_PUBLIC_EMAILJS_USER_ID="$EXPO_PUBLIC_EMAILJS_USER_ID" \
  -t nmd-nomadnow .

echo "✅ Build completed!"
echo "📧 Email configuration is now built into the image"
echo "🔧 Run: docker run -p 19006:19006 -p 3001:3001 nmd-nomadnow"
