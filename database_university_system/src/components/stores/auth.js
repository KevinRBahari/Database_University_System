import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/components/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const studentId = computed(() => user.value?.student_id || null)
  const studentName = computed(() => user.value?.name || null)

  // Actions
  const initialize = () => {
    // Initialize default users if none exist
    const usersKey = 'university_users'
    const users = localStorage.getItem(usersKey)
    if (!users) {
      // Add default demo user
      const defaultUsers = [{
        id: 1,
        student_id: '12345',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        password_hash: '-1999991507', // hash of 'password123'
        program: 'Computer Science',
        year: 3,
        created_at: new Date().toISOString()
      }]
      localStorage.setItem(usersKey, JSON.stringify(defaultUsers))
    }

    // Load user from localStorage on app start
    const storedUser = authService.getCurrentUser()
    const storedToken = authService.getAuthToken()

    if (storedUser && storedToken) {
      user.value = storedUser
      token.value = storedToken
    }
  }

  const login = async (studentId, password) => {
    loading.value = true
    error.value = null

    try {
      // Use database login for local storage
      // Change to authService.login when you have a real backend
      const data = await authService.databaseLogin(studentId, password)

      user.value = data.user
      token.value = data.token

      return { success: true, user: data.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const register = async (studentId, name, email, password, program = '', year = 1) => {
    loading.value = true
    error.value = null

    try {
      const data = await authService.databaseRegister(studentId, name, email, password, program, year)

      user.value = data.user
      token.value = data.token

      return { success: true, user: data.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    user.value = null
    token.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    
    try {
      const profile = await authService.getStudentProfile()
      user.value = { ...user.value, ...profile }
      return { success: true, profile }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Initialize on store creation
  initialize()

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    studentId,
    studentName,
    // Actions
    login,
    register,
    logout,
    clearError,
    initialize,
    fetchProfile
  }
})
