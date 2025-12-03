<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <!-- Student ID Field -->
    <div class="form-group" :class="{ 'has-error': errors.studentId }">
      <label for="student_id">Student ID *</label>
      <input
        id="student_id"
        v-model="studentId"
        type="text"
        placeholder="Enter your student ID"
        :disabled="isLoading"
        @blur="validateStudentId"
        @input="clearFieldError('studentId')"
      />
      <span v-if="errors.studentId" class="error-message">
        {{ errors.studentId }}
      </span>
    </div>

    <!-- Name Field -->
    <div class="form-group" :class="{ 'has-error': errors.name }">
      <label for="name">Full Name *</label>
      <input
        id="name"
        v-model="name"
        type="text"
        placeholder="Enter your full name"
        :disabled="isLoading"
        @blur="validateName"
        @input="clearFieldError('name')"
      />
      <span v-if="errors.name" class="error-message">
        {{ errors.name }}
      </span>
    </div>

    <!-- Email Field -->
    <div class="form-group" :class="{ 'has-error': errors.email }">
      <label for="email">Email Address *</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="Enter your email address"
        :disabled="isLoading"
        @blur="validateEmail"
        @input="clearFieldError('email')"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <!-- Program Field -->
    <div class="form-group" :class="{ 'has-error': errors.program }">
      <label for="program">Program</label>
      <select
        id="program"
        v-model="program"
        :disabled="isLoading"
        @blur="validateProgram"
        @input="clearFieldError('program')"
      >
        <option value="">Select your program</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Information Technology">Information Technology</option>
        <option value="Engineering">Engineering</option>
        <option value="Business Administration">Business Administration</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Physics">Physics</option>
        <option value="Other">Other</option>
      </select>
      <span v-if="errors.program" class="error-message">
        {{ errors.program }}
      </span>
    </div>

    <!-- Year Field -->
    <div class="form-group" :class="{ 'has-error': errors.year }">
      <label for="year">Year of Study</label>
      <select
        id="year"
        v-model="year"
        :disabled="isLoading"
        @blur="validateYear"
        @input="clearFieldError('year')"
      >
        <option value="">Select your year</option>
        <option value="1">1st Year</option>
        <option value="2">2nd Year</option>
        <option value="3">3rd Year</option>
        <option value="4">4th Year</option>
        <option value="5">5th Year</option>
      </select>
      <span v-if="errors.year" class="error-message">
        {{ errors.year }}
      </span>
    </div>

    <!-- Password Field -->
    <div class="form-group" :class="{ 'has-error': errors.password }">
      <label for="password">Password *</label>
      <div class="password-wrapper">
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Create a password"
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

    <!-- Confirm Password Field -->
    <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
      <label for="confirmPassword">Confirm Password *</label>
      <div class="password-wrapper">
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm your password"
          :disabled="isLoading"
          @blur="validateConfirmPassword"
          @input="clearFieldError('confirmPassword')"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showConfirmPassword = !showConfirmPassword"
          :disabled="isLoading"
          tabindex="-1"
        >
          {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
      <span v-if="errors.confirmPassword" class="error-message">
        {{ errors.confirmPassword }}
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
      <span>{{ isLoading ? 'Creating Account...' : 'Register' }}</span>
    </button>

    <!-- Additional Links -->
    <div class="form-footer">
      <p>Already have an account?
        <a href="#" class="link" @click.prevent="$emit('switch-to-login')">
          Login here
        </a>
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/components/stores/auth'
import { validateRegisterForm } from '@/components/utils/validation'

const emit = defineEmits(['submit', 'switch-to-login'])
const authStore = useAuthStore()

// Form data
const studentId = ref('')
const name = ref('')
const email = ref('')
const program = ref('')
const year = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Form state
const errors = ref({})
const serverError = ref('')

// Computed
const isLoading = computed(() => authStore.loading)
const isFormValid = computed(() => {
  return studentId.value && name.value && email.value && password.value &&
         confirmPassword.value && Object.keys(errors.value).length === 0
})

// Validation functions
const validateStudentId = () => {
  if (!studentId.value) {
    errors.value.studentId = 'Student ID is required'
  } else if (!/^\d+$/.test(studentId.value)) {
    errors.value.studentId = 'Student ID must contain only numbers'
  } else if (studentId.value.length < 4) {
    errors.value.studentId = 'Student ID must be at least 4 digits'
  } else {
    delete errors.value.studentId
  }
}

const validateName = () => {
  if (!name.value) {
    errors.value.name = 'Name is required'
  } else if (name.value.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
  } else {
    delete errors.value.name
  }
}

const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  } else {
    delete errors.value.email
  }
}

const validateProgram = () => {
  // Optional field, no validation needed
}

const validateYear = () => {
  // Optional field, no validation needed
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

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    delete errors.value.confirmPassword
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
  const validation = validateRegisterForm(
    studentId.value, name.value, email.value, password.value, confirmPassword.value
  )

  if (!validation.isValid) {
    errors.value = validation.errors
    return
  }

  // Clear field errors
  errors.value = {}

  // Emit submit event with registration data
  emit('submit', {
    student_id: studentId.value,
    name: name.value,
    email: email.value,
    password: password.value,
    program: program.value,
    year: parseInt(year.value) || 1
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
.register-form {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group.has-error input,
.form-group.has-error select {
  border-color: #ef4444;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled, select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

select {
  cursor: pointer;
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
