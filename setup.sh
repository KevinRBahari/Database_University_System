#!/bin/bash

# University Database System - Complete Setup Script
# This script sets up both backend and frontend for development

set -e  # Exit on any error

echo "🏛️  University Database System - Setup Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v20.19.0 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="20.19.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v$REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Function to setup backend
setup_backend() {
    echo ""
    echo "🔧 Setting up Backend..."
    echo "========================"
    
    cd backend
    
    # Install backend dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "📄 Creating .env file for backend..."
        cat > .env << EOF
# Backend Environment Configuration
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-$(date +%s)
NODE_ENV=development

# Database Configuration
DB_PATH=./database_university.db

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
EOF
        echo "✅ Created .env file with default configuration"
    else
        echo "📄 .env file already exists, skipping creation"
    fi
    
    cd ..
    echo "✅ Backend setup completed!"
}

# Function to setup frontend
setup_frontend() {
    echo ""
    echo "🎨 Setting up Frontend..."
    echo "========================"
    
    cd database_university_system
    
    # Install frontend dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "📄 Creating .env file for frontend..."
        cat > .env << EOF
# Frontend Environment Configuration
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=University Database System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost
EOF
        echo "✅ Created .env file with default configuration"
    else
        echo "📄 .env file already exists, skipping creation"
    fi
    
    cd ..
    echo "✅ Frontend setup completed!"
}

# Main setup process
echo ""
echo "🚀 Starting setup process..."

# Setup backend
setup_backend

# Setup frontend
setup_frontend

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd database_university_system && npm run dev"
echo ""
echo "🌐 Application URLs:"
echo "• Frontend: http://localhost:5173"
echo "• Backend API: http://localhost:3000"
echo "• Backend API Health: http://localhost:3000/api/health"
echo ""
echo "📖 For more information, check the README.md files in each directory"
echo ""
echo "Happy coding! 🚀"
