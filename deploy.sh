#!/bin/bash
# Campus Lost & Found - Deployment Script
# This script automates the entire deployment process

set -e

echo "================================"
echo "Campus Lost & Found - Deploy"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi
echo "✅ Firebase CLI found: $(firebase --version)"

if ! command -v gcloud &> /dev/null; then
    echo "⚠️  Google Cloud SDK not found. Some features may not work."
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
fi

echo ""
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
cd functions
npm install
cd ..
echo "✅ Dependencies installed"

echo ""
echo -e "${BLUE}Step 2: Checking Firebase configuration...${NC}"

# Check if .env exists
if [ ! -f "functions/.env" ]; then
    echo "⚠️  functions/.env not found"
    echo "   Copying from .env.example..."
    cp functions/.env.example functions/.env 2>/dev/null || cp .env.example functions/.env 2>/dev/null || true
    echo "   ⚠️  Please update functions/.env with your credentials"
fi

# Check if config.js has been updated
if grep -q "YOUR_FIREBASE_API_KEY" public/js/config.js; then
    echo "❌ public/js/config.js still has placeholder values"
    echo "   Please update with your Firebase project credentials"
    exit 1
fi
echo "✅ Firebase config looks good"

echo ""
echo -e "${BLUE}Step 3: Building frontend...${NC}"
echo "✅ Frontend ready (no build step needed)"

echo ""
echo -e "${BLUE}Step 4: Deploying to Firebase...${NC}"
echo "   This requires you to be logged in to Firebase"
echo ""

# Ask for deployment confirmation
read -p "Deploy now? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy
firebase deploy

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Get deployment URL
PROJECT_ID=$(firebase projects:list --json | jq -r '.[0].projectId' 2>/dev/null || echo "your-project-id")

echo "🎉 Your app is live!"
echo ""
echo "URLs:"
echo "  Frontend: https://${PROJECT_ID}.web.app"
echo "  Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}"
echo ""
echo "Next steps:"
echo "  1. Test the app at the URL above"
echo "  2. Create test users and items"
echo "  3. Verify matching works"
echo "  4. Share the link!"
echo ""
echo "For support, see SETUP.md"
