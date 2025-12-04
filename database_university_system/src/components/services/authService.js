// API Base URL - change this to your actual backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
