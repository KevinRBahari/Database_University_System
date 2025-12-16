<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Login</h1>

      <!--Login Form-->
      <form @submit.prevent="handleLogin" class="login-form">
        <!--User ID Field-->
        <div class="form-group" :class="{ 'has-error': errors.userId }">
          <label for="user_id">User ID</label>
          <input 
            id="user_id"
            v-model="userId" 
            type="text" 
            placeholder="Enter your ID"
            :disabled="isLoading"
            @blur="validateUserId"
            @input="clearFieldError('userId')"
          />
          <span v-if="errors.userId" class="error-message">
            {{ errors.userId }}
          </span>
        </div>
        
        <!--Password Field-->
        <div class="form-group" :class="{ 'has-error': errors.password }">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input 
              id="password"
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              :disabled="isLoading"
              @blur="validatePassword"
              @input="clearFieldError('password')"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
              :disabled="isLoading"
              tabindex="-1"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">
            {{ errors.password }}
          </span>
        </div>

        <!--Server Error Alert-->
        <div v-if="serverError" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          {{ serverError }}
        </div>

        <!--Success Message-->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">✓</span>
          {{ successMessage }}
        </div>

        <!--Submit Button-->
        <button type="submit" class="btn-primary" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading" class="loading-spinner">⏳</span>
          <span>{{ isLoading ? 'Logging in...' : 'Login' }}</span>
        </button>

        <!--Additional Links-->
        <div class="form-footer">
          <a href="#" class="link" @click.prevent="handleForgotPassword">
            Forgot password?
          </a>
        </div>
      </form>

      <div class="register-link">
        Don't have an account?
        <router-link to="/register" class="link">Register here</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

//State
const userId = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref({})
const serverError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

//Computed
const isFormValid = computed(() => {
  return userId.value && password.value && Object.keys(errors.value).length === 0
})

//Validation
const validateUserId = () => {
  if (!userId.value) {
    errors.value.userId = 'User ID is required'
    return false
  } else if (!/^\d+$/.test(userId.value)) {
    errors.value.userId = 'ID must contain only numbers'
    return false
  } else if (userId.value.length < 3) {
    errors.value.userId = 'ID must be at least 3 digits'
    return false
  } else {
    delete errors.value.userId
    return true
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Password is required'
    return false
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return false
  } else {
    delete errors.value.password
    return true
  }
}

const clearFieldError = (field) => {
  delete errors.value[field]
  serverError.value = ''
  successMessage.value = ''
}

const handleLogin = async () => {
  serverError.value = ''
  successMessage.value = ''
  
  //Validate all fields
  const isUserIdValid = validateUserId()
  const isPasswordValid = validatePassword()
  
  if (!isUserIdValid || !isPasswordValid) {
    return
  }
  
  errors.value = {}
  isLoading.value = true
  
  try {
    const result = await authStore.login(userId.value, password.value)
    
    if (result.success) {
      successMessage.value = 'Login successful! Redirecting...'
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      serverError.value = result.error || 'Login failed'
    }
  } catch (error) {
    serverError.value = error.message || 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  alert('Password reset functionality coming soon!')
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #374151;
  font-size: 2rem;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group.has-error input {
  border-color: #ef4444;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  padding: 0.25rem;
  transition: opacity 0.2s;
}

.toggle-password:hover:not(:disabled) {
  opacity: 0.7;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.alert-icon {
  font-size: 1.2rem;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
