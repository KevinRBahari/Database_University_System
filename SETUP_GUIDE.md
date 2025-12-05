# 🏛️ University Database System - Setup Guide

## 🚀 Quick Start

Choose one of the following setup methods:

### Method 1: Automated Setup (Recommended)

**For Unix/Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
bash setup.sh
```

### Method 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
# Create .env file (see environment variables below)
npm run dev
```

#### Frontend Setup
```bash
cd database_university_system
npm install
# Create .env file (see environment variables below)
npm run dev
```

## 📋 Prerequisites

- **Node.js**: Version 20.19.0 or higher
- **npm**: Latest version (comes with Node.js)
- **Operating System**: Windows, macOS, or Linux

### Check Prerequisites
```bash
node --version    # Should be v20.19.0 or higher
npm --version     # Should be 8.0.0 or higher
```

## 🔧 Environment Configuration

### Backend (.env file in `/backend`)
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
DB_PATH=./database_university.db
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env file in `/database_university_system`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=University Database System
VITE_APP_VERSION=1.0.0
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost
```

## 🌐 Application URLs

After successful setup:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Backend Health Check**: http://localhost:3000/api/health

## 🏃‍♂️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd database_university_system
npm run dev
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd database_university_system
npm run build
npm run preview
```

## 🗄️ Database

The application uses SQLite database (`database_university.db`) which is automatically created and initialized when you first run the backend.

## 🧪 Testing

### Frontend Tests
```bash
cd database_university_system
npm run test:unit      # Unit tests
npm run test:e2e       # End-to-end tests
```

### Backend Tests
```bash
cd backend
npm test               # If you add tests
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend: Change PORT in backend/.env
   - Frontend: Change VITE_DEV_SERVER_PORT in frontend/.env

2. **CORS Errors**
   - Ensure CORS_ORIGIN in backend/.env matches frontend URL

3. **Database Errors**
   - Delete `database_university.db` and restart backend
   - Check file permissions

4. **Module Not Found**
   - Run `npm install` in both directories
   - Clear npm cache: `npm cache clean --force`

### Getting Help

- Check the README.md files in each directory
- Verify all prerequisites are installed
- Ensure environment variables are correctly set

## 📁 Project Structure

```
Database_University_System/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── database.js         # Database operations
│   ├── package.json        # Backend dependencies
│   └── database_university.db  # SQLite database
├── database_university_system/  # Vue.js Frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── setup.sh               # Automated setup script
└── README.md              # This file
```

## 🔐 Security Notes

- Change JWT_SECRET in production
- Use environment-specific database paths
- Configure proper CORS origins
- Consider using HTTPS in production

## 🚀 Deployment

For production deployment, consider:

1. Using a proper database (PostgreSQL, MySQL)
2. Setting up environment variables on your server
3. Using a process manager like PM2
4. Setting up reverse proxy (nginx)
5. Configuring SSL certificates

---

**Happy Coding! 🎉**
