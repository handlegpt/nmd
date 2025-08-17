# NomadNow Development and Deployment
# Usage: make <target>

.PHONY: help setup build start stop clean logs security-audit audit-fix

# Default target
help:
	@echo "NomadNow - Digital Nomad Social App"
	@echo "=================================="
	@echo "Available targets:"
	@echo "  setup          - Initial setup and dependency installation"
	@echo "  build          - Build Docker image"
	@echo "  start          - Start the application"
	@echo "  stop           - Stop the application"
	@echo "  logs           - View application logs"
	@echo "  clean          - Clean up containers and images"
	@echo "  security-audit - Run security audit and checks"
	@echo "  audit-fix      - Fix security vulnerabilities"

# Initial setup
setup:
	@echo "🔧 Setting up NomadNow..."
	@if [ ! -f "package-lock.json" ]; then \
		echo "Installing dependencies..."; \
		npm install; \
	fi
	@echo "✅ Setup completed"

# Build Docker image
build:
	@echo "🏗️ Building Docker image..."
	@docker-compose build
	@echo "✅ Build completed"

# Start the application
start:
	@echo "🚀 Starting NomadNow..."
	@docker-compose up -d
	@echo "✅ Application started"
	@echo "🌐 Available at: http://localhost:8081"

# Stop the application
stop:
	@echo "🛑 Stopping NomadNow..."
	@docker-compose down
	@echo "✅ Application stopped"

# View logs
logs:
	@echo "📋 Viewing application logs..."
	@docker-compose logs -f nomadnow-web

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@docker-compose down
	@docker rmi nomadnow:latest 2>/dev/null || true
	@docker system prune -f
	@echo "✅ Cleanup completed"

# Security audit
security-audit:
	@echo "🔒 Running security audit..."
	@chmod +x scripts/security-audit.sh
	@./scripts/security-audit.sh

# Fix security vulnerabilities
audit-fix:
	@echo "🔧 Fixing security vulnerabilities..."
	@npm audit fix
	@echo "✅ Security fixes applied"

# Full deployment
deploy: setup security-audit build start
	@echo "🎉 Deployment completed!" 