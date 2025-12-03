<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <!-- Student ID Field -->
    <div class="form-group" :class="{ 'has-error': errors.studentId }">
      <label for="student_id">Student ID</label>
      <input 
        id="student_id"
        v-model="studentId" 
        type="number" 
        placeholder="Enter your student ID"
        :disabled="isLoading"
        @blur="validateStudentId"
        @input="clearFieldError('studentId')"
      />
      <span v-if="errors.studentId" class="error-message">
        {{ errors.studentId }}
      </span>
    </div>
    
    <!-- Password Field -->
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

    <!-- Server Error Alert -->
    <div v-if="serverError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      {{ serverError }}
    </div>

    <!-- Submit Button -->
    <button type="submit" class="btn-primary" :disabled="isLoading || !isFormValid">
      <span v-if="isLoading" class="loading-spinner">⏳</span>
      <span>{{ isLoading ? 'Logging in...' : 'Login' }}</span>
    </button>

    <!-- Additional Links -->
    <div class="form-footer">
      <a href="#" class="link" @click.prevent="$emit('forgot-password')">
        Forgot password?
      </a>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/components/stores/auth'
import { validateLoginForm } from '@/components/utils/validation'

const emit = defineEmits(['submit', 'forgot-password'])
const authStore = useAuthStore()

// Form data
const studentId = ref('')
const password = ref('')
const showPassword = ref(false)

// Form state
const errors = ref({})
const serverError = ref('')

// Computed
const isLoading = computed(() => authStore.loading)
const isFormValid = computed(() => {
  return studentId.value && password.value && Object.keys(errors.value).length === 0
})

// Validate individual fields
const validateStudentId = () => {
  if (!studentId.value) {
    errors.value.studentId = 'Student ID is required'
  } else if (isNaN(Number(studentId.value)) || Number(studentId.value) <= 0) {
    errors.value.studentId = 'Please enter a valid Student ID'
  } else {
    delete errors.value.studentId
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  } else {
    delete errors.value.password
  }
}

const clearFieldError = (field) => {
  delete errors.value[field]
  serverError.value = ''
}

// Handle form submission
const handleSubmit = async () => {
  // Clear previous server errors
  serverError.value = ''
  
  // Validate form
  const validation = validateLoginForm(studentId.value, password.value)
  
  if (!validation.isValid) {
    errors.value = validation.errors
    return
  }
  
  // Clear field errors
  errors.value = {}
  
  // Emit submit event
  emit('submit', {
    student_id: studentId.value,
    password: password.value
  })

  // Check for auth store errors after submission
  setTimeout(() => {
    if (authStore.error) {
      serverError.value = authStore.error
    }
  }, 100)
}
</script>

<style scoped>
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group.has-error input {
  border-color: #ef4444;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
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
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: opacity 0.2s;
}

.toggle-password:hover:not(:disabled) {
  opacity: 0.7;
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.375rem;
}

.alert {
  padding: 0.875rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.alert-error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-icon {
  font-size: 1.2rem;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
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
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
