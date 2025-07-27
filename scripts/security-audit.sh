#!/bin/bash

echo "🔒 Running security audit for NomadNow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if package.json exists
if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo "📦 Checking for vulnerable dependencies..."

# Run npm audit
npm audit --production
AUDIT_EXIT_CODE=$?
print_status $AUDIT_EXIT_CODE "npm audit completed"

# Check for outdated packages
echo "🔄 Checking for outdated packages..."
npm outdated
OUTDATED_EXIT_CODE=$?
print_status $OUTDATED_EXIT_CODE "outdated packages check"

# Check for known vulnerabilities in dependencies
echo "🔍 Checking for known vulnerabilities..."
npm audit --audit-level=moderate
VULNERABILITIES_EXIT_CODE=$?
print_status $VULNERABILITIES_EXIT_CODE "vulnerability scan"

# Check Docker security
echo "🐳 Checking Docker security..."

# Check if Dockerfile exists
if [ -f Dockerfile ]; then
    echo -e "${GREEN}✅ Dockerfile found${NC}"
    
    # Check for common security issues in Dockerfile
    if grep -q "USER root" Dockerfile; then
        echo -e "${YELLOW}⚠️  Warning: Running as root user${NC}"
    else
        echo -e "${GREEN}✅ Non-root user configured${NC}"
    fi
    
    if grep -q "npm install" Dockerfile; then
        echo -e "${YELLOW}⚠️  Warning: Using npm install instead of npm ci${NC}"
    else
        echo -e "${GREEN}✅ Using npm ci for deterministic builds${NC}"
    fi
    
    # Check for legacy-peer-deps usage
    if grep -q "legacy-peer-deps" Dockerfile; then
        echo -e "${YELLOW}⚠️  Warning: Using --legacy-peer-deps flag${NC}"
        echo -e "${YELLOW}   This may indicate dependency conflicts that should be resolved${NC}"
    else
        echo -e "${GREEN}✅ No legacy-peer-deps usage detected${NC}"
    fi
else
    echo -e "${RED}❌ Dockerfile not found${NC}"
fi

# Check .dockerignore
if [ -f .dockerignore ]; then
    echo -e "${GREEN}✅ .dockerignore found${NC}"
    
    # Check for critical exclusions
    if grep -q "\.env" .dockerignore; then
        echo -e "${GREEN}✅ .env files excluded${NC}"
    else
        echo -e "${RED}❌ .env files not excluded${NC}"
    fi
    
    if grep -q "node_modules" .dockerignore; then
        echo -e "${GREEN}✅ node_modules excluded${NC}"
    else
        echo -e "${RED}❌ node_modules not excluded${NC}"
    fi
else
    echo -e "${RED}❌ .dockerignore not found${NC}"
fi

# Check for sensitive files
echo "🔐 Checking for sensitive files..."
SENSITIVE_FILES=0

if [ -f .env ]; then
    echo -e "${RED}❌ .env file found in repository${NC}"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

if [ -f .env.local ]; then
    echo -e "${RED}❌ .env.local file found in repository${NC}"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

if [ -f .env.production ]; then
    echo -e "${RED}❌ .env.production file found in repository${NC}"
    SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
fi

if [ $SENSITIVE_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive files found in repository${NC}"
fi

# Check for dependency conflicts
echo "🔍 Checking for dependency conflicts..."
if npm ls 2>&1 | grep -q "ERESOLVE"; then
    echo -e "${RED}❌ Dependency conflicts detected${NC}"
    echo -e "${YELLOW}   Run 'npm ls' to see detailed conflicts${NC}"
    DEPENDENCY_CONFLICTS=1
else
    echo -e "${GREEN}✅ No dependency conflicts detected${NC}"
    DEPENDENCY_CONFLICTS=0
fi

# Summary
echo ""
echo "📊 Security Audit Summary:"
echo "=========================="

if [ $AUDIT_EXIT_CODE -eq 0 ] && [ $VULNERABILITIES_EXIT_CODE -eq 0 ] && [ $SENSITIVE_FILES -eq 0 ] && [ $DEPENDENCY_CONFLICTS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed${NC}"
    echo ""
    echo "Recommendations:"
    echo "1. Run 'npm audit fix' to fix any vulnerabilities"
    echo "2. Update dependencies regularly"
    echo "3. Use 'npm ci' instead of 'npm install' in Docker"
    echo "4. Run as non-root user in containers"
    echo "5. Exclude sensitive files from Docker builds"
    echo "6. Resolve any dependency conflicts"
else
    echo -e "${RED}❌ Security issues found${NC}"
    echo ""
    echo "Actions needed:"
    if [ $AUDIT_EXIT_CODE -ne 0 ]; then
        echo "- Run 'npm audit fix' to fix vulnerabilities"
    fi
    if [ $SENSITIVE_FILES -gt 0 ]; then
        echo "- Remove sensitive files from repository"
    fi
    if [ $DEPENDENCY_CONFLICTS -eq 1 ]; then
        echo "- Resolve dependency conflicts"
    fi
    echo "- Review Docker security configuration"
fi

echo ""
echo "🔒 Security audit completed!" 