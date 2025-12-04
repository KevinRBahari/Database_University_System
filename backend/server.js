import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { initializeDatabase, verifyPassword, createUser, findUserByStudentId, findUserById, getAllCourses, getStudentEnrollments } from './database.js'

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully')
  })
  .catch(err => {
    console.error('Database initialization failed:', err)
    process.exit(1)
  })

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
    req.userId = decoded.userId
    next()
  })
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { student_id, password } = req.body

    if (!student_id || !password) {
      return res.status(400).json({ message: 'Student ID and password are required' })
    }

    const user = await verifyPassword(student_id, password)

    if (!user) {
      return res.status(401).json({ message: 'Invalid student ID or password' })
    }

    const token = generateToken(user.id)

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { student_id, name, email, password } = req.body

    if (!student_id || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if student ID already exists
    const existingStudent = await findUserByStudentId(student_id)
    if (existingStudent) {
      return res.status(409).json({ message: 'Student ID already registered' })
    }

    const newUser = await createUser({
      studentId: student_id,
      name,
      email,
      password,
      program: req.body.program || '',
      year: req.body.year || 1
    })

    const token = generateToken(newUser.id)

    res.status(201).json({
      token,
      user: newUser
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Email or student ID already exists' })
    }

    res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // If we reach here, token is valid
    // Get user details
    const user = await findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user

    res.json({ valid: true, user: userWithoutPassword })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Student routes
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user

    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Course routes
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await getAllCourses()
    res.json(courses)
  } catch (error) {
    console.error('Courses fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/api/student/enrollments', authenticateToken, async (req, res) => {
  try {
    // Get student ID from user
    const user = await findUserById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'Student not found' })
    }

    const enrollments = await getStudentEnrollments(user.student_id)
    res.json(enrollments)
  } catch (error) {
    console.error('Enrollments fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...')
  process.exit(0)
})
