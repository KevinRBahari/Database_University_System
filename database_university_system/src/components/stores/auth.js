import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  //State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const profile = ref(null)

  //Getter
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  const userType = computed(() => user.value?.user_type || null)
  const isStudent = computed(() => userType.value === 'student')
  const isInstructor = computed(() => userType.value === 'instructor')
  const isAdmin = computed(() => userType.value === 'admin')
  const studentId = computed(() => {
    if (profile.value?.student_id) return profile.value.student_id
    if (user.value?.user_id) return user.value.user_id
    return null
  })
  const studentName = computed(() => {
    if (profile.value?.name) return profile.value.name
    if (user.value?.name) return user.value.name
    return null
  })

  //Helper function to handle API responses
  const handleResponse = async (response) => {
    const data = await response.json()
    
    if (!response.ok) {
      const errorMsg = (data && data.message) || response.statusText || 'An error occurred'
      throw new Error(errorMsg)
    }
    
    return data
  }

  //Actions
  const initialize = () => {
    //Load user from localStorage on app start
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('authToken')
      const storedProfile = localStorage.getItem('profile')

      if (storedUser && storedToken) {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
        if (storedProfile) {
          profile.value = JSON.parse(storedProfile)
        }
        console.log('Auth initialized from localStorage:', user.value)
      }
    } catch (err) {
      console.error('Failed to initialize auth from localStorage:', err)
      logout()
    }
  }

  const login = async (userId, password) => {
    loading.value = true
    error.value = null
    
    console.log('Login attempt for user:', userId)
    console.log('API URL:', API_URL)

    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Login successful:', data)

      //Store user and token
      user.value = data.user
      token.value = data.token
      
      //Persist to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      //Fetch full profile based on user type
      await fetchFullProfile()

      return { success: true, user: data.user }
    } catch (err) {
      console.error('Login error:', err)
      
      //Provide user friendly error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        error.value = 'Cannot connect to server. Please make sure the backend is running on http://localhost:3000'
      } else if (err.message.includes('401')) {
        error.value = 'Invalid Student ID or password. Please check your credentials.'
      } else {
        error.value = err.message || 'Login failed. Please try again.'
      }
      
      //Clear any partial state
      user.value = null
      token.value = null
      profile.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('profile')
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userId, name, email, password, program = '', year = 1) => {
    loading.value = true
    error.value = null
    
    console.log('Registration attempt for user:', userId)
    console.log('API URL:', API_URL)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          name,
          email,
          password,
          user_type: 'student',
          college: 'Engineering',
          major: program,
          year_of_study: year
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Registration successful:', data)

      //Store user and token
      user.value = data.user
      token.value = data.token
      
      //Persist to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      //Fetch full profile
      await fetchFullProfile()

      return { success: true, user: data.user }
    } catch (err) {
      console.error('Registration error:', err)
      
      //Provide error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        error.value = 'Cannot connect to server. Please make sure the backend is running on http://localhost:3000'
      } else if (err.message.includes('already exists') || err.message.includes('UNIQUE constraint') || err.message.includes('409')) {
        error.value = 'This Student ID or email is already registered. Please use a different one or try logging in.'
      } else if (err.message.includes('required')) {
        error.value = 'Please fill in all required fields correctly.'
      } else {
        error.value = err.message || 'Registration failed. Please try again.'
      }
      
      //Clear any partial state
      user.value = null
      token.value = null
      profile.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('profile')
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    console.log('Logging out user')
    
    //Clear state
    user.value = null
    token.value = null
    profile.value = null
    error.value = null
    
    //Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
  }

  const clearError = () => {
    error.value = null
  }

  const fetchFullProfile = async () => {
    if (!token.value || !user.value) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      let endpoint = ''
      if (user.value.user_type === 'student') {
        endpoint = '/student/profile'
      } else if (user.value.user_type === 'instructor') {
        endpoint = '/instructor/profile'
      } else {
        return { success: true }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const profileData = await response.json()
        profile.value = profileData
        localStorage.setItem('profile', JSON.stringify(profileData))
        console.log('Profile fetched:', profileData)
        return { success: true, profile: profileData }
      } else {
        console.error('Failed to fetch profile')
        return { success: false, error: 'Failed to fetch profile' }
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      return { success: false, error: err.message }
    }
  }

  //Init on store creation
  initialize()

  return {
    user,
    token,
    loading,
    error,
    profile,
    isAuthenticated,
    currentUser,
    userType,
    isStudent,
    isInstructor,
    isAdmin,
    studentId,
    studentName,
    login,
    register,
    logout,
    clearError,
    initialize,
    fetchFullProfile
  }
})
