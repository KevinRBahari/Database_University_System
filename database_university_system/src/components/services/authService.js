const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

//Helper function to handle API responses
const handleResponse = async (response) => {
  let data
  try {
    data = await response.json()
  } catch (e) {
    throw new Error('Server returned invalid response')
  }
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText || 'Request failed'
    throw new Error(error)
  }
  
  return data
}

//Login user
export const login = async (userId, password) => {
  try {
    console.log('Attempting login to:', `${API_URL}/auth/login`)
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user_id: userId, 
        password: password 
      })
    })

    const data = await handleResponse(response)
    
    //Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  } catch (error) {
    console.error('Login error:', error)
    throw new Error(error.message || 'Login failed')
  }
}

//Register new user
export const register = async (userData) => {
  try {
    console.log('Attempting registration to:', `${API_URL}/auth/register`)
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    const data = await handleResponse(response)
    
    //Auto login after registration
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  } catch (error) {
    console.error('Registration error:', error)
    throw new Error(error.message || 'Registration failed')
  }
}

//Logout user
export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

//Get current user from localStorage
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

//Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

//Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

//Verify token
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
    console.error('Token verification error:', error)
    return false
  }
}

//Get student profile
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
    console.error('Profile fetch error:', error)
    throw new Error(error.message || 'Failed to fetch profile')
  }
}
