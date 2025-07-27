#!/bin/bash

echo "🚀 Quick start for NomadNow..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup.sh first or create .env file manually."
    echo "You can copy env.example to .env and edit it:"
    echo "cp env.example .env"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🐳 Starting NomadNow with Docker Compose..."
docker-compose up --build

echo "✅ NomadNow is running!"
echo "📱 Open http://localhost:19002 in your browser to access Expo DevTools"
echo "📱 Use Expo Go app to scan the QR code for mobile testing" 