#!/bin/bash

echo "🧹 Cleaning up NomadNow..."

# Stop and remove containers
docker-compose down

# Remove containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans

# Remove node_modules (optional)
read -p "Do you want to remove node_modules? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing node_modules..."
    rm -rf node_modules
fi

echo "✅ Cleanup completed!" 