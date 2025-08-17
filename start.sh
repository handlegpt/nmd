#!/bin/bash

# Start script for NomadNow
echo "Starting NomadNow..."

# Set environment variables
export EXPO_WEB_PORT=19006
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export NODE_ENV=development

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting Expo development server..."
npx expo start --web --port 19006 --host lan
