# 🚀 Quick Start Guide

## ⚡ Super Quick Setup (30 seconds)

```bash
# 1. Clone/Download the project
# 2. Run the setup script:

# For Mac/Linux:
chmod +x setup.sh && ./setup.sh

# For Windows:
setup.bat

# 3. Start the application:
# Terminal 1 (Backend):
cd backend && npm run dev

# Terminal 2 (Frontend):
cd database_university_system && npm run dev
```

## 🎯 What You Get

- **Frontend**: http://localhost:5173 (Vue.js + Vite)
- **Backend**: http://localhost:3000 (Express.js + SQLite)
- **API**: http://localhost:3000/api

## 🔑 Default Test Account

After first run, you can register a new account or use these test credentials:
- Student ID: `12345678`
- Password: `password123`

## 🐳 Docker Alternative

```bash
# Build and run with Docker
docker-compose up --build
```

## 📱 Mobile Testing

The frontend is responsive and works on mobile devices. Access via:
- **Local Network**: http://[your-ip]:5173
- **USB Tethering**: Use your computer's IP address

## ❓ Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Verify Node.js version: `node --version` (should be ≥20.19.0)
3. Check logs for error messages
4. Ensure ports 3000 and 5173 are available

## 🎉 Success Indicators

- ✅ Backend shows: "Server running on http://localhost:3000"
- ✅ Frontend shows: "Local: http://localhost:5173/"
- ✅ Health check: http://localhost:3000/api/health returns `{"status":"OK"}`

---

**Ready to go in under 1 minute! 🚀**
