#!/bin/bash

echo "🛑 Stopping NomadNow..."

# Stop Docker Compose services
docker-compose down

echo "✅ NomadNow stopped successfully!" 