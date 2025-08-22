#!/bin/bash

# Production environment startup script
export NODE_ENV=production
export EXPO_WEB_OPTIMIZE=true
export EXPO_WEB_MINIFY=true
export EXPO_DEBUG=false
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_WEB_BUNDLE_ANALYZER=false
export EXPO_WEB_SOURCE_MAPS=false
export EXPO_WEB_CACHE=true
export EXPO_WEB_COMPRESS=true
export EXPO_WEB_GZIP=true

echo "Starting NomadNow in production mode..."
echo "NODE_ENV: $NODE_ENV"
echo "EXPO_WEB_OPTIMIZE: $EXPO_WEB_OPTIMIZE"

# Start the application in production mode
npx expo start --web --port 19006 --host lan
