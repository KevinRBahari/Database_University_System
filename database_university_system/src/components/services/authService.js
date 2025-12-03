// API Base URL - change this to your actual backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// LocalStorage-based user management for demo purposes
// In production, use a proper backend API with database

const getUsers = () => {
  const users = localStorage.getItem('university_users')
  return users ? JSON.parse(users) : []
}

const saveUsers = (users) => {
  localStorage.setItem('university_users', JSON.stringify(users))
}

const hashPassword = (password) => {
  // Simple hash for demo (not secure - use bcrypt in production)
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return hash.toString()
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText
    throw new Error(error)
  }
  
  return data
}

// Login user with Student ID
export const login = async (studentId, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        student_id: studentId, 
        password: password 
      })
    })

    const data = await handleResponse(response)
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

// Register new student (if needed)
export const register = async (studentId, name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        student_id: studentId, 
        name, 
        email, 
        password 
      })
    })

    const data = await handleResponse(response)
    
    // Auto-login after registration
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  } catch (error) {
    throw new Error(error.message || 'Registration failed')
  }
}

// Logout user
export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (e) {
      return null
    }
  }
  return null
}

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Verify token (call your backend to validate)
export const verifyToken = async () => {
  const token = getAuthToken()
  
  if (!token) {
    return false
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    return response.ok
  } catch (error) {
    return false
  }
}

// Get student profile
export const getStudentProfile = async () => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token')
  }

  try {
    const response = await fetch(`${API_URL}/student/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    return await handleResponse(response)
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch profile')
  }
}

// LocalStorage-based login (demo - not secure)
export const databaseLogin = async (studentId, password) => {
  try {
    const users = getUsers()
    const user = users.find(u => u.student_id === studentId)

    if (!user) {
      throw new Error('Invalid Student ID or password')
    }

    const passwordHash = hashPassword(password)
    if (user.password_hash !== passwordHash) {
      throw new Error('Invalid Student ID or password')
    }

    // Create token
    const token = 'demo-token-' + Date.now()

    // Store token and user data (remove password hash)
    const { password_hash, ...userWithoutPassword } = user
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))

    return {
      token: token,
      user: userWithoutPassword
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

// LocalStorage-based registration (demo - not secure)
export const databaseRegister = async (studentId, name, email, password, program = '', year = 1) => {
  try {
    const users = getUsers()

    // Check if student ID or email already exists
    const existingStudentId = users.find(u => u.student_id === studentId)
    if (existingStudentId) {
      throw new Error('Student ID already exists')
    }

    const existingEmail = users.find(u => u.email === email)
    if (existingEmail) {
      throw new Error('Email already registered')
    }

    // Create new user
    const passwordHash = hashPassword(password)
    const newUser = {
      id: Date.now(), // Simple ID generation
      student_id: studentId,
      name: name,
      email: email,
      password_hash: passwordHash,
      program: program,
      year: year,
      created_at: new Date().toISOString()
    }

    // Add to users list
    users.push(newUser)
    saveUsers(users)

    // Auto-login after successful registration
    const token = 'demo-token-' + Date.now()

    // Remove password hash before returning
    const { password_hash, ...userWithoutPassword } = newUser
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))

    return {
      token: token,
      user: userWithoutPassword
    }
  } catch (error) {
    throw new Error(error.message || 'Registration failed')
  }
}

// Mock student data (for testing)
export const mockStudents = [
  { student_id: '12345', password: 'password123', name: 'John Doe' },
  { student_id: '67890', password: 'password123', name: 'Jane Smith' },
  { student_id: '11111', password: 'password123', name: 'Bob Johnson' }
]
