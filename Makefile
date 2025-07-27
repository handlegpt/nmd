.PHONY: help setup start stop clean build logs security-audit audit-fix

# Default target
help:
	@echo "NomadNow - Digital Nomad Social App"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup           - Initial project setup"
	@echo "  make start           - Start the application"
	@echo "  make stop            - Stop the application"
	@echo "  make clean           - Clean up containers and images"
	@echo "  make build           - Build Docker images"
	@echo "  make logs            - View application logs"
	@echo "  make security-audit  - Run security audit"
	@echo "  make audit-fix       - Fix security vulnerabilities"
	@echo "  make help            - Show this help message"

# Initial setup
setup:
	@echo "🚀 Setting up NomadNow..."
	@chmod +x scripts/*.sh
	@./scripts/setup.sh

# Start the application
start:
	@echo "🚀 Starting NomadNow..."
	@./scripts/start.sh

# Stop the application
stop:
	@echo "🛑 Stopping NomadNow..."
	@./scripts/stop.sh

# Clean up
clean:
	@echo "🧹 Cleaning up NomadNow..."
	@./scripts/clean.sh

# Build Docker images
build:
	@echo "🔨 Building Docker images..."
	@docker-compose build

# View logs
logs:
	@echo "📋 Viewing application logs..."
	@docker-compose logs -f nomadnow-app

# Security audit
security-audit:
	@echo "🔒 Running security audit..."
	@chmod +x scripts/security-audit.sh
	@./scripts/security-audit.sh

# Fix security vulnerabilities
audit-fix:
	@echo "🔧 Fixing security vulnerabilities..."
	@npm audit fix
	@echo "✅ Security vulnerabilities fixed!"

# Install dependencies locally
install:
	@echo "📦 Installing dependencies..."
	@npm install

# Run tests
test:
	@echo "🧪 Running tests..."
	@npm test

# Lint code
lint:
	@echo "🔍 Linting code..."
	@npm run lint

# Format code
format:
	@echo "✨ Formatting code..."
	@npx prettier --write "src/**/*.{ts,tsx,js,jsx}" 