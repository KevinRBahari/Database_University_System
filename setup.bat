@echo off
setlocal EnableDelayedExpansion

echo 🏛️  University Database System - Windows Setup Script
echo ==============================================

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js (v20.19.0 or higher) first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: !NODE_VERSION!

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Get npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm version: !NPM_VERSION!

echo.
echo 🔧 Setting up Backend...
echo ========================

cd backend

:: Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install

:: Create .env file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file for backend...
    (
        echo # Backend Environment Configuration
        echo PORT=3000
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-%RANDOM%
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo DB_PATH=./database_university.db
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    echo ✅ Created .env file with default configuration
) else (
    echo 📄 .env file already exists, skipping creation
)

cd ..

echo ✅ Backend setup completed!

echo.
echo 🎨 Setting up Frontend...
echo ========================

cd database_university_system

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

:: Create .env file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file for frontend...
    (
        echo # Frontend Environment Configuration
        echo VITE_API_URL=http://localhost:3000/api
        echo VITE_APP_NAME=University Database System
        echo VITE_APP_VERSION=1.0.0
        echo.
        echo # Development Configuration
        echo VITE_DEV_SERVER_PORT=5173
        echo VITE_DEV_SERVER_HOST=localhost
    ) > .env
    echo ✅ Created .env file with default configuration
) else (
    echo 📄 .env file already exists, skipping creation
)

cd ..

echo ✅ Frontend setup completed!

echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.
echo 📋 Next steps:
echo 1. Start the backend: cd backend && npm run dev
echo 2. Start the frontend: cd database_university_system && npm run dev
echo.
echo 🌐 Application URLs:
echo • Frontend: http://localhost:5173
echo • Backend API: http://localhost:3000
echo • Backend API Health: http://localhost:3000/api/health
echo.
echo 📖 For more information, check the README.md files in each directory
echo.
echo Happy coding! 🚀
echo.
pause
