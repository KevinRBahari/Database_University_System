<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Create Account</h1>
      
      <!--Role Selection Buttons-->
      <div class="role-selector">
        <button 
          @click="selectedRole = 'student'" 
          :class="['role-btn', { active: selectedRole === 'student' }]"
        >
          <span class="role-icon">👨‍🎓</span>
          <span>Student</span>
        </button>
        <button 
          @click="selectedRole = 'instructor'" 
          :class="['role-btn', { active: selectedRole === 'instructor' }]"
        >
          <span class="role-icon">👨‍🏫</span>
          <span>Instructor</span>
        </button>
      </div>

      <!--Registration Form-->
      <form @submit.prevent="handleRegister" class="register-form">
        <!--User ID Field-->
        <div class="form-group" :class="{ 'has-error': errors.userId }">
          <label for="user_id">
            {{ selectedRole === 'student' ? 'Student ID *' : 'Instructor ID *' }}
          </label>
          <input
            id="user_id"
            v-model="userId"
            type="text"
            :placeholder="`Enter your ${selectedRole === 'student' ? 'student' : 'instructor'} ID (numbers only)`"
            :disabled="isLoading"
            @blur="validateUserId"
            @input="clearFieldError('userId')"
          />
          <span v-if="errors.userId" class="error-message">{{ errors.userId }}</span>
          <span v-else class="helper-text">Must be numbers only (e.g., 12345)</span>
        </div>

        <!--Name Field-->
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
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <!--Email Field-->
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
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!--Student-specific fields-->
        <template v-if="selectedRole === 'student'">
          <div class="form-group">
            <label for="program">Program</label>
            <select id="program" v-model="program" :disabled="isLoading">
              <option value="">Select your program</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
          </div>

          <div class="form-group">
            <label for="year">Year of Study</label>
            <select id="year" v-model="year" :disabled="isLoading">
              <option value="">Select your year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>
        </template>

        <!--Instructor-specific fields-->
        <template v-if="selectedRole === 'instructor'">
          <div class="form-group" :class="{ 'has-error': errors.department }">
            <label for="department">Department *</label>
            <select 
              id="department" 
              v-model="department" 
              :disabled="isLoading || departments.length === 0"
              @blur="validateDepartment"
              @change="clearFieldError('department')"
            >
              <option value="">Select department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.dept_name }} ({{ dept.dept_code }})
              </option>
            </select>
            <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
            <span v-else-if="departments.length === 0" class="helper-text">Loading departments...</span>
          </div>

          <div class="form-group">
            <label for="title">Title</label>
            <select id="title" v-model="title" :disabled="isLoading">
              <option value="">Select title</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Teaching Assistant">Teaching Assistant</option>
            </select>
          </div>

          <div class="form-group">
            <label for="office">Office Location</label>
            <input
              id="office"
              v-model="office"
              type="text"
              placeholder="e.g., Building A, Room 301"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="hours">Office Hours</label>
            <input
              id="hours"
              v-model="hours"
              type="text"
              placeholder="e.g., Mon-Wed 2-4 PM"
              :disabled="isLoading"
            />
          </div>
        </template>

        <!--Password Fields-->
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
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          <span v-else class="helper-text">Minimum 6 characters</span>
        </div>

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
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
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
          <span>{{ isLoading ? 'Creating Account...' : 'Register' }}</span>
        </button>
      </form>

      <div class="login-link">
        Already have an account?
        <router-link to="/login" class="link">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

//State
const selectedRole = ref('student')
const userId = ref('')
const name = ref('')
const email = ref('')
const program = ref('')
const year = ref('')
const department = ref('')
const title = ref('')
const office = ref('')
const hours = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref({})
const serverError = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const departments = ref([])

//Computed
const isFormValid = computed(() => {
  const baseValid = userId.value && name.value && email.value && password.value && confirmPassword.value
  const instructorValid = selectedRole.value === 'instructor' ? department.value : true
  return baseValid && instructorValid && Object.keys(errors.value).length === 0
})

//Load departments
const loadDepartments = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/departments')
    if (response.ok) {
      departments.value = await response.json()
      console.log('Departments loaded:', departments.value)
    } else {
      console.error('Failed to load departments:', response.status)
    }
  } catch (err) {
    console.error('Failed to load departments:', err)
  }
}

//Validation
const validateUserId = () => {
  if (!userId.value) {
    errors.value.userId = `${selectedRole.value === 'student' ? 'Student' : 'Instructor'} ID is required`
    return false
  } else if (!/^\d+$/.test(userId.value)) {
    errors.value.userId = 'ID must contain only numbers'
    return false
  } else if (userId.value.length < 4) {
    errors.value.userId = 'ID must be at least 4 digits'
    return false
  } else {
    delete errors.value.userId
    return true
  }
}

const validateName = () => {
  if (!name.value) {
    errors.value.name = 'Name is required'
    return false
  } else if (name.value.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
    return false
  } else {
    delete errors.value.name
    return true
  }
}

const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'Email is required'
    return false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    return false
  } else {
    delete errors.value.email
    return true
  }
}

const validateDepartment = () => {
  if (selectedRole.value === 'instructor' && !department.value) {
    errors.value.department = 'Department is required for instructors'
    return false
  } else {
    delete errors.value.department
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

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
    return false
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    return false
  } else {
    delete errors.value.confirmPassword
    return true
  }
}

const clearFieldError = (field) => {
  delete errors.value[field]
  serverError.value = ''
  successMessage.value = ''
}

//Handle registration
const handleRegister = async () => {
  serverError.value = ''
  successMessage.value = ''

  //Validate all fields
  const validations = [
    validateUserId(),
    validateName(),
    validateEmail(),
    validatePassword(),
    validateConfirmPassword()
  ]

  if (selectedRole.value === 'instructor') {
    validations.push(validateDepartment())
  }

  if (validations.includes(false)) {
    serverError.value = 'Please fix the errors above before submitting'
    return
  }

  errors.value = {}
  isLoading.value = true

  try {
    const userData = {
      user_id: userId.value,
      name: name.value,
      email: email.value,
      password: password.value,
      user_type: selectedRole.value
    }

    //Add role-specific data
    if (selectedRole.value === 'student') {
      userData.college = 'Engineering'
      userData.major = program.value || 'Undeclared'
      userData.year_of_study = parseInt(year.value) || 1
    } else {
      userData.dept_id = parseInt(department.value)
      userData.title = title.value || 'Instructor'
      userData.office_location = office.value || ''
      userData.office_hours = hours.value || ''
    }

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    //Store in auth store
    authStore.user = data.user
    authStore.token = data.token
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    successMessage.value = 'Registration successful! Redirecting...'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      serverError.value = 'Cannot connect to server. Please make sure the backend is running.'
    } else if (err.message.includes('already exists') || err.message.includes('UNIQUE') || err.message.includes('409')) {
      serverError.value = 'This ID or email is already registered. Please use a different one.'
    } else {
      serverError.value = err.message || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

//Lifecycle
onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-container {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #374151;
  font-size: 2rem;
}

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 3px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  color: #6b7280;
}

.role-btn:hover {
  border-color: #667eea;
  background: #f9fafb;
  transform: translateY(-2px);
}

.role-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.role-icon {
  font-size: 2rem;
}

.register-form {
  width: 100%;
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
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
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

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.375rem;
}

.helper-text {
  display: block;
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-style: italic;
}

.alert {
  padding: 0.875rem;
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

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

@media (max-width: 480px) {
  .register-page {
    padding: 1rem;
  }

  .register-container {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .role-selector {
    grid-template-columns: 1fr;
  }
}
</style>
