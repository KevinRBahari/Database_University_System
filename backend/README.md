# Database University System - Backend

Node.js/Express API backend for the University Course Registration and Grade Management System.

## Features

- **Authentication**: JWT-based login and registration
- **SQLite Database**: Lightweight database for users, courses, and enrollments
- **RESTful API**: Clean API endpoints for all operations
- **CORS Support**: Cross-origin requests enabled for frontend integration

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: SQLite3 with sqlite3 package
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  instructor TEXT,
  semester TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (id),
  FOREIGN KEY (course_id) REFERENCES courses (id),
  UNIQUE(student_id, course_id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with student ID and password
- `POST /api/auth/register` - Register new student account
- `GET /api/auth/verify` - Verify JWT token

### Student
- `GET /api/student/profile` - Get student profile information
- `GET /api/student/enrollments` - Get student's enrolled courses

### Courses
- `GET /api/courses` - Get all available courses

### Health
- `GET /api/health` - Health check endpoint

## Setup Instructions

### Prerequisites
- Node.js (v20 or later)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Or start the production server:**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` by default.

### Environment Variables

Create a `.env` file in the backend directory for configuration:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

## Default Data

On first run, the database is automatically populated with:
- 3 sample student accounts (student IDs: 12345, 67890, 11111)
- Password for all sample accounts: `password123`
- 3 sample courses

## Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id": "12345", "password": "password123"}'
```

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "99999",
    "name": "Test Student",
    "email": "test@university.edu",
    "password": "password123",
    "program": "Computer Science",
    "year": 1
  }'
```

## Integration with Frontend

The backend is designed to work with the Vue.js frontend in the `../database_university_system` directory.

1. Start the backend: `npm run dev`
2. Start the frontend: `cd ../database_university_system && npm run dev`
3. Frontend will automatically connect to `http://localhost:3000/api`

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting for production use
- Validate and sanitize all inputs
- Use environment variables for sensitive data

## Development

The server supports hot reloading with `npm run dev` (requires nodemon).

Database file `database_university.db` is created automatically in the backend directory.
