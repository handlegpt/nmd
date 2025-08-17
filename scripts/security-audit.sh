#!/bin/bash

# Security Audit Script for NomadNow
# This script performs security checks before deployment

set -e

echo "🔒 Starting security audit for NomadNow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking for package-lock.json..."
if [ ! -f "package-lock.json" ]; then
    print_warning "package-lock.json not found. Generating..."
    npm install
fi

print_status "Running npm audit for production dependencies..."
npm audit --production --audit-level=moderate || {
    print_warning "Security vulnerabilities found. Check the audit report above."
    read -p "Continue with build? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Build cancelled due to security concerns."
        exit 1
    fi
}

print_status "Checking for .dockerignore file..."
if [ ! -f ".dockerignore" ]; then
    print_error ".dockerignore file not found. This is required for security."
    exit 1
fi

print_status "Checking for sensitive files..."
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "*.key"
    "*.pem"
    "*.crt"
    "id_rsa"
    "id_ed25519"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$file" -type f | grep -q .; then
        print_warning "Sensitive file found: $file"
    fi
done

print_status "Checking Dockerfile security..."
if [ -f "Dockerfile" ]; then
    # Check for security best practices
    if grep -q "npm ci" Dockerfile; then
        print_success "Using npm ci for deterministic builds"
    else
        print_warning "Consider using npm ci instead of npm install"
    fi
    
    if grep -q "USER nextjs" Dockerfile; then
        print_success "Non-root user configured"
    else
        print_warning "Consider running as non-root user"
    fi
    
    if grep -q "HEALTHCHECK" Dockerfile; then
        print_success "Health check configured"
    else
        print_warning "Consider adding health check"
    fi
else
    print_error "Dockerfile not found"
    exit 1
fi

print_status "Checking docker-compose.yml security..."
if [ -f "docker-compose.yml" ]; then
    if grep -q "security_opt" docker-compose.yml; then
        print_success "Security options configured"
    else
        print_warning "Consider adding security_opt: no-new-privileges"
    fi
    
    if grep -q "healthcheck" docker-compose.yml; then
        print_success "Health check configured in docker-compose"
    else
        print_warning "Consider adding health check in docker-compose"
    fi
else
    print_error "docker-compose.yml not found"
    exit 1
fi

print_status "Security checklist completed:"
echo "✅ package-lock.json present"
echo "✅ npm audit completed"
echo "✅ .dockerignore configured"
echo "✅ Dockerfile security checked"
echo "✅ docker-compose.yml security checked"

print_success "Security audit completed successfully!"
print_status "To build and run the application:"
echo "  make build"
echo "  make start"
echo ""
print_status "Or use the full deployment command:"
echo "  make deploy" 